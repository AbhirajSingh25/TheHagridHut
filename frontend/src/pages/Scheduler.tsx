import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../components/MainLayout";

import {
  getSchedules,
  createSchedule,
  cancelSchedule,
  deleteSchedule,
} from "../services/api";

interface Schedule {
  id: number;
  title: string;
  role: string;
  level: string;
  company: string | null;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
}

function Scheduler() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSchedules();
      setSchedules(data.schedules || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your scheduled interviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveSession = async () => {
    if (!role || !date || !time) {
      setError("Role, date, and time are required.");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);

    if (Number.isNaN(scheduledAt.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createSchedule({
        title: company ? `${role} at ${company}` : `${role} interview`,
        role,
        company: company || undefined,
        scheduled_at: scheduledAt.toISOString(),
      });

      setCompany("");
      setRole("");
      setDate("");
      setTime("");

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not schedule this interview. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelSchedule(id);
      await load();
    } catch {
      setError("Could not cancel this session. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this scheduled interview permanently?")) {
      return;
    }

    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Could not remove this session. Please try again.");
    }
  };

  const statusStyles: Record<string, string> = {
    scheduled: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
    completed: "bg-green-500/10 border-green-500/20 text-green-300",
    cancelled: "bg-red-500/10 border-red-500/20 text-red-300",
    missed: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#050816] text-white px-8 py-10">
        <h1 className="text-5xl font-bold text-cyan-400">
          Interview Scheduler
        </h1>

        <p className="text-gray-400 mt-3">
          Plan and manage AI interview sessions. Scheduling one also
          creates a reminder notification on your account.
        </p>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-6 py-4">
            {error}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-cyan-400">
            Schedule Interview
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <input
              type="text"
              placeholder="Company (optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-4 outline-none"
            />
          </div>

          <button
            onClick={saveSession}
            disabled={saving}
            className="mt-8 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold disabled:opacity-50"
          >
            {saving ? "Scheduling..." : "Schedule Session"}
          </button>
        </div>

        <div className="space-y-6 mt-12">
          {loading ? (
            <div className="bg-white/5 rounded-3xl p-8 text-center text-gray-400">
              Loading your scheduled interviews...
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white/5 rounded-3xl p-8 text-center text-gray-400">
              No scheduled interviews yet.
            </div>
          ) : (
            schedules.map((item) => {
              const scheduledDate = new Date(item.scheduled_at);

              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400">
                        {item.company || item.role}
                      </h2>

                      <p className="text-gray-400 mt-2">
                        {item.role} &middot; {item.interview_type}
                      </p>
                    </div>

                    <div
                      className={`px-5 py-3 rounded-2xl border capitalize ${
                        statusStyles[item.status] ||
                        "bg-white/5 border-white/10 text-gray-300"
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white/5 rounded-2xl p-5">
                      <p className="text-gray-400">Interview Date</p>
                      <p className="text-2xl font-bold mt-3">
                        {scheduledDate.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5">
                      <p className="text-gray-400">Interview Time</p>
                      <p className="text-2xl font-bold mt-3">
                        {scheduledDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {item.status === "scheduled" && (
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                      >
                        Cancel Session
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Scheduler;
