from typing import Dict


def calculate_contact_score(parsed: Dict) -> int:

    score = 0

    if parsed.get("email"):
        score += 25

    if parsed.get("phone"):
        score += 25

    if parsed.get("linkedin"):
        score += 25

    if parsed.get("github"):
        score += 25

    return score


def calculate_section_score(parsed: Dict) -> int:

    sections = parsed["sections"]

    score = 0

    if sections["education"]:
        score += 20

    if sections["experience"]:
        score += 25

    if sections["projects"]:
        score += 25

    if sections["skills"]:
        score += 20

    if sections["certifications"]:
        score += 10

    return score


def calculate_skill_score(skills: list) -> int:

    return min(
        len(skills) * 2,
        100,
    )


def calculate_word_score(word_count: int) -> int:

    if 350 <= word_count <= 700:
        return 100

    if 250 <= word_count < 350:
        return 80

    if 700 < word_count <= 900:
        return 80

    if 150 <= word_count < 250:
        return 60

    return 40


def calculate_ats(
    parsed: Dict,
    skills: list,
    word_count: int,
) -> Dict:

    contact = calculate_contact_score(parsed)

    sections = calculate_section_score(parsed)

    skill_score = calculate_skill_score(skills)

    length = calculate_word_score(word_count)

    overall = round(

        (
            contact * 0.20
            + sections * 0.35
            + skill_score * 0.30
            + length * 0.15
        ),

        2,

    )

    return {

        "overall": overall,

        "contact": contact,

        "sections": sections,

        "skills": skill_score,

        "length": length,

    }