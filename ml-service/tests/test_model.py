"""
Tests for the ML model module (no GPU / large data required).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pytest
import torch

# Make ml-service importable as a package
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ml_service.model import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    YieldModel,
    preprocess_input,
)


def make_scaler_params() -> dict:
    return {
        "means": {f: 0.0 for f in NUMERIC_FEATURES},
        "stds": {f: 1.0 for f in NUMERIC_FEATURES},
        "crop_name_categories": ["maize", "wheat", "teff"],
        "season_categories": ["meher", "belg"],
    }


def test_yield_model_forward():
    """Model should return a 1-D tensor of the correct batch size."""
    params = make_scaler_params()
    input_dim = len(NUMERIC_FEATURES) + 3 + 2  # numeric + crop OHE + season OHE
    model = YieldModel(input_dim=input_dim)
    x = torch.randn(4, input_dim)
    out = model(x)
    assert out.shape == (4,), f"Expected shape (4,), got {out.shape}"


def test_yield_model_single():
    params = make_scaler_params()
    input_dim = len(NUMERIC_FEATURES) + 3 + 2
    model = YieldModel(input_dim=input_dim)
    x = torch.randn(1, input_dim)
    out = model(x)
    assert out.shape == (1,)
    assert torch.isfinite(out).all()


def test_preprocess_input_known():
    """Preprocessed features should have the correct length."""
    params = make_scaler_params()
    record = {
        "crop_name": "Maize",
        "area_hectares": 2.5,
        "rainfall_mm": 850.0,
        "temperature_celsius": 22.0,
        "fertilizer_amount_kg": 120.0,
        "season": "Meher",
        "year": 2021,
    }
    features = preprocess_input(record, params)
    expected_dim = len(NUMERIC_FEATURES) + 3 + 2
    assert len(features) == expected_dim


def test_preprocess_input_missing_values():
    """Missing numeric values should be imputed with 0 (mean of zeros) without error."""
    params = make_scaler_params()
    record = {}  # all fields missing
    features = preprocess_input(record, params)
    expected_dim = len(NUMERIC_FEATURES) + 3 + 2
    assert len(features) == expected_dim
    # Numeric values should be 0.0 (zero-mean imputation after standardisation)
    for v in features[: len(NUMERIC_FEATURES)]:
        assert v == pytest.approx(0.0)


def test_preprocess_input_unknown_category():
    """Unknown category should produce all-zero one-hot without raising."""
    params = make_scaler_params()
    record = {"crop_name": "UNKNOWN_CROP", "season": "winter"}
    features = preprocess_input(record, params)
    # one-hot for crop_name should be all zeros
    crop_start = len(NUMERIC_FEATURES)
    crop_end = crop_start + len(params["crop_name_categories"])
    assert all(v == 0.0 for v in features[crop_start:crop_end])
