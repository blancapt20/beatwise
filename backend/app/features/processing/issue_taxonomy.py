from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Set


@dataclass(frozen=True)
class IssueDefinition:
    label: str
    category: str
    severity: str
    priority: int
    worry: str
    explanation: str


EXTREME_LOW_BITRATE_THRESHOLD = 96

ISSUE_DEFINITIONS: Dict[str, IssueDefinition] = {
    "file_not_found": IssueDefinition(
        label="File Not Found",
        category="file_integrity",
        severity="error",
        priority=1000,
        worry="critical",
        explanation="The file cannot be located and cannot be analyzed or played.",
    ),
    "unsupported_format": IssueDefinition(
        label="Unsupported Format",
        category="file_integrity",
        severity="error",
        priority=990,
        worry="critical",
        explanation="The file format is not supported by the analyzer pipeline.",
    ),
    "corrupted": IssueDefinition(
        label="Corrupted File",
        category="file_integrity",
        severity="error",
        priority=980,
        worry="critical",
        explanation="The file cannot be reliably decoded and is unsafe for playback use.",
    ),
    "truncated_content": IssueDefinition(
        label="Truncated Content",
        category="file_integrity",
        severity="error",
        priority=920,
        worry="high",
        explanation="Decoded content appears incomplete or has suspicious long silent tail.",
    ),
    "metadata_inconsistency": IssueDefinition(
        label="Metadata Inconsistency",
        category="file_integrity",
        severity="warning",
        priority=680,
        worry="medium",
        explanation="Decoded duration and metadata duration diverge beyond accepted tolerance.",
    ),
    "fake_bitrate_severe": IssueDefinition(
        label="Fake Bitrate (Severe)",
        category="source_quality",
        severity="error",
        priority=900,
        worry="high",
        explanation="Very large bitrate mismatch or extremely low real bitrate indicates bad source.",
    ),
    "fake_bitrate": IssueDefinition(
        label="Fake Bitrate",
        category="source_quality",
        severity="warning",
        priority=650,
        worry="medium",
        explanation="Declared and real bitrate mismatch suggests low-quality source or transcode.",
    ),
    "low_bitrate": IssueDefinition(
        label="Low Bitrate",
        category="source_quality",
        severity="warning",
        priority=630,
        worry="medium",
        explanation="Effective MP3 bitrate is low for club playback expectations.",
    ),
    "possible_upscale": IssueDefinition(
        label="Possible Upscale",
        category="source_quality",
        severity="warning",
        priority=610,
        worry="low",
        explanation="Bitrate claims and spectral cutoff indicate possible low-quality upscaled source.",
    ),
    "tp_hard_overs": IssueDefinition(
        label="Hard True-Peak Overs",
        category="playback_risk",
        severity="error",
        priority=880,
        worry="high",
        explanation="True-peak overs are far above safe headroom and increase distortion risk.",
    ),
    "very_hot_signal": IssueDefinition(
        label="Very Hot Signal",
        category="playback_risk",
        severity="warning",
        priority=560,
        worry="medium",
        explanation="Signal sits near 0 dBTP and needs careful gain staging.",
    ),
    "low_headroom": IssueDefinition(
        label="Low Headroom",
        category="playback_risk",
        severity="warning",
        priority=540,
        worry="low",
        explanation="Headroom is tight and leaves little room for safe playback margin.",
    ),
    "too_loud": IssueDefinition(
        label="Too Loud",
        category="playback_risk",
        severity="warning",
        priority=500,
        worry="low",
        explanation="Integrated loudness is hot and may require channel gain compensation.",
    ),
    "too_quiet": IssueDefinition(
        label="Too Quiet",
        category="playback_risk",
        severity="warning",
        priority=520,
        worry="low",
        explanation="Integrated loudness is low and may feel weak in club playback.",
    ),
    "long_clipping_runs": IssueDefinition(
        label="Long Clipping Runs",
        category="mastering_content",
        severity="error",
        priority=870,
        worry="high",
        explanation="Long consecutive clipped sequences are strong indicators of audible distortion.",
    ),
    "major_clipping": IssueDefinition(
        label="Major Clipping",
        category="mastering_content",
        severity="error",
        priority=840,
        worry="high",
        explanation="High clipped-sample ratio suggests probable audible distortion.",
    ),
    "moderate_clipping": IssueDefinition(
        label="Moderate Clipping",
        category="mastering_content",
        severity="warning",
        priority=580,
        worry="medium",
        explanation="Noticeable clipping behavior may become audible on loud systems.",
    ),
    "minor_clipping": IssueDefinition(
        label="Minor Clipping",
        category="mastering_content",
        severity="warning",
        priority=560,
        worry="low",
        explanation="Light clipping behavior is present; monitor in context.",
    ),
    "overcompressed_master": IssueDefinition(
        label="Overcompressed Master",
        category="mastering_content",
        severity="warning",
        priority=590,
        worry="medium",
        explanation="Master likely has reduced dynamics and can sound fatiguing at high SPL.",
    ),
    "low_frequency_content": IssueDefinition(
        label="Low Frequency Content",
        category="mastering_content",
        severity="warning",
        priority=420,
        worry="low",
        explanation="Low-end balance appears weak relative to full-spectrum content.",
    ),
}

