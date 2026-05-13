"""
Sklearn-based yield regression model definition + helpers.

Uses GradientBoostingRegressor — no GPU or PyTorch required.
Trained model is persisted as a pickle alongside a JSON metadata file.
"""

from __future__ import annotations

import json
import pickle
import time
from pathlib import Path
from typing import Any

import numpy as np

# ---------------------------------------------------------------------------
# Feature definitions
# ---------------------------------------------------------------------------

NUMERIC_FEATURES = [
    "area_hectares",
    "rainfall_mm",
    "temperature_celsius",
    "fertilizer_amount_kg",
    "year",
]

CATEGORICAL_FEATURES = ["crop_name", "season"]

# Populated after load
FEATURE_COLUMNS: list[str] = []

MODELS_DIR = Path(__file__).parent / "models"


# ---------------------------------------------------------------------------
# Persistence helpers
# ---------------------------------------------------------------------------


def save_model(model: Any, version: str, meta: dict[str, Any]) -> Path:
    """Save sklearn model + metadata to MODELS_DIR/<version>/."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    save_dir = MODELS_DIR / version
    save_dir.mkdir(parents=True, exist_ok=True)

    with open(save_dir / "model.pkl", "wb") as f:
        pickle.dump(model, f)

    with open(save_dir / "metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    (MODELS_DIR / "latest.txt").write_text(version)
    return save_dir


def load_latest_model() -> tuple[Any, str, dict[str, Any]]:
    """Load the most recent trained model."""
    latest_file = MODELS_DIR / "latest.txt"
    if not latest_file.exists():
        raise FileNotFoundError("No trained model found. Run train.py first.")
    version = latest_file.read_text().strip()
    return load_model_version(version)


def load_model_version(version: str) -> tuple[Any, str, dict[str, Any]]:
    model_dir = MODELS_DIR / version
    with open(model_dir / "metadata.json") as f:
        meta = json.load(f)

    global FEATURE_COLUMNS
    FEATURE_COLUMNS = meta.get("feature_columns", [])

    with open(model_dir / "model.pkl", "rb") as f:
        model = pickle.load(f)

    return model, version, meta


# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------


def preprocess_input(record: dict[str, Any], meta: dict[str, Any]) -> list[float]:
    """
    Convert a raw record dict into a flat feature vector.
    Matches the column order used during training.
    """
    means: dict[str, float] = meta.get("means", {})
    stds: dict[str, float] = meta.get("stds", {})
    encoders: dict[str, Any] = meta.get("encoders", {})

    features: list[float] = []

    # Numeric (z-score normalised)
    for feat in NUMERIC_FEATURES:
        val = record.get(feat)
        if val is None:
            val = means.get(feat, 0.0)
        val = float(val)
        std = stds.get(feat, 1.0) or 1.0
        features.append((val - means.get(feat, 0.0)) / std)

    # Categorical (label encoded — same mapping as training)
    for cat_feat in CATEGORICAL_FEATURES:
        enc_info = encoders.get(cat_feat, {})
        mapping: dict[str, int] = enc_info.get("mapping", {})
        raw = str(record.get(cat_feat) or "").lower().strip()
        # Use 0 (unknown) if unseen label
        features.append(float(mapping.get(raw, 0)))

    return features
