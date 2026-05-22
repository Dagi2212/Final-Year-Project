#!/usr/bin/env python3
"""Convenience launcher: python -m ml_service (when packaged) or python -m __main__ locally."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
