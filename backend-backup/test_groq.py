import os

from dotenv import load_dotenv
from groq import Groq


# Load backend/.env

load_dotenv(
    override=True
)


# Read configuration

api_key = os.getenv(
    "GROQ_API_KEY"
)

model = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b"
)


print("=" * 60)

print(
    "GROQ API KEY:",
    "FOUND"
    if api_key
    else "MISSING"
)

print(
    "GROQ MODEL:",
    model
)

print("=" * 60)


if not api_key:

    raise RuntimeError(
        "GROQ_API_KEY is missing from .env"
    )


client = Groq(
    api_key=api_key
)


try:

    print(
        "Sending test request..."
    )


    response = client.chat.completions.create(

        model=model,

        messages=[

            {

                "role": "user",

                "content":
                    "Reply with exactly: Groq connection successful",

            }

        ],

        temperature=0,

        max_tokens=50,

    )


    print(
        "\nSUCCESS!"
    )

    print(
        response
        .choices[0]
        .message
        .content
    )


except Exception as error:

    print(
        "\nGROQ ERROR:"
    )

    print(
        type(error).__name__
    )

    print(
        str(error)
    )