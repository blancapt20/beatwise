import numpy as np

from app.features.processing.quality import (
    _classify_clipping_percentage,
    _classify_true_peak,
    calculate_rms,
    calculate_true_peak,
    detect_clipping,
)


def test_calculate_rms_for_unity_signal():
    audio = np.ones(2048, dtype=np.float32)
    rms_db = calculate_rms(audio)
    assert rms_db == 0.0


def test_detect_clipping_counts_peaks():
    audio = np.array([0.1, 1.0, -1.0, 0.5], dtype=np.float32)
    clipped_samples, clipping_percentage = detect_clipping(audio, threshold=0.999)
    assert clipped_samples == 2
    assert clipping_percentage == 50.0


def test_calculate_true_peak_dbfs():
    audio = np.array([0.0, 0.5, -0.5], dtype=np.float32)
    true_peak = calculate_true_peak(audio)
    assert round(true_peak, 2) == -6.02


def test_clipping_percentage_thresholds():
    assert _classify_clipping_percentage(0.0) is None
    assert _classify_clipping_percentage(0.01) is None
    assert _classify_clipping_percentage(0.02) == "minor_clipping"
    assert _classify_clipping_percentage(0.2) == "moderate_clipping"
    assert _classify_clipping_percentage(0.9) == "major_clipping"


def test_true_peak_thresholds():
    assert _classify_true_peak(-1.2) is None
    assert _classify_true_peak(-0.8) == "low_headroom"
    assert _classify_true_peak(-0.1) == "very_hot_signal"
    assert _classify_true_peak(0.1) == "tp_overs"
