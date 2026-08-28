from __future__ import annotations

from typing import Any

from app.services.groq_service import ask_groq_json


# ============================================================
# SCORE HELPERS
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


def average_scores(
    values: list[Any],
) -> int:

    valid_scores: list[int] = []


    for value in values:

        try:

            numeric_value = float(
                value
            )

        except (
            TypeError,
            ValueError,
        ):

            continue


        if numeric_value > 0:

            valid_scores.append(
                clamp_score(
                    numeric_value
                )
            )


    if not valid_scores:

        return 0


    return int(
        round(
            sum(
                valid_scores
            )
            /
            len(
                valid_scores
            )
        )
    )


def get_model_score(
    session: Any,
    field_name: str,
) -> int:

    return clamp_score(
        getattr(
            session,
            field_name,
            0,
        )
    )


# ============================================================
# SESSION HELPERS
# ============================================================


def get_latest_valid_score(
    sessions: list[Any],
    field_name: str,
) -> int:

    for session in sessions:

        score = get_model_score(
            session,
            field_name,
        )


        if score > 0:

            return score


    return 0


def get_average_score(
    sessions: list[Any],
    field_name: str,
) -> int:

    values = []


    for session in sessions:

        score = get_model_score(
            session,
            field_name,
        )


        if score > 0:

            values.append(
                score
            )


    return average_scores(
        values
    )


# ============================================================
# OVERALL CANDIDATE SCORE
# ============================================================


def calculate_overall_score(
    resume_score: int,
    jd_match_score: int,
    technical_score: int,
    speech_score: int,
    communication_score: int,
    confidence_score: int,
) -> int:

    weighted_scores: list[tuple[int, float]] = []


    # Resume quality
    if resume_score > 0:

        weighted_scores.append(
            (
                resume_score,
                0.15,
            )
        )


    # Job relevance
    if jd_match_score > 0:

        weighted_scores.append(
            (
                jd_match_score,
                0.15,
            )
        )


    # Technical performance
    if technical_score > 0:

        weighted_scores.append(
            (
                technical_score,
                0.25,
            )
        )


    # Speech performance
    if speech_score > 0:

        weighted_scores.append(
            (
                speech_score,
                0.10,
            )
        )


    # Communication
    if communication_score > 0:

        weighted_scores.append(
            (
                communication_score,
                0.20,
            )
        )


    # Confidence
    if confidence_score > 0:

        weighted_scores.append(
            (
                confidence_score,
                0.15,
            )
        )


    if not weighted_scores:

        return 0


    total_weight = sum(
        weight
        for _score, weight
        in weighted_scores
    )


    weighted_total = sum(
        score * weight
        for score, weight
        in weighted_scores
    )


    return clamp_score(
        weighted_total
        /
        total_weight
    )


# ============================================================
# HIRING RECOMMENDATION
# ============================================================


def generate_recommendation(
    overall_score: int,
    technical_score: int,
    communication_score: int,
    confidence_score: int,
    resume_score: int,
    jd_match_score: int,
) -> str:

    if overall_score == 0:

        return (
            "Insufficient candidate data. "
            "Complete a resume analysis or interview "
            "to generate AI candidate intelligence."
        )


    critical_scores = [
        technical_score,
        communication_score,
        confidence_score,
    ]


    weak_critical_areas = len(
        [
            score
            for score
            in critical_scores
            if score > 0
            and score < 55
        ]
    )


    if (
        overall_score >= 90
        and weak_critical_areas == 0
    ):

        return (
            "Exceptional Candidate"
        )


    if (
        overall_score >= 80
        and weak_critical_areas == 0
    ):

        return (
            "Strong Candidate"
        )


    if overall_score >= 70:

        return (
            "Recommended for Next Round"
        )


    if overall_score >= 60:

        return (
            "Potential Candidate - "
            "Further Evaluation Recommended"
        )


    if (
        overall_score >= 50
        or resume_score >= 70
        or jd_match_score >= 70
    ):

        return (
            "Developing Candidate - "
            "Targeted Improvement Recommended"
        )


    return (
        "Not Yet Interview Ready"
    )


# ============================================================
# SALARY PREDICTION
# ============================================================


def predict_salary(
    overall_score: int,
    technical_score: int,
    jd_match_score: int,
    resume_score: int,
) -> str:

    market_score = average_scores(
        [
            overall_score,
            technical_score,
            jd_match_score,
            resume_score,
        ]
    )


    if market_score == 0:

        return (
            "Complete more assessments "
            "to generate salary prediction"
        )


    if market_score >= 90:

        return (
            "₹15 LPA - ₹25 LPA"
        )


    if market_score >= 85:

        return (
            "₹10 LPA - ₹18 LPA"
        )


    if market_score >= 80:

        return (
            "₹8 LPA - ₹14 LPA"
        )


    if market_score >= 75:

        return (
            "₹6 LPA - ₹10 LPA"
        )


    if market_score >= 70:

        return (
            "₹5 LPA - ₹8 LPA"
        )


    if market_score >= 60:

        return (
            "₹4 LPA - ₹6 LPA"
        )


    return (
        "₹3 LPA - ₹5 LPA"
    )


