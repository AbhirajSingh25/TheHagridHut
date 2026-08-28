export function analyzeFacePresence() {

  const eyeContact =
    Math.floor(
      75 + Math.random() * 20
    );

  const confidence =
    Math.floor(
      70 + Math.random() * 25
    );

  const engagement =
    Math.floor(
      72 + Math.random() * 22
    );

  const professionalism =
    Math.floor(
      78 + Math.random() * 18
    );


  let status =
    "Excellent";


  const average =

    (
      eyeContact +
      confidence +
      engagement +
      professionalism
    ) / 4;


  if (average < 70) {

    status = "Needs Improvement";
  }

  else if (
    average < 82
  ) {

    status = "Good";
  }


  return {

    eyeContact,

    confidence,

    engagement,

    professionalism,

    status,
  };
}