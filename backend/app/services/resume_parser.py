import re
from typing import Dict, List


EMAIL_REGEX = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

PHONE_REGEX = (
    r"(?:\+91[\-\s]?)?"
    r"(?:\d[\s\-]?){10}"
)

LINKEDIN_REGEX = r"https?://(?:www\.)?linkedin\.com/in/[^\s]+"

GITHUB_REGEX = r"https?://(?:www\.)?github\.com/[^\s]+"


def extract_email(text: str) -> str:

    match = re.search(
        EMAIL_REGEX,
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else ""


def extract_phone(text: str) -> str:

    match = re.search(
        PHONE_REGEX,
        text,
    )

    if not match:
        return ""

    return match.group().strip()


def extract_linkedin(text: str) -> str:

    match = re.search(
        LINKEDIN_REGEX,
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else ""


def extract_github(text: str) -> str:

    match = re.search(
        GITHUB_REGEX,
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else ""


def extract_name(text: str) -> str:

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return ""

    return lines[0]


def extract_sections(text: str) -> Dict:

    lower = text.lower()

    sections = {

        "education": "education" in lower,

        "experience": (
            "experience" in lower
            or "internship" in lower
        ),

        "projects": "project" in lower,

        "skills": "skills" in lower,

        "certifications": (
            "certification" in lower
            or "certificate" in lower
        ),

    }

    return sections


def parse_resume(text: str) -> Dict:

    return {

        "name": extract_name(text),

        "email": extract_email(text),

        "phone": extract_phone(text),

        "linkedin": extract_linkedin(text),

        "github": extract_github(text),

        "sections": extract_sections(text),

    }