import json
import os
import re
from typing import Any, Dict

from groq import Groq

from app.config import GROQ_API_KEY


# ============================================================
# GROQ CLIENT
# ============================================================

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

def _parse_json(
    raw_response: str,
) -> Dict[str, Any]:

    if not raw_response:
        return {}

    text = raw_response.strip()

    # Remove markdown code fences
    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"^```\s*",
        "",
        text,
    )

    text = re.sub(
        r"\s*```$",
        "",
        text,
    )

    text = text.strip()

    try:
        result = json.loads(text)

        if isinstance(result, dict):
            return result

    except json.JSONDecodeError:
        pass

    # Try extracting the JSON object
    match = re.search(
        r"\{.*\}",
        text,
        re.DOTALL,
    )

    if match:

        try:

            result = json.loads(
                match.group()
            )

            if isinstance(result, dict):
                return result

        except json.JSONDecodeError:
            pass

    return {}


# ============================================================
# SAFE INTEGER
# ============================================================

def _safe_int(
    value: Any,
    default: int = 0,
) -> int:

    try:

        number = int(float(value))

    except (
        TypeError,
        ValueError,
    ):

        number = default

    return max(
        0,
        min(
            number,
            100,
        ),
    )


# ============================================================
# RECRUITER AI
# ============================================================

