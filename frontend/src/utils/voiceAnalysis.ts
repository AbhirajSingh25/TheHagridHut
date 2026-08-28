export function analyzeSpeech(
  transcript: string,
  duration: number
) {

  const words =

    transcript
      .trim()
      .split(/\s+/)
      .filter(Boolean);


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


  let fillerCount = 0;


  words.forEach(
    (word) => {

      const clean =

        word
          .toLowerCase()
          .replace(/[^\w]/g, "");

      if (

        fillerWords.includes(
          clean
        )
      ) {

        fillerCount++;
      }
    }
  );


  const wordsPerMinute =

    duration > 0

      ? Math.floor(
          wordCount /
          (duration / 60)
        )

      : 0;


  let confidence = 85;


  if (
    fillerCount > 10
  ) {

    confidence -= 15;
  }

  if (
    wordsPerMinute < 90
  ) {

    confidence -= 10;
  }

  if (
    wordsPerMinute > 170
  ) {

    confidence -= 10;
  }


  return {

    wordCount,

    fillerCount,

    wordsPerMinute,

    confidence,
  };
}