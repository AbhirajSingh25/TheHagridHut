from __future__ import annotations

from collections import defaultdict
from typing import Any


# ============================================================
# SCORE UTILITIES
# ============================================================


def clamp_score(
    value: Any,
) -> int:

    try:

        score = float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return 0


    score = max(
        0,
        min(
            100,
            score,
        ),
    )


    return int(
        round(
            score
        )
    )


def average(
    values: list[Any],
) -> int:

    valid_values: list[int] = []


    for value in values:

        score = clamp_score(
            value
        )


        if score > 0:

            valid_values.append(
                score
            )


    if not valid_values:

        return 0


    return int(
        round(
            sum(
                valid_values
            )
            /
            len(
                valid_values
            )
        )
    )


def weighted_score(
    scores: list[
        tuple[
            Any,
            float,
        ]
    ],
) -> int:

    valid_scores: list[
        tuple[
            int,
            float,
        ]
    ] = []


    for value, weight in scores:

        score = clamp_score(
            value
        )


        if score > 0:

            valid_scores.append(
                (
                    score,
                    weight,
                )
            )


    if not valid_scores:

        return 0


    total_weight = sum(
        weight
        for _score, weight
        in valid_scores
    )


    weighted_total = sum(
        score * weight
        for score, weight
        in valid_scores
    )


    if total_weight <= 0:

        return 0


    return clamp_score(
        weighted_total
        /
        total_weight
    )


# ============================================================
# SESSION UTILITIES
# ============================================================


def get_value(
    session: Any,
    field_name: str,
    default: Any = 0,
) -> Any:

    return getattr(
        session,
        field_name,
        default,
    )


def get_session_score(
    session: Any,
) -> int:

    overall_score = clamp_score(
        get_value(
            session,
            "overall_score",
        )
    )


    if overall_score > 0:

        return overall_score


    candidate_score = clamp_score(
        get_value(
            session,
            "candidate_score",
        )
    )


    if candidate_score > 0:

        return candidate_score


    return weighted_score(
        [

            (
                get_value(
                    session,
                    "technical_score",
                ),
                0.25,
            ),

            (
                get_value(
                    session,
                    "communication_score",
                ),
                0.20,
            ),

            (
                get_value(
                    session,
                    "confidence_score",
                ),
                0.15,
            ),

            (
                get_value(
                    session,
                    "resume_score",
                ),
                0.15,
            ),

            (
                get_value(
                    session,
                    "jd_match_score",
                ),
                0.10,
            ),

            (
                get_value(
                    session,
                    "speech_score",
                ),
                0.10,
            ),

            (
                get_value(
                    session,
                    "vision_score",
                ),
                0.05,
            ),

        ]
    )


def get_session_status(
    session: Any,
    score: int,
) -> str:

    saved_status = str(
        get_value(
            session,
            "status",
            "",
        )
        or ""
    ).strip()


    if saved_status:

        normalized_status = (
            saved_status
            .lower()
            .replace(
                "_",
                " ",
            )
        )


        if normalized_status == "completed":

            if score >= 85:

                return (
                    "Highly Recommended"
                )


            if score >= 70:

                return (
                    "Recommended"
                )


            if score >= 55:

                return (
                    "Review Required"
                )


            return (
                "Needs Improvement"
            )


        if normalized_status == "paused":

            return (
                "Assessment Paused"
            )


        if normalized_status in (
            "in progress",
            "active",
        ):

            return (
                "In Assessment"
            )


    if score >= 85:

        return (
            "Highly Recommended"
        )


    if score >= 70:

        return (
            "Recommended"
        )


    if score >= 55:

        return (
            "Review Required"
        )


    if score > 0:

        return (
            "Needs Improvement"
        )


    return (
        "Assessment Pending"
    )


# ============================================================
# CANDIDATE SCORE ANALYSIS
# ============================================================


