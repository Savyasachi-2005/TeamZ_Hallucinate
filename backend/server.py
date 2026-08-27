"""Compatibility entry point for the NichePulse FastAPI application."""

try:
    from .app.app_factory import app
except ImportError:
    from app.app_factory import app

__all__ = ["app"]
