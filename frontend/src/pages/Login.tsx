import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";
import HagridsLogo from "../components/shared/HagridsLogo";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(normalizedEmail, password);

      const token = response?.access_token || response?.token || null;
      const user = response?.user || {
        id: response?.id || response?.user_id || null,
        email: normalizedEmail,
        username: response?.username || normalizedEmail.split("@")[0],
      };

      if (!token) {
        throw new Error(
          response?.detail ||
            response?.message ||
            "Login failed. Authentication token was not received."
        );
      }

      auth.login(user, token);
      toast.success("Welcome back to your study desk.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to sign in. Please verify your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] dark:bg-[#221D19] text-[#302820] dark:text-[#F3EADD] font-sans flex flex-col justify-between">
      {/* Subtle top header */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <HagridsLogo to="/" />
        <Link
          to="/"
          className="text-xs font-medium text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
        >
          ← Return to homepage
        </Link>
      </header>

      {/* Main split layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Study Room Art & Note (Hidden on smaller screens to prioritize form) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
            <div className="relative rounded-xl overflow-hidden border border-[#49372B]/15 dark:border-[#E5D6BE]/15 shadow-md">
              <img
                src="/images/rainlit_study_hero.jpg"
                alt="A warm study desk beside a rainlit window"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A231C]/90 via-[#2A231C]/30 to-transparent flex flex-col justify-end p-6 text-[#FAF5EC]">
                <span className="font-hand text-2xl text-[#E5D6BE] mb-1">
                  "Take a breath. You are in good company."
                </span>
                <p className="text-xs text-[#FAF5EC]/80">
                  Your private study desk for thoughtful career preparation.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#6B5D50] dark:text-[#B8AFA3]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                <span>Resume reviews and interview sessions preserved privately</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                <span>No countdowns, no artificial pressure, no fluorescent lights</span>
              </div>
            </div>
          </div>

          {/* Right: Clean, welcoming Login Form */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="study-card p-8 sm:p-10 space-y-7">
              <div className="space-y-2 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#AC7256]">
                  Welcome Back
                </span>
                <h1 className="font-serif text-3xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                  Enter your study.
                </h1>
                <p className="text-sm text-[#6B5D50] dark:text-[#B8AFA3]">
                  Sign in to resume your interviews and document reviews.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-md bg-[#AC5E50]/10 border border-[#AC5E50]/25 text-[#AC5E50] text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5 text-left">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-[#49372B] dark:text-[#E5D6BE]"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF5EC] dark:bg-[#342C25] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 text-[#302820] dark:text-[#FAF5EC] placeholder:text-[#9B8D7F] text-sm focus:border-[#AC7256] focus:ring-1 focus:ring-[#AC7256] outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-[#9B8D7F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-[#49372B] dark:text-[#E5D6BE]"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your secret password"
                      required
                      autoComplete="current-password"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF5EC] dark:bg-[#342C25] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 text-[#302820] dark:text-[#FAF5EC] placeholder:text-[#9B8D7F] text-sm focus:border-[#AC7256] focus:ring-1 focus:ring-[#AC7256] outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8D7F] hover:text-[#302820] dark:hover:text-[#FAF5EC] p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? (
                    <span>Opening your desk...</span>
                  ) : (
                    <>
                      <span>Sign in to Study Desk</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
                First time here?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#AC7256] hover:underline ml-1"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Understated footer note */}
      <footer className="w-full py-4 text-center text-[11px] text-[#9B8D7F]">
        Hagrid's Hut · A product of <span className="text-[#AC7256] font-medium">The Sorted Club</span>
      </footer>
    </div>
  );
}