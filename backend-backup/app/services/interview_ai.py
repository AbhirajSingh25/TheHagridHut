# app/services/interview_ai.py

from __future__ import annotations

from typing import Any, Dict, List, Optional

from app.services.groq_service import (
    ask_groq,
    ask_groq_json,
)


# ============================================================
# HELPERS
# ============================================================

def _clamp_score(
    value: Any,
    default: int = 0,
) -> int:
    try:
        score = int(float(value))
    except (
        TypeError,
        ValueError,
    ):
        score = default

    return max(
        0,
        min(
            score,
            100,
        ),
    )


def _normalize_level(
    level: Optional[str],
) -> str:
    if not level:
        return "intermediate"

    value = (
        str(level)
        .strip()
        .lower()
    )

    aliases = {
        "easy": "beginner",
        "medium": "intermediate",
        "hard": "advanced",
        "junior": "beginner",
        "mid": "intermediate",
        "mid-level": "intermediate",
        "senior": "advanced",
        "expert": "advanced",
    }

    return aliases.get(
        value,
        value,
    )


def _safe_list(
    value: Any,
) -> List[Any]:
    if isinstance(
        value,
        list,
    ):
        return value

    if value is None:
        return []

    return [value]


# ============================================================
# QUESTION GENERATION
# ============================================================

def generate_interview_questions(
    role: str,
    level: str = "intermediate",
    question_count: int = 5,
    skills: Optional[List[str]] = None,
    resume_context: Optional[str] = None,
    job_description: Optional[str] = None,
) -> List[str]:
    """
    Generate adaptive interview questions.
    """

    normalized_level = (
        _normalize_level(
            level
        )
    )

    question_count = max(
        1,
        min(
            int(question_count),
            15,
        ),
    )

    skills_text = (
        ", ".join(skills)
        if skills
        else "Not provided"
    )

    resume_text = (
        resume_context.strip()
        if resume_context
        else "Not provided"
    )

    jd_text = (
        job_description.strip()
        if job_description
        else "Not provided"
    )

    prompt = f"""
Generate exactly {question_count} realistic interview questions.

Candidate target role:
{role}

Candidate experience level:
{normalized_level}

Candidate skills:
{skills_text}

Resume context:
{resume_text}

Job description:
{jd_text}

Requirements:

- Questions must be relevant to the role.
- Match the requested difficulty level.
- Include a balanced mix of:
  technical knowledge,
  practical experience,
  problem solving,
  communication,
  and behavioral questions.
- Use resume context when it is available.
- Use the job description when it is available.
- Do not generate generic filler questions.
- Do not repeat the same concept.
- Questions should be suitable for a real interview.

Return JSON:

{{
    "questions": [
        "Question 1",
        "Question 2"
    ]
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an expert interviewer conducting realistic "
            "job interviews. Generate relevant, progressive and "
            "high-quality interview questions. Return JSON only."
        ),
        temperature=0.6,
        max_tokens=2200,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid interview question format."
        )

    questions = _safe_list(
        result.get(
            "questions",
            [],
        )
    )

    cleaned_questions = []

    for question in questions:
        question_text = str(
            question
        ).strip()

        if question_text:
            cleaned_questions.append(
                question_text
            )

    return cleaned_questions[
        :question_count
    ]


# ============================================================
# FOLLOW-UP QUESTION
# ============================================================

def generate_followup_question(
    question: str,
    answer: str,
    role: str = "General Professional",
    level: str = "intermediate",
    history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Generate one adaptive follow-up question based on the answer.
    """

    normalized_level = (
        _normalize_level(
            level
        )
    )

    formatted_history: List[Dict[str, str]] = []

    if history:
        for item in history[-10:]:
            item_question = str(
                item.get(
                    "question",
                    "",
                )
            ).strip()

            item_answer = str(
                item.get(
                    "answer",
                    "",
                )
            ).strip()

            if item_question:
                formatted_history.append(
                    {
                        "role": "assistant",
                        "content": (
                            "Question: "
                            + item_question
                        ),
                    }
                )

            if item_answer:
                formatted_history.append(
                    {
                        "role": "user",
                        "content": (
                            "Answer: "
                            + item_answer
                        ),
                    }
                )

    prompt = f"""
Generate exactly one intelligent follow-up interview question.

Target role:
{role}

Candidate level:
{normalized_level}

Current question:
{question}

Candidate answer:
{answer}

The follow-up must:

- directly relate to the candidate's answer when useful
- test depth of understanding
- identify gaps or vague claims
- avoid repeating earlier questions
- be natural and conversational
- be appropriate for the role and level
- be concise

Return JSON:

{{
    "question": "",
    "reason": "",
    "focus_area": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an adaptive AI interviewer. "
            "Ask thoughtful follow-up questions that naturally "
            "probe deeper into the candidate's previous answer."
        ),
        history=formatted_history,
        temperature=0.6,
        max_tokens=700,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid follow-up format."
        )

    result.setdefault(
        "question",
        "",
    )

    result.setdefault(
        "reason",
        "",
    )

    result.setdefault(
        "focus_area",
        "",
    )

    return result


# ============================================================
# ANSWER EVALUATION
# ============================================================

def evaluate_interview_answer(
    question: str,
    answer: str,
    role: str = "General Professional",
    level: str = "intermediate",
    expected_skills: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Evaluate one interview answer using real AI.
    """

    normalized_level = (
        _normalize_level(
            level
        )
    )

    skills_text = (
        ", ".join(expected_skills)
        if expected_skills
        else "General role-relevant competencies"
    )

    prompt = f"""
Evaluate this interview answer professionally.

Target role:
{role}

Candidate level:
{normalized_level}

Expected competencies:
{skills_text}

Interview question:
{question}

Candidate answer:
{answer}

Evaluate:

1. Relevance to the question
2. Technical or domain accuracy
3. Depth of explanation
4. Communication quality
5. Confidence indicators from the written response
6. Evidence and examples
7. Role suitability

Return JSON:

{{
    "score": 0,
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "relevance_score": 0,
    "depth_score": 0,
    "strengths": [],
    "improvements": [],
    "missing_points": [],
    "feedback": "",
    "summary": "",
    "followup_recommended": true
}}

Rules:

- Scores must be between 0 and 100.
- Do not invent achievements not mentioned by the candidate.
- Be strict about vague or irrelevant answers.
- Reward specific examples and clear reasoning.
- Feedback must be constructive and specific.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are a fair, evidence-based interview evaluator. "
            "Evaluate the actual answer rather than making assumptions. "
            "Return JSON only."
        ),
        temperature=0.2,
        max_tokens=1800,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid answer evaluation format."
        )

    for key in [
        "score",
        "technical_score",
        "communication_score",
        "confidence_score",
        "relevance_score",
        "depth_score",
    ]:
        result[key] = _clamp_score(
            result.get(
                key,
                0,
            )
        )

    result["strengths"] = _safe_list(
        result.get(
            "strengths",
            [],
        )
    )

    result["improvements"] = _safe_list(
        result.get(
            "improvements",
            [],
        )
    )

    result["missing_points"] = _safe_list(
        result.get(
            "missing_points",
            [],
        )
    )

    result.setdefault(
        "feedback",
        "",
    )

    result.setdefault(
        "summary",
        "",
    )

    result.setdefault(
        "followup_recommended",
        True,
    )

    return result


# ============================================================
# FINAL REPORT
# ============================================================

def generate_interview_report(
    role: str,
    level: str,
    questions: List[str],
    answers: List[str],
    evaluations: List[Dict[str, Any]],
    resume_context: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate a complete AI interview report.
    """

    normalized_level = (
        _normalize_level(
            level
        )
    )

    transcript = []

    for index, question in enumerate(
        questions
    ):
        answer = (
            answers[index]
            if index < len(answers)
            else ""
        )

        evaluation = (
            evaluations[index]
            if index < len(evaluations)
            else {}
        )

        transcript.append(
            {
                "question_number":
                    index + 1,
                "question":
                    question,
                "answer":
                    answer,
                "evaluation":
                    evaluation,
            }
        )

    prompt = f"""
Create a final interview performance report.

Role:
{role}

Level:
{normalized_level}

Resume context:
{resume_context or "Not available"}

Interview transcript and evaluations:

{transcript}

Return JSON:

{{
    "overall_score": 0,
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "problem_solving_score": 0,
    "hiring_probability": 0,
    "recommendation": "",
    "overall_assessment": "",
    "strengths": [],
    "weaknesses": [],
    "skill_gaps": [],
    "top_improvements": [],
    "interview_summary": "",
    "next_steps": []
}}

Recommendation must be one of:

- Strong Hire
- Hire
- Leaning Hire
- Neutral
- Leaning No Hire
- No Hire

Scores must be between 0 and 100.
Hiring probability must be between 0 and 100.
Base the report on the actual interview content.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are a senior hiring interviewer preparing a final "
            "candidate assessment. Be balanced, evidence-based and "
            "constructive. Return JSON only."
        ),
        temperature=0.25,
        max_tokens=2400,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid final report format."
        )

    for key in [
        "overall_score",
        "technical_score",
        "communication_score",
        "confidence_score",
        "problem_solving_score",
        "hiring_probability",
    ]:
        result[key] = _clamp_score(
            result.get(
                key,
                0,
            )
        )

    for key in [
        "strengths",
        "weaknesses",
        "skill_gaps",
        "top_improvements",
        "next_steps",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "recommendation",
        "Neutral",
    )

    result.setdefault(
        "overall_assessment",
        "",
    )

    result.setdefault(
        "interview_summary",
        "",
    )

    return result


# ============================================================
# LEGACY COMPATIBILITY
# ============================================================

def evaluate_answer(
    answer: str,
    question: str = "",
    role: str = "General Professional",
    level: str = "intermediate",
) -> Dict[str, Any]:
    """
    Backward-compatible answer evaluation.
    """

    return evaluate_interview_answer(
        question=(
            question
            or "Please describe your answer in detail."
        ),
        answer=answer,
        role=role,
        level=level,
    )


def generate_final_report(
    questions: Optional[List[str]] = None,
    answers: Optional[List[str]] = None,
    evaluations: Optional[List[Dict[str, Any]]] = None,
    role: str = "General Professional",
    level: str = "intermediate",
) -> Dict[str, Any]:
    """
    Backward-compatible final report generator.
    """

    return generate_interview_report(
        role=role,
        level=level,
        questions=questions or [],
        answers=answers or [],
        evaluations=evaluations or [],
    )


def generate_followup(
    question: str,
    answer: str,
    history: Optional[List[Dict[str, Any]]] = None,
    role: str = "General Professional",
    level: str = "intermediate",
) -> str:
    """
    Compatibility helper returning only the follow-up question string.
    """

    result = generate_followup_question(
        question=question,
        answer=answer,
        history=history,
        role=role,
        level=level,
    )

    return str(
        result.get(
            "question",
            "",
        )
    ).strip()


# ============================================================
# INTERVIEW COACH
# ============================================================

def generate_interview_coaching(
    question: str,
    answer: str,
    evaluation: Optional[Dict[str, Any]] = None,
    role: str = "General Professional",
) -> Dict[str, Any]:
    """
    Generate targeted coaching after an answer.
    """

    prompt = f"""
Act as an interview coach.

Target role:
{role}

Question:
{question}

Candidate answer:
{answer}

Evaluation:
{evaluation or {}}

Provide concise and actionable coaching.

Return JSON:

{{
    "what_went_well": [],
    "what_to_improve": [],
    "better_answer_strategy": [],
    "practice_tip": "",
    "sample_structure": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an experienced interview coach. "
            "Help candidates improve without falsely claiming "
            "that they gave a stronger answer than they actually did."
        ),
        temperature=0.4,
        max_tokens=1500,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid coaching format."
        )

    for key in [
        "what_went_well",
        "what_to_improve",
        "better_answer_strategy",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "practice_tip",
        "",
    )

    result.setdefault(
        "sample_structure",
        "",
    )

    return result