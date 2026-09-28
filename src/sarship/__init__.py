"""Ship detection in Sentinel-1 SAR imagery."""

from .detect import DetectionResult, DetectorConfig, ShipDetector
from .s1 import S1Product

__all__ = ["DetectionResult", "DetectorConfig", "S1Product", "ShipDetector"]
__version__ = "0.1.0"
