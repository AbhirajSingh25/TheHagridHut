export function analyzeLiveAnswer(
  answer: string
) {

  const fillerWords = [

    "um",

    "uh",

    "like",

    "basically",

    "actually",

    "you know",

    "sort of",
  ];


  const lower =
    answer.toLowerCase();

  let fillerCount = 0;

  fillerWords.forEach(
    (word) => {

      const matches =
        lower.match(

          new RegExp(
            word,
            "g"
          )
        );

      if (matches) {

        fillerCount +=
          matches.length;
      }
    }
  );

  const wordCount =
    answer.split(" ").length;

  let communicationScore =
    95;

  if (fillerCount > 10) {

    communicationScore -= 20;
  }

  else if (fillerCount > 5) {

    communicationScore -= 10;
  }

  if (wordCount < 20) {

    communicationScore -= 15;
  }

  const suggestions = [];

  if (fillerCount > 5) {

    suggestions.push(
      "Reduce filler words"
    );
  }

  if (wordCount < 20) {

    suggestions.push(
      "Provide more detailed explanations"
    );
  }

  if (
    answer.includes("impact")
    ||
    answer.includes("result")
  ) {

    suggestions.push(
      "Good measurable communication"
    );
  }

  return {

    fillerCount,

    communicationScore,

    wordCount,

    suggestions,
  };
}