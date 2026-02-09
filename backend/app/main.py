"""FastAPI application for AI Virtual Try-On service."""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import uuid
from typing import Optional
from pathlib import Path

from .config import settings
from .models.job import Job, JobStatus
from .models.requests import TryOnRequest, TryOnResponse, StatusResponse
from .workers import job_queue, start_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    # Startup
    print("Starting AI Virtual Try-On Service...")
    
    # Ensure storage directories exist
    settings.ensure_directories()
    
    # Start background worker
    start_worker()
    
    print(f"Service started on {settings.host}:{settings.port}")
    
    yield
    
    # Shutdown
    print("Shutting down service...")


# Create FastAPI app
app = FastAPI(
    title="AI Virtual Try-On Service",
    description="AI-powered virtual clothing try-on service",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file serving for results and artifacts
app.mount("/results", StaticFiles(directory=str(settings.results_path)), name="results")
app.mount("/artifacts", StaticFiles(directory=str(settings.artifacts_path)), name="artifacts")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "AI Virtual Try-On",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    stats = job_queue.get_stats()
    return {
        "status": "healthy",
        "queue_stats": stats
    }


@app.post("/api/tryon/submit", response_model=TryOnResponse)
async def submit_tryon(
    user_image: Optional[UploadFile] = File(None),
    user_image_url: Optional[str] = Form(None),
    product_image: Optional[UploadFile] = File(None),
    product_image_url: Optional[str] = Form(None),
    product_id: Optional[str] = Form(None),
    garment_type: Optional[str] = Form(None),
    mode: str = Form("final"),
    preserve_face: bool = Form(True),
    preserve_background: bool = Form(True),
    realism_level: int = Form(3),
    max_retries: int = Form(2)
):
    """
    Submit a virtual try-on job.
    
    Accepts either file uploads or URLs for user and product images.
    """
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Handle user image
    user_image_path = None
    if user_image:
        # Save uploaded file
        upload_path = settings.uploads_path / f"{job_id}_user{Path(user_image.filename).suffix}"
        with open(upload_path, "wb") as f:
            content = await user_image.read()
            f.write(content)
        user_image_path = str(upload_path)
    elif not user_image_url:
        raise HTTPException(status_code=400, detail="Either user_image file or user_image_url must be provided")
    
    # Handle product image
    product_image_path = None
    if product_image:
        # Save uploaded file
        upload_path = settings.products_path / f"{job_id}_product{Path(product_image.filename).suffix}"
        with open(upload_path, "wb") as f:
            content = await product_image.read()
            f.write(content)
        product_image_path = str(upload_path)
    elif not product_image_url:
        raise HTTPException(status_code=400, detail="Either product_image file or product_image_url must be provided")
    
    # Create job
    job = Job(
        job_id=job_id,
        user_image_path=user_image_path,
        user_image_url=user_image_url,
        product_id=product_id,
        product_image_path=product_image_path,
        product_image_url=product_image_url,
        garment_type=garment_type,
        mode=mode,
        max_retries=max_retries,
        preserve_face=preserve_face,
        preserve_background=preserve_background,
        realism_level=realism_level
    )
    
    # Submit to queue
    await job_queue.submit_job(job)
    
    return TryOnResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        message="Job submitted successfully"
    )


@app.get("/api/tryon/status/{job_id}", response_model=StatusResponse)
async def get_status(job_id: str):
    """Get status of a try-on job."""
    job = await job_queue.get_job(job_id)
    
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    return StatusResponse(
        job_id=job.job_id,
        status=job.status,
        result_image_url=job.result_image_url,
        quality_score=job.quality_score,
        debug_artifacts=job.debug_artifacts if settings.debug else None,
        error_code=job.error_code,
        error_message=job.error_message,
        retry_count=job.retry_count,
        created_at=job.created_at.isoformat(),
        updated_at=job.updated_at.isoformat(),
        started_at=job.started_at.isoformat() if job.started_at else None,
        completed_at=job.completed_at.isoformat() if job.completed_at else None
    )


@app.get("/api/tryon/result/{job_id}")
async def get_result(job_id: str):
    """Get result image for a completed job."""
    job = await job_queue.get_job(job_id)
    
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    if job.status != JobStatus.DONE:
        raise HTTPException(
            status_code=400,
            detail=f"Job is not completed. Current status: {job.status}"
        )
    
    # Return the result image file
    result_path = settings.results_path / f"{job_id}.png"
    
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Result image not found")
    
    return FileResponse(result_path, media_type="image/png")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
