#!/usr/bin/env python3
"""
Training script for the IADS yield prediction model.

Usage
-----
    # Train from the database (default):
    python -m ml_service.train

    # Train from a CSV file (fallback):
    python -m ml_service.train --source csv --data data/sample_yield.csv

    # Download the public Explore-AI dataset and train:
    python -m ml_service.train --download

The script will:
    1. Load and clean the dataset (DB or CSV)
  2. Encode features (numeric z-score, categorical label-encode)
  3. Train a GradientBoostingRegressor (no GPU needed)
  4. Evaluate on a held-out test split
  5. Save model + metadata to models/<timestamp>/
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import pickle
import time
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

try:
    from .model import (
        CATEGORICAL_FEATURES,
        NUMERIC_FEATURES,
        MODELS_DIR,
        save_model,
    )
except ImportError:
    from model import (
        CATEGORICAL_FEATURES,
        NUMERIC_FEATURES,
        MODELS_DIR,
        save_model,
    )

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"

_DEFAULT_DATASET_URL = (
    "https://raw.githubusercontent.com/Explore-AI/Public-Data/master/Data/Python/Crop_yield.csv"
)
DATASET_URL = os.environ.get("CROP_YIELD_DATASET_URL", _DEFAULT_DATASET_URL)

COLUMN_MAP = {
    "Crop": "crop_name", "Crop_Year": "year", "Season": "season",
    "State": "region", "Area": "area_hectares", "Production": "actual_yield_kg",
    "Annual_Rainfall": "rainfall_mm", "Fertilizer": "fertilizer_amount_kg",
    "Pesticide": "pesticide_amount", "Yield": "actual_yield_kg",
    "crop_name": "crop_name", "year": "year", "season": "season",
    "area_hectares": "area_hectares", "actual_yield_kg": "actual_yield_kg",
    "rainfall_mm": "rainfall_mm", "temperature_celsius": "temperature_celsius",
    "fertilizer_amount_kg": "fertilizer_amount_kg",
}


def download_dataset(dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    logger.info(f"Downloading dataset from {DATASET_URL} ...")
    urllib.request.urlretrieve(DATASET_URL, dest)
    logger.info(f"Saved to {dest}")


def load_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    rename = {k: v for k, v in COLUMN_MAP.items() if k in df.columns}
    if rename:
        df = df.rename(columns=rename)

    if "actual_yield_kg" not in df.columns:
        raise ValueError("Could not find yield target column in dataset.")

    df = df.dropna(subset=["actual_yield_kg"])
    df = df[df["actual_yield_kg"] > 0].copy()

    df = df.replace([np.inf, -np.inf], np.nan)

    for col in NUMERIC_FEATURES:
        if col in df.columns:
            series = pd.to_numeric(df[col], errors="coerce")
            median = float(series.median()) if series.notna().any() else 0.0
            df[col] = series.fillna(median)
        else:
            df[col] = 0.0

    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.lower()
        else:
            df[col] = "unknown"

    return df


def load_from_csv(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    return load_and_prepare_df(df)


def load_from_db(database_url: str) -> pd.DataFrame:
    try:
        import psycopg2  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "psycopg2 is required to load training data from the database. "
            "Install psycopg2-binary in ml-service/requirements.txt."
        ) from exc

    query = """
        SELECT
          crop_name,
          area_hectares,
          rainfall_mm,
          temperature_celsius,
          fertilizer_amount_kg,
          season,
          year,
          actual_yield_kg
        FROM imported_records
        WHERE status = 'valid'
          AND actual_yield_kg IS NOT NULL
    """

    with psycopg2.connect(database_url) as conn:
        df = pd.read_sql_query(query, conn)

    return load_and_prepare_df(df)


def build_features(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, dict]:
    means = {f: float(df[f].mean()) for f in NUMERIC_FEATURES}
    stds  = {f: float(df[f].std()) or 1.0 for f in NUMERIC_FEATURES}

    X_parts = []
    # Numeric z-score
    X_num = np.zeros((len(df), len(NUMERIC_FEATURES)), dtype=np.float32)
    for i, feat in enumerate(NUMERIC_FEATURES):
        X_num[:, i] = ((df[feat] - means[feat]) / stds[feat]).values
    X_parts.append(X_num)

    encoders: dict = {}
    X_cat = np.zeros((len(df), len(CATEGORICAL_FEATURES)), dtype=np.float32)
    for j, cat in enumerate(CATEGORICAL_FEATURES):
        le = LabelEncoder()
        X_cat[:, j] = le.fit_transform(df[cat].values).astype(np.float32)
        encoders[cat] = {
            "classes": le.classes_.tolist(),
            "mapping": {cls: int(i) for i, cls in enumerate(le.classes_)},
        }
    X_parts.append(X_cat)

    X = np.concatenate(X_parts, axis=1)
    y = df["actual_yield_kg"].values.astype(np.float32)

    feature_columns = NUMERIC_FEATURES + [f"{c}_enc" for c in CATEGORICAL_FEATURES]

    meta = {
        "feature_columns": feature_columns,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "means": means,
        "stds": stds,
        "encoders": encoders,
    }
    return X, y, meta


def train(df: pd.DataFrame, n_estimators: int = 200, max_depth: int = 5, lr: float = 0.1) -> str:
    logger.info(f"Dataset: {len(df)} rows after cleaning")

    X, y, extra_meta = build_features(df)
    logger.info(f"Feature dimension: {X.shape[1]}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    logger.info(f"Training GradientBoostingRegressor (n_estimators={n_estimators}) ...")
    model = GradientBoostingRegressor(
        n_estimators=n_estimators, max_depth=max_depth,
        learning_rate=lr, subsample=0.8, random_state=42,
        verbose=0,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae  = float(mean_absolute_error(y_test, preds))
    rmse = float(np.sqrt(np.mean((preds - y_test) ** 2)))
    logger.info(f"Test MAE={mae:.2f} kg  RMSE={rmse:.2f} kg")

    version = time.strftime("%Y%m%d_%H%M%S")
    meta = {
        "version": version,
        "model_type": "GradientBoostingRegressor",
        "mae_kg": round(mae, 2),
        "rmse_kg": round(rmse, 2),
        **extra_meta,
    }
    save_dir = save_model(model, version, meta)
    logger.info(f"Model saved → {save_dir}  (version={version})")
    return version


def main() -> None:
    parser = argparse.ArgumentParser(description="Train IADS yield prediction model")
    parser.add_argument("--source", choices=["db", "csv"], default="db")
    parser.add_argument("--data", type=Path, default=DATA_DIR / "sample_yield.csv")
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--n-estimators", type=int, default=200)
    parser.add_argument("--max-depth", type=int, default=5)
    parser.add_argument("--lr", type=float, default=0.1)
    args = parser.parse_args()

    if args.source == "db":
        database_url = os.environ.get("DATABASE_URL") or os.environ.get("ML_DATABASE_URL")
        if not database_url:
            raise SystemExit("DATABASE_URL is not set for DB training.")
        if args.download:
            logger.warning("--download is ignored when source=db")
        logger.info("Loading data from database (imported_records)")
        df = load_from_db(database_url)
    else:
        if args.download:
            download_dataset(args.data)
        logger.info(f"Loading data from CSV: {args.data}")
        df = load_from_csv(args.data)

    train(df, n_estimators=args.n_estimators, max_depth=args.max_depth, lr=args.lr)


if __name__ == "__main__":
    main()