SUPPRESSION_RULES: Dict[str, Set[str]] = {
    "file_not_found": {
        "unsupported_format",
        "corrupted",
        "truncated_content",
        "metadata_inconsistency",
        "fake_bitrate_severe",
        "fake_bitrate",
        "low_bitrate",
        "possible_upscale",
        "tp_hard_overs",
        "very_hot_signal",
        "low_headroom",
        "too_loud",
        "too_quiet",
        "major_clipping",
        "moderate_clipping",
        "minor_clipping",
        "long_clipping_runs",
        "overcompressed_master",
        "low_frequency_content",
    },
    "unsupported_format": {
        "corrupted",
        "truncated_content",
        "metadata_inconsistency",
        "fake_bitrate_severe",
        "fake_bitrate",
        "low_bitrate",
        "possible_upscale",
        "tp_hard_overs",
        "very_hot_signal",
        "low_headroom",
        "too_loud",
        "too_quiet",
        "major_clipping",
        "moderate_clipping",
        "minor_clipping",
        "long_clipping_runs",
        "overcompressed_master",
        "low_frequency_content",
    },
    "corrupted": {"truncated_content", "metadata_inconsistency", "fake_bitrate", "possible_upscale", "low_bitrate"},
    "fake_bitrate_severe": {"fake_bitrate", "possible_upscale", "low_bitrate"},
    "truncated_content": {"metadata_inconsistency"},
    "long_clipping_runs": {"major_clipping", "moderate_clipping", "minor_clipping"},
    "major_clipping": {"moderate_clipping", "minor_clipping"},
    "tp_hard_overs": {"very_hot_signal", "low_headroom", "too_loud"},
    "overcompressed_master": {"too_loud"},
}


def _label_from_tag(tag: str) -> str:
    return tag.replace("_", " ").title()


def _is_extreme_low_bitrate(properties: Optional[Dict[str, Any]]) -> bool:
    if not properties:
        return False
    if (properties.get("format") or "").lower() != "mp3":
        return False
    bitrate_real = int(properties.get("bitrate_real") or 0)
    bitrate_declared = int(properties.get("bitrate_declared") or 0)
    effective = bitrate_real if bitrate_real > 0 else bitrate_declared
    return 0 < effective < EXTREME_LOW_BITRATE_THRESHOLD


def _normalize_tag_metadata(tag: str, properties: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    definition = ISSUE_DEFINITIONS.get(tag)
    if definition is None:
        return {
            "tag": tag,
            "label": _label_from_tag(tag),
            "category": "mastering_content",
            "severity": "warning",
            "priority": 100,
            "worry": "low",
            "explanation": "Additional quality signal detected.",
        }

    if tag == "low_bitrate" and _is_extreme_low_bitrate(properties):
        return {
            "tag": tag,
            "label": "Low Bitrate (Severe)",
            "category": definition.category,
            "severity": "error",
            "priority": 905,
            "worry": "high",
            "explanation": "Effective MP3 bitrate is extremely low and can be unreliable on club sound systems.",
        }

    return {
        "tag": tag,
        "label": definition.label,
        "category": definition.category,
        "severity": definition.severity,
        "priority": definition.priority,
        "worry": definition.worry,
        "explanation": definition.explanation,
    }


def _apply_suppression(issues: Iterable[str]) -> List[str]:
    unique = set(issues)
    kept = set(unique)
    for tag in unique:
        suppressed = SUPPRESSION_RULES.get(tag)
        if not suppressed:
            continue
        for candidate in suppressed:
            kept.discard(candidate)
    return sorted(kept)


def build_display_issue_payload(
    issues: List[str],
    properties: Optional[Dict[str, Any]],
    max_visible: int = 4,
) -> Dict[str, Any]:
    reduced = _apply_suppression(issues)
    normalized = [_normalize_tag_metadata(tag, properties) for tag in reduced]
    normalized.sort(key=lambda item: (-int(item["priority"]), str(item["tag"])))

    visible = normalized[:max_visible]
    hidden_count = max(0, len(normalized) - len(visible))
    primary = visible[0] if visible else None

    if not normalized:
        overall_severity = "none"
    elif any(item.get("severity") == "error" for item in normalized):
        overall_severity = "error"
    else:
        overall_severity = "warning"

    return {
        "display_issues": visible,
        "hidden_issues_count": hidden_count,
        "issue_overall_severity": overall_severity,
        "issue_primary_tag": primary.get("tag") if primary else None,
        "issue_primary_label": primary.get("label") if primary else None,
    }
