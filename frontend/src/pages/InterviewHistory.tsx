import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import MainLayout from "../components/MainLayout";

import Card from "../components/ui/Card";

import {
  Clock,
  Brain,
  PlayCircle,
  Trophy,
} from "lucide-react";

import {
  getInterviewSessions,
} from "../services/api";

function InterviewHistory() {

  const navigate =
    useNavigate();

  const [
    sessions,
    setSessions,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    loadSessions();

  }, []);

  async function loadSessions() {

    try {

      const data =
        await getInterviewSessions();

      setSessions(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  return (

    <MainLayout>

      <div
        className="
          max-w-7xl
          mx-auto
        "
      >

        <div className="mb-10">

          <h1
            className="
              text-6xl
              font-black
              mb-4
            "
          >
            Interview History
          </h1>

          <p
            className="
              text-zinc-500
              text-xl
            "
          >
            Review and replay previous interview sessions
          </p>

        </div>

        {
          loading

          ? (

            <div
              className="
                text-zinc-400
                text-xl
              "
            >
              Loading sessions...
            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                gap-6
              "
            >

              {
                sessions.map(
                  (
                    session,
                    index
                  ) => (

                    <div
                      key={index}

                      onClick={() =>
                        navigate(
                          `/playback/${session.id}`
                        )
                      }

                      className="
                        cursor-pointer
                        hover:scale-[1.02]
                        transition-all
                      "
                    >

                      <Card
                        className="
                          p-8
                        "
                      >

                        <div
                          className="
                            flex
                            justify-between
                            items-center
                            mb-5
                          "
                        >

                          <Brain
                            className="
                              text-red-400
                            "
                            size={32}
                          />

                          <span
                            className="
                              text-xs
                              px-3
                              py-1
                              rounded-full
                              bg-red-500/10
                              text-red-400
                            "
                          >
                            Session #{session.id}
                          </span>

                        </div>

                        <h2
                          className="
                            text-2xl
                            font-bold
                            mb-2
                          "
                        >
                          {
                            session.role ||
                            "Interview"
                          }
                        </h2>

                        <p
                          className="
                            text-zinc-500
                            mb-5
                          "
                        >
                          {
                            session.level ||
                            "Intermediate"
                          }
                        </p>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            mb-5
                          "
                        >

                          <Trophy
                            size={18}
                            className="
                              text-yellow-400
                            "
                          />

                          <span
                            className="
                              text-white
                              font-semibold
                            "
                          >
                            Score:
                            {" "}
                            {
                              session.overall_score || 0
                            }
                          </span>

                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            text-zinc-400
                            mb-6
                          "
                        >

                          <Clock size={18} />

                          <span
                            className="
                              text-sm
                            "
                          >
                            {
                              session.created_at
                                ? new Date(
                                    session.created_at
                                  ).toLocaleString()
                                : "Recently"
                            }
                          </span>

                        </div>

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            navigate(
                              `/playback/${session.id}`
                            );
                          }}

                          className="
                            w-full
                            h-12
                            rounded-2xl
                            bg-red-500
                            hover:bg-red-600
                            transition-all
                            flex
                            items-center
                            justify-center
                            gap-2
                            font-semibold
                          "
                        >

                          <PlayCircle
                            size={18}
                          />

                          Replay Interview

                        </button>

                      </Card>

                    </div>
                  )
                )
              }

            </div>
          )
        }

      </div>

    </MainLayout>
  );
}

export default InterviewHistory;