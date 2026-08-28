from __future__ import annotations

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
)

from pydantic import (
    BaseModel,
    Field,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InterviewSession


router = APIRouter(
    prefix="/candidate-intelligence",
    tags=["Candidate Intelligence"],
)


# ============================================================
# REQUEST MODEL
# ============================================================


class CandidateScoreRequest(
    BaseModel
):

    ats_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    jd_match_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    interview_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    communication_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    confidence_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    speech_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    behavior_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    candidate_name: Optional[str] = (
        "Candidate"
    )

    target_role: Optional[str] = (
        "Not Specified"
    )

    session_id: Optional[int] = None


# ============================================================
# HELPERS
# ============================================================


def normalize_score(
    score: float,
) -> int:

    return max(
        0,
        min(
            100,
            int(
                round(
                    score
                )
            ),
        ),
    )


def get_candidate_tier(
    score: int,
) -> str:

    if score >= 90:

        return "Elite Candidate"


    if score >= 80:

        return "Strong Candidate"


    if score >= 70:

        return "Competitive Candidate"


    if score >= 55:

        return "Developing Candidate"


    return "Needs Improvement"


def get_hiring_recommendation(
    score: int,
) -> str:

    if score >= 90:

        return "Strongly Recommended"


    if score >= 80:

        return "Recommended"


    if score >= 70:

        return "Consider for Interview"


    if score >= 55:

        return "Potential Candidate"


    return "Needs Improvement"


def get_score_status(
    score: int,
) -> str:

    if score >= 85:

        return "Excellent"


    if score >= 70:

        return "Strong"


    if score >= 55:

        return "Moderate"


    return "Needs Improvement"


def get_salary_prediction(
    score: int,
) -> str:

    if score >= 90:

        return "₹18-24 LPA"


    if score >= 80:

        return "₹12-18 LPA"


    if score >= 70:

        return "₹8-14 LPA"


    if score >= 60:

        return "₹6-10 LPA"


    return "₹4-8 LPA"


def build_summary(
    candidate_name: str,
    target_role: str,
    final_score: int,
    strongest_area: str,
    weakest_area: str,
) -> str:

    if final_score >= 85:

        return (
            f"{candidate_name} demonstrates strong overall "
            f"readiness for the {target_role} role. "
            f"The strongest signal is {strongest_area.lower()}, "
            f"while continued improvement in "
            f"{weakest_area.lower()} can further strengthen "
            f"interview readiness."
        )


    if final_score >= 70:

        return (
            f"{candidate_name} is a competitive candidate "
            f"for the {target_role} role. "
            f"{strongest_area} is currently the strongest "
            f"performance area, while {weakest_area.lower()} "
            f"should be the primary improvement priority."
        )


    if final_score >= 55:

        return (
            f"{candidate_name} shows potential for the "
            f"{target_role} role but requires focused "
            f"improvement. Preserve strength in "
            f"{strongest_area.lower()} and prioritize "
            f"{weakest_area.lower()}."
        )


    return (
        f"{candidate_name} requires further structured "
        f"preparation for the {target_role} role. "
        f"The current strongest area is "
        f"{strongest_area.lower()}, while "
        f"{weakest_area.lower()} needs immediate attention."
    )


# ============================================================
# CALCULATE CANDIDATE INTELLIGENCE
# ============================================================


@router.post(
    "/score"
)
def calculate_candidate_intelligence(
    data: CandidateScoreRequest,
    db: Session = Depends(
        get_db
    ),
):

    scores = {

        "Resume ATS":

            normalize_score(
                data.ats_score
            ),

        "JD Match":

            normalize_score(
                data.jd_match_score
            ),

        "Interview Performance":

            normalize_score(
                data.interview_score
            ),

        "Communication":

            normalize_score(
                data.communication_score
            ),

        "Confidence":

            normalize_score(
                data.confidence_score
            ),

        "Speech":

            normalize_score(
                data.speech_score
            ),

        "Behavior":

            normalize_score(
                data.behavior_score
            ),

    }


    weights = {

        "Resume ATS":
            0.15,

        "JD Match":
            0.15,

        "Interview Performance":
            0.25,

        "Communication":
            0.18,

        "Confidence":
            0.12,

        "Speech":
            0.08,

        "Behavior":
            0.07,

    }


    available_scores = {

        area: score

        for area, score
        in scores.items()

        if score > 0

    }


    if not available_scores:

        final_score = 0

    else:

        available_weight = sum(

            weights[
                area
            ]

            for area
            in available_scores

        )


        weighted_total = sum(

            available_scores[
                area
            ]

            *

            weights[
                area
            ]

            for area
            in available_scores

        )


        final_score = normalize_score(

            weighted_total
            / available_weight

        )


    ranked_areas = sorted(

        available_scores.items(),

        key=lambda item:
            item[1],

        reverse=True,

    )


    if ranked_areas:

        strongest_area = (

            ranked_areas[0][0]

        )


        weakest_area = (

            ranked_areas[-1][0]

        )

    else:

        strongest_area = (
            "No measured area"
        )

        weakest_area = (
            "No measured area"
        )


    strengths = [

        {

            "area":
                area,

            "score":
                score,

            "status":

                get_score_status(
                    score
                ),

        }

        for area, score
        in ranked_areas[:3]

    ]


    improvement_areas = [

        {

            "area":
                area,

            "score":
                score,

            "status":

                get_score_status(
                    score
                ),

        }

        for area, score
        in ranked_areas[-3:]

        if score < 75

    ]


    candidate_tier = (

        get_candidate_tier(
            final_score
        )

    )


    recommendation = (

        get_hiring_recommendation(
            final_score
        )

    )


    salary_prediction = (

        get_salary_prediction(
            final_score
        )

    )


    summary = build_summary(

        candidate_name=

            data.candidate_name
            or "Candidate",

        target_role=

            data.target_role
            or "target role",

        final_score=
            final_score,

        strongest_area=
            strongest_area,

        weakest_area=
            weakest_area,

    )


    # ========================================================
    # OPTIONAL PERSISTENCE
    # ========================================================

    updated_session_id = None


    if data.session_id is not None:

        session = (

            db.query(
                InterviewSession
            )

            .filter(

                InterviewSession.id
                == data.session_id

            )

            .first()

        )


        if session:

            session.resume_score = (
                scores[
                    "Resume ATS"
                ]
            )


            session.jd_match_score = (
                scores[
                    "JD Match"
                ]
            )


            session.overall_score = (
                scores[
                    "Interview Performance"
                ]
            )


            session.communication_score = (
                scores[
                    "Communication"
                ]
            )


            session.confidence_score = (
                scores[
                    "Confidence"
                ]
            )


            session.speech_score = (
                scores[
                    "Speech"
                ]
            )


            session.behavior_score = (
                scores[
                    "Behavior"
                ]
            )


            session.candidate_score = (
                final_score
            )


            session.hiring_probability = (
                final_score
            )


            session.recruiter_recommendation = (
                recommendation
            )


            if not session.expected_salary:

                session.expected_salary = (
                    salary_prediction
                )


            db.commit()

            db.refresh(
                session
            )


            updated_session_id = (
                session.id
            )


    return {

        "success":
            True,

        "candidate_name":

            data.candidate_name
            or "Candidate",

        "target_role":

            data.target_role
            or "Not Specified",

        "hiresense_score":
            final_score,

        "candidate_score":
            final_score,

        "candidate_tier":
            candidate_tier,

        "hiring_recommendation":
            recommendation,

        "hiring_probability":
            final_score,

        "salary_prediction":
            salary_prediction,

        "strongest_area":
            strongest_area,

        "weakest_area":
            weakest_area,

        "score_breakdown": {

            "ats_score":

                scores[
                    "Resume ATS"
                ],

            "jd_match_score":

                scores[
                    "JD Match"
                ],

            "interview_score":

                scores[
                    "Interview Performance"
                ],

            "communication_score":

                scores[
                    "Communication"
                ],

            "confidence_score":

                scores[
                    "Confidence"
                ],

            "speech_score":

                scores[
                    "Speech"
                ],

            "behavior_score":

                scores[
                    "Behavior"
                ],

        },

        "strengths":
            strengths,

        "improvement_areas":
            improvement_areas,

        "summary":
            summary,

        "updated_session_id":
            updated_session_id,

    }