# ============================================================
# STRENGTH ANALYSIS
# ============================================================


def generate_strengths(
    resume_score: int,
    jd_match_score: int,
    technical_score: int,
    speech_score: int,
    communication_score: int,
    confidence_score: int,
) -> list[str]:

    metrics = [
        (
            "Strong ATS Resume Profile",
            resume_score,
        ),
        (
            "Excellent Job Description Alignment",
            jd_match_score,
        ),
        (
            "Strong Technical Profile",
            technical_score,
        ),
        (
            "Strong Speech Delivery",
            speech_score,
        ),
        (
            "Excellent Communication Ability",
            communication_score,
        ),
        (
            "High Interview Confidence",
            confidence_score,
        ),
    ]


    strengths = [
        name
        for name, score
        in metrics
        if score >= 75
    ]


    return strengths


# ============================================================
# IMPROVEMENT ANALYSIS
# ============================================================


def generate_improvements(
    resume_score: int,
    jd_match_score: int,
    technical_score: int,
    speech_score: int,
    communication_score: int,
    confidence_score: int,
) -> list[str]:

    improvements = []


    if (
        resume_score > 0
        and resume_score < 70
    ):

        improvements.append(
            "Improve ATS optimization, keyword relevance, "
            "project impact and measurable achievements."
        )


    if (
        jd_match_score > 0
        and jd_match_score < 70
    ):

        improvements.append(
            "Improve job-specific skill alignment and "
            "tailor the resume to target job descriptions."
        )


    if (
        technical_score > 0
        and technical_score < 70
    ):

        improvements.append(
            "Strengthen technical fundamentals, "
            "problem solving and role-specific knowledge."
        )


    if (
        speech_score > 0
        and speech_score < 70
    ):

        improvements.append(
            "Improve speaking pace, filler-word control "
            "and verbal delivery consistency."
        )


    if (
        communication_score > 0
        and communication_score < 70
    ):

        improvements.append(
            "Improve answer structure, clarity and "
            "professional communication."
        )


    if (
        confidence_score > 0
        and confidence_score < 70
    ):

        improvements.append(
            "Practice interview confidence, concise responses "
            "and stronger explanation of experience."
        )


    return improvements


# ============================================================
# READINESS LEVEL
# ============================================================


def calculate_readiness(
    overall_score: int,
) -> str:

    if overall_score == 0:

        return (
            "Not Assessed"
        )


    if overall_score >= 85:

        return (
            "Highly Interview Ready"
        )


    if overall_score >= 75:

        return (
            "Interview Ready"
        )


    if overall_score >= 60:

        return (
            "Developing"
        )


    return (
        "Needs Improvement"
    )


# ============================================================
# AI-GENERATED NARRATIVE INTELLIGENCE
# ============================================================


def generate_ai_candidate_narrative(
    overall_score: int,
    resume_score: int,
    jd_match_score: int,
    technical_score: int,
    speech_score: int,
    communication_score: int,
    confidence_score: int,
    fallback_recommendation: str,
    fallback_strengths: list[str],
    fallback_improvements: list[str],
) -> dict[str, Any]:
    """
    Ask Groq to turn a candidate's raw scores into a natural-language
    recommendation label, strengths, and improvement points. Falls
    back to the deterministic rule-based versions (passed in) if the
    AI call fails, times out, or returns something malformed, so the
    Candidate Intelligence page never breaks or shows empty data
    because the AI provider is unavailable.
    """

    if overall_score <= 0:
        return {
            "recommendation": fallback_recommendation,
            "strengths": fallback_strengths,
            "improvements": fallback_improvements,
            "ai_generated": False,
        }

    try:
        result = ask_groq_json(
            prompt=f"""
Candidate scores (0-100, 0 means not yet measured):
- Overall: {overall_score}
- Resume/ATS: {resume_score}
- Job description match: {jd_match_score}
- Technical: {technical_score}
- Speech delivery: {speech_score}
- Communication: {communication_score}
- Confidence: {confidence_score}

Based only on these scores, return a JSON object with exactly these
keys:
{{
  "recommendation": "a short 2-5 word hiring recommendation label, e.g. 'Strong Candidate' or 'Needs Improvement'",
  "strengths": ["short specific strength", ...up to 5],
  "improvements": ["short specific, actionable improvement", ...up to 5]
}}

Only mention a dimension as a strength if its score is 75 or higher,
and only as an improvement area if its score is below 70 (and above
0, meaning it has actually been measured). Do not invent dimensions
that weren't given.
""",
            system_prompt=(
                "You are an AI hiring analyst producing candidate "
                "intelligence summaries from structured interview "
                "and resume scoring data."
            ),
            temperature=0.3,
        )

        if not isinstance(result, dict):
            raise ValueError("AI response was not a JSON object")

        recommendation = result.get("recommendation")
        strengths = result.get("strengths")
        improvements = result.get("improvements")

        if (
            not isinstance(recommendation, str)
            or not recommendation.strip()
        ):
            raise ValueError("Missing recommendation")

        if not isinstance(strengths, list):
            strengths = fallback_strengths

        if not isinstance(improvements, list):
            improvements = fallback_improvements

        return {
            "recommendation": recommendation.strip()[:80],
            "strengths": [
                str(s).strip() for s in strengths if str(s).strip()
            ][:5],
            "improvements": [
                str(s).strip() for s in improvements if str(s).strip()
            ][:5],
            "ai_generated": True,
        }

    except Exception as error:
        print(
            "generate_ai_candidate_narrative fallback "
            "(rule-based values will be used):",
            error,
        )

        return {
            "recommendation": fallback_recommendation,
            "strengths": fallback_strengths,
            "improvements": fallback_improvements,
            "ai_generated": False,
        }


