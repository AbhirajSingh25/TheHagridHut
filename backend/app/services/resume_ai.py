import json
import os

from groq import Groq


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


SYSTEM_PROMPT = """
You are a Senior Technical Recruiter with 15+ years of experience.

Analyze the resume professionally.

Evaluate:

- ATS Compatibility
- Grammar
- Resume Structure
- Skills
- Experience
- Projects
- Education
- Certifications
- Career Growth
- Overall Professionalism

Return ONLY valid JSON.

Schema:

{

    "overall_rating": 0,

    "ats_rating": 0,

    "grammar_rating": 0,

    "structure_rating": 0,

    "skills_rating": 0,

    "experience_rating": 0,

    "projects_rating": 0,

    "strengths": [],

    "weaknesses": [],

    "missing_sections": [],

    "improvement_suggestions": [],

    "professional_summary": "",

    "recommended_roles": [],

    "experience_level": "",

    "salary_estimate": "",

    "hire_recommendation": ""

}
"""
def build_prompt(
    resume_text: str,
):

    return f"""
Resume

--------------------

{resume_text}

--------------------

Analyze the resume.

Respond ONLY with JSON.

Do not include markdown.

Do not explain.

Only return valid JSON.
"""
def review_resume(
    resume_text: str,
):

    try:

        response = client.chat.completions.create(

            model=os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
),

            temperature=0.2,

            response_format={
                "type": "json_object"
            },

            messages=[

                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },

                {
                    "role": "user",
                    "content": build_prompt(
                        resume_text
                    ),
                },

            ],

        )

        content = response.choices[0].message.content

        return json.loads(content)

    except Exception as e:

        return {

            "overall_rating": 0,

            "ats_rating": 0,

            "grammar_rating": 0,

            "structure_rating": 0,

            "skills_rating": 0,

            "experience_rating": 0,

            "projects_rating": 0,

            "strengths": [],

            "weaknesses": [],

            "missing_sections": [],

            "improvement_suggestions": [

                str(e)
            ],

            "professional_summary": "",

            "recommended_roles": [],

            "experience_level": "",

            "salary_estimate": "",

            "hire_recommendation": "Unable to Analyze"

        }