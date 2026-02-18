"""FastAPI Application - Walkability Index API."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from .routers import health, profiles, areas

# Initialize FastAPI app
app = FastAPI(
    title="Walkability Index API",
    description="REST API for querying Walkability Index scores",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server alternative
        "http://localhost",        # Docker frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    logger.info("=" * 60)
    logger.info("Walkability Index API starting...")
    logger.info("=" * 60)
    logger.info("API Documentation: http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Walkability Index API shutting down...")


# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(profiles.router, prefix="/api/v1", tags=["profiles"])
app.include_router(areas.router, prefix="/api/v1", tags=["areas"])


# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint - redirect to docs."""
    return {
        "message": "Walkability Index API",
        "version": "1.0.0",
        "docs": "/docs"
    }
