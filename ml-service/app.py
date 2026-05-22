"""
Yield Prediction ML Microservice
=================================
FastAPI service exposing a sklearn GradientBoosting model for crop yield prediction.

Endpoints
---------
GET  /health               – service + model health check
POST /predict/yield        – single record inference
POST /predict/yield/batch  – batch inference
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    from .model import FEATURE_COLUMNS, load_latest_model, preprocess_input
except ImportError:
    from model import FEATURE_COLUMNS, load_latest_model, preprocess_input

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global state
_model: Any = None
_model_version: str = "none"
_model_meta: dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global _model, _model_version, _model_meta
    try:
        _model, _model_version, _model_meta = load_latest_model()
        logger.info(f"Loaded model version {_model_version}  "
                    f"(MAE={_model_meta.get('mae_kg','?')} kg)")
    except FileNotFoundError:
        logger.warning("No trained model found. Run train.py to train a model first.")
    yield


app = FastAPI(
    title="IADS Yield Prediction ML Service",
    description="Sklearn GradientBoosting crop yield regression microservice",
    version="2.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class YieldInput(BaseModel):
    crop_name: str | None = Field(None)
    area_hectares: float | None = Field(None)
    rainfall_mm: float | None = Field(None)
    temperature_celsius: float | None = Field(None)
    fertilizer_amount_kg: float | None = Field(None)
    season: str | None = Field(None)
    year: int | None = Field(None)
    model_config = {"extra": "allow"}


class BatchInput(BaseModel):
    records: list[YieldInput]


class YieldOutput(BaseModel):
    predicted_yield_kg: float
    confidence_score: float | None
    model_version: str
    raw_output: dict[str, Any]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "ok" if _model is not None else "no_model",
        "model_version": _model_version,
        "model_type": _model_meta.get("model_type", "unknown"),
        "mae_kg": _model_meta.get("mae_kg"),
        "rmse_kg": _model_meta.get("rmse_kg"),
        "feature_columns": FEATURE_COLUMNS,
    }


@app.post("/predict/yield", response_model=YieldOutput)
async def predict_yield(data: YieldInput):
    if _model is None:
        raise HTTPException(503, "Model not loaded. Train the model first.")

    features = preprocess_input(data.model_dump(), _model_meta)
    X = np.array(features).reshape(1, -1)
    pred = float(_model.predict(X)[0])
    pred = max(0.0, pred)  # clamp to non-negative

    return YieldOutput(
        predicted_yield_kg=round(pred, 2),
        confidence_score=None,
        model_version=_model_version,
        raw_output={"raw_prediction": pred, "model_type": _model_meta.get("model_type")},
    )


@app.post("/predict/yield/batch", response_model=list[YieldOutput])
async def predict_yield_batch(batch: BatchInput):
    if _model is None:
        raise HTTPException(503, "Model not loaded. Train the model first.")

    results = []
    for record in batch.records:
        features = preprocess_input(record.model_dump(), _model_meta)
        X = np.array(features).reshape(1, -1)
        pred = float(max(0.0, _model.predict(X)[0]))
        results.append(YieldOutput(
            predicted_yield_kg=round(pred, 2),
            confidence_score=None,
            model_version=_model_version,
            raw_output={"raw_prediction": pred},
        ))
    return results
