# AI Virtual Try-On Service

Python-based AI service for virtual clothing try-on, integrating image processing, pose detection, and photorealistic generation via Nano Banana API.

## Features

- **Complete Try-On Pipeline**: 7-stage processing from image loading to final result
- **Intelligent Alignment**: Automatic garment positioning using pose detection and anchor points
- **Quality Control**: Validates alignment quality with automatic retries
- **Async Job Processing**: Background worker with in-memory job queue
- **FastAPI Backend**: RESTful API with job submission, status tracking, and result retrieval
- **Debug Mode**: Save intermediate artifacts (masks, keypoints, draft composites)

## Architecture

### Pipeline Stages

1. **Stage 0 - Image Loading**: Download/load images, auto-rotate, normalize
2. **Stage 1 - Segmentation**: Extract person, torso, and arms masks using rembg
3. **Stage 2 - Pose Detection**: Detect keypoints using MediaPipe Pose
4. **Stage 3 - Garment Preparation**: Remove background, detect anchor points
5. **Stage 4 - Alignment**: Calculate transform, warp garment, composite with occlusion
6. **Stage 5 - Quality Control**: Validate alignment quality, trigger retries if needed
7. **Stage 6 - API Integration**: Generate photorealistic result via Nano Banana API
8. **Stage 7 - Storage**: Save result and optional debug artifacts

## Installation

### Prerequisites

- Python 3.11+
- pip

### Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your Nano Banana API key
```

### Environment Variables

Key configuration in `.env`:

- `NANO_BANANA_API_KEY`: Your API key (required for final mode)
- `NANO_BANANA_API_URL`: API endpoint URL
- `WORK_IMAGE_SIZE`: Processing resolution (default: 1536)
- `QUALITY_THRESHOLD`: Minimum quality score (default: 0.7)
- `DEBUG`: Enable debug mode and artifact saving

## Usage

### Start the Server

```bash
# From backend directory
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start on `http://localhost:8000`

### API Endpoints

#### 1. Submit Try-On Job

```bash
POST /api/tryon/submit

# With file uploads
curl -X POST http://localhost:8000/api/tryon/submit \
  -F "user_image=@person.jpg" \
  -F "product_image=@tshirt.png" \
  -F "garment_type=tshirt" \
  -F "mode=final"

# With URLs
curl -X POST http://localhost:8000/api/tryon/submit \
  -F "user_image_url=https://example.com/person.jpg" \
  -F "product_image_url=https://example.com/tshirt.png" \
  -F "garment_type=tshirt"
```

Parameters:
- `user_image` (file) or `user_image_url` (string): Person photo
- `product_image` (file) or `product_image_url` (string): Garment photo
- `garment_type` (optional): Type of garment
- `mode` (optional): "draft" or "final" (default: "final")
- `preserve_face` (optional): Preserve face (default: true)
- `preserve_background` (optional): Preserve background (default: true)
- `realism_level` (optional): 1-5 realism level (default: 3)
- `max_retries` (optional): 0-3 retry attempts (default: 2)

Response:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "QUEUED",
  "message": "Job submitted successfully"
}
```

#### 2. Check Job Status

```bash
GET /api/tryon/status/{job_id}

curl http://localhost:8000/api/tryon/status/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DONE",
  "result_image_url": "/results/550e8400-e29b-41d4-a716-446655440000.png",
  "quality_score": 0.85,
  "retry_count": 0,
  "created_at": "2026-02-09T12:00:00",
  "completed_at": "2026-02-09T12:00:15"
}
```

#### 3. Get Result Image

```bash
GET /api/tryon/result/{job_id}

curl http://localhost:8000/api/tryon/result/550e8400-e29b-41d4-a716-446655440000 \
  --output result.png
```

#### 4. Health Check

```bash
GET /health

