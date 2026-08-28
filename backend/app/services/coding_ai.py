import json
import os
import re
from typing import Any, Dict

from groq import Groq

from app.config import GROQ_API_KEY


client = Groq(
    api_key=GROQ_API_KEY
)


MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)


# ============================================================
# JSON PARSER
# ============================================================

def parse_json_response(
    content: str,
) -> Dict[str, Any]:

    if not content:

        return {}

    cleaned = content.strip()

    cleaned = re.sub(
        r"^```json",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"^```",
        "",
        cleaned,
    )

    cleaned = re.sub(
        r"```$",
        "",
        cleaned,
    )

    cleaned = cleaned.strip()

    try:

        return json.loads(
            cleaned
        )

    except json.JSONDecodeError:

        match = re.search(
            r"\{.*\}",
            cleaned,
            re.DOTALL,
        )

        if match:

            try:

                return json.loads(
                    match.group()
                )

            except json.JSONDecodeError:

                return {}

    return {}


# ============================================================
# GENERATE QUESTION
# ============================================================

def generate_question(
    role: str,
    level: str,
    language: str,
):

    prompt = f"""
You are a senior technical interviewer.

Generate one coding interview problem.

Candidate role:
{role}

Difficulty:
{level}

Programming language:
{language}

Return ONLY valid JSON.

Required format:

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
            "input": "example input",
            "output": "example output",
            "explanation":
                "Why this output occurs"
        }}
    ],

    "test_cases": [
        {{
            "input": "input",
            "expected_output":
                "output"
        }}
    ]
}}

Do not use markdown.
Return JSON only.
"""

    completion = client.chat.completions.create(

        model=MODEL,

        temperature=0.4,

        messages=[

            {
                "role": "system",
                "content":
                    "You generate coding interview problems. "
                    "Return valid JSON only.",
            },

            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    raw = (
        completion
        .choices[0]
        .message
        .content
    )

    result = parse_json_response(
        raw
    )

    if not result:

        return {

            "success": False,

            "error":
                "Unable to generate coding question.",
        }

    return {

        "success": True,

        **result,
    }


# ============================================================
# EVALUATE SOLUTION
# ============================================================

def evaluate_solution(
    role: str,
    language: str,
    question: str,
    solution: str,
):

    prompt = f"""
You are a senior software engineer and coding interviewer.

Evaluate the candidate's coding solution.

Role:
{role}

Language:
{language}

Problem:
{question}

Candidate Solution:
{solution}

Evaluate:

1. Correctness
2. Algorithm quality
3. Time complexity
4. Space complexity
5. Code quality
6. Edge cases
7. Maintainability
8. Interview readiness

Return ONLY valid JSON.

Required format:

{{
    "score": 85,

    "correctness_score": 90,

    "code_quality_score": 80,

    "algorithm_score": 85,

    "edge_case_score": 80,

    "time_complexity": "O(n)",

    "space_complexity": "O(1)",

    "strengths": [
        "Clear implementation"
    ],

    "weaknesses": [
        "Could optimize edge case handling"
    ],

    "improvements": [
        "Use a more efficient lookup structure"
    ],

    "verdict":
        "Strong solution",

    "interview_recommendation":
        "Proceed"
}}

Score must be between 0 and 100.

Do not use markdown.
Return JSON only.
"""

    completion = client.chat.completions.create(

        model=MODEL,

        temperature=0.2,

        messages=[

            {
                "role": "system",
                "content":
                    "You are a strict coding interviewer. "
                    "Return JSON only.",
            },

            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    raw = (
        completion
        .choices[0]
        .message
        .content
    )

    result = parse_json_response(
        raw
    )

    if not result:

        return {

            "success": False,

            "score": 0,

            "error":
                "Unable to evaluate solution.",
        }

    score = result.get(
        "score",
        0,
    )

    try:

        score = int(score)

    except (
        ValueError,
        TypeError,
    ):

        score = 0

    score = max(
        0,
        min(
            score,
            100,
        ),
    )

    result["score"] = score

    result["success"] = True

    return result