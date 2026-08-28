from __future__ import annotations

from collections import Counter
from typing import Any, Dict, Iterable, List


def _safe_number(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _normalize_key(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip().lower()


def _iter_events(events: Any) -> Iterable[Dict[str, Any]]:
    if not isinstance(events, list):
        return []

    return [
        event
        for event in events
        if isinstance(event, dict)
    ]


def analyze_keyboard_events(
    events: Any,
) -> Dict[str, Any]:

    normalized_events = list(
        _iter_events(events)
    )

    if not normalized_events:
        return {
            "total_events": 0,
            "total_keystrokes": 0,
            "typing_speed": 0,
            "average_delay": 0,
            "backspace_count": 0,
            "correction_rate": 0,
            "key_frequency": {},
            "most_used_keys": [],
        }

    timestamps: List[float] = []
    keys: List[str] = []
    delays: List[float] = []

    for event in normalized_events:

        key = _normalize_key(
            event.get("key")
        )

        timestamp = _safe_number(
            event.get("timestamp")
        )

        delay = _safe_number(
            event.get("delay")
        )

        if key:
            keys.append(key)

        if timestamp > 0:
            timestamps.append(timestamp)

        if delay > 0:
            delays.append(delay)

    total_keystrokes = len(keys)

    backspace_count = sum(
        1
        for key in keys
        if key in {
            "backspace",
            "delete",
        }
    )

    correction_rate = (
        round(
            (
                backspace_count
                / total_keystrokes
            )
            * 100,
            2,
        )
        if total_keystrokes > 0
        else 0
    )

    average_delay = (
        round(
            sum(delays)
            / len(delays),
            2,
        )
        if delays
        else 0
    )

    typing_speed = 0

    if len(timestamps) >= 2:

        elapsed = (
            max(timestamps)
            - min(timestamps)
        )

        if elapsed > 0:

            if elapsed > 1000:
                elapsed_seconds = (
                    elapsed / 1000
                )
            else:
                elapsed_seconds = elapsed

            typing_speed = round(
                (
                    total_keystrokes
                    / elapsed_seconds
                )
                * 60,
                2,
            )

    key_frequency = dict(
        Counter(keys)
    )

    most_used_keys = [
        {
            "key": key,
            "count": count,
        }
        for key, count in (
            Counter(keys)
            .most_common(10)
        )
    ]

    return {
        "total_events": len(
            normalized_events
        ),
        "total_keystrokes": total_keystrokes,
        "typing_speed": typing_speed,
        "average_delay": average_delay,
        "backspace_count": backspace_count,
        "correction_rate": correction_rate,
        "key_frequency": key_frequency,
        "most_used_keys": most_used_keys,
    }