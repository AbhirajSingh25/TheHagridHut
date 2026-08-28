import json
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession


router = APIRouter(
    tags=["Analytics"],
)


def safe_json(
    value: Any,
    default: Any,
) -> Any:
    if value is None or value == "":
        return default

    if isinstance(
        value,
        (dict, list),
    ):
        return value

    try:
        return json.loads(value)
    except Exception:
        return default


def to_number(
    value: Any,
    default: float = 0,
) -> float:
    try:
        number = float(value)

        if number < 0:
            return default

        return number

    except (
        TypeError,
        ValueError,
    ):
        return default


def get_average(
    values: list[float],
) -> float:
    valid_values = [
        value
        for value in values
        if value is not None
    ]

    if not valid_values:
        return 0

    return round(
        sum(valid_values)
        / len(valid_values),
        1,
    )


def get_first_number(
    *values: Any,
) -> float:
    for value in values:
        if value is None:
            continue

        try:
            number = float(value)

            if number >= 0:
                return number

        except (
            TypeError,
            ValueError,
        ):
            continue

    return 0


def get_dict_number(
    data: dict,
    *keys: str,
) -> float:
    for key in keys:
        if key not in data:
            continue

        number = to_number(
            data.get(key),
            -1,
        )

        if number >= 0:
            return number

    return 0


def extract_session_metrics(
    session: InterviewSession,
) -> dict:
    evaluations = safe_json(
        getattr(
            session,
            "evaluations",
            None,
        ),
        [],
    )

    final_report = safe_json(
        getattr(
            session,
            "final_report",
            None,
        ),
        {},
    )

    if not isinstance(
        final_report,
        dict,
    ):
        final_report = {}

    if not isinstance(
        evaluations,
        list,
    ):
        evaluations = []

    technical_values = []
    communication_values = []
    confidence_values = []
    evaluation_scores = []

    for evaluation in evaluations:
        if not isinstance(
            evaluation,
            dict,
        ):
            continue

        technical = get_dict_number(
            evaluation,
            "technical_score",
            "technical",
        )

        communication = get_dict_number(
            evaluation,
            "communication_score",
            "communication",
        )

        confidence = get_dict_number(
            evaluation,
            "confidence_score",
            "confidence",
        )

        score = get_dict_number(
            evaluation,
            "score",
            "overall_score",
        )

        if technical > 0:
            technical_values.append(
                technical
            )

        if communication > 0:
            communication_values.append(
                communication
            )

        if confidence > 0:
            confidence_values.append(
                confidence
            )

        if score > 0:
            evaluation_scores.append(
                score
            )

    technical = get_first_number(
        getattr(
            session,
            "technical_score",
            None,
        ),
        final_report.get(
            "technical_score"
        ),
        final_report.get(
            "technical"
        ),
        get_average(
            technical_values
        ),
    )

    communication = get_first_number(
        getattr(
            session,
            "communication_score",
            None,
        ),
        final_report.get(
            "communication_score"
        ),
        final_report.get(
            "communication"
        ),
        get_average(
            communication_values
        ),
    )

    confidence = get_first_number(
        getattr(
            session,
            "confidence_score",
            None,
        ),
        final_report.get(
            "confidence_score"
        ),
        final_report.get(
            "confidence"
        ),
        get_average(
            confidence_values
        ),
    )

    overall_score = get_first_number(
        getattr(
            session,
            "overall_score",
            None,
        ),
        getattr(
            session,
            "candidate_score",
            None,
        ),
        final_report.get(
            "overall_score"
        ),
        final_report.get(
            "candidate_score"
        ),
        final_report.get(
            "score"
        ),
        get_average(
            evaluation_scores
        ),
    )

    if overall_score == 0:
        metric_values = [
            value
            for value in [
                technical,
                communication,
                confidence,
            ]
            if value > 0
        ]

        if metric_values:
            overall_score = round(
                sum(metric_values)
                / len(metric_values),
                1,
            )

    return {
        "technical": round(
            technical,
            1,
        ),
        "communication": round(
            communication,
            1,
        ),
        "confidence": round(
            confidence,
            1,
        ),
        "overall_score": round(
            overall_score,
            1,
        ),
    }


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(InterviewSession)
        .order_by(
            InterviewSession.id.asc()
        )
        .all()
    )

    session_data = []

    technical_scores = []
    communication_scores = []
    confidence_scores = []
    overall_scores = []

    for session in sessions:
        metrics = extract_session_metrics(
            session
        )

        technical_scores.append(
            metrics["technical"]
        )

        communication_scores.append(
            metrics["communication"]
        )

        confidence_scores.append(
            metrics["confidence"]
        )

        overall_scores.append(
            metrics["overall_score"]
        )

        session_data.append(
            {
                "id": session.id,
                "session_id": session.id,
                "role": getattr(
                    session,
                    "role",
                    "Mock Interview",
                )
                or "Mock Interview",
                "level": getattr(
                    session,
                    "level",
                    "General",
                )
                or "General",
                "score": metrics[
                    "overall_score"
                ],
                "overall_score": metrics[
                    "overall_score"
                ],
                "confidence": metrics[
                    "confidence"
                ],
                "confidence_score": metrics[
                    "confidence"
                ],
                "communication": metrics[
                    "communication"
                ],
                "communication_score": metrics[
                    "communication"
                ],
                "technical": metrics[
                    "technical"
                ],
                "technical_score": metrics[
                    "technical"
                ],
                "created_at": (
                    str(
                        getattr(
                            session,
                            "created_at",
                            None,
                        )
                    )
                    if getattr(
                        session,
                        "created_at",
                        None,
                    )
                    else None
                ),
            }
        )

    average_score = get_average(
        overall_scores
    )

    average_confidence = get_average(
        confidence_scores
    )

    average_communication = get_average(
        communication_scores
    )

    average_technical = get_average(
        technical_scores
    )

    improvement = 0

    valid_scores = [
        score
        for score in overall_scores
        if score > 0
    ]

    if len(valid_scores) >= 2:
        first_score = valid_scores[0]
        latest_score = valid_scores[-1]

        improvement = round(
            latest_score
            - first_score,
            1,
        )

    return {
        "success": True,

        "total_interviews": len(
            sessions
        ),

        "totalInterviews": len(
            sessions
        ),

        "average_score": round(
            average_score,
            1,
        ),

        "averageScore": round(
            average_score,
            1,
        ),

        "overall_score": round(
            average_score,
            1,
        ),

        "confidence": round(
            average_confidence,
            1,
        ),

        "average_confidence": round(
            average_confidence,
            1,
        ),

        "communication": round(
            average_communication,
            1,
        ),

        "average_communication": round(
            average_communication,
            1,
        ),

        "technical": round(
            average_technical,
            1,
        ),

        "average_technical": round(
            average_technical,
            1,
        ),

        "improvement": improvement,

        "growth": improvement,

        "improvement_percentage": improvement,

        "sessions": session_data,

        "interviews": session_data,

        "history": session_data,

        "summary": {
            "total_interviews": len(
                sessions
            ),
            "average_score": round(
                average_score,
                1,
            ),
            "confidence": round(
                average_confidence,
                1,
            ),
            "communication": round(
                average_communication,
                1,
            ),
            "technical": round(
                average_technical,
                1,
            ),
            "improvement": improvement,
        },
    }