import {
  FaChartPie,
  FaMicrophone,
  FaBrain,
  FaCog,
} from "react-icons/fa";

function DashboardSidebar() {
  return (
    <aside className="w-72 min-h-screen border-r border-white/10 bg-white/5 backdrop-blur-xl p-6">

      <h1 className="text-3xl font-bold text-cyan-400">
        HireSense AI
      </h1>

      <div className="mt-14 space-y-4">

        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 transition">
          <FaChartPie />
          Dashboard
        </button>

        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition">
          <FaMicrophone />
          Interviews
        </button>

        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition">
          <FaBrain />
          AI Feedback
        </button>

        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition">
          <FaCog />
          Settings
        </button>

      </div>
    </aside>
  );
}

export default DashboardSidebar;