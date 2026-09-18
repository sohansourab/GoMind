"""
Satori Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, analysis, coach

app = FastAPI(
    title="Satori Backend",
    description="Backend API for Satori Go game analysis and coaching",
    version="0.1.0"
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
        "status": "running"
    }
