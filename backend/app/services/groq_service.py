import json
import os
import re
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)

_client: Optional[Groq] = None


def get_client() -> Groq:
    global _client

    if _client is None:
        if not GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is missing from backend/.env"
            )

        _client = Groq(
            api_key=GROQ_API_KEY
        )

    return _client


def ask_groq(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> str:
    """
    Core Groq AI request used across HireSense AI.
    """

    client = get_client()

    messages: List[Dict[str, str]] = []

    if system_prompt:
        messages.append(
            {
                "role": "system",
                "content": system_prompt,
            }
        )

    messages.append(
        {
            "role": "user",
            "content": prompt,
        }
    )

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        if not completion.choices:
            raise RuntimeError(
                "Groq returned no completion choices."
            )

        content = completion.choices[0].message.content

        if not content:
            raise RuntimeError(
                "Groq returned an empty response."
            )

        return content.strip()

    except Exception as error:
        raise RuntimeError(
            f"Groq AI request failed: {str(error)}"
        ) from error


def ask_groq_json(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 2048,
) -> Any:
    """
    Ask Groq for structured JSON and return parsed Python data.
    """

    json_instruction = """
Return ONLY valid JSON.

Do not use markdown.
Do not use ```json.
Do not include explanations before or after the JSON.
"""

    if system_prompt:
        final_system_prompt = (
            f"{system_prompt}\n\n{json_instruction}"
        )
    else:
        final_system_prompt = json_instruction

    response = ask_groq(
        prompt=prompt,
        system_prompt=final_system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return parse_json_response(response)


def parse_json_response(response: str) -> Any:
    """
    Safely extracts JSON from AI responses.
    """

    cleaned = response.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    ).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    json_match = re.search(
        r"(\{.*\}|\[.*\])",
        cleaned,
        re.DOTALL,
    )

    if json_match:
        possible_json = json_match.group(1)

        try:
            return json.loads(possible_json)
        except json.JSONDecodeError:
            pass

    raise ValueError(
        "AI returned invalid JSON."
    )


def ask_copilot(message: str) -> str:
    """
    HireSense AI Career Copilot.

    Kept specifically because the existing copilot route imports
    ask_copilot directly.
    """

    system_prompt = """
You are HireSense AI, an advanced AI career and interview intelligence
assistant.

You help users with:
- Interview preparation
- Mock interview guidance
- Resume improvement
- Job description analysis
- Technical and HR interview questions
- Career planning
- Communication improvement
- Hiring readiness
- Professional development

Your personality should be intelligent, supportive, concise and practical.

Give clear and actionable answers.
Do not mention that you are powered by Groq.
"""

    return ask_groq(
        prompt=message,
        system_prompt=system_prompt,
        temperature=0.5,
        max_tokens=2048,
    )


def ask_resume_ai(
    resume_text: str,
    job_description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Resume intelligence helper for resume analysis routes.
    """

    jd_section = ""

    if job_description:
        jd_section = f"""
JOB DESCRIPTION:
{job_description}
"""

    prompt = f"""
Analyze the following candidate resume for a modern AI-powered
career intelligence platform.

RESUME:
{resume_text}

{jd_section}

Return a JSON object with this exact structure:

{{
    "overall_score": 0,
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "skills_found": [],
    "missing_skills": [],
    "recommendations": [],
    "ats_feedback": [],
    "keyword_match": 0
}}

Rules:
- Scores must be between 0 and 100.
- Give realistic and actionable feedback.
- Do not invent experience not present in the resume.
"""

    result = ask_groq_json(
        prompt=prompt,
        temperature=0.2,
        max_tokens=4096,
    )

    if not isinstance(result, dict):
        raise ValueError(
            "Resume AI returned an invalid response."
        )

    return result


def ask_interview_ai(
    prompt: str,
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> str:
    """
    Generic interview intelligence helper.
    """

    system_prompt = """
You are HireSense AI Interview Intelligence Engine.

Provide accurate, professional and realistic interview assistance.

When evaluating candidates:
- Be constructive.
- Be specific.
- Identify strengths and weaknesses.
- Avoid exaggerated scoring.
- Focus on employability and interview readiness.
"""

    return ask_groq(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def ask_recruiter_ai(
    prompt: str,
) -> str:
    """
    Recruiter and candidate intelligence helper.
    """

    system_prompt = """
You are HireSense AI Recruiter Intelligence.

Analyze candidates professionally based only on the supplied information.

Focus on:
- Skills
- Experience
- Communication
- Interview performance
- Job fit
- Hiring recommendation
- Risks and strengths

Be objective and practical.
"""

    return ask_groq(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=0.3,
        max_tokens=2048,
    )


def ask_report_ai(
    prompt: str,
) -> str:
    """
    Final interview report generation helper.
    """

    system_prompt = """
You are HireSense AI Performance Reporting Engine.

Generate structured, professional and actionable candidate reports.

Focus on:
- Overall performance
- Technical skills
- Communication
- Confidence
- Strengths
- Weaknesses
- Improvement recommendations
- Hiring readiness

Avoid generic feedback.
"""

    return ask_groq(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=0.3,
        max_tokens=4096,
    )