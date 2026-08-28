export function generateRecruiterInsights(
  report: any
) {

  const average =

    (
      report.confidence +
      report.communication +
      report.technical
    ) / 3;


  let hiring =
    "Strong Hire";


  if (average < 70) {

    hiring =
      "Needs Improvement";
  }

  else if (
    average < 85
  ) {

    hiring =
      "Potential Hire";
  }


  const strengths = [];

  const weaknesses = [];


  if (
    report.communication >= 85
  ) {

    strengths.push(
      "Excellent communication clarity"
    );
  }

  else {

    weaknesses.push(
      "Communication consistency needs improvement"
    );
  }


  if (
    report.technical >= 85
  ) {

    strengths.push(
      "Strong technical understanding"
    );
  }

  else {

    weaknesses.push(
      "Technical depth can improve"
    );
  }


  if (
    report.confidence >= 85
  ) {

    strengths.push(
      "High professional confidence"
    );
  }

  else {

    weaknesses.push(
      "Confidence under pressure should improve"
    );
  }


  const employabilityScore =
    Math.floor(average);


  return {

    hiring,

    strengths,

    weaknesses,

    employabilityScore,
  };
}