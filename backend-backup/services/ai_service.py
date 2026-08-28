import json

from services.groq_service import (
    ask_groq
)


def generate_interview_questions(

    role,

    level,

    resume_analysis=None
):

    prompt = f"""

    You are an expert technical interviewer.

    Generate 5 professional interview questions.

    Candidate Role:
    {role}

    Candidate Experience Level:
    {level}

    Resume Analysis:
    {resume_analysis}

    IMPORTANT RULES:

    - Questions must feel realistic
    - Questions should reference resume projects/skills if available
    - Include technical + behavioral questions
    - Make questions recruiter-quality
    - Return ONLY valid JSON array
    - No markdown
    - No explanation

    Example:

    [
      "Question 1",
      "Question 2"
    ]
    """


    response = ask_groq(
        prompt
    )


    cleaned = (

        response
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )


    try:

        return json.loads(
            cleaned
        )

    except:

        return [

            "Tell me about yourself",

            "Explain your most challenging project",

            "How do you solve technical problems?",

            "Describe a team conflict you handled",

            "Why should we hire you?"
        ]


def evaluate_answer(
    answer
):

    prompt = f"""

    Evaluate this interview answer professionally.

    Candidate Answer:
    {answer}

    Return ONLY valid JSON.

    Format:

    {{
      "confidence": number,
      "communication": number,
      "technical": number,
      "feedback": "detailed recruiter feedback"
    }}

    Rules:
    - Scores out of 100
    - Feedback should be realistic
    - Evaluate clarity and technical depth
    """


    response = ask_groq(
        prompt
    )


    cleaned = (

        response
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )


    try:

        return json.loads(
            cleaned
        )

    except:

        return {

            "confidence": 80,

            "communication": 82,

            "technical": 78,

            "feedback":
                "Good answer structure with decent technical understanding."
        }


def generate_final_report():

    prompt = """

    Generate a professional final interview report.

    Return ONLY valid JSON.

    Format:

    {
      "confidence": number,
      "communication": number,
      "technical": number,
      "recommendation": "detailed recruiter recommendation"
    }

    Make the feedback realistic and recruiter quality.
    """


    response = ask_groq(
        prompt
    )


    cleaned = (

        response
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )


    try:

        return json.loads(
            cleaned
        )

    except:

        return {

            "confidence": 85,

            "communication": 84,

            "technical": 83,

            "recommendation":
                "Strong candidate with solid communication and technical skills."
        }


def generate_followup_question(

    previous_question,

    answer,

    role,

    level
):

    prompt = f"""

    You are an expert interviewer.

    Generate ONE intelligent follow-up question.

    Previous Question:
    {previous_question}

    Candidate Answer:
    {answer}

    Role:
    {role}

    Level:
    {level}

    Rules:
    - Be contextual
    - Dig deeper technically
    - Sound realistic
    - Return ONLY the question
    """


    response = ask_groq(
        prompt
    )

    return response.strip()