"""Background job processor."""
import asyncio
import traceback
from typing import Optional

from .job_queue import job_queue
from ..models.job import Job, JobStatus, ErrorCode
from ..services import image_loader, segmentation, pose_detector, garment_prep, alignment, quality_control, nano_api, storage


async def process_job(job: Job) -> bool:
    """
    Process a single try-on job through the complete pipeline.
    
    Args:
        job: Job to process
        
    Returns:
        True if successful, False if failed
    """
    try:
        print(f"Processing job {job.job_id}...")
        
        # Update status to processing
        job.mark_processing()
        await job_queue.update_job(job)
        
        # Stage 0: Load and normalize images
        print(f"  Stage 0: Loading images...")
        person_image, _ = await image_loader.load_and_normalize(
            image_url=job.user_image_url,
            image_path=job.user_image_path
        )
        
        garment_image, _ = await image_loader.load_and_normalize(
            image_url=job.product_image_url,
            image_path=job.product_image_path
        )
        
        # Stage 2: Detect pose (before segmentation to optionally use for torso extraction)
        print(f"  Stage 2: Detecting pose...")
        person_keypoints = pose_detector.detect_pose(person_image, person_mask=None)
        
        # Stage 1: Segment person
        print(f"  Stage 1: Segmenting person...")
        masks = segmentation.segment_person(person_image, person_keypoints)
        person_mask = masks['person']
        torso_mask = masks['torso']
        arms_mask = masks['arms']
        
        # Re-detect pose with person mask as fallback
        if len(person_keypoints) < 2:
            person_keypoints = pose_detector.detect_pose(person_image, person_mask)
        
        # Stage 3: Prepare garment
        print(f"  Stage 3: Preparing garment...")
        garment_rgba, garment_mask, garment_anchors = garment_prep.prepare_garment(
            garment_image,
            garment_type=job.garment_type
        )
        
        # Stage 4: Align and composite
        print(f"  Stage 4: Aligning and compositing...")
        draft_composite, transformed_garment_mask, transform_params = alignment.align_and_composite(
            person_image=person_image,
            person_keypoints=person_keypoints,
            garment_image=garment_rgba,
            garment_mask=garment_mask,
            garment_anchors=garment_anchors,
            torso_mask=torso_mask,
            arms_mask=arms_mask
        )
        
        # Stage 5: Quality control
        print(f"  Stage 5: Quality control...")
        quality_score, quality_passed = quality_control.quality_control(
            garment_anchors=garment_anchors,
            person_keypoints=person_keypoints,
            garment_mask=transformed_garment_mask,
            person_mask=person_mask,
            transform_params=transform_params
        )
        
        if not quality_passed and job.can_retry():
            # Quality check failed but we can retry
            print(f"  Quality check failed (score: {quality_score:.2f}), retrying...")
            job.increment_retry()
            job.status = JobStatus.QUEUED
            await job_queue.update_job(job)
            await job_queue.requeue_job(job.job_id)
            return False
        
        # Decide final result based on mode
        if job.mode == "draft":
            # Draft mode: use draft composite
            print(f"  Draft mode: using draft composite...")
            final_result = draft_composite
        else:
            # Final mode: call API
            print(f"  Stage 6: Calling Nano Banana API...")
            try:
                final_result = await nano_api.generate_final_result(
                    person_image=person_image,
                    garment_image=garment_image,
                    draft_composite=draft_composite,
                    preserve_face=job.preserve_face,
                    preserve_background=job.preserve_background,
                    realism_level=job.realism_level,
                    garment_type=job.garment_type
                )
            except nano_api.NanoAPIError as e:
                # API failed - use draft as fallback
                print(f"  Warning: API call failed ({e.message}), using draft composite...")
                final_result = draft_composite
        
        # Stage 7: Save result
        print(f"  Stage 7: Saving result...")
        result_url = storage.save_result(job.job_id, final_result)
        
        # Save debug artifacts if enabled
        debug_artifacts = storage.save_debug_artifacts(
            job_id=job.job_id,
            person_mask=person_mask,
            torso_mask=torso_mask,
            garment_mask=transformed_garment_mask,
            draft_composite=draft_composite,
            keypoints=person_keypoints
        )
        
        job.debug_artifacts = debug_artifacts
        
        # Mark as done
        job.mark_done(result_url, quality_score)
        await job_queue.update_job(job)
        
        print(f"Job {job.job_id} completed successfully!")
        return True
        
    except image_loader.ImageLoadError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except segmentation.SegmentationError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except pose_detector.PoseDetectionError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except garment_prep.GarmentPrepError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except alignment.AlignmentError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except quality_control.QualityCheckError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except storage.StorageError as e:
        job.mark_failed(e.error_code, e.message)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed: {e.message}")
        return False
        
    except Exception as e:
        # Catch-all for unexpected errors
        error_msg = f"Unexpected error: {str(e)}\n{traceback.format_exc()}"
        job.mark_failed(ErrorCode.UNKNOWN_ERROR, error_msg)
        await job_queue.update_job(job)
        print(f"Job {job.job_id} failed with unexpected error: {error_msg}")
        return False


async def worker_loop():
    """
    Background worker that continuously processes jobs from the queue.
    """
    print("Worker started, waiting for jobs...")
    
    while True:
        try:
            # Get next job from queue
            job_id = await job_queue.get_next_job()
            
            if job_id is None:
                # No jobs, wait a bit
                await asyncio.sleep(0.1)
                continue
            
            # Get job data
            job = await job_queue.get_job(job_id)
            
            if job is None:
                print(f"Warning: Job {job_id} not found in storage")
                continue
            
            # Process the job
            await process_job(job)
            
        except Exception as e:
            print(f"Worker error: {e}\n{traceback.format_exc()}")
            await asyncio.sleep(1)


def start_worker():
    """Start the background worker in a new task."""
    asyncio.create_task(worker_loop())
