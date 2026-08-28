import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import MainLayout from "../components/MainLayout";

import {
  getPlayback,
} from "../services/api";

function InterviewPlayback() {

  const {
    id,
  } = useParams();

  const [
    data,
    setData,
  ] = useState<any>(null);

  useEffect(() => {

    loadPlayback();

  }, []);

  async function loadPlayback() {

    if (!id) return;

    const result =
      await getPlayback(id);

    setData(result);
  }

  if (!data) {

    return (

      <MainLayout>

        <div className="text-white">
          Loading...
        </div>

      </MainLayout>
    );
  }

  return (

    <MainLayout>

      <div className="max-w-6xl mx-auto">

        <h1
          className="
            text-6xl
            font-black
            mb-8
          "
        >
          Interview Playback
        </h1>

        <div
          className="
            mb-8
            p-6
            rounded-3xl
            border
            border-white/10
          "
        >

          <h2 className="text-3xl font-bold">
            {data.role}
          </h2>

          <p className="text-zinc-500">
            {data.level}
          </p>

          <p className="mt-3">
            Score:
            {" "}
            {data.overall_score}%
          </p>

        </div>

        <div className="space-y-6">

          {
            data.questions?.map(
              (
                question: string,
                index: number
              ) => {

                const answer =
                  data.answers?.[index];

                const evaluation =
                  data.evaluations?.[index];

                return (

                  <div
                    key={index}
                    className="
                      p-6
                      rounded-3xl
                      border
                      border-white/10
                    "
                  >

                    <h3
                      className="
                        font-bold
                        text-xl
                        mb-3
                      "
                    >
                      Q{index + 1}
                    </h3>

                    <p
                      className="
                        text-cyan-400
                        mb-3
                      "
                    >
                      {question}
                    </p>

                    <p
                      className="
                        text-zinc-300
                        mb-4
                      "
                    >
                      {answer}
                    </p>

                    <div
                      className="
                        flex
                        gap-6
                      "
                    >

                      <span>
                        Confidence:
                        {" "}
                        {
                          evaluation?.confidence
                        }
                      </span>

                      <span>
                        Communication:
                        {" "}
                        {
                          evaluation?.communication
                        }
                      </span>

                      <span>
                        Technical:
                        {" "}
                        {
                          evaluation?.technical
                        }
                      </span>

                    </div>

                  </div>
                );
              }
            )
          }

        </div>

      </div>

    </MainLayout>
  );
}

export default InterviewPlayback;