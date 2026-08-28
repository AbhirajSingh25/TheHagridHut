# app/services/resume_ai.py

from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

from app.services.groq_service import (
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
        score = int(
            float(value)
        )
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


def _clean_text(
    value: Optional[str],
) -> str:
    if not value:
        return ""

    return str(
        value
    ).strip()


# ============================================================
# RESUME ANALYSIS
# ============================================================

def analyze_resume(
    resume_text: str,
    target_role: Optional[str] = None,
    job_description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Perform complete AI resume analysis.
    """

    clean_resume = _clean_text(
        resume_text
    )

    if not clean_resume:
        raise ValueError(
            "Resume text is required for analysis."
        )

    prompt = f"""
Analyze this resume professionally.

Target role:
{target_role or "Not specified"}

Job description:
{job_description or "Not provided"}

Resume:

{clean_resume}

Analyze:

1. Overall resume quality
2. Professional summary
3. Work experience
4. Skills
5. Projects
6. Education
7. ATS compatibility
8. Missing information
9. Strengths
10. Weaknesses
11. Role readiness
12. Resume improvement opportunities

Return JSON:

{{
    "overall_score": 0,
    "ats_score": 0,
    "role_readiness_score": 0,

    "professional_summary": "",

    "candidate_profile": {{
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "current_role": "",
        "experience_level": ""
    }},

    "skills": {{
        "technical": [],
        "soft": [],
        "tools": [],
        "languages": [],
        "frameworks": []
    }},

    "experience": {{
        "years_of_experience": "",
        "experience_summary": "",
        "key_achievements": []
    }},

    "education": [],

    "projects": [],

    "strengths": [],

    "weaknesses": [],

    "missing_sections": [],

    "ats_issues": [],

    "keyword_gaps": [],

    "improvements": [],

    "top_priority_actions": [],

    "overall_feedback": ""
}}

Rules:

- Scores must be between 0 and 100.
- Do not invent information not present in the resume.
- If information cannot be found, use empty strings or arrays.
- Be specific and useful.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an expert recruiter, ATS specialist and "
            "career coach. Analyze resumes based on the actual "
            "content provided. Do not invent candidate information. "
            "Return valid JSON only."
        ),
        temperature=0.25,
        max_tokens=3200,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid resume analysis format."
        )

    return _normalize_resume_analysis(
        result
    )


# ============================================================
# NORMALIZE RESUME ANALYSIS
# ============================================================

def _normalize_resume_analysis(
    result: Dict[str, Any],
) -> Dict[str, Any]:

    for key in [
        "overall_score",
        "ats_score",
        "role_readiness_score",
    ]:
        result[key] = _clamp_score(
            result.get(
                key,
                0,
            )
        )

    result.setdefault(
        "professional_summary",
        "",
    )

    candidate_profile = result.get(
        "candidate_profile",
        {},
    )

    if not isinstance(
        candidate_profile,
        dict,
    ):
        candidate_profile = {}

    for key in [
        "name",
        "email",
        "phone",
        "location",
        "current_role",
        "experience_level",
    ]:
        candidate_profile.setdefault(
            key,
            "",
        )

    result[
        "candidate_profile"
    ] = candidate_profile

    skills = result.get(
        "skills",
        {},
    )

    if not isinstance(
        skills,
        dict,
    ):
        skills = {}

    for key in [
        "technical",
        "soft",
        "tools",
        "languages",
        "frameworks",
    ]:
        skills[key] = _safe_list(
            skills.get(
                key,
                [],
            )
        )

    result[
        "skills"
    ] = skills

    experience = result.get(
        "experience",
        {},
    )

    if not isinstance(
        experience,
        dict,
    ):
        experience = {}

    experience.setdefault(
        "years_of_experience",
        "",
    )

    experience.setdefault(
        "experience_summary",
        "",
    )

    experience[
        "key_achievements"
    ] = _safe_list(
        experience.get(
            "key_achievements",
            [],
        )
    )

    result[
        "experience"
    ] = experience

    for key in [
        "education",
        "projects",
        "strengths",
        "weaknesses",
        "missing_sections",
        "ats_issues",
        "keyword_gaps",
        "improvements",
        "top_priority_actions",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "overall_feedback",
        "",
    )

    return result


# ============================================================
# JOB DESCRIPTION MATCHING
# ============================================================