def calculate_candidate_score(
    sessions: list[Any],
) -> dict[str, Any]:

    if not sessions:

        return {

            "score":
                0,

            "technical":
                0,

            "communication":
                0,

            "confidence":
                0,

            "resume":
                0,

            "jd_match":
                0,

            "speech":
                0,

            "vision":
                0,

            "hiring_probability":
                0,

            "improvement":
                0,

            "latest_score":
                0,

        }


    session_scores = [

        get_session_score(
            session
        )

        for session
        in sessions

    ]


    technical_score = average(
        [

            get_value(
                session,
                "technical_score",
            )

            for session
            in sessions

        ]
    )


    communication_score = average(
        [

            get_value(
                session,
                "communication_score",
            )

            for session
            in sessions

        ]
    )


    confidence_score = average(
        [

            get_value(
                session,
                "confidence_score",
            )

            for session
            in sessions

        ]
    )


    resume_score = average(
        [

            get_value(
                session,
                "resume_score",
            )

            for session
            in sessions

        ]
    )


    jd_match_score = average(
        [

            get_value(
                session,
                "jd_match_score",
            )

            for session
            in sessions

        ]
    )


    speech_score = average(
        [

            get_value(
                session,
                "speech_score",
            )

            for session
            in sessions

        ]
    )


    vision_score = average(
        [

            get_value(
                session,
                "vision_score",
            )

            for session
            in sessions

        ]
    )


    hiring_probability = average(
        [

            get_value(
                session,
                "hiring_probability",
            )

            for session
            in sessions

        ]
    )


    average_session_score = average(
        session_scores
    )


    calculated_score = weighted_score(
        [

            (
                average_session_score,
                0.40,
            ),

            (
                technical_score,
                0.20,
            ),

            (
                communication_score,
                0.15,
            ),

            (
                confidence_score,
                0.10,
            ),

            (
                resume_score,
                0.05,
            ),

            (
                jd_match_score,
                0.05,
            ),

            (
                speech_score,
                0.05,
            ),

        ]
    )


    if (
        hiring_probability > 0
        and calculated_score > 0
    ):

        final_score = clamp_score(
            (
                calculated_score
                * 0.80
            )
            +
            (
                hiring_probability
                * 0.20
            )
        )

    elif hiring_probability > 0:

        final_score = hiring_probability

    else:

        final_score = calculated_score


    latest_score = (
        session_scores[0]
        if session_scores
        else 0
    )


    improvement = 0


    if len(
        session_scores
    ) >= 2:

        oldest_score = (
            session_scores[-1]
        )


        improvement = (
            latest_score
            - oldest_score
        )


    return {

        "score":
            final_score,

        "technical":
            technical_score,

        "communication":
            communication_score,

        "confidence":
            confidence_score,

        "resume":
            resume_score,

        "jd_match":
            jd_match_score,

        "speech":
            speech_score,

        "vision":
            vision_score,

        "hiring_probability":
            hiring_probability,

        "improvement":
            improvement,

        "latest_score":
            latest_score,

    }


# ============================================================
# CANDIDATE RANKING
# ============================================================


def get_rank_label(
    score: int,
) -> str:

    if score >= 90:

        return (
            "Elite"
        )


    if score >= 80:

        return (
            "Strong"
        )


    if score >= 70:

        return (
            "Competitive"
        )


    if score >= 55:

        return (
            "Developing"
        )


    return (
        "Early Stage"
    )


def build_candidate_record(
    user_id: Any,
    sessions: list[Any],
    user_map: dict[
        int,
        Any,
    ],
) -> dict[str, Any]:

    metrics = (
        calculate_candidate_score(
            sessions
        )
    )


    user = user_map.get(
        user_id
    )


    name = None


    if user is not None:

        name = (
            getattr(
                user,
                "username",
                None,
            )
            or getattr(
                user,
                "name",
                None,
            )
            or getattr(
                user,
                "email",
                None,
            )
        )


    if not name:

        name = (
            f"Candidate {user_id}"
            if user_id is not None
            else "Guest Candidate"
        )


    latest_session = (
        sessions[0]
        if sessions
        else None
    )


    role = (
        get_value(
            latest_session,
            "role",
            "General Candidate",
        )
        if latest_session
        else "General Candidate"
    )


    score = metrics[
        "score"
    ]


    status = (
        get_session_status(
            latest_session,
            score,
        )
        if latest_session
        else "Assessment Pending"
    )


    return {

        # ====================================================
        # EXACT CURRENT FRONTEND CONTRACT
        # ====================================================

        "name":
            name,

        "role":
            role,

        "score":
            score,

        "status":
            status,


        # ====================================================
        # EXTENDED RECRUITER DATA
        # ====================================================

        "user_id":
            user_id,

        "rank_label":
            get_rank_label(
                score
            ),

        "technical":
            metrics[
                "technical"
            ],

        "communication":
            metrics[
                "communication"
            ],

        "confidence":
            metrics[
                "confidence"
            ],

        "resume":
            metrics[
                "resume"
            ],

        "jd_match":
            metrics[
                "jd_match"
            ],

        "speech":
            metrics[
                "speech"
            ],

        "vision":
            metrics[
                "vision"
            ],

        "hiring_probability":
            metrics[
                "hiring_probability"
            ],

        "improvement":
            metrics[
                "improvement"
            ],

        "latest_score":
            metrics[
                "latest_score"
            ],

        "interviews_completed":
            len(
                sessions
            ),

    }


