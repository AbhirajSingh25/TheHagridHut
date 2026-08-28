def generate_feedback(
    filler_percentage: float,
    words_per_minute: float,
    confidence_score: float,
):

    feedback = []

    communication_score = confidence_score

    if filler_percentage > 10:

        feedback.append(
            "Try reducing filler words like 'um' and 'like'."
        )

        communication_score -= 10

    else:

        feedback.append(
            "Good control over filler words."
        )

    if words_per_minute < 90:

        feedback.append(
            "You are speaking too slowly."
        )

        communication_score -= 5

    elif words_per_minute > 150:

        feedback.append(
            "You are speaking too fast."
        )

        communication_score -= 5

    else:

        feedback.append(
            "Your speaking pace is well balanced."
        )

    if confidence_score > 80:

        confidence_level = "High"

        feedback.append(
            "You sound confident and clear."
        )

    elif confidence_score > 60:

        confidence_level = "Moderate"

        feedback.append(
            "Your confidence level is decent but can improve."
        )

    else:

        confidence_level = "Low"

        feedback.append(
            "You sound hesitant in parts of the response."
        )

    communication_score = max(
        0,
        min(100, round(communication_score))
    )

    return {
        "communication_score": communication_score,
        "confidence_level": confidence_level,
        "feedback": feedback,
    }