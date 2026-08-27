from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .routes import system, trends, channels, copilot


def create_app():
    application = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(system.router)
    api.include_router(trends.router)
    api.include_router(channels.router)
    api.include_router(copilot.router)
    application.include_router(api)
    application.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=CORS_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return application


app = create_app()
