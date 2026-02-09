"""Stage 6: Nano Banana API integration."""
import httpx
import cv2
import numpy as np
from typing import Dict, Optional
import base64
from io import BytesIO
from PIL import Image

from ..config import settings
from ..models.job import ErrorCode


class NanoAPIError(Exception):
    """Error during Nano Banana API call."""
    def __init__(self, message: str, error_code: ErrorCode = ErrorCode.NANO_API_ERROR):
        self.message = message
        self.error_code = error_code
        super().__init__(message)


def numpy_to_base64(image: np.ndarray) -> str:
    """
    Convert numpy array to base64 string.
    
    Args:
        image: Image as numpy array (BGR)
        
    Returns:
        Base64 encoded string
    """
    # Convert BGR to RGB
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb)
    
    # Encode to JPEG
    buffer = BytesIO()
    pil_image.save(buffer, format='JPEG', quality=95)
    buffer.seek(0)
    
    # Base64 encode
    encoded = base64.b64encode(buffer.read()).decode('utf-8')
    
    return encoded


def create_prompt(
    preserve_face: bool = True,
    preserve_background: bool = True,
    realism_level: int = 3,
    garment_type: Optional[str] = None
) -> str:
    """
    Create prompt for Nano Banana API.
    
    Args:
        preserve_face: Whether to preserve face
        preserve_background: Whether to preserve background
        realism_level: Realism level 1-5
        garment_type: Type of garment
        
    Returns:
        Prompt string
    """
    prompt_parts = []
    
    # Core instruction
    prompt_parts.append(
        "High-quality virtual try-on result. "
        "Place the garment naturally on the person's body."
    )
    
    # Preserve identity
    if preserve_face:
        prompt_parts.append(
            "Preserve the person's face, identity, and facial features exactly as in the original image."
        )
    
    # Preserve background
    if preserve_background:
        prompt_parts.append(
            "Preserve the background exactly as in the original image."
        )
    
    # Garment fidelity
    prompt_parts.append(
        "Use exactly this garment with its original color, pattern, and design. "
        "Do not change or modify the garment appearance."
    )
    
    # Realism
    realism_instructions = {
        1: "Simple blend.",
        2: "Add basic shadows.",
        3: "Add realistic shadows and lighting that match the scene.",
        4: "Add realistic shadows, lighting, and natural fabric folds.",
        5: "Photorealistic result with perfect shadows, lighting, fabric physics, and natural draping."
    }
    prompt_parts.append(realism_instructions.get(realism_level, realism_instructions[3]))
    
    # Pose preservation
    prompt_parts.append(
        "Maintain the person's exact pose, body proportions, and position. "
        "Do not change the person's posture."
    )
    
    # Garment-specific
    if garment_type:
        prompt_parts.append(f"This is a {garment_type}.")
    
    return " ".join(prompt_parts)


async def call_nano_banana_api(
    person_image: np.ndarray,
    garment_image: np.ndarray,
    draft_composite: np.ndarray,
    prompt: str,
    timeout: Optional[int] = None
) -> np.ndarray:
    """
    Call Nano Banana API for photorealistic try-on.
    
    Args:
        person_image: Original person image (BGR)
        garment_image: Garment reference image (BGR)
        draft_composite: Draft composite from alignment stage (BGR)
        prompt: Text prompt with instructions
        timeout: Request timeout (uses config default if None)
        
    Returns:
        Result image (BGR)
        
    Raises:
        NanoAPIError: If API call fails
    """
    if timeout is None:
        timeout = settings.nano_banana_timeout
    
    try:
        # Encode images to base64
        person_b64 = numpy_to_base64(person_image)
        garment_b64 = numpy_to_base64(garment_image)
        draft_b64 = numpy_to_base64(draft_composite)
        
        # Prepare request payload
        payload = {
            "person_image": person_b64,
            "garment_image": garment_b64,
            "draft_image": draft_b64,
            "prompt": prompt,
            "negative_prompt": "deformed, distorted, disfigured, bad anatomy, wrong proportions, blurry, low quality",
        }
        
        # Make API request
        headers = {
            "Authorization": f"Bearer {settings.nano_banana_api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.nano_banana_api_url,
                json=payload,
                headers=headers,
                timeout=timeout
            )
            
            response.raise_for_status()
            
            result_data = response.json()
            
            # Extract result image from response
            # Assuming API returns base64 image in 'image' field
            if 'image' not in result_data:
                raise NanoAPIError(f"Invalid API response: {result_data}")
            
            result_b64 = result_data['image']
            
            # Decode base64 to image
            image_bytes = base64.b64decode(result_b64)
            nparr = np.frombuffer(image_bytes, np.uint8)
            result_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if result_image is None:
                raise NanoAPIError("Failed to decode result image")
            
            return result_image
            
    except httpx.TimeoutException:
        raise NanoAPIError("API request timed out", ErrorCode.TIMEOUT)
    except httpx.HTTPError as e:
        raise NanoAPIError(f"API request failed: {e}")
    except Exception as e:
        raise NanoAPIError(f"Unexpected error during API call: {e}")


async def generate_final_result(
    person_image: np.ndarray,
    garment_image: np.ndarray,
    draft_composite: np.ndarray,
    preserve_face: bool = True,
    preserve_background: bool = True,
    realism_level: int = 3,
    garment_type: Optional[str] = None
) -> np.ndarray:
    """
    Generate final photorealistic try-on result using Nano Banana API.
    
    Args:
        person_image: Original person image
        garment_image: Garment image
        draft_composite: Draft composite from alignment
        preserve_face: Preserve face and identity
        preserve_background: Preserve background
        realism_level: Realism level 1-5
        garment_type: Type of garment
        
    Returns:
        Final result image (BGR)
        
    Raises:
        NanoAPIError: If generation fails
    """
    # Create prompt
    prompt = create_prompt(
        preserve_face=preserve_face,
        preserve_background=preserve_background,
        realism_level=realism_level,
        garment_type=garment_type
    )
    
    # Call API
    result = await call_nano_banana_api(
        person_image=person_image,
        garment_image=garment_image,
        draft_composite=draft_composite,
        prompt=prompt
    )
    
    return result