curl http://localhost:8000/health
```

## Processing Modes

### Draft Mode

Fast processing without API call - uses only the alignment composite.

```bash
-F "mode=draft"
```

### Final Mode (Default)

Full processing with Nano Banana API for photorealistic results.

```bash
-F "mode=final"
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models/              # Data models
│   │   ├── job.py           # Job status and tracking
│   │   └── requests.py      # API request/response models
│   ├── services/            # Processing pipeline
│   │   ├── image_loader.py  # Stage 0: Image loading
│   │   ├── segmentation.py  # Stage 1: Person segmentation
│   │   ├── pose_detector.py # Stage 2: Pose detection
│   │   ├── garment_prep.py  # Stage 3: Garment preparation
│   │   ├── alignment.py     # Stage 4: Alignment & warping
│   │   ├── quality_control.py # Stage 5: Quality checks
│   │   ├── nano_api.py      # Stage 6: API integration
│   │   └── storage.py       # Stage 7: Result storage
│   ├── workers/             # Job processing
│   │   ├── job_queue.py     # In-memory queue
│   │   └── processor.py     # Background worker
│   └── utils/               # Utilities
│       ├── image_utils.py   # Image operations
│       └── validation.py    # Input validation
├── storage/                 # File storage
│   ├── uploads/             # User photos
│   ├── products/            # Product images
│   ├── results/             # Final results
│   └── artifacts/           # Debug artifacts
├── tests/                   # Tests
├── requirements.txt         # Python dependencies
├── .env                     # Environment configuration
└── README.md               # This file
```

## Error Codes

- `INVALID_IMAGE_FORMAT`: Invalid image file format
- `IMAGE_TOO_LARGE`: Image exceeds size limit
- `SEGMENTATION_FAILED`: Person segmentation failed
- `POSE_FAILED`: Pose detection failed
- `WARP_FAILED`: Garment warping failed
- `QUALITY_CHECK_FAILED`: Quality validation failed
- `NANO_API_ERROR`: API call failed
- `TIMEOUT`: Operation timed out
- `STORAGE_ERROR`: Storage/file operation failed

## Development

### Running Tests

```bash
# Run tests
pytest tests/ -v
```

### Debug Mode

Enable debug artifact saving in `.env`:

```
DEBUG=true
SAVE_DEBUG_ARTIFACTS=true
```

Debug artifacts will be saved to `storage/artifacts/{job_id}/`:
- `person_mask.png`: Person segmentation
- `torso_mask.png`: Torso mask
- `garment_mask.png`: Garment mask
- `draft_composite.png`: Draft alignment result
- `keypoints.json`: Detected pose keypoints

## Integration with Next.js Frontend

The service can be integrated with your existing Next.js fashion store:

```typescript
// Example: Submit try-on job
const formData = new FormData();
formData.append('user_image', userImageFile);
formData.append('product_image', productImageFile);
formData.append('garment_type', 'tshirt');

const response = await fetch('http://localhost:8000/api/tryon/submit', {
  method: 'POST',
  body: formData
});

const { job_id } = await response.json();

// Poll for status
const checkStatus = async () => {
  const status = await fetch(`http://localhost:8000/api/tryon/status/${job_id}`);
  const data = await status.json();
  
  if (data.status === 'DONE') {
    // Display result
    return data.result_image_url;
  } else if (data.status === 'FAILED') {
    // Handle error
    console.error(data.error_message);
  }
};
```

## Production Considerations

For production deployment:

1. **Redis Queue**: Replace in-memory queue with Redis (RQ/Celery)
2. **Object Storage**: Use S3/GCS instead of local file storage
3. **Database**: Store job metadata in PostgreSQL/MongoDB
4. **API Authentication**: Add API key authentication
5. **Rate Limiting**: Implement request rate limiting
6. **Monitoring**: Add logging and metrics (Prometheus/Grafana)
7. **CORS**: Configure proper CORS origins
8. **HTTPS**: Enable SSL/TLS

## License

Proprietary - AI Fashion Store

## Support

For issues or questions, contact the development team.
