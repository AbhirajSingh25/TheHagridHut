from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from fastapi.responses import FileResponse

from reportlab.lib import colors

from reportlab.lib.pagesizes import A4

from reportlab.lib.styles import (
    getSampleStyleSheet,
)

from reportlab.lib.units import mm

from reportlab.pdfbase.pdfmetrics import (
    stringWidth,
)

from reportlab.pdfgen import canvas


router = APIRouter()


# ============================================================
# STORAGE
# ============================================================


CERTIFICATE_DIRECTORY = (

    Path(__file__)
    .resolve()
    .parent
    .parent
    / "generated_certificates"

)


CERTIFICATE_DIRECTORY.mkdir(

    parents=True,

    exist_ok=True,

)


# ============================================================
# HELPERS
# ============================================================


def clamp_score(
    value: int,
) -> int:

    return max(
        0,
        min(
            100,
            int(value),
        ),
    )


def sanitize_filename(
    value: str,
) -> str:

    cleaned = re.sub(

        r"[^A-Za-z0-9_-]+",

        "_",

        value,

    )


    cleaned = cleaned.strip(
        "_"
    )


    return (

        cleaned

        or "candidate"

    )


def sanitize_text(
    value: str,
    fallback: str,
) -> str:

    cleaned = (

        value
        .replace(
            "\n",
            " "
        )
        .replace(
            "\r",
            " "
        )
        .strip()

    )


    return (

        cleaned

        if cleaned

        else fallback

    )


def get_performance_label(
    score: int,
) -> str:

    if score >= 90:

        return "Outstanding Performance"


    if score >= 80:

        return "Excellent Performance"


    if score >= 70:

        return "Strong Performance"


    if score >= 60:

        return "Developing Performance"


    return "Verified Participation"


def get_certificate_id(
    candidate_name: str,
    score: int,
    provided_id: str | None,
) -> str:

    if provided_id:

        return sanitize_text(

            provided_id,

            "HSAI-VERIFIED",

        )


    timestamp = datetime.utcnow().strftime(
        "%Y%m%d"
    )


    name_code = (

        re.sub(

            r"[^A-Za-z0-9]",

            "",

            candidate_name,

        )

        .upper()

        [:6]

        or "CAND"

    )


    return (

        f"HSAI-{timestamp}-"
        f"{name_code}-{score}"

    )


# ============================================================
# CERTIFICATE GENERATION
# ============================================================


@router.get(
    "/certificate/{candidate_name}/{score}"
)
def generate_certificate(
    candidate_name: str,
    score: int,

    role: str = Query(
        default="AI Interview"
    ),

    level: str = Query(
        default="Professional"
    ),

    certificate_id: str | None = Query(
        default=None
    ),

):

    candidate_name = sanitize_text(

        unquote(
            candidate_name
        ),

        "Candidate",

    )


    role = sanitize_text(

        role,

        "AI Interview",

    )


    level = sanitize_text(

        level,

        "Professional",

    )


    score = clamp_score(
        score
    )


    if not candidate_name:

        raise HTTPException(

            status_code=400,

            detail=(
                "Candidate name is required."
            ),

        )


    performance_label = (

        get_performance_label(
            score
        )

    )


    verification_id = (

        get_certificate_id(

            candidate_name,

            score,

            certificate_id,

        )

    )


    safe_name = sanitize_filename(
        candidate_name
    )


    filename = (

        f"hiresense_certificate_"
        f"{safe_name}_"
        f"{verification_id}.pdf"

    )


    file_path = (

        CERTIFICATE_DIRECTORY
        / filename

    )


    # ========================================================
    # PDF CANVAS
    # ========================================================

    page_width, page_height = A4


    pdf = canvas.Canvas(

        str(
            file_path
        ),

        pagesize=A4,

    )


    # ========================================================
    # BACKGROUND
    # ========================================================

    pdf.setFillColor(

        colors.HexColor(
            "#080b14"
        )

    )


    pdf.rect(

        0,
        0,
        page_width,
        page_height,

        fill=1,

        stroke=0,

    )


    # ========================================================
    # OUTER BORDER
    # ========================================================

    margin = 16 * mm


    pdf.setStrokeColor(

        colors.HexColor(
            "#6d5dfc"
        )

    )


    pdf.setLineWidth(
        1.4
    )


    pdf.roundRect(

        margin,
        margin,

        page_width
        - (
            margin * 2
        ),

        page_height
        - (
            margin * 2
        ),

        7 * mm,

        stroke=1,

        fill=0,

    )


    # ========================================================
    # INNER BORDER
    # ========================================================

    inner_margin = 22 * mm


    pdf.setStrokeColor(

        colors.HexColor(
            "#1f2937"
        )

    )


    pdf.setLineWidth(
        0.6
    )


    pdf.roundRect(

        inner_margin,
        inner_margin,

        page_width
        - (
            inner_margin * 2
        ),

        page_height
        - (
            inner_margin * 2
        ),

        5 * mm,

        stroke=1,

        fill=0,

    )


    # ========================================================
    # BRAND
    # ========================================================

    pdf.setFont(

        "Helvetica-Bold",

        15,

    )


    pdf.setFillColor(

        colors.HexColor(
            "#f8fafc"
        )

    )


    brand_text = "HireSense"


    pdf.drawCentredString(

        page_width / 2,

        page_height - (42 * mm),

        brand_text,

    )


    accent_width = stringWidth(

        "AI",

        "Helvetica-Bold",

        15,

    )


    base_width = stringWidth(

        brand_text,

        "Helvetica-Bold",

        15,

    )


    pdf.setFillColor(

        colors.HexColor(
            "#a78bfa"
        )

    )


    pdf.drawString(

        (
            page_width / 2
        )
        +
        (
            base_width / 2
        )
        +
        4,

        page_height - (42 * mm),

        "AI",

    )


    # ========================================================
    # HEADER
    # ========================================================

    pdf.setFillColor(

        colors.HexColor(
            "#67e8f9"
        )

    )


    pdf.setFont(

        "Helvetica-Bold",

        8,

    )


    pdf.drawCentredString(

        page_width / 2,

        page_height - (58 * mm),

        "CERTIFICATE OF INTERVIEW EXCELLENCE",

    )


    pdf.setFillColor(

        colors.HexColor(
            "#94a3b8"
        )

    )


    pdf.setFont(

        "Helvetica",

        9,

    )


    pdf.drawCentredString(

        page_width / 2,

        page_height - (70 * mm),

        "This is to certify that",

    )


    # ========================================================
    # CANDIDATE NAME
    # ========================================================

    pdf.setFillColor(

        colors.HexColor(
            "#f8fafc"
        )

    )


    pdf.setFont(

        "Helvetica-Bold",

        30,

    )


    pdf.drawCentredString(

        page_width / 2,

        page_height - (88 * mm),

        candidate_name,

    )


    # ========================================================
    # DESCRIPTION
    # ========================================================

    pdf.setFillColor(

        colors.HexColor(
            "#94a3b8"
        )

    )


    pdf.setFont(

        "Helvetica",

        10,

    )


    description_lines = [

        (
            "has successfully completed a verified "
            "AI-powered interview assessment"
        ),

        (
            f"for the role of {role} at "
            f"{level} level."
        ),

    ]


    description_y = (
        page_height - (108 * mm)
    )


    for line in description_lines:

        pdf.drawCentredString(

            page_width / 2,

            description_y,

            line,

        )


        description_y -= 6 * mm


    # ========================================================
    # SCORE BLOCK
    # ========================================================

    score_box_width = 72 * mm

    score_box_height = 32 * mm

    score_box_x = (

        (
            page_width
            - score_box_width
        )
        / 2

    )

    score_box_y = (

        page_height
        - (158 * mm)

    )


    pdf.setFillColor(

        colors.HexColor(
            "#101827"
        )

    )


    pdf.setStrokeColor(

        colors.HexColor(
            "#334155"
        )

    )


    pdf.roundRect(

        score_box_x,
        score_box_y,

        score_box_width,
        score_box_height,

        6 * mm,

        fill=1,

        stroke=1,

    )


    pdf.setFillColor(

        colors.HexColor(
            "#94a3b8"
        )

    )


    pdf.setFont(

        "Helvetica-Bold",

        7,

    )


    pdf.drawCentredString(

        page_width / 2,

        score_box_y
        + (22 * mm),

        "VERIFIED PERFORMANCE SCORE",

    )


    pdf.setFillColor(

        colors.HexColor(
            "#a78bfa"
        )

    )


    pdf.setFont(

        "Helvetica-Bold",

        24,

    )


    pdf.drawCentredString(

        page_width / 2,

        score_box_y
        + (10 * mm),

        f"{score} / 100",

    )


    # ========================================================
    # PERFORMANCE LABEL
    # ========================================================

    pdf.setFillColor(

        colors.HexColor(
            "#67e8f9"
        )

    )


    pdf.setFont(

        "Helvetica-Bold",

        11,

    )


    pdf.drawCentredString(

        page_width / 2,

        page_height - (177 * mm),

        performance_label,

    )


    # ========================================================
    # FOOTER DETAILS
    # ========================================================

    issue_date = datetime.utcnow().strftime(
        "%d %B %Y"
    )


    footer_y = 52 * mm


    pdf.setFillColor(

        colors.HexColor(
            "#64748b"
        )

    )


    pdf.setFont(

        "Helvetica",

        8,

    )


    pdf.drawCentredString(

        page_width * 0.27,

        footer_y,

        f"Issued: {issue_date}",

    )


    pdf.drawCentredString(

        page_width * 0.73,

        footer_y,

        "HireSense AI Intelligence System",

    )


    pdf.setStrokeColor(

        colors.HexColor(
            "#334155"
        )

    )


    pdf.line(

        35 * mm,
        footer_y - (6 * mm),

        page_width - (35 * mm),
        footer_y - (6 * mm),

    )


    # ========================================================
    # VERIFICATION ID
    # ========================================================

    pdf.setFillColor(

        colors.HexColor(
            "#475569"
        )

    )


    pdf.setFont(

        "Helvetica",

        7,

    )


    pdf.drawCentredString(

        page_width / 2,

        31 * mm,

        (
            "Certificate ID: "
            f"{verification_id}"
        ),

    )


    pdf.drawCentredString(

        page_width / 2,

        24 * mm,

        (
            "Generated through the HireSense AI "
            "career intelligence platform"
        ),

    )


    # ========================================================
    # SAVE
    # ========================================================

    pdf.save()


    return FileResponse(

        path=str(
            file_path
        ),

        media_type=(
            "application/pdf"
        ),

        filename=filename,

    )
