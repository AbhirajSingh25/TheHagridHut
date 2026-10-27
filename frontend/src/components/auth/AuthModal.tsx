import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, X, ArrowRight, Loader2 } from "lucide-react";
import { login as loginApi, signup as signupApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import HagridsLogo from "../shared/HagridsLogo";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "signin",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = useAuth();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please provide your email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginApi(normalizedEmail, password);
      const token = response?.access_token || response?.token || null;
      const user = response?.user || {
        id: response?.id || response?.user_id || null,
        email: normalizedEmail,
        username: response?.username || normalizedEmail.split("@")[0],
      };

      if (!token) {
        throw new Error("Login failed. No token received.");
      }

      auth.login(user, token);
      toast.success("Welcome back to your study desk.");
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to sign in. Please verify your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await signupApi(cleanUsername, cleanEmail, password);

      // Automatically sign in upon registration
      const loginResp = await loginApi(cleanEmail, password);
      const token = loginResp?.access_token || loginResp?.token || null;
      const user = loginResp?.user || {
        id: loginResp?.id || loginResp?.user_id || null,
        email: cleanEmail,
        username: cleanUsername,
      };

      if (token) {
        auth.login(user, token);
      }

      toast.success("Your study desk is ready. Welcome to Hagrid's Hut.");
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to create account. Please check your details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B242B]/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#FAF6EE] text-[#2D261E] rounded-2xl shadow-2xl border border-[#DFD3C1] overflow-hidden"
      >
        {/* Header decoration */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#EBE1CF]">
          <div className="flex items-center gap-2">
            <HagridsLogo variant="minimal" />
            <span className="text-xs uppercase tracking-wider text-[#7A6B5D] font-mono">
              Study Room
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7A6B5D] hover:text-[#2D261E] hover:bg-[#EBE1CF]/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Pills */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-[#EDE3D2] rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-[#FAF6EE] text-[#2D261E] shadow-sm font-semibold"
                  : "text-[#7A6B5D] hover:text-[#2D261E]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-[#FAF6EE] text-[#2D261E] shadow-sm font-semibold"
                  : "text-[#7A6B5D] hover:text-[#2D261E]"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="mb-4">
            <h2
              id="auth-modal-title"
              className="font-serif text-2xl text-[#2D261E] mb-1 font-semibold"
            >
              {mode === "signin" ? "Welcome Back" : "Begin Your Practice"}
            </h2>
            <p className="text-xs text-[#7A6B5D]">
              {mode === "signin"
                ? "Return to your study desk, notes, and interview prep."
                : "Join the quiet room to practice interviews and refine your resume."}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 px-3 py-2.5 rounded-lg bg-[#F8E5DF] text-[#8C3A27] text-xs border border-[#E9C0B3]"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
            className="space-y-3.5"
          >
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-[#5B4F43] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Abhiraj Singh"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-[#DFD3C1] text-[#2D261E] placeholder:text-[#A69B8D] focus:outline-none focus:ring-1 focus:ring-[#526C7A] focus:border-[#526C7A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#5B4F43] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-[#DFD3C1] text-[#2D261E] placeholder:text-[#A69B8D] focus:outline-none focus:ring-1 focus:ring-[#526C7A] focus:border-[#526C7A]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#5B4F43]">
                  Password
                </label>
                {mode === "signin" && (
                  <span className="text-[11px] text-[#7A6B5D] hover:underline cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg bg-white border border-[#DFD3C1] text-[#2D261E] placeholder:text-[#A69B8D] focus:outline-none focus:ring-1 focus:ring-[#526C7A] focus:border-[#526C7A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7D6F] hover:text-[#2D261E]"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-[#5B4F43] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7D6F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-[#DFD3C1] text-[#2D261E] placeholder:text-[#A69B8D] focus:outline-none focus:ring-1 focus:ring-[#526C7A] focus:border-[#526C7A]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#273D4B] hover:bg-[#1E2E38] text-[#F7F3EB] text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entering study room...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "signin"
                      ? "Sign In to Study Desk"
                      : "Create Your Account"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-[#8C7D6F]">
            {mode === "signin" ? (
              <>
                New to Hagrid's Hut?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className="font-medium text-[#273D4B] hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="font-medium text-[#273D4B] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