# ============================================================
# GROUP CANDIDATE SESSIONS
# ============================================================


def group_sessions_by_candidate(
    sessions: list[Any],
) -> dict[
    Any,
    list[Any],
]:

    grouped_sessions: dict[
        Any,
        list[Any],
    ] = defaultdict(
        list
    )


    for session in sessions:

        user_id = get_value(
            session,
            "user_id",
            None,
        )


        # Sessions without a user are still
        # included instead of disappearing.


        if user_id is None:

            user_id = (
                f"guest-{get_value(session, 'id')}"
            )


        grouped_sessions[
            user_id
        ].append(
            session
        )


    return grouped_sessions


# ============================================================
# BUILD RECRUITER DASHBOARD
# ============================================================


def build_recruiter_dashboard(
    sessions: list[Any],
    users: list[Any],
) -> list[dict[str, Any]]:

    user_map: dict[
        int,
        Any,
    ] = {

        getattr(
            user,
            "id",
        ): user

        for user
        in users

        if getattr(
            user,
            "id",
            None,
        )
        is not None

    }


    grouped_sessions = (
        group_sessions_by_candidate(
            sessions
        )
    )


    candidates = []


    for user_id, candidate_sessions in (
        grouped_sessions.items()
    ):

        candidate = (
            build_candidate_record(
                user_id=user_id,
                sessions=candidate_sessions,
                user_map=user_map,
            )
        )


        candidates.append(
            candidate
        )


    candidates.sort(
        key=lambda candidate: (
            candidate.get(
                "score",
                0,
            ),
            candidate.get(
                "technical",
                0,
            ),
            candidate.get(
                "communication",
                0,
            ),
        ),
        reverse=True,
    )


    for index, candidate in enumerate(
        candidates,
        start=1,
    ):

        candidate[
            "rank"
        ] = index


    return candidates


# ============================================================
# RECRUITER INSIGHTS
# ============================================================


def generate_technical_insight(
    candidates: list[
        dict[
            str,
            Any,
        ]
    ],
) -> str:

    if not candidates:

        return (
            "No completed candidate assessments are "
            "available yet. Technical intelligence will "
            "activate as interview data is collected."
        )


    technical_average = average(
        [

            candidate.get(
                "technical",
                0,
            )

            for candidate
            in candidates

        ]
    )


    strong_candidates = len(
        [

            candidate

            for candidate
            in candidates

            if candidate.get(
                "technical",
                0,
            ) >= 75

        ]
    )


    if technical_average >= 85:

        return (
            f"The candidate pool demonstrates strong "
            f"technical performance with an average score "
            f"of {technical_average}%. "
            f"{strong_candidates} candidate(s) show "
            f"high-confidence technical readiness."
        )


    if technical_average >= 70:

        return (
            f"Technical performance is competitive at "
            f"{technical_average}% on average. "
            f"{strong_candidates} candidate(s) are strong "
            f"enough for priority recruiter review."
        )


    if technical_average >= 55:

        return (
            f"The current technical average is "
            f"{technical_average}%. Candidates show "
            f"potential, but deeper technical validation "
            f"is recommended before final selection."
        )


    return (
        f"Technical readiness is currently limited at "
        f"{technical_average}%. Additional assessment and "
        f"targeted technical evaluation are recommended."
    )


