from typing import Dict


def calculate_final_score(
    ats: Dict,
    ai: Dict,
    keywords: Dict,
):

    ats_score = ats.get("overall", 0)

    ai_score = ai.get("overall_rating", 0)

    keyword_score = keywords.get("keyword_score", 0)

    final = round(

        (
            ats_score * 0.40
            + ai_score * 0.40
            + keyword_score * 0.20
        ),

        2,

    )

    return final
def get_verdict(score: float):

    if score >= 90:
        return "Excellent"

    if score >= 80:
        return "Very Good"

    if score >= 70:
        return "Good"

    if score >= 60:
        return "Average"

    return "Needs Improvement"
def generate_strength_summary(
    ai: Dict,
):

    strengths = ai.get(
        "strengths",
        [],
    )

    return strengths[:5]
def generate_improvements(
    ai: Dict,
):

    improvements = ai.get(

        "improvement_suggestions",

        [],

    )

    return improvements[:10]
def build_resume_report(

    parsed: Dict,

    ats: Dict,

    metrics: Dict,

    keywords: Dict,

    ai: Dict,

):

    score = calculate_final_score(

        ats,

        ai,

        keywords,

    )

    return {

        "candidate": parsed,

        "ats": ats,

        "metrics": metrics,

        "keywords": keywords,

        "ai_review": ai,

        "overall_score": score,

        "verdict": get_verdict(score),

        "strengths": generate_strength_summary(ai),

        "improvements": generate_improvements(ai),

    }
