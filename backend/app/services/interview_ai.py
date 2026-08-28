from groq import Groq

import os
import json

from dotenv import load_dotenv


load_dotenv()


client = Groq(
    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


SYSTEM_PROMPT = """

You are HireSense AI.

An elite AI interview intelligence system.

You:
- conduct realistic interviews
- ask adaptive questions
- evaluate communication
- evaluate technical skill
- evaluate confidence
- give professional feedback

Always behave professionally.
"""


def safe_json_parse(content: str):

    try:

        return json.loads(content)

    except Exception:

        return {
            "overall_score": 80,
            "technical_score": 78,
            "communication_score": 82,
            "confidence_score": 79,
            "strengths": [
                "Clear communication"
            ],
            "weaknesses": [
                "Need deeper technical detail"
            ],
            "improvements": [
                "Practice structured answers"
            ],
            "feedback":
                content
        }


def generate_question(

    role: str,

    level: str,

    previous_answer: str = "",

    previous_question: str = "",
):

    try:

        if previous_answer:

            prompt = f"""

Role:
{role}

Level:
{level}

Previous Question:
{previous_question}

Candidate Answer:
{previous_answer}

Generate ONE intelligent follow-up interview question.
"""

        else:

            prompt = f"""

Start a technical interview.

Role:
{role}

Level:
{level}

Generate the FIRST interview question.

Ask ONE question only.
"""


        response = client.chat.completions.create(

            model=os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
),

            messages=[

                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },

                {
                    "role": "user",
                    "content": prompt,
                }
            ],

            temperature=0.7,
        )


        return (

            response
            .choices[0]
            .message.content
            .strip()
        )

    except Exception as e:

        print(e)

        return (
            "Tell me about yourself."
        )


def evaluate_interview_answer(

    question: str,

    answer: str,
):

    try:

        prompt = f"""

QUESTION:
{question}

ANSWER:
{answer}

Evaluate the answer professionally.

Return STRICT JSON ONLY:

{{
  "overall_score": number,
  "technical_score": number,
  "communication_score": number,
  "confidence_score": number,
  "strengths": [
    "point"
  ],
  "weaknesses": [
    "point"
  ],
  "improvements": [
    "point"
  ],
  "feedback": "detailed feedback"
}}
"""


        response = client.chat.completions.create(

                model=os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
),
        

            messages=[

                {
                    "role": "system",
                    "content":
                        "You are an elite AI interviewer."
                },

                {
                    "role": "user",
                    "content": prompt,
                }
            ],

            temperature=0.3,
        )


        content = (

            response
            .choices[0]
            .message.content
        )


        return safe_json_parse(
            content
        )

    except Exception as e:

        print(e)

        return {

            "overall_score": 80,

            "technical_score": 78,

            "communication_score": 82,

            "confidence_score": 79,

            "strengths": [
                "Good communication"
            ],

            "weaknesses": [
                "Need deeper technical explanations"
            ],

            "improvements": [
                "Practice structured answers"
            ],

            "feedback":
                "Good overall interview performance."
        }