import re
from collections import Counter


ACTION_VERBS = {

    "developed",
    "built",
    "created",
    "designed",
    "implemented",
    "optimized",
    "improved",
    "led",
    "managed",
    "achieved",
    "delivered",
    "reduced",
    "increased",
    "deployed",
    "engineered",

}


def get_word_count(text: str):

    return len(text.split())


def get_sentence_count(text: str):

    sentences = re.split(

        r"[.!?]",

        text,

    )

    return len(

        [s for s in sentences if s.strip()]

    )


def get_reading_time(text: str):

    words = get_word_count(text)

    return max(

        1,

        round(words / 200),

    )


def count_action_verbs(text: str):

    words = re.findall(

        r"\b[a-z]+\b",

        text.lower(),

    )

    return sum(

        word in ACTION_VERBS

        for word in words

    )


def keyword_frequency(text: str):

    words = re.findall(

        r"\b[a-zA-Z]{3,}\b",

        text.lower(),

    )

    return Counter(words).most_common(20)


def analyze_metrics(text: str):

    return {

        "word_count": get_word_count(text),

        "sentence_count": get_sentence_count(text),

        "reading_time": get_reading_time(text),

        "action_verbs": count_action_verbs(text),

        "top_keywords": keyword_frequency(text),

    }