import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { signup, login as loginApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import HagridsLogo from "../components/shared/HagridsLogo";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  }

  function validateForm() {
    const username = formData.username.trim();
    const email = formData.email.trim();

    if (!username) {
      setError("Please enter your name.");
      return false;
    }
    if (username.length < 2) {
      setError("Your name must contain at least 2 characters.");
      return false;
    }
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!formData.password) {
      setError("Please create a password.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const username = formData.username.trim();

      // Call centralized API helper
      const data = await signup(username, normalizedEmail, formData.password);

      let token = data?.token || data?.access_token;
      let user = data?.user || {
        id: data?.id || data?.user_id,
        email: normalizedEmail,
        username: username,
      };

      // If signup didn't return an access token directly, perform auto-login
      if (!token) {
        try {
          const loginData = await loginApi(normalizedEmail, formData.password);
          token = loginData?.token || loginData?.access_token;
          user = loginData?.user || user;
        } catch {
          // If auto-login fails, redirect to login page
          toast.success("Account created successfully! Please sign in.");
          navigate("/login");
          return;
        }
      }

      if (token) {
        login(user, token);
        toast.success("Welcome to Hagrid's Hut! Your desk is ready.");
        navigate("/dashboard", { replace: true });
      } else {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to create your account. Please check your information.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F3EB] dark:bg-[#221D19] text-[#302820] dark:text-[#F3EADD] font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <HagridsLogo to="/" />
        <Link
          to="/"
          className="text-xs font-medium text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
        >
          ← Return to homepage
        </Link>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Introduction */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
            <div className="relative rounded-xl overflow-hidden border border-[#49372B]/15 dark:border-[#E5D6BE]/15 shadow-md">
              <img
                src="/images/study_workspace_desk.jpg"
                alt="A warm study desk with notebook and coffee"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A231C]/90 via-[#2A231C]/30 to-transparent flex flex-col justify-end p-6 text-[#FAF5EC]">
                <span className="font-hand text-2xl text-[#E5D6BE] mb-1">
                  "Your next opportunity starts right here."
                </span>
                <p className="text-xs text-[#FAF5EC]/80">
                  A personal corner of the world built for career readiness.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm text-[#6B5D50] dark:text-[#B8AFA3]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                <span>Unlimited interview practice across roles and experience levels</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                <span>Resume PDF workshop with tailored suggestion notes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                <span>Access to both Cozy Experience and Advanced Mode anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Registration Form */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="study-card p-8 sm:p-10 space-y-6">
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#AC7256]">
                  A product of The Sorted Club
                </span>
                <h1 className="font-serif text-3xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                  Take a seat.
                </h1>
                <p className="text-sm text-[#6B5D50] dark:text-[#B8AFA3]">
                  Create your personal study desk to begin preparing.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-md bg-[#AC5E50]/10 border border-[#AC5E50]/25 text-[#AC5E50] text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="block text-xs font-medium text-[#49372B] dark:text-[#E5D6BE]"
                  >
                    Your name
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Eleanor Vance"
                      required
                      autoComplete="name"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF5EC] dark:bg-[#342C25] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 text-[#302820] dark:text-[#FAF5EC] placeholder:text-[#9B8D7F] text-sm focus:border-[#AC7256] focus:ring-1 focus:ring-[#AC7256] outline-none transition-all"
                    />
                    <User className="w-4 h-4 text-[#9B8D7F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-[#49372B] dark:text-[#E5D6BE]"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@domain.com"
                      required
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF5EC] dark:bg-[#342C25] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 text-[#302820] dark:text-[#FAF5EC] placeholder:text-[#9B8D7F] text-sm focus:border-[#AC7256] focus:ring-1 focus:ring-[#AC7256] outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-[#9B8D7F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-[#49372B] dark:text-[#E5D6BE]"
                  >
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-[#49372B] dark:text-[#E5D6BE]"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      required
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 rounded-md bg-[#FAF5EC] dark:bg-[#342C25] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 text-[#302820] dark:text-[#FAF5EC] placeholder:text-[#9B8D7F] text-sm focus:border-[#AC7256] focus:ring-1 focus:ring-[#AC7256] outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8D7F] hover:text-[#302820] dark:hover:text-[#FAF5EC] p-1"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 text-sm font-semibold disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <span>Preparing your desk...</span>
                  ) : (
                    <>
                      <span>Create your study account</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
                Already have a desk here?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#AC7256] hover:underline ml-1"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-[#9B8D7F]">
        Hagrid's Hut · A product of <span className="text-[#AC7256] font-medium">The Sorted Club</span>
      </footer>
    </div>
  );
}