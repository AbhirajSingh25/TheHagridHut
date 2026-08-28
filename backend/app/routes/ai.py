from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()


class EvaluateRequest(BaseModel):

    question: str

    answer: str


class NextQuestionRequest(BaseModel):

    role: str

    level: str

    previous_question: str

    previous_answer: str


@router.post("/ai/evaluate")
async def evaluate_answer(
    data: EvaluateRequest
):

    feedback_options = [

        "Strong communication and confident delivery.",

        "Good technical explanation but improve clarity.",

        "Excellent structure and articulation.",

        "Try adding more real-world examples.",

        "Confidence improved significantly.",
    ]

    return {

        "feedback":
            random.choice(
                feedback_options
            ),

        "confidence":
            random.randint(70, 95),

        "communication":
            random.randint(72, 96),

        "technical":
            random.randint(68, 94),
    }


@router.post("/ai/next-question")
async def next_question(
    data: NextQuestionRequest
):

    questions = [

        "Explain React hooks.",

        "How does virtual DOM work?",

        "Difference between SQL and NoSQL?",

        "Explain authentication in web apps.",

        "What are REST APIs?",

        "Tell me about a challenging project.",

        "How would you optimize React performance?",
    ]

    return {

        "question":
            random.choice(
                questions
            )
    }