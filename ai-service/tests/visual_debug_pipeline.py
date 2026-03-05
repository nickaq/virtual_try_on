import sys
import os
import cv2
import numpy as np
import glob
from pathlib import Path

# Add project root to path to allow imports of app module
# Script is in ai-service/tests/visual_debug_pipeline.py
# So project root is ai-service/ (parent of parent)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

try:
    from app.services.segmentation import segment_person
    from app.services.pose_detector import detect_pose
except ImportError as e:
    print(f"Error importing app modules: {e}")
    print(f"PYTHONPATH: {sys.path}")
    sys.exit(1)

def draw_pose_on_image(image, keypoints):
    """Draw keypoints and skeleton on image."""
    vis_img = image.copy()
    
    # Draw points
    for name, (x, y) in keypoints.items():
        cv2.circle(vis_img, (x, y), 5, (0, 255, 0), -1)
        # cv2.putText(vis_img, name, (x+5, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
    # Draw skeleton lines (simplified)
    skeleton = [
        ('left_shoulder', 'right_shoulder'),
        ('left_shoulder', 'left_elbow'),
        ('left_elbow', 'left_wrist'),
        ('right_shoulder', 'right_elbow'),
        ('right_elbow', 'right_wrist'),
        ('left_shoulder', 'left_hip'),
        ('right_shoulder', 'right_hip'),
        ('left_hip', 'right_hip')
    ]
    
    for p1, p2 in skeleton:
        if p1 in keypoints and p2 in keypoints:
            pt1 = keypoints[p1]
            pt2 = keypoints[p2]
            cv2.line(vis_img, pt1, pt2, (255, 0, 0), 2)
            
    return vis_img

def main():
    print("="*60)
    print("AI Service - Visual Debug Pipeline")
    print("="*60)
    
    # Setup paths
    test_dir = Path(__file__).parent
    input_dir = test_dir / "sample_images"
    output_dir = test_dir / "debug_output"
    
    # Create output dir if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find images
    extensions = ['*.jpg', '*.jpeg', '*.png']
    images = []
    for ext in extensions:
        images.extend(input_dir.glob(ext))
        
    if not images:
        print(f"No images found in {input_dir}")
        print("Please add a sample image (e.g., person.jpg) to run the debug.")
        print(f"Current directory: {os.getcwd()}")
        return
        
    print(f"Found {len(images)} images. Processing...")
    
    for img_path in images:
        print(f"\nProcessing {img_path.name}...")
        
        # Load image
        image = cv2.imread(str(img_path))
        if image is None:
            print("Failed to load image")
            continue
            
        try:
            # 1. Detect Pose
            print("  Step 1: Detecting Pose...", end=" ", flush=True)
            try:
                keypoints = detect_pose(image)
                print("✓ Done.")
                print(f"    Found {len(keypoints)} keypoints")
                
                # Visualize Pose
                pose_vis = draw_pose_on_image(image, keypoints)
                cv2.imwrite(str(output_dir / f"{img_path.stem}_1_pose.jpg"), pose_vis)
            except Exception as e:
                print(f"❌ Failed: {e}")
                keypoints = {} # Continue with empty keypoints if possible? No, usually fatal.
            
            if not keypoints:
                 print("    Skipping segmentation due to pose failure")
                 continue

            # 2. Segmentation
            print("  Step 2: Segmenting Person...", end=" ", flush=True)
            try:
                # segment_person returns a dict of masks
                masks_dict = segment_person(image, keypoints)
                # It returns {'person': ..., 'torso': ..., 'arms': ...} ?
                # Let's check signature... Yes, returns dict.
                print("✓ Done.")
                
                # Save masks
                if isinstance(masks_dict, dict):
                    for name, mask in masks_dict.items():
                         # Save mask as png
                        cv2.imwrite(str(output_dir / f"{img_path.stem}_2_mask_{name}.png"), mask)
                        
                    # Create composite (Person on green background)
                    person_mask = masks_dict.get('person')
                    if person_mask is not None:
                        green_bg = np.zeros_like(image)
                        green_bg[:] = (0, 255, 0)
                        
                        # Invert mask for background
                        inv_mask = cv2.bitwise_not(person_mask)
                        
                        # Foreground
                        fg = cv2.bitwise_and(image, image, mask=person_mask)
                        
                        # Background
                        bg = cv2.bitwise_and(green_bg, green_bg, mask=inv_mask)
                        
                        composite = cv2.add(fg, bg)
                        cv2.imwrite(str(output_dir / f"{img_path.stem}_3_composite.jpg"), composite)
                else:
                    print(f"    Warning: segment_person returned {type(masks_dict)}")

                print(f"  ✅ Validation successful! Results saved to {output_dir}")

            except Exception as e:
                print(f"❌ Failed: {e}")
                import traceback
                traceback.print_exc()
            
        except Exception as e:
            print(f"\n  ❌ Critical Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()