def match_resume_to_job(
    resume_text: str,
    job_description: str,
    target_role: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Compare a resume against a job description.
    """

    clean_resume = _clean_text(
        resume_text
    )

    clean_job_description = _clean_text(
        job_description
    )

    if not clean_resume:
        raise ValueError(
            "Resume text is required."
        )

    if not clean_job_description:
        raise ValueError(
            "Job description is required."
        )

    prompt = f"""
Compare this candidate resume against the job description.

Target role:
{target_role or "Determine from the job description"}

Resume:

{clean_resume}

Job description:

{clean_job_description}

Evaluate:

1. Overall compatibility
2. Technical skill match
3. Experience match
4. Education match
5. Keyword match
6. Missing skills
7. Missing experience
8. Candidate strengths for this role
9. Candidate weaknesses for this role
10. Specific improvements to increase compatibility

Return JSON:

{{
    "overall_match_score": 0,
    "skills_match_score": 0,
    "experience_match_score": 0,
    "education_match_score": 0,
    "keyword_match_score": 0,

    "matched_skills": [],
    "missing_skills": [],
    "additional_skills": [],

    "matched_keywords": [],
    "missing_keywords": [],

    "matched_requirements": [],
    "missing_requirements": [],

    "experience_gaps": [],

    "candidate_strengths": [],
    "candidate_weaknesses": [],

    "recommendations": [],

    "final_assessment": "",

    "interview_recommendation": ""
}}

Scores must be between 0 and 100.
Do not claim a match when the resume does not provide evidence.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an expert recruiter and ATS matching system. "
            "Compare resumes and job descriptions carefully using "
            "only evidence present in the provided text. "
            "Return valid JSON only."
        ),
        temperature=0.2,
        max_tokens=3000,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid job match format."
        )

    return _normalize_job_match(
        result
    )


# ============================================================
# NORMALIZE JOB MATCH
# ============================================================

def _normalize_job_match(
    result: Dict[str, Any],
) -> Dict[str, Any]:

    for key in [
        "overall_match_score",
        "skills_match_score",
        "experience_match_score",
        "education_match_score",
        "keyword_match_score",
    ]:
        result[key] = _clamp_score(
            result.get(
                key,
                0,
            )
        )

    for key in [
        "matched_skills",
        "missing_skills",
        "additional_skills",
        "matched_keywords",
        "missing_keywords",
        "matched_requirements",
        "missing_requirements",
        "experience_gaps",
        "candidate_strengths",
        "candidate_weaknesses",
        "recommendations",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "final_assessment",
        "",
    )

    result.setdefault(
        "interview_recommendation",
        "",
    )

    return result


# ============================================================
# ATS OPTIMIZATION
# ============================================================