def generate_communication_insight(
    candidates: list[
        dict[
            str,
            Any,
        ]
    ],
) -> str:

    if not candidates:

        return (
            "Communication intelligence will be generated "
            "once candidate interview sessions are available."
        )


    communication_average = average(
        [

            candidate.get(
                "communication",
                0,
            )

            for candidate
            in candidates

        ]
    )


    confidence_average = average(
        [

            candidate.get(
                "confidence",
                0,
            )

            for candidate
            in candidates

        ]
    )


    if (
        communication_average >= 80
        and confidence_average >= 75
    ):

        return (
            "The candidate pool demonstrates strong "
            "communication and interview confidence. "
            "Candidates are generally well positioned "
            "for recruiter-facing conversations."
        )


    if communication_average >= 70:

        return (
            f"Communication performance averages "
            f"{communication_average}%. Recruiter "
            f"conversations should focus on response "
            f"clarity, role alignment and depth."
        )


    return (
        f"Communication performance averages "
        f"{communication_average}%, indicating that "
        f"candidate explanations and interview delivery "
        f"should receive additional evaluation."
    )


def generate_recruiter_recommendation(
    candidates: list[
        dict[
            str,
            Any,
        ]
    ],
) -> str:

    if not candidates:

        return (
            "Recruiter monitoring is active. Candidate "
            "recommendations will appear after assessment "
            "data is collected."
        )


    total_candidates = len(
        candidates
    )


    highly_recommended = len(
        [

            candidate

            for candidate
            in candidates

            if candidate.get(
                "score",
                0,
            ) >= 85

        ]
    )


    recommended = len(
        [

            candidate

            for candidate
            in candidates

            if candidate.get(
                "score",
                0,
            ) >= 70

        ]
    )


    if highly_recommended > 0:

        return (
            f"Prioritize {highly_recommended} high-performing "
            f"candidate(s) for immediate recruiter review. "
            f"{recommended} of {total_candidates} candidate(s) "
            f"currently meet the recommended threshold."
        )


    if recommended > 0:

        return (
            f"{recommended} of {total_candidates} candidate(s) "
            f"meet the current recommendation threshold. "
            f"Proceed with structured recruiter interviews "
            f"and role-specific validation."
        )


    return (
        "No candidate currently exceeds the primary "
        "recommendation threshold. Continue assessment "
        "and focus on measurable improvement signals."
    )


def build_recruiter_insights(
    candidates: list[
        dict[
            str,
            Any,
        ]
    ],
) -> dict[str, Any]:

    total_candidates = len(
        candidates
    )


    average_score = average(
        [

            candidate.get(
                "score",
                0,
            )

            for candidate
            in candidates

        ]
    )


    top_score = max(
        [

            candidate.get(
                "score",
                0,
            )

            for candidate
            in candidates

        ],
        default=0,
    )


    recommended_candidates = len(
        [

            candidate

            for candidate
            in candidates

            if candidate.get(
                "score",
                0,
            ) >= 70

        ]
    )


    return {

        # ====================================================
        # EXACT CURRENT FRONTEND CONTRACT
        # ====================================================

        "technical":
            generate_technical_insight(
                candidates
            ),

        "communication":
            generate_communication_insight(
                candidates
            ),

        "recommendation":
            generate_recruiter_recommendation(
                candidates
            ),


        # ====================================================
        # EXTENDED INTELLIGENCE
        # ====================================================

        "summary": {

            "total_candidates":
                total_candidates,

            "average_score":
                average_score,

            "top_score":
                top_score,

            "recommended_candidates":
                recommended_candidates,

        },

        "technical_average":
            average(
                [

                    candidate.get(
                        "technical",
                        0,
                    )

                    for candidate
                    in candidates

                ]
            ),

        "communication_average":
            average(
                [

                    candidate.get(
                        "communication",
                        0,
                    )

                    for candidate
                    in candidates

                ]
            ),

        "confidence_average":
            average(
                [

                    candidate.get(
                        "confidence",
                        0,
                    )

                    for candidate
                    in candidates

                ]
            ),

        "hiring_probability_average":
            average(
                [

                    candidate.get(
                        "hiring_probability",
                        0,
                    )

                    for candidate
                    in candidates

                ]
            ),

        "engine_status":
            "LIVE",

        "monitoring":
            "ACTIVE",

    }