import io
import re

import pdfplumber


# ============================================================
# RESUME TEXT EXTRACTION
# ============================================================

def extract_resume_text(
    file_content: bytes,
) -> str:

    text = ""


    try:

        with pdfplumber.open(

            io.BytesIO(
                file_content
            )

        ) as pdf:

            for page in pdf.pages:

                page_text = (
                    page.extract_text()
                )

                if page_text:

                    text += (

                        page_text
                        +
                        "\n"

                    )


    except Exception:

        return ""


    return text.strip()


# ============================================================
# CLEAN RESUME TEXT
# ============================================================

def clean_resume_text(
    text: str,
) -> str:

    if not text:

        return ""


    text = re.sub(

        r"\s+",

        " ",

        text,

    )


    return text.strip()


# ============================================================
# EXTRACT EMAIL
# ============================================================

def extract_email(
    text: str,
):

    pattern = (

        r"[A-Za-z0-9._%+-]+"
        r"@"
        r"[A-Za-z0-9.-]+"
        r"\."
        r"[A-Za-z]{2,}"

    )


    match = re.search(

        pattern,

        text,

    )


    if match:

        return match.group()


    return None


# ============================================================
# EXTRACT PHONE
# ============================================================

def extract_phone(
    text: str,
):

    pattern = (

        r"(\+?\d{1,3}"
        r"[-.\s]?)?"
        r"\(?\d{3}\)?"
        r"[-.\s]?"
        r"\d{3}"
        r"[-.\s]?"
        r"\d{4}"

    )


    match = re.search(

        pattern,

        text,

    )


    if match:

        return match.group()


    return None


# ============================================================
# EXTRACT SKILLS
# ============================================================

def extract_skills(
    text: str,
):

    skills = [

        "python",

        "java",

        "javascript",

        "typescript",

        "react",

        "node",

        "nodejs",

        "fastapi",

        "django",

        "flask",

        "sql",

        "mysql",

        "postgresql",

        "mongodb",

        "redis",

        "docker",

        "kubernetes",

        "aws",

        "azure",

        "gcp",

        "machine learning",

        "deep learning",

        "data analysis",

        "data science",

        "pandas",

        "numpy",

        "tensorflow",

        "pytorch",

        "langchain",

        "groq",

        "openai",

        "git",

        "github",

    ]


    found = []


    lower_text = (
        text.lower()
    )


    for skill in skills:

        if skill in lower_text:

            found.append(
                skill
            )


    return found