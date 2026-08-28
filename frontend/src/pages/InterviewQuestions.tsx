import {
  useState,
} from "react";

import MainLayout from "../components/MainLayout";

const roleQuestions: any = {

  "Software Engineer": [

    "Explain OOP concepts.",

    "What is REST API?",

    "Difference between SQL and NoSQL?",

    "Explain time complexity.",

    "What are microservices?",
  ],

  "Frontend Developer": [

    "What is React?",

    "Explain virtual DOM.",

    "Difference between state and props?",

    "What is Tailwind CSS?",

    "Explain React hooks.",
  ],

  "AI/ML Engineer": [

    "What is overfitting?",

    "Explain supervised learning.",

    "Difference between AI and ML?",

    "What is deep learning?",

    "Explain neural networks.",
  ],

  "Data Analyst": [

    "What is data cleaning?",

    "Explain Power BI dashboards.",

    "Difference between mean and median?",

    "What is SQL JOIN?",

    "Explain data visualization.",
  ],

  "DevOps Engineer": [

    "What is Docker?",

    "Explain CI/CD.",

    "What is Kubernetes?",

    "Difference between Git merge and rebase?",

    "Explain cloud deployment.",
  ],

  "HR": [

    "How do you handle conflict?",

    "Explain employee engagement.",

    "What is recruitment lifecycle?",

    "How do you evaluate candidates?",

    "Explain workplace ethics.",
  ],
};

function InterviewQuestions() {

  const [selectedRole, setSelectedRole] =
    useState(
      "Software Engineer"
    );

  const questions =
    roleQuestions[selectedRole];

  return (
    <MainLayout>

      <div className="min-h-screen bg-[#050816] text-white px-8 py-10">

        <h1 className="text-5xl font-bold text-cyan-400">
          AI Interview Questions
        </h1>

        <p className="text-gray-400 mt-3">
          Role-specific AI interview preparation engine
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-12">

          <h2 className="text-2xl font-bold text-cyan-400">
            Select Role
          </h2>

          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(
                e.target.value
              )
            }
            className="mt-6 bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none text-white w-full max-w-md"
          >

            {Object.keys(
              roleQuestions
            ).map((role) => (

              <option
                key={role}
                value={role}
              >

                {role}

              </option>

            ))}

          </select>

        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">

          {questions.map(
            (
              question: string,
              index: number
            ) => (

              <div
                key={index}
                className="bg-white/5 border border-cyan-500/10 rounded-3xl p-8"
              >

                <div className="flex items-center justify-between">

                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">

                    {index + 1}

                  </div>

                  <div className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 text-sm">

                    AI Generated

                  </div>

                </div>

                <p className="text-xl leading-8 mt-8">

                  {question}

                </p>

              </div>

            )
          )}

        </div>

      </div>

    </MainLayout>
  );
}

export default InterviewQuestions;