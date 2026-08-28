import os

from groq import Groq

from dotenv import load_dotenv


load_dotenv()


client = Groq(

    api_key=os.getenv(
        "GROQ_API_KEY"
    )
)


def ask_groq(
    prompt
):

    completion = client.chat.completions.create(

        model=os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
),

        messages=[

            {
                "role": "user",

                "content": prompt
            }
        ],

        temperature=0.7,

        max_tokens=2048
    )

    return (

        completion
        .choices[0]
        .message
        .content
    )