def optimize_resume_for_ats(
    resume_text: str,
    target_role: Optional[str] = None,
    job_description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate ATS-specific optimization recommendations.
    """

    clean_resume = _clean_text(
        resume_text
    )

    if not clean_resume:
        raise ValueError(
            "Resume text is required."
        )

    prompt = f"""
Analyze this resume for ATS optimization.

Target role:
{target_role or "Not specified"}

Job description:
{job_description or "Not provided"}

Resume:

{clean_resume}

Evaluate:

- ATS readability
- Section structure
- Keyword optimization
- Skill placement
- Experience bullet quality
- Measurable achievements
- Formatting risks
- Missing role-specific keywords

Return JSON:

{{
    "ats_score": 0,

    "ats_strengths": [],

    "ats_issues": [
        {{
            "severity": "low",
            "issue": "",
            "recommendation": ""
        }}
    ],

    "missing_keywords": [],

    "recommended_keywords": [],

    "bullet_point_improvements": [],

    "formatting_recommendations": [],

    "priority_actions": [],

    "optimized_summary": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an ATS optimization specialist. "
            "Focus on practical improvements that improve parsing, "
            "keyword relevance and recruiter readability. "
            "Return valid JSON only."
        ),
        temperature=0.25,
        max_tokens=2800,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid ATS analysis format."
        )

    result[
        "ats_score"
    ] = _clamp_score(
        result.get(
            "ats_score",
            0,
        )
    )

    for key in [
        "ats_strengths",
        "ats_issues",
        "missing_keywords",
        "recommended_keywords",
        "bullet_point_improvements",
        "formatting_recommendations",
        "priority_actions",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "optimized_summary",
        "",
    )

    return result


# ============================================================
# RESUME IMPROVEMENT
# ============================================================

def improve_resume_section(
    section_name: str,
    section_content: str,
    target_role: Optional[str] = None,
    job_description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Improve a single resume section.
    """

    clean_section = _clean_text(
        section_content
    )

    if not clean_section:
        raise ValueError(
            "Section content is required."
        )

    prompt = f"""
Improve this resume section.

Section:
{section_name}

Target role:
{target_role or "Not specified"}

Job description:
{job_description or "Not provided"}

Current content:

{clean_section}

Return JSON:

{{
    "section_name": "{section_name}",
    "improved_content": "",
    "changes_made": [],
    "why_improved": [],
    "keywords_added": []
}}

Rules:

- Do not invent fake work experience.
- Do not invent degrees, companies, achievements or skills.
- Preserve the factual meaning.
- Improve clarity, action verbs and professional impact.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are an expert resume writer. "
            "Improve resume content without fabricating facts. "
            "Return valid JSON only."
        ),
        temperature=0.35,
        max_tokens=1800,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid resume improvement format."
        )

    result.setdefault(
        "section_name",
        section_name,
    )

    result.setdefault(
        "improved_content",
        "",
    )

    for key in [
        "changes_made",
        "why_improved",
        "keywords_added",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    return result


# ============================================================
# CAREER SKILL GAP ANALYSIS
# ============================================================

def analyze_skill_gap(
    current_skills: List[str],
    target_role: str,
    job_description: Optional[str] = None,
    experience_level: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Identify skill gaps and generate a learning roadmap.
    """

    prompt = f"""
Analyze the candidate's skill gap.

Current skills:

{", ".join(current_skills) if current_skills else "No skills provided"}

Target role:
{target_role}

Experience level:
{experience_level or "Not specified"}

Job description:
{job_description or "Not provided"}

Return JSON:

{{
    "role_readiness_score": 0,

    "strong_skills": [],
    "relevant_skills": [],
    "missing_critical_skills": [],
    "missing_optional_skills": [],

    "skill_priorities": [
        {{
            "skill": "",
            "priority": "high",
            "reason": ""
        }}
    ],

    "learning_roadmap": [
        {{
            "step": 1,
            "skill": "",
            "goal": "",
            "estimated_time": ""
        }}
    ],

    "career_recommendation": ""
}}
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are a technical career advisor. "
            "Create realistic and actionable skill gap analysis "
            "without exaggerating readiness. Return JSON only."
        ),
        temperature=0.35,
        max_tokens=2500,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid skill gap format."
        )

    result[
        "role_readiness_score"
    ] = _clamp_score(
        result.get(
            "role_readiness_score",
            0,
        )
    )

    for key in [
        "strong_skills",
        "relevant_skills",
        "missing_critical_skills",
        "missing_optional_skills",
        "skill_priorities",
        "learning_roadmap",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "career_recommendation",
        "",
    )

    return result


# ============================================================
# RESUME SUMMARY
# ============================================================

def generate_resume_summary(
    resume_text: str,
    target_role: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate a concise candidate profile from resume text.
    """

    clean_resume = _clean_text(
        resume_text
    )

    if not clean_resume:
        raise ValueError(
            "Resume text is required."
        )

    prompt = f"""
Create a concise professional candidate summary.

Target role:
{target_role or "Not specified"}

Resume:

{clean_resume}

Return JSON:

{{
    "summary": "",
    "experience_level": "",
    "years_of_experience": "",
    "primary_skills": [],
    "secondary_skills": [],
    "key_strengths": [],
    "recommended_roles": []
}}

Do not invent facts.
"""

    result = ask_groq_json(
        prompt=prompt,
        system_prompt=(
            "You are a recruiter summarizing candidate profiles "
            "from actual resume content. Return JSON only."
        ),
        temperature=0.25,
        max_tokens=1600,
    )

    if not isinstance(
        result,
        dict,
    ):
        raise ValueError(
            "AI returned an invalid resume summary format."
        )

    for key in [
        "primary_skills",
        "secondary_skills",
        "key_strengths",
        "recommended_roles",
    ]:
        result[key] = _safe_list(
            result.get(
                key,
                [],
            )
        )

    result.setdefault(
        "summary",
        "",
    )

    result.setdefault(
        "experience_level",
        "",
    )

    result.setdefault(
        "years_of_experience",
        "",
    )

    return result


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

def analyze_resume_with_ai(
    resume_text: str,
    job_description: Optional[str] = None,
    target_role: Optional[str] = None,
) -> Dict[str, Any]:
    return analyze_resume(
        resume_text=resume_text,
        target_role=target_role,
        job_description=job_description,
    )


def match_resume(
    resume_text: str,
    job_description: str,
    target_role: Optional[str] = None,
) -> Dict[str, Any]:
    return match_resume_to_job(
        resume_text=resume_text,
        job_description=job_description,
        target_role=target_role,
    )


def calculate_match_score(
    resume_text: str,
    job_description: str,
) -> Dict[str, Any]:
    return match_resume_to_job(
        resume_text=resume_text,
        job_description=job_description,
    )