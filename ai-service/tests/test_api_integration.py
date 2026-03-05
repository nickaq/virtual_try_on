import requests
import os
import sys
import time
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"
TEST_IMAGE_PATH = Path(__file__).parent / "sample_images" / "test_person.jpg"

def ensure_test_image():
    """Create a simple test image if it doesn't exist."""
    if not TEST_IMAGE_PATH.exists():
        print(f"Generating test image at {TEST_IMAGE_PATH}...")
        TEST_IMAGE_PATH.parent.mkdir(exist_ok=True)
        
        try:
            import cv2
            import numpy as np
            # Create a 512x512 gradient image
            img = np.zeros((512, 512, 3), dtype=np.uint8)
            for y in range(512):
                for x in range(512):
                    img[y, x] = [x % 255, y % 255, (x+y) % 255]
            
            # Draw a circle (head) and rectangle (body) to resemble a person
            cv2.circle(img, (256, 100), 50, (200, 200, 200), -1)
            cv2.rectangle(img, (206, 150), (306, 400), (100, 100, 200), -1)
            
            cv2.imwrite(str(TEST_IMAGE_PATH), img)
            print("Test image generated.")
        except ImportError:
            print("OpenCV not found, cannot generate image. Please provide 'sample_images/test_person.jpg' manually.")
            sys.exit(1)

def check_health():
    """Check if service is running."""
    try:
        print(f"Checking health at {API_URL}/health ...")
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Service is UP")
            return True
        else:
            print(f"❌ Service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Service is DOWN (Connection refused)")
        print("   Did you run './start.sh' in 'ai-service/'?")
        return False

def test_process():
    """Test the try-on process (Submit -> Poll -> Result)."""
    print(f"\nTesting full Try-On flow...")
    
    if not TEST_IMAGE_PATH.exists():
        print("❌ Test image not found.")
        return

    # 1. Submit Job
    print("  Step 1: Submitting job...", end=" ", flush=True)
    try:
        files = {
            'user_image': ('user.jpg', open(TEST_IMAGE_PATH, 'rb'), 'image/jpeg'),
            'product_image': ('product.jpg', open(TEST_IMAGE_PATH, 'rb'), 'image/jpeg')
        }
        data = {
            'garment_type': 'upper_body',
            'mode': 'fast' # Use fast mode if available, else ignored
        }
        
        response = requests.post(f"{API_URL}/api/tryon/submit", files=files, data=data)
        
        if response.status_code != 200:
            print(f"❌ Failed to submit: {response.text}")
            return
            
        result = response.json()
        job_id = result.get('job_id')
        print(f"✓ Job ID: {job_id}")
        
    except Exception as e:
        print(f"❌ Exception during submit: {e}")
        return

    # 2. Poll Status
    print(f"  Step 2: Polling status for job {job_id}...", end=" ", flush=True)
    start_time = time.time()
    while True:
        try:
            status_resp = requests.get(f"{API_URL}/api/tryon/status/{job_id}")
            if status_resp.status_code != 200:
                print(f"❌ Error getting status: {status_resp.text}")
                break
                
            status_data = status_resp.json()
            status = status_data.get('status')
            
            if status == 'DONE':
                print("✓ DONE")
                print(f"    Quality Score: {status_data.get('quality_score')}")
                print(f"    Result URL: {status_data.get('result_image_url')}")
                break
            elif status == 'FAILED':
                print(f"❌ FAILED: {status_data.get('error_message')}")
                break
            else:
                print(f"{status}...", end=" ", flush=True)
                time.sleep(1)
                
            # Timeout after 30 seconds
            if time.time() - start_time > 30:
                print("❌ Timeout waiting for job to complete")
                break
                
        except Exception as e:
            print(f"❌ Exception polling status: {e}")
            break

if __name__ == "__main__":
    ensure_test_image()
    if check_health():
        test_process()
