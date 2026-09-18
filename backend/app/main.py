"""
Satori Backend - FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, analysis, coach
from app.services.katago import get_katago_service, shutdown_katago_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    logger.info("Starting Satori backend")
    
    # Start KataGo if enabled
    if settings.katago_enabled:
        try:
            katago_service = get_katago_service()
            # Engine will start on first request
            logger.info("KataGo service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize KataGo: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Satori backend")
    await shutdown_katago_service()
    logger.info("Shutdown complete")


app = FastAPI(
    title="Satori Backend",
    description="Backend API for Satori Go game analysis and coaching",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(coach.router, prefix="/coach", tags=["coach"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "satori-backend",
        "version": "0.1.0",
        "status": "running",
        "katago_enabled": settings.katago_enabled
    }
