# backend/app/services/coding_ai.py

from __future__ import annotations

from typing import Any

from app.services.groq_service import (
    ask_groq_json,
    get_groq_status,
    is_groq_available,
)


# ============================================================
# HELPERS
# ============================================================

def clamp_score(
    value: Any,
) -> int:

    try:
        score = int(
            round(
                float(value)
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        return 0

    return max(
        0,
        min(
            100,
            score,
        ),
    )


def normalize_list(
    value: Any,
    limit: int = 20,
) -> list[str]:

    if not isinstance(
        value,
        list,
    ):
        return []

    result: list[str] = []

    seen = set()

    for item in value:

        if not isinstance(
            item,
            str,
        ):
            continue

        cleaned = item.strip()

        if not cleaned:
            continue

        key = cleaned.lower()

        if key in seen:
            continue

        seen.add(key)

        result.append(cleaned)

        if len(result) >= limit:
            break

    return result


def normalize_examples(
    value: Any,
) -> list[dict[str, str]]:

    if not isinstance(
        value,
        list,
    ):
        return []

    examples: list[
        dict[str, str]
    ] = []

    for item in value[:5]:

        if not isinstance(
            item,
            dict,
        ):
            continue

        examples.append(
            {
                "input": str(
                    item.get(
                        "input",
                        "",
                    )
                ),

                "output": str(
                    item.get(
                        "output",
                        item.get(
                            "expected_output",
                            "",
                        ),
                    )
                ),

                "explanation": str(
                    item.get(
                        "explanation",
                        "",
                    )
                ),
            }
        )

    return examples


def normalize_test_cases(
    value: Any,
) -> list[dict[str, str]]:

    if not isinstance(
        value,
        list,
    ):
        return []

    test_cases: list[
        dict[str, str]
    ] = []

    for item in value[:10]:

        if not isinstance(
            item,
            dict,
        ):
            continue

        test_cases.append(
            {
                "input": str(
                    item.get(
                        "input",
                        "",
                    )
                ),

                "expected_output": str(
                    item.get(
                        "expected_output",
                        item.get(
                            "output",
                            "",
                        ),
                    )
                ),
            }
        )

    return test_cases


def validate_text(
    value: str,
    field_name: str,
    max_length: int,
) -> str:

    cleaned = (
        value
        or ""
    ).strip()

    if not cleaned:

        raise ValueError(
            f"{field_name} cannot be empty."
        )

    return cleaned[:max_length]


# ============================================================
# GENERATE CODING QUESTION
# ============================================================

def generate_question(
    role: str,
    level: str,
    language: str,
) -> dict[str, Any]:

    role = validate_text(
        role,
        "Role",
        200,
    )

    level = validate_text(
        level,
        "Level",
        100,
    )

    language = validate_text(
        language,
        "Language",
        100,
    )

    if not is_groq_available():

        return {
            "success": False,
            "error":
                (
                    "Coding AI is unavailable. "
                    "Check GROQ_API_KEY and ENABLE_AI."
                ),
        }

    system_prompt = """
You are HireSense AI Coding Interviewer.

You generate realistic technical interview coding problems.

Create exactly one problem appropriate for the requested
candidate role, difficulty level, and programming language.

Rules:

1. The problem must be solvable.
2. Do not include ambiguous requirements.
3. Difficulty must match the requested level.
4. Include realistic constraints.
5. Examples must be internally consistent.
6. Test cases must match the problem.
7. Do not provide the solution.
8. Return valid JSON only.
9. Do not wrap JSON in Markdown.
"""

    prompt = f"""
Generate one coding interview problem.

Candidate role:
{role}

Difficulty level:
{level}

Programming language:
{language}

Return exactly this JSON structure:

{{
    "title": "Problem title",

    "description":
        "Complete problem description",

    "difficulty":
        "{level}",

    "language":
        "{language}",

    "input_format":
        "Input description",

    "output_format":
        "Output description",

    "constraints": [
        "Constraint 1",
        "Constraint 2"
    ],

    "examples": [
        {{
            "input":
                "Example input",

            "output":
                "Example output",

            "explanation":
                "Explanation"
        }}
    ],

    "test_cases": [
        {{
            "input":
                "Test input",

            "expected_output":
                "Expected output"
        }}
    ]
}}
"""

    try:

        result = ask_groq_json(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.4,
            max_tokens=3000,
        )

    except Exception as error:

        print(
            "Coding question AI error:",
            str(error),
        )

        return {
            "success": False,
            "error":
                (
                    "Unable to generate coding question: "
                    f"{str(error)}"
                ),
        }

    title = str(
        result.get(
            "title",
            "Coding Interview Problem",
        )
    ).strip()

    description = str(
        result.get(
            "description",
            "",
        )
    ).strip()

    if not description:

        return {
            "success": False,
            "error":
                (
                    "AI generated an invalid "
                    "coding question."
                ),
        }

    return {
        "success": True,

        "title":
            title,

        "description":
            description,

        "difficulty":
            str(
                result.get(
                    "difficulty",
                    level,
                )
            ),

        "language":
            str(
                result.get(
                    "language",
                    language,
                )
            ),

        "input_format":
            str(
                result.get(
                    "input_format",
                    "",
                )
            ),

        "output_format":
            str(
                result.get(
                    "output_format",
                    "",
                )
            ),

        "constraints":
            normalize_list(
                result.get(
                    "constraints",
                    [],
                ),
                limit=15,
            ),

        "examples":
            normalize_examples(
                result.get(
                    "examples",
                    [],
                )
            ),

        "test_cases":
            normalize_test_cases(
                result.get(
                    "test_cases",
                    [],
                )
            ),

        "model":
            get_groq_status().get(
                "model"
            ),
    }


# ============================================================
# EVALUATE CODING SOLUTION
# ============================================================

def evaluate_solution(
    role: str,
    language: str,
    question: str,
    solution: str,
) -> dict[str, Any]:

    role = validate_text(
        role,
        "Role",
        200,
    )

    language = validate_text(
        language,
        "Language",
        100,
    )

    question = validate_text(
        question,
        "Question",
        15000,
    )

    solution = validate_text(
        solution,
        "Solution",
        20000,
    )

    if not is_groq_available():

        return {
            "success": False,
            "score": 0,
            "error":
                (
                    "Coding AI is unavailable. "
                    "Check GROQ_API_KEY and ENABLE_AI."
                ),
        }

    system_prompt = """
You are a strict but fair senior software engineer
conducting a coding interview.

Evaluate only the candidate's submitted solution.

Important rules:

1. Do not invent execution results.
2. Do not claim the code was actually run.
3. Evaluate based on the submitted code and problem statement.
4. Be specific about likely correctness issues.
5. Complexity must be reasonable for the actual implementation.
6. Identify important missing edge cases.
7. Score fairly from 0 to 100.
8. Return valid JSON only.
9. Do not use Markdown code fences.
"""

    prompt = f"""
Evaluate this coding interview submission.

Candidate role:
{role}

Programming language:
{language}

Problem:
{question}

Candidate solution:
{solution}

Evaluate:

1. Correctness
2. Algorithm quality
3. Time complexity
4. Space complexity
5. Code quality
6. Edge case handling
7. Maintainability
8. Interview readiness

Return exactly this JSON structure:

{{
    "score": 0,

    "correctness_score": 0,

    "code_quality_score": 0,

    "algorithm_score": 0,

    "edge_case_score": 0,

    "time_complexity":
        "Estimated time complexity",

    "space_complexity":
        "Estimated space complexity",

    "strengths": [
        "Specific strength"
    ],

    "weaknesses": [
        "Specific weakness"
    ],

    "improvements": [
        "Specific improvement"
    ],

    "verdict":
        "Overall assessment",

    "interview_recommendation":
        "Proceed / Borderline / Do Not Proceed"
}}
"""

    try:

        result = ask_groq_json(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=3000,
        )

    except Exception as error:

        print(
            "Coding evaluation AI error:",
            str(error),
        )

        return {
            "success": False,
            "score": 0,
            "error":
                (
                    "Unable to evaluate solution: "
                    f"{str(error)}"
                ),
        }

    score = clamp_score(
        result.get(
            "score",
            0,
        )
    )

    correctness_score = clamp_score(
        result.get(
            "correctness_score",
            score,
        )
    )

    code_quality_score = clamp_score(
        result.get(
            "code_quality_score",
            score,
        )
    )

    algorithm_score = clamp_score(
        result.get(
            "algorithm_score",
            score,
        )
    )

    edge_case_score = clamp_score(
        result.get(
            "edge_case_score",
            score,
        )
    )

    return {
        "success": True,

        "score":
            score,

        "correctness_score":
            correctness_score,

        "code_quality_score":
            code_quality_score,

        "algorithm_score":
            algorithm_score,

        "edge_case_score":
            edge_case_score,

        "time_complexity":
            str(
                result.get(
                    "time_complexity",
                    "Not determined",
                )
            ),

        "space_complexity":
            str(
                result.get(
                    "space_complexity",
                    "Not determined",
                )
            ),

        "strengths":
            normalize_list(
                result.get(
                    "strengths",
                    [],
                )
            ),

        "weaknesses":
            normalize_list(
                result.get(
                    "weaknesses",
                    [],
                )
            ),

        "improvements":
            normalize_list(
                result.get(
                    "improvements",
                    [],
                )
            ),

        "verdict":
            str(
                result.get(
                    "verdict",
                    "Code evaluation completed.",
                )
            ),

        "interview_recommendation":
            str(
                result.get(
                    "interview_recommendation",
                    "Borderline",
                )
            ),

        "model":
            get_groq_status().get(
                "model"
            ),
    }