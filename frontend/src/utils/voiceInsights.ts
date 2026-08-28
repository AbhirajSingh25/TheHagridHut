export function analyzeVoiceInsights(
  text: string
) {

  const words =
    text
      .trim()
      .split(/\s+/);

  const wordCount =
    words.length;


  const fillerWords = [

    "um",

    "uh",

    "like",

    "basically",

    "actually",

    "you know",

    "literally",
  ];


  let fillerCount =
    0;


  fillerWords.forEach(
    (word) => {

      const regex =
        new RegExp(
          `\\b${word}\\b`,
          "gi"
        );

      const matches =
        text.match(regex);

      if (matches) {

        fillerCount +=
          matches.length;
      }
    }
  );


  const fillerRatio =
    wordCount > 0

      ? fillerCount / wordCount

      : 0;


  let confidence =
    90;

  confidence -=
    fillerRatio * 100;


  if (confidence < 40) {

    confidence = 40;
  }


  let pacing =
    "Balanced";


  if (wordCount < 20) {

    pacing = "Too Short";
  }

  else if (
    wordCount > 180
  ) {

    pacing = "Too Fast";
  }


  let sentiment =
    "Professional";


  const positiveWords = [

    "achieved",

    "improved",

    "built",

    "created",

    "led",

    "optimized",

    "designed",
  ];


  let positiveCount =
    0;


  positiveWords.forEach(
    (word) => {

      if (
        text
          .toLowerCase()
          .includes(word)
      ) {

        positiveCount++;
      }
    }
  );


  if (positiveCount >= 3) {

    sentiment =
      "Confident";
  }


  return {

    confidence:
      Math.round(
        confidence
      ),

    pacing,

    sentiment,

    fillerCount,

    wordCount,
  };
}