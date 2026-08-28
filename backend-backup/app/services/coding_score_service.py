from sqlalchemy.orm import Session

from app.models import (
    CodingSession,
    InterviewSession,
)


def get_coding_average(
    db: Session,
    interview_id: int,
) -> int:

    sessions = (
        db.query(CodingSession)
        .filter(
            CodingSession.interview_id
            == interview_id
        )
        .all()
    )

    if not sessions:
        return 0

    scores = []

    for session in sessions:

        score = session.score or 0

        score = max(
            0,
            min(score, 100),
        )

        scores.append(score)

    if not scores:
        return 0

    return round(
        sum(scores) / len(scores)
    )


def update_candidate_score(
    db: Session,
    interview_id: int,
):

    interview = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id
            == interview_id
        )
        .first()
    )

    if not interview:
        return None

    coding_score = get_coding_average(
        db,
        interview_id,
    )

    technical = (
        interview.technical_score or 0
    )

    communication = (
        interview.communication_score or 0
    )

    confidence = (
        interview.confidence_score or 0
    )

    resume = (
        interview.resume_score or 0
    )

    jd_match = (
        interview.jd_match_score or 0
    )

    eye_contact = (
        interview.eye_contact_score or 0
    )

    posture = (
        interview.posture_score or 0
    )

    emotion = (
        interview.emotion_score or 0
    )

    # Keep every score between 0 and 100.

    technical = max(
        0,
        min(technical, 100),
    )

    communication = max(
        0,
        min(communication, 100),
    )

    confidence = max(
        0,
        min(confidence, 100),
    )

    resume = max(
        0,
        min(resume, 100),
    )

    jd_match = max(
        0,
        min(jd_match, 100),
    )

    eye_contact = max(
        0,
        min(eye_contact, 100),
    )

    posture = max(
        0,
        min(posture, 100),
    )

    emotion = max(
        0,
        min(emotion, 100),
    )

    # ========================================================
    # FINAL SCORE
    # ========================================================

    final_score = round(

        technical * 0.20

        + coding_score * 0.20

        + communication * 0.15

        + confidence * 0.10

        + resume * 0.10

        + jd_match * 0.15

        + eye_contact * 0.05

        + posture * 0.025

        + emotion * 0.025
    )

    final_score = max(
        0,
        min(final_score, 100),
    )

    interview.candidate_score = (
        final_score
    )

    interview.overall_score = (
        final_score
    )

    db.commit()

    db.refresh(interview)

    return {

        "candidate_score":
            final_score,

        "overall_score":
            final_score,

        "coding_score":
            coding_score,

        "technical_score":
            technical,

        "communication_score":
            communication,

        "confidence_score":
            confidence,

        "resume_score":
            resume,

        "jd_match_score":
            jd_match,

        "eye_contact_score":
            eye_contact,

        "posture_score":
            posture,

        "emotion_score":
            emotion,
    }