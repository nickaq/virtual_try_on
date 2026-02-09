"""Test utilities and pytest configuration."""
import pytest


@pytest.fixture
def sample_image_dir():
    """Return path to sample images directory."""
    from pathlib import Path
    return Path(__file__).parent / "sample_images"