def analyze_candidate(
    resume_report: dict,
    jd_report: dict,
    interview_report: dict,
    coding_report: dict | None = None,
    vision_report: dict | None = None,
) -> dict:

    coding_report = (
        coding_report
        if isinstance(coding_report, dict)
        else {}
    )

    vision_report = (
        vision_report
        if isinstance(vision_report, dict)
        else {}
    )

    prompt = f"""
You are a senior technical recruiter and hiring manager.

Analyze the complete candidate profile using the information below.

========================
RESUME ANALYSIS
========================

{json.dumps(
    resume_report or {},
    indent=2,
    default=str,
)}

========================
JOB DESCRIPTION MATCH
========================

{json.dumps(
    jd_report or {},
    indent=2,
    default=str,
)}

========================
INTERVIEW ANALYSIS
========================

{json.dumps(
    interview_report or {},
    indent=2,
    default=str,
)}

========================
CODING ANALYSIS
========================

{json.dumps(
    coding_report,
    indent=2,
    default=str,
)}

========================
VISION ANALYSIS
========================

{json.dumps(
    vision_report,
    indent=2,
    default=str,
)}

========================
TASK
========================

Create a professional recruiter assessment.

Evaluate:

1. Technical capability
2. Resume quality
3. Job-description alignment
4. Coding ability
5. Communication
6. Confidence
7. Eye contact
8. Professional behavior
9. Overall hiring readiness

Do NOT invent facts that are not present in the supplied data.

Return ONLY valid JSON.

Required structure:

{{
    "candidate_score": 82,

    "hiring_probability": 78,

    "verdict": "Strong Candidate",

    "recommendation": "Proceed to next round",

    "technical_summary":
        "Strong technical foundation with relevant project experience.",

    "resume_summary":
        "Resume demonstrates relevant technical skills and projects.",

    "communication_summary":
        "Communication is clear and reasonably structured.",

    "coding_summary":
        "Coding performance demonstrates good problem-solving ability.",

    "vision_summary":
        "Candidate demonstrates acceptable visual engagement.",

    "strengths": [
        "Strong technical foundation",
        "Relevant project experience"
    ],

    "weaknesses": [
        "Limited cloud experience"
    ],

    "recommended_roles": [
        "Software Engineer",
        "Backend Developer"
    ],

    "interview_focus": [
        "Cloud architecture",
        "System design"
    ],

    "salary_range": "₹6 LPA - ₹10 LPA",

    "next_steps": [
        "Proceed to technical interview"
    ]
}}

Rules:

- candidate_score must be 0-100.
- hiring_probability must be 0-100.
- strengths must be an array.
- weaknesses must be an array.
- recommended_roles must be an array.
- interview_focus must be an array.
- next_steps must be an array.
- salary_range must be a string.
- Return JSON only.
- No markdown.
- No explanation outside JSON.
"""

    try:

        completion = client.chat.completions.create(

            model=MODEL,

            temperature=0.2,

            messages=[

                {
                    "role": "system",

                    "content":
                        "You are an expert recruiter. "
                        "Return valid JSON only.",
                },

                {
                    "role": "user",

                    "content": prompt,
                },
            ],
        )

        raw_response = (
            completion
            .choices[0]
            .message
            .content
        )

        result = _parse_json(
            raw_response
        )

    except Exception as exc:

        return {

            "success": False,

            "candidate_score": 0,

            "hiring_probability": 0,

            "verdict":
                "Unable to Generate",

            "recommendation":
                "Recruiter AI analysis failed.",

            "technical_summary": "",

            "resume_summary": "",

            "communication_summary": "",

            "coding_summary": "",

            "vision_summary": "",

            "strengths": [],

            "weaknesses": [],

            "recommended_roles": [],

            "interview_focus": [],

            "salary_range": "",

            "next_steps": [],

            "error": str(exc),
        }

    if not result:

        return {

            "success": False,

            "candidate_score": 0,

            "hiring_probability": 0,

            "verdict":
                "Unable to Generate",

            "recommendation":
                "Recruiter AI returned invalid data.",

            "technical_summary": "",

            "resume_summary": "",

            "communication_summary": "",

            "coding_summary": "",

            "vision_summary": "",

            "strengths": [],

            "weaknesses": [],

            "recommended_roles": [],

            "interview_focus": [],

            "salary_range": "",

            "next_steps": [],
        }

    # ========================================================
    # NORMALIZE AI OUTPUT
    # ========================================================

    candidate_score = _safe_int(
        result.get(
            "candidate_score",
            0,
        )
    )

    hiring_probability = _safe_int(
        result.get(
            "hiring_probability",
            0,
        )
    )

    strengths = result.get(
        "strengths",
        [],
    )

    weaknesses = result.get(
        "weaknesses",
        [],
    )

    recommended_roles = result.get(
        "recommended_roles",
        [],
    )

    interview_focus = result.get(
        "interview_focus",
        [],
    )

    next_steps = result.get(
        "next_steps",
        [],
    )

    if not isinstance(
        strengths,
        list,
    ):
        strengths = []

    if not isinstance(
        weaknesses,
        list,
    ):
        weaknesses = []

    if not isinstance(
        recommended_roles,
        list,
    ):
        recommended_roles = []

    if not isinstance(
        interview_focus,
        list,
    ):
        interview_focus = []

    if not isinstance(
        next_steps,
        list,
    ):
        next_steps = []

    return {

        "success": True,

        "candidate_score":
            candidate_score,

        "hiring_probability":
            hiring_probability,

        "verdict":
            str(
                result.get(
                    "verdict",
                    "Needs Review",
                )
            ),

        "recommendation":
            str(
                result.get(
                    "recommendation",
                    "",
                )
            ),

        "technical_summary":
            str(
                result.get(
                    "technical_summary",
                    "",
                )
            ),

        "resume_summary":
            str(
                result.get(
                    "resume_summary",
                    "",
                )
            ),

        "communication_summary":
            str(
                result.get(
                    "communication_summary",
                    "",
                )
            ),

        "coding_summary":
            str(
                result.get(
                    "coding_summary",
                    "",
                )
            ),

        "vision_summary":
            str(
                result.get(
                    "vision_summary",
                    "",
                )
            ),

        "strengths":
            strengths,

        "weaknesses":
            weaknesses,

        "recommended_roles":
            recommended_roles,

        "interview_focus":
            interview_focus,

        "salary_range":
            str(
                result.get(
                    "salary_range",
                    "",
                )
            ),

        "next_steps":
            next_steps,
    }