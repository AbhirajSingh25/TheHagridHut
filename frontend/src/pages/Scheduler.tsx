import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../components/MainLayout";

function Scheduler() {

  const [company, setCompany] =
    useState("");

  const [role, setRole] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [sessions, setSessions] =
    useState<any[]>([]);

  useEffect(() => {

    const stored =
      JSON.parse(
        localStorage.getItem(
          "hiresense-sessions"
        ) || "[]"
      );

    setSessions(stored);

  }, []);

  const saveSession = () => {

    if (
      !company ||
      !role ||
      !date ||
      !time
    ) {

      alert(
        "Please fill all fields."
      );

      return;
    }

    const newSession = {

      id: Date.now(),

      company,

      role,

      date,

      time,

      status:
        "Upcoming",
    };

    const updated =
      [newSession, ...sessions];

    setSessions(updated);

    localStorage.setItem(
      "hiresense-sessions",
      JSON.stringify(updated)
    );

    setCompany("");
    setRole("");
    setDate("");
    setTime("");
  };

  return (
    <MainLayout>

      <div className="min-h-screen bg-[#050816] text-white px-8 py-10">

        <h1 className="text-5xl font-bold text-cyan-400">
          Interview Scheduler
        </h1>

        <p className="text-gray-400 mt-3">
          Plan and manage AI interview sessions
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-12">

          <h2 className="text-2xl font-bold text-cyan-400">
            Schedule Interview
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) =>
                setCompany(
                  e.target.value
                )
              }
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value
                )
              }
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

            <input
              type="time"
              value={time}
              onChange={(e) =>
                setTime(
                  e.target.value
                )
              }
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

          </div>

          <button
            onClick={saveSession}
            className="mt-8 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold"
          >
            Schedule Session
          </button>

        </div>

        <div className="space-y-6 mt-12">

          {sessions.length === 0 && (

            <div className="bg-white/5 rounded-3xl p-8">

              No scheduled interviews.

            </div>

          )}

          {sessions.map(
            (
              item: any
            ) => (

              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-bold text-cyan-400">

                      {item.company}

                    </h2>

                    <p className="text-gray-400 mt-2">

                      {item.role}

                    </p>

                  </div>

                  <div className="px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">

                    {item.status}

                  </div>

                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">

                  <div className="bg-white/5 rounded-2xl p-5">

                    <p className="text-gray-400">
                      Interview Date
                    </p>

                    <p className="text-2xl font-bold mt-3">

                      {item.date}

                    </p>

                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">

                    <p className="text-gray-400">
                      Interview Time
                    </p>

                    <p className="text-2xl font-bold mt-3">

                      {item.time}

                    </p>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </MainLayout>
  );
}

export default Scheduler;