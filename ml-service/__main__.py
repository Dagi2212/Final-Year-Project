#!/usr/bin/env python3
"""Convenience launcher: python -m ml_service"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("ml_service.app:app", host="0.0.0.0", port=8000, reload=True)
