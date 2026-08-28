import re
from collections import Counter
from typing import Dict, List


SKILL_CATEGORIES = {

    "Programming": {

        "python",
        "java",
        "javascript",
        "typescript",
        "c",
        "c++",
        "c#",
        "go",
        "rust",
        "php",
        "kotlin",
        "swift",

    },

    "Frontend": {

        "react",
        "nextjs",
        "next",
        "angular",
        "vue",
        "html",
        "css",
        "tailwind",
        "bootstrap",

    },

    "Backend": {

        "node",
        "nodejs",
        "express",
        "nestjs",
        "spring",
        "springboot",
        "django",
        "flask",
        "fastapi",

    },

    "Database": {

        "mysql",
        "postgresql",
        "postgres",
        "mongodb",
        "redis",
        "sqlite",
        "oracle",
        "firebase",

    },

    "Cloud": {

        "aws",
        "azure",
        "gcp",
        "cloudflare",
        "vercel",
        "netlify",

    },

    "DevOps": {

        "docker",
        "kubernetes",
        "jenkins",
        "github actions",
        "terraform",
        "ansible",

    },

    "AI/ML": {

        "tensorflow",
        "keras",
        "pytorch",
        "opencv",
        "pandas",
        "numpy",
        "scikit",
        "langchain",
        "llamaindex",
        "groq",
        "openai",
        "huggingface",
        "ollama",

    },

}
def tokenize(text: str) -> List[str]:

    return re.findall(

        r"[a-zA-Z0-9+#.]+",

        text.lower(),

    )


def extract_skills(text: str) -> List[str]:

    words = tokenize(text)

    found = set()

    joined = " ".join(words)

    for category in SKILL_CATEGORIES.values():

        for skill in category:

            if " " in skill:

                if skill in joined:
                    found.add(skill)

            elif skill in words:

                found.add(skill)

    return sorted(found)
def categorize_skills(skills: List[str]) -> Dict:

    result = {}

    for category, values in SKILL_CATEGORIES.items():

        result[category] = []

        for skill in skills:

            if skill in values:

                result[category].append(skill)

    return result
def keyword_density(
    text: str,
    skills: List[str],
) -> Dict:

    words = tokenize(text)

    total = max(

        len(words),

        1,

    )

    density = {}

    counter = Counter(words)

    for skill in skills:

        count = counter[skill]

        density[skill] = round(

            count / total * 100,

            2,

        )

    return density
def duplicate_skills(
    text: str,
    skills: List[str],
) -> Dict:

    words = tokenize(text)

    counter = Counter(words)

    duplicates = {}

    for skill in skills:

        if counter[skill] > 1:

            duplicates[skill] = counter[skill]

    return duplicates
def keyword_score(skills: List[str]) -> int:

    score = len(skills) * 4

    return min(

        score,

        100,

    )
def analyze_keywords(text: str) -> Dict:

    skills = extract_skills(text)

    return {

        "skills": skills,

        "categories": categorize_skills(skills),

        "density": keyword_density(

            text,

            skills,

        ),

        "duplicates": duplicate_skills(

            text,

            skills,

        ),

        "keyword_score": keyword_score(skills),

    }
