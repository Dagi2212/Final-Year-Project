"""
Tests for the training pipeline using the sample CSV.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

SAMPLE_CSV = Path(__file__).parent.parent / "data" / "sample_yield.csv"


def test_sample_csv_exists():
    assert SAMPLE_CSV.exists(), "sample_yield.csv must exist in ml-service/data/"


def test_load_and_prepare():
    from ml_service.train import load_and_prepare

    df = load_and_prepare(SAMPLE_CSV)
    assert len(df) > 0
    assert "actual_yield_kg" in df.columns
    assert (df["actual_yield_kg"] > 0).all()


def test_build_features():
    from ml_service.train import build_features, load_and_prepare

    df = load_and_prepare(SAMPLE_CSV)
    X, y, scaler_params = build_features(df)
    assert X.shape[0] == len(df)
    assert y.shape[0] == len(df)
    assert "means" in scaler_params
    assert "stds" in scaler_params
    assert X.shape[1] > 0


def test_train_sample(tmp_path, monkeypatch):
    """Full train run on sample CSV should complete and produce a saved model."""
    import ml_service.model as m

    monkeypatch.setattr(m, "MODELS_DIR", tmp_path / "models")

    from ml_service.train import train

    version = train(SAMPLE_CSV, epochs=3, batch_size=8, lr=1e-2)
    assert version
    assert (tmp_path / "models" / version / "model.pt").exists()
    assert (tmp_path / "models" / version / "metadata.json").exists()
    assert (tmp_path / "models" / "latest.txt").exists()
