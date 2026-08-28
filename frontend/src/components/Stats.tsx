import {
  LayoutDashboard,
  Brain,
  BarChart3,
  History,
  Video,
  MessageSquare,
  FileText,
 Award,
  NotebookPen,
  TrendingUp,
  Sparkles,
  Trophy,
  Building2,
  CalendarDays,
  FileSearch,
  Moon,
  Sun,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  useTheme,
} from "../context/ThemeContext";

function Sidebar() {

  const {
    darkMode,
    toggleTheme,
  } = useTheme();

  return (
    <div
      className={`w-[260px] min-h-screen p-6 ${
        darkMode
          ? "bg-[#081028] text-white"
          : "bg-white text-black"
      }`}
    >

      <h1 className="text-3xl font-bold text-cyan-400">
        HireSense AI
      </h1>

      <button
        onClick={toggleTheme}
        className="mt-8 w-full py-3 rounded-xl bg-cyan-500 text-white flex items-center justify-center gap-3"
      >

        {darkMode ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        )}

        {darkMode
          ? "Light Mode"
          : "Dark Mode"}

      </button>

      <div className="mt-10 space-y-4">

        <Link to="/dashboard" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} />
            Dashboard
          </div>
        </Link>

        <Link to="/analysis" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <Brain size={20} />
            AI Analysis
          </div>
        </Link>

        <Link to="/analytics" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} />
            Analytics
          </div>
        </Link>

        <Link to="/reports" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <FileSearch size={20} />
            Reports
          </div>
        </Link>

        <Link to="/progress" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} />
            Progress
          </div>
        </Link>

        <Link to="/mock" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <Sparkles size={20} />
            Mock Interview
          </div>
        </Link>

        <Link to="/company" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <Building2 size={20} />
            Company Mode
          </div>
        </Link>

        <Link to="/scheduler" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} />
            Scheduler
          </div>
        </Link>

        <Link to="/leaderboard" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <Trophy size={20} />
            Leaderboard
          </div>
        </Link>

        <Link to="/history" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <History size={20} />
            History
          </div>
        </Link>

        <Link to="/live" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <Video size={20} />
            Live Interview
          </div>
        </Link>

        <Link to="/questions" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} />
            AI Questions
          </div>
        </Link>

        <Link to="/resume" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <FileText size={20} />
            Resume Analyzer
          </div>
        </Link>

        <Link to="/achievements" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <Award size={20} />
            Achievements
          </div>
        </Link>

        <Link to="/notes" className="block p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <NotebookPen size={20} />
            Notes
          </div>
        </Link>

      </div>

    </div>
  );
}

export default Sidebar;