import MainLayout from "../components/MainLayout";

import Card from "../components/ui/Card";

import {
  Trophy,
  Brain,
  Users,
  Target,
} from "lucide-react";


const candidates = [

  {
    name: "Rahul Sharma",

    score: 92,

    communication: 90,

    confidence: 95,

    recommendation:
      "Strong Hire",
  },

  {
    name: "Ananya Gupta",

    score: 84,

    communication: 88,

    confidence: 79,

    recommendation:
      "Hire",
  },

  {
    name: "Aditya Verma",

    score: 71,

    communication: 68,

    confidence: 74,

    recommendation:
      "Average",
  },
];


function RecruiterInsights() {

  return (

    <MainLayout>

      <div className="mb-10">

        <h1
          className="
            text-5xl
            font-black
            text-white
          "
        >
          Recruiter Intelligence
        </h1>


        <p
          className="
            text-zinc-500
            mt-2
          "
        >
          AI-powered hiring analytics
        </p>

      </div>


      {/* TOP STATS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-8
        "
      >

        {[
          {
            title:
              "Candidates",

            value: "124",

            icon: Users,
          },

          {
            title:
              "Avg Score",

            value: "84%",

            icon: Brain,
          },

          {
            title:
              "Top Performer",

            value: "92%",

            icon: Trophy,
          },

          {
            title:
              "Hiring Rate",

            value: "68%",

            icon: Target,
          },
        ].map((item) => {

          const Icon =
            item.icon;

          return (

            <Card
              key={item.title}
              className="p-6"
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-6
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-cyan-400/20
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Icon
                    className="
                      text-cyan-400
                    "
                  />

                </div>

              </div>


              <p
                className="
                  text-zinc-500
                  mb-2
                "
              >
                {item.title}
              </p>


              <h2
                className="
                  text-5xl
                  font-black
                "
              >
                {item.value}
              </h2>

            </Card>
          );
        })}

      </div>


      {/* CANDIDATES */}

      <Card className="p-8">

        <div
          className="
            flex
            items-center
            justify-between
            mb-8
          "
        >

          <h2
            className="
              text-3xl
              font-bold
            "
          >
            Candidate Rankings
          </h2>

        </div>


        <div className="space-y-5">

          {candidates.map(
            (candidate, index) => (

              <div
                key={candidate.name}
                className="
                  p-6
                  rounded-3xl
                  bg-black/30
                  border
                  border-white/5
                  flex
                  items-center
                  justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-5
                  "
                >

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-cyan-400
                      text-black
                      font-black
                      flex
                      items-center
                      justify-center
                    "
                  >

                    #{index + 1}

                  </div>


                  <div>

                    <h3
                      className="
                        text-xl
                        font-bold
                      "
                    >
                      {candidate.name}
                    </h3>


                    <p
                      className="
                        text-zinc-500
                      "
                    >
                      {
                        candidate.recommendation
                      }
                    </p>

                  </div>

                </div>


                <div
                  className="
                    flex
                    gap-10
                  "
                >

                  <div>

                    <p
                      className="
                        text-zinc-500
                        mb-1
                      "
                    >
                      Overall
                    </p>

                    <h2
                      className="
                        text-3xl
                        font-black
                        text-cyan-400
                      "
                    >
                      {
                        candidate.score
                      }%
                    </h2>

                  </div>


                  <div>

                    <p
                      className="
                        text-zinc-500
                        mb-1
                      "
                    >
                      Confidence
                    </p>

                    <h2
                      className="
                        text-3xl
                        font-black
                      "
                    >
                      {
                        candidate.confidence
                      }%
                    </h2>

                  </div>


                  <div>

                    <p
                      className="
                        text-zinc-500
                        mb-1
                      "
                    >
                      Communication
                    </p>

                    <h2
                      className="
                        text-3xl
                        font-black
                      "
                    >
                      {
                        candidate.communication
                      }%
                    </h2>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </Card>

    </MainLayout>
  );
}

export default RecruiterInsights;