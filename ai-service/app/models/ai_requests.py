"""New request/response models for path-based processing."""
from pydantic import BaseModel
from typing import Optional


class AIProcessRequest(BaseModel):
    """Request model for AI processing with file paths."""
    job_id: str
    user_image_path: str
    product_image_path: str
    garment_type: Optional[str] = None
    mode: str = "final"  # 'draft' or 'final'
    realism_level: int = 3
    preserve_face: bool = True
    preserve_background: bool = True
    max_retries: int = 2


class AIProcessResponse(BaseModel):
    """Response model for AI processing result."""
    job_id: str
    status: str  # 'DONE' or 'FAILED'
    result_path: Optional[str] = None
    quality_score: Optional[float] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