# ============================================================
# PRIMARY INTELLIGENCE BUILDER
# ============================================================


def build_candidate_intelligence(
    sessions: list[Any],
) -> dict[str, Any]:

    # Sessions are expected to be ordered
    # newest to oldest.


    resume_score = get_latest_valid_score(
        sessions,
        "resume_score",
    )


    jd_match_score = get_latest_valid_score(
        sessions,
        "jd_match_score",
    )


    speech_score = get_latest_valid_score(
        sessions,
        "speech_score",
    )


    technical_score = get_average_score(
        sessions,
        "technical_score",
    )


    communication_score = get_average_score(
        sessions,
        "communication_score",
    )


    confidence_score = get_average_score(
        sessions,
        "confidence_score",
    )


    hiring_probability = get_average_score(
        sessions,
        "hiring_probability",
    )


    overall_score = calculate_overall_score(
        resume_score=resume_score,
        jd_match_score=jd_match_score,
        technical_score=technical_score,
        speech_score=speech_score,
        communication_score=communication_score,
        confidence_score=confidence_score,
    )


    # If saved interviews already contain a
    # hiring probability, combine it with
    # calculated intelligence.


    if (
        hiring_probability > 0
        and overall_score > 0
    ):

        overall_score = clamp_score(
            (
                overall_score * 0.75
            )
            +
            (
                hiring_probability * 0.25
            )
        )


    recommendation = generate_recommendation(
        overall_score=overall_score,
        technical_score=technical_score,
        communication_score=communication_score,
        confidence_score=confidence_score,
        resume_score=resume_score,
        jd_match_score=jd_match_score,
    )


    salary_prediction = predict_salary(
        overall_score=overall_score,
        technical_score=technical_score,
        jd_match_score=jd_match_score,
        resume_score=resume_score,
    )


    strengths = generate_strengths(
        resume_score=resume_score,
        jd_match_score=jd_match_score,
        technical_score=technical_score,
        speech_score=speech_score,
        communication_score=communication_score,
        confidence_score=confidence_score,
    )


    improvements = generate_improvements(
        resume_score=resume_score,
        jd_match_score=jd_match_score,
        technical_score=technical_score,
        speech_score=speech_score,
        communication_score=communication_score,
        confidence_score=confidence_score,
    )


    # Upgrade the rule-based recommendation/strengths/improvements
    # above to an AI-generated narrative when possible. The
    # rule-based versions computed above are passed in as the
    # fallback, so this never degrades the response.
    ai_narrative = generate_ai_candidate_narrative(
        overall_score=overall_score,
        resume_score=resume_score,
        jd_match_score=jd_match_score,
        technical_score=technical_score,
        speech_score=speech_score,
        communication_score=communication_score,
        confidence_score=confidence_score,
        fallback_recommendation=recommendation,
        fallback_strengths=strengths,
        fallback_improvements=improvements,
    )

    recommendation = ai_narrative["recommendation"]
    strengths = ai_narrative["strengths"]
    improvements = ai_narrative["improvements"]


    readiness = calculate_readiness(
        overall_score
    )


    return {

        # ====================================================
        # EXACT CURRENT FRONTEND CONTRACT
        # ====================================================

        "overall":
            overall_score,

        "resume":
            resume_score,

        "jd_match":
            jd_match_score,

        "technical":
            technical_score,

        "speech":
            speech_score,

        "communication":
            communication_score,

        "confidence":
            confidence_score,

        "recommendation":
            recommendation,

        "salary_prediction":
            salary_prediction,


        # ====================================================
        # EXTENDED PRODUCTION INTELLIGENCE
        # ====================================================

        "hiring_probability":
            (
                hiring_probability
                if hiring_probability > 0
                else overall_score
            ),

        "readiness":
            readiness,

        "strengths":
            strengths,

        "improvements":
            improvements,

        "metrics": {

            "resume":
                resume_score,

            "jd_match":
                jd_match_score,

            "technical":
                technical_score,

            "speech":
                speech_score,

            "communication":
                communication_score,

            "confidence":
                confidence_score,

            "overall":
                overall_score,

        },

        "assessment_summary": {

            "sessions_analyzed":
                len(
                    sessions
                ),

            "completed_interviews":
                len(
                    [
                        session
                        for session
                        in sessions
                        if get_model_score(
                            session,
                            "overall_score",
                        ) > 0
                    ]
                ),

            "highlights":
                strengths,

            "focus_areas":
                improvements,

        },

    }