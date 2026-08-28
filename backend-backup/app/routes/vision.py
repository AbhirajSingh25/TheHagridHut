from __future__ import annotations

import base64
import json
import os
import re
from io import BytesIO
from typing import Any

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)
from groq import Groq
from PIL import Image, ImageOps


router = APIRouter(
    prefix="/vision",
    tags=["Vision Analysis"],
)


# ============================================================
# CONFIGURATION
# ============================================================


GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY",
    "",
).strip()


MAX_FILE_SIZE = 10 * 1024 * 1024


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


client: Groq | None = None


if GROQ_API_KEY:

    try:

        client = Groq(
            api_key=GROQ_API_KEY
        )

    except Exception:

        client = None


# ============================================================
# HELPERS
# ============================================================


def clamp_score(
    value: Any,
    default: int = 0,
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

        score = default


    return max(
        0,
        min(
            100,
            score,
        ),
    )


def parse_ai_json(
    raw_response: str,
) -> dict[str, Any]:

    if not raw_response:

        return {}


    cleaned = raw_response.strip()


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
    ).strip()


    try:

        result = json.loads(
            cleaned
        )


        if isinstance(
            result,
            dict,
        ):

            return result

    except Exception:

        pass


    match = re.search(
        r"\{.*\}",
        cleaned,
        flags=re.DOTALL,
    )


    if match:

        try:

            result = json.loads(
                match.group(0)
            )


            if isinstance(
                result,
                dict,
            ):

                return result

        except Exception:

            pass


    return {}


def normalize_string_list(
    value: Any,
) -> list[str]:

    if not isinstance(
        value,
        list,
    ):

        return []


    results: list[str] = []


    seen: set[str] = set()


    for item in value:

        text = str(
            item
        ).strip()


        if not text:

            continue


        key = text.lower()


        if key in seen:

            continue


        seen.add(
            key
        )


        results.append(
            text
        )


    return results


def get_image_quality_score(
    image: Image.Image,
) -> int:

    width, height = image.size


    pixel_count = width * height


    if pixel_count >= 1920 * 1080:

        return 100


    if pixel_count >= 1280 * 720:

        return 90


    if pixel_count >= 640 * 480:

        return 75


    if pixel_count >= 320 * 240:

        return 60


    return 45


def encode_image(
    image_bytes: bytes,
    content_type: str,
) -> str:

    encoded = base64.b64encode(
        image_bytes
    ).decode(
        "utf-8"
    )


    return (
        f"data:{content_type};base64,{encoded}"
    )


# ============================================================
# IMAGE VALIDATION
# ============================================================


def validate_and_prepare_image(
    image_bytes: bytes,
) -> tuple[Image.Image, bytes]:

    try:

        image = Image.open(
            BytesIO(
                image_bytes
            )
        )


        image.verify()

    except Exception as error:

        raise HTTPException(

            status_code=400,

            detail=(
                "The uploaded file is not a valid image."
            ),

        ) from error


    try:

        image = Image.open(
            BytesIO(
                image_bytes
            )
        )


        image = ImageOps.exif_transpose(
            image
        )


        if image.mode not in (
            "RGB",
            "RGBA",
        ):

            image = image.convert(
                "RGB"
            )


        output = BytesIO()


        if image.mode == "RGBA":

            background = Image.new(

                "RGB",

                image.size,

                (
                    15,
                    15,
                    20,
                ),

            )


            background.paste(

                image,

                mask=image.getchannel(
                    "A"
                ),

            )


            image = background


        image.save(
            output,
            format="JPEG",
            quality=92,
        )


        prepared_bytes = output.getvalue()


        return (
            image,
            prepared_bytes,
        )

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(

            status_code=400,

            detail=(
                "Unable to process the uploaded image."
            ),

        ) from error


# ============================================================
# LOCAL IMAGE BASELINE
# ============================================================


def build_local_baseline(
    image: Image.Image,
) -> dict[str, Any]:

    width, height = image.size


    quality_score = get_image_quality_score(
        image
    )


    aspect_ratio = round(
        width / height,
        3,
    ) if height else 0


    image_size_score = clamp_score(

        quality_score,

        default=65,

    )


    return {

        "eye_contact":

            clamp_score(

                55
                +
                (
                    image_size_score
                    *
                    0.20
                ),

                default=65,

            ),

        "attention":

            clamp_score(

                60
                +
                (
                    image_size_score
                    *
                    0.18
                ),

                default=68,

            ),

        "face_visibility":

            clamp_score(

                58
                +
                (
                    image_size_score
                    *
                    0.20
                ),

                default=70,

            ),

        "posture":

            clamp_score(

                60
                +
                (
                    image_size_score
                    *
                    0.15
                ),

                default=68,

            ),

        "confidence":

            clamp_score(

                60
                +
                (
                    image_size_score
                    *
                    0.15
                ),

                default=68,

            ),

        "expression":
            "Neutral",

        "image_quality":
            quality_score,

        "image_width":
            width,

        "image_height":
            height,

        "aspect_ratio":
            aspect_ratio,

    }


# ============================================================
# AI VISION ANALYSIS
# ============================================================


def analyze_with_groq_vision(
    image_bytes: bytes,
    baseline: dict[str, Any],
) -> dict[str, Any]:

    if not client:

        return {}


    image_url = encode_image(
        image_bytes,
        "image/jpeg",
    )


    system_prompt = """
You are HireSense AI Vision Intelligence.

You analyze a candidate's interview camera frame for professional interview presentation.

Evaluate only what is visually observable.

You must estimate:

1. Eye contact and camera engagement
2. Attention and presence
3. Face visibility and framing
4. Posture and professional body language
5. Facial expression
6. Visual confidence
7. Professional presentation
8. Lighting and image quality
9. Distractions

Do not identify the person.
Do not infer age, race, ethnicity, religion, health, disability, sexuality, identity, or personality traits.
Do not claim certainty where the image is ambiguous.
Do not diagnose emotions beyond visible facial expression.

Return ONLY valid JSON.

Use exactly this structure:

{
  "eye_contact": 0,
  "attention": 0,
  "face_visibility": 0,
  "posture": 0,
  "confidence": 0,
  "professionalism_score": 0,
  "presentation_score": 0,
  "lighting_score": 0,
  "image_quality": 0,
  "expression": "Neutral",
  "face_direction": "Centered",
  "camera_framing": "Good",
  "strengths": ["string"],
  "improvements": ["string"],
  "recruiter_feedback": "string",
  "recommendation": "Good"
}

Rules:

- Every score must be between 0 and 100.
- strengths must contain 2 to 4 concise observations.
- improvements must contain 2 to 4 actionable suggestions.
- expression must describe visible presentation only.
- recommendation must be one of:
  "Excellent"
  "Good"
  "Fair"
  "Needs Improvement"
- Return JSON only.
"""


    user_prompt = f"""
Analyze this interview camera image.

Local image baseline:

Image quality: {baseline["image_quality"]}
Width: {baseline["image_width"]}
Height: {baseline["image_height"]}
Aspect ratio: {baseline["aspect_ratio"]}

Give a balanced visual interview analysis.
"""


    try:

        completion = (

            client
            .chat
            .completions
            .create(

                model=(
                    "meta-llama/llama-4-scout-17b-16e-instruct"
                ),

                temperature=0.2,

                messages=[

                    {

                        "role":
                            "system",

                        "content":
                            system_prompt,

                    },

                    {

                        "role":
                            "user",

                        "content":

                            [

                                {

                                    "type":
                                        "text",

                                    "text":
                                        user_prompt,

                                },

                                {

                                    "type":
                                        "image_url",

                                    "image_url":

                                        {

                                            "url":
                                                image_url,

                                        },

                                },

                            ],

                    },

                ],

            )

        )


        raw_response = (

            completion
            .choices[0]
            .message
            .content

            or ""

        )


        return parse_ai_json(
            raw_response
        )

    except Exception:

        return {}


# ============================================================
# FALLBACK ANALYSIS
# ============================================================


def build_fallback_analysis(
    baseline: dict[str, Any],
) -> dict[str, Any]:

    return {

        "eye_contact":
            baseline[
                "eye_contact"
            ],

        "attention":
            baseline[
                "attention"
            ],

        "face_visibility":
            baseline[
                "face_visibility"
            ],

        "posture":
            baseline[
                "posture"
            ],

        "confidence":
            baseline[
                "confidence"
            ],

        "professionalism_score":

            clamp_score(

                (
                    baseline[
                        "posture"
                    ]

                    +

                    baseline[
                        "confidence"
                    ]

                    +

                    baseline[
                        "face_visibility"
                    ]

                )

                / 3,

                default=68,

            ),

        "presentation_score":

            clamp_score(

                (
                    baseline[
                        "attention"
                    ]

                    +

                    baseline[
                        "face_visibility"
                    ]

                    +

                    baseline[
                        "posture"
                    ]

                )

                / 3,

                default=68,

            ),

        "lighting_score":
            baseline[
                "image_quality"
            ],

        "image_quality":
            baseline[
                "image_quality"
            ],

        "expression":
            baseline[
                "expression"
            ],

        "face_direction":
            "Analysis Unavailable",

        "camera_framing":
            "Detected",

        "strengths": [

            "Image was successfully captured and processed.",

            "The visual frame is available for interview analysis.",

        ],

        "improvements": [

            "Use balanced front lighting for a clearer interview image.",

            "Keep your face centered and clearly visible to the camera.",

        ],

        "recruiter_feedback":

            "The visual interview frame was processed successfully. More detailed behavioral evaluation becomes available when AI vision analysis is configured.",

        "recommendation":
            "Fair",

    }


# ============================================================
# CORE ANALYSIS
# ============================================================


def analyze_image(
    image: Image.Image,
    image_bytes: bytes,
) -> dict[str, Any]:

    baseline = build_local_baseline(
        image
    )


    fallback = build_fallback_analysis(
        baseline
    )


    ai_analysis = analyze_with_groq_vision(
        image_bytes,
        baseline,
    )


    merged = {

        **fallback,

        **ai_analysis,

    }


    eye_contact = clamp_score(

        merged.get(
            "eye_contact"
        ),

        default=fallback[
            "eye_contact"
        ],

    )


    attention = clamp_score(

        merged.get(
            "attention"
        ),

        default=fallback[
            "attention"
        ],

    )


    face_visibility = clamp_score(

        merged.get(
            "face_visibility"
        ),

        default=fallback[
            "face_visibility"
        ],

    )


    posture = clamp_score(

        merged.get(
            "posture"
        ),

        default=fallback[
            "posture"
        ],

    )


    confidence = clamp_score(

        merged.get(
            "confidence"
        ),

        default=fallback[
            "confidence"
        ],

    )


    professionalism_score = clamp_score(

        merged.get(
            "professionalism_score"
        ),

        default=fallback[
            "professionalism_score"
        ],

    )


    presentation_score = clamp_score(

        merged.get(
            "presentation_score"
        ),

        default=fallback[
            "presentation_score"
        ],

    )


    lighting_score = clamp_score(

        merged.get(
            "lighting_score"
        ),

        default=fallback[
            "lighting_score"
        ],

    )


    image_quality = clamp_score(

        merged.get(
            "image_quality"
        ),

        default=baseline[
            "image_quality"
        ],

    )


    overall_score = clamp_score(

        (
            eye_contact
            * 0.22
        )

        +

        (
            attention
            * 0.18
        )

        +

        (
            face_visibility
            * 0.15
        )

        +

        (
            posture
            * 0.20
        )

        +

        (
            confidence
            * 0.15
        )

        +

        (
            professionalism_score
            * 0.10
        ),

        default=70,

    )


    strengths = normalize_string_list(

        merged.get(
            "strengths"
        )

    )


    improvements = normalize_string_list(

        merged.get(
            "improvements"
        )

    )


    if not strengths:

        strengths = fallback[
            "strengths"
        ]


    if not improvements:

        improvements = fallback[
            "improvements"
        ]


    return {

        "success":
            True,

        "overall_score":
            overall_score,

        "eye_contact":
            eye_contact,

        "eyeContact":
            eye_contact,

        "attention":
            attention,

        "attention_score":
            attention,

        "face_visibility":
            face_visibility,

        "faceVisibility":
            face_visibility,

        "posture":
            posture,

        "posture_score":
            posture,

        "confidence":
            confidence,

        "confidence_score":
            confidence,

        "professionalism_score":
            professionalism_score,

        "presentation_score":
            presentation_score,

        "lighting_score":
            lighting_score,

        "image_quality":
            image_quality,

        "expression":

            str(

                merged.get(
                    "expression"
                )

                or fallback[
                    "expression"
                ]

            ),

        "facial_expression":

            str(

                merged.get(
                    "expression"
                )

                or fallback[
                    "expression"
                ]

            ),

        "face_direction":

            str(

                merged.get(
                    "face_direction"
                )

                or fallback[
                    "face_direction"
                ]

            ),

        "camera_framing":

            str(

                merged.get(
                    "camera_framing"
                )

                or fallback[
                    "camera_framing"
                ]

            ),

        "strengths":
            strengths[:4],

        "improvements":
            improvements[:4],

        "recruiter_feedback":

            str(

                merged.get(
                    "recruiter_feedback"
                )

                or fallback[
                    "recruiter_feedback"
                ]

            ),

        "recommendation":

            str(

                merged.get(
                    "recommendation"
                )

                or fallback[
                    "recommendation"
                ]

            ),

        "metrics": {

            "eye_contact":
                eye_contact,

            "attention":
                attention,

            "face_visibility":
                face_visibility,

            "posture":
                posture,

            "confidence":
                confidence,

            "expression":

                str(

                    merged.get(
                        "expression"
                    )

                    or fallback[
                        "expression"
                    ]

                ),

            "professionalism_score":
                professionalism_score,

            "presentation_score":
                presentation_score,

            "lighting_score":
                lighting_score,

            "image_quality":
                image_quality,

            "image_width":

                baseline[
                    "image_width"
                ],

            "image_height":

                baseline[
                    "image_height"
                ],

            "aspect_ratio":

                baseline[
                    "aspect_ratio"
                ],

        },

        "analysis_source":

            "groq_vision"

            if ai_analysis

            else "local_fallback",

    }


# ============================================================
# POST /vision/analyze
# ============================================================


@router.post(
    "/analyze"
)
async def analyze_vision(
    file: UploadFile = File(
        ...
    ),
):

    if not file:

        raise HTTPException(

            status_code=400,

            detail=(
                "An image file is required."
            ),

        )


    content_type = (
        file.content_type
        or ""
    ).lower()


    if (
        content_type
        not in
        ALLOWED_CONTENT_TYPES
    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "Unsupported image format. Use JPG, JPEG, PNG, or WEBP."
            ),

        )


    image_bytes = await file.read()


    if not image_bytes:

        raise HTTPException(

            status_code=400,

            detail=(
                "The uploaded image is empty."
            ),

        )


    if len(
        image_bytes
    ) > MAX_FILE_SIZE:

        raise HTTPException(

            status_code=413,

            detail=(
                "Image size exceeds the 10 MB limit."
            ),

        )


    (
        image,
        prepared_image_bytes,
    ) = validate_and_prepare_image(

        image_bytes

    )


    result = analyze_image(

        image,

        prepared_image_bytes,

    )


    result[
        "filename"
    ] = (

        file.filename
        or "vision-image"

    )


    return result


# ============================================================
# GET /vision/health
# ============================================================


@router.get(
    "/health"
)
async def vision_health():

    return {

        "success":
            True,

        "service":
            "Vision Analysis",

        "groq_configured":
            client is not None,

        "mediapipe_required":
            False,

        "supported_inputs": [

            "image/jpeg",

            "image/png",

            "image/webp",

        ],

    }
