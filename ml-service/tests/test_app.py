"""
Tests for the FastAPI application endpoints.
Uses TestClient to avoid starting a real server.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from fastapi.testclient import TestClient


@pytest.fixture()
def client_no_model():
    """Client with no model loaded (startup skipped)."""
    with patch("ml_service.app.load_latest_model", side_effect=FileNotFoundError):
        from ml_service.app import app

        with TestClient(app) as c:
            yield c


def test_health_no_model(client_no_model):
    resp = client_no_model.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("no_model", "ok")


def test_predict_no_model(client_no_model):
    resp = client_no_model.post("/predict/yield", json={"crop_name": "maize"})
    assert resp.status_code == 503
