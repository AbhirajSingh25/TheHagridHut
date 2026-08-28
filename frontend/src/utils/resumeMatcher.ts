export function analyzeResumeMatch(

  resumeText: string,

  jobDescription: string
) {

  const resume =
    resumeText.toLowerCase();

  const job =
    jobDescription.toLowerCase();


  const commonSkills = [

    "react",

    "typescript",

    "javascript",

    "python",

    "java",

    "sql",

    "node",

    "express",

    "mongodb",

    "postgresql",

    "aws",

    "docker",

    "kubernetes",

    "ai",

    "machine learning",

    "fastapi",

    "communication",

    "leadership",

    "problem solving",
  ];


  const matchedSkills: string[] = [];

  const missingSkills: string[] = [];


  commonSkills.forEach(
    (skill) => {

      const inResume =
        resume.includes(skill);

      const inJob =
        job.includes(skill);

      if (
        inResume &&
        inJob
      ) {

        matchedSkills.push(
          skill
        );
      }

      if (
        !inResume &&
        inJob
      ) {

        missingSkills.push(
          skill
        );
      }
    }
  );


  let score =
    60;

  score +=
    matchedSkills.length * 5;

  score -=
    missingSkills.length * 2;


  if (score > 100) {

    score = 100;
  }

  if (score < 0) {

    score = 0;
  }


  let recommendation =
    "Moderate Match";


  if (score >= 85) {

    recommendation =
      "Excellent Match";
  }

  else if (score >= 70) {

    recommendation =
      "Strong Match";
  }

  else if (score < 50) {

    recommendation =
      "Needs Improvement";
  }


  return {

    score,

    recommendation,

    matchedSkills,

    missingSkills,
  };
}