import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Zap,
} from "lucide-react";

import {
  login,
} from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";


type AuthUiStyle =
  | "modern"
  | "hiresense";


function Login() {

  const navigate =
    useNavigate();

  const auth =
    useAuth();


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    authStyle,
    setAuthStyle,
  ] = useState<AuthUiStyle>(
    () => {

      const saved =
        localStorage.getItem(
          "hiresense_auth_ui"
        );

      return saved ===
        "modern"
        ? "modern"
        : "hiresense";

    }
  );


  const [
    lightMode,
    setLightMode,
  ] = useState(false);


  useEffect(() => {

    localStorage.setItem(
      "hiresense_auth_ui",
      authStyle
    );

  }, [
    authStyle,
  ]);


  function switchAuthStyle() {

    setAuthStyle(
      (
        current
      ) =>
        current === "hiresense"
          ? "modern"
          : "hiresense"
    );

  }


  async function handleLogin(
    event: React.FormEvent
  ) {

    event.preventDefault();


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !normalizedEmail ||
      !password
    ) {

      toast.error(
        "Please enter your email and password."
      );

      return;

    }


    try {

      setLoading(
        true
      );


      const response =
        await login(
          normalizedEmail,
          password
        );


      const token =

        response?.access_token ||

        response?.token ||

        null;


      const user =

        response?.user || {

          id:

            response?.id ||

            response?.user_id ||

            null,

          email:
            normalizedEmail,

          username:

            response?.username ||

            normalizedEmail
              .split("@")[0],

        };


      if (
        !token
      ) {

        throw new Error(

          response?.detail ||

          response?.message ||

          "Login failed. Authentication token was not received."

        );

      }


      auth.login(
        user,
        token
      );


      toast.success(
        "Welcome back to HireSense AI."
      );


      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );


    } catch (
      error: any
    ) {

      console.error(
        "Login failed:",
        error
      );


      toast.error(

        error?.response?.data?.detail ||

        error?.message ||

        "Unable to sign in."

      );


    } finally {

      setLoading(
        false
      );

    }

  }


  /* =========================================================
     HIRESENSE DARK NEON UI
  ========================================================= */

  if (
    authStyle === "hiresense"
  ) {

    return (

      <div
        className={`
          relative
          min-h-screen
          overflow-hidden
          ${
            lightMode
              ? "bg-slate-100"
              : "bg-[#050814]"
          }
        `}
      >

        {/* =================================================
            BACKGROUND GRID
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.22]
          "
          style={{

            backgroundImage:
              `
                linear-gradient(
                  rgba(67, 104, 171, 0.13) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(67, 104, 171, 0.13) 1px,
                  transparent 1px
                )
              `,

            backgroundSize:
              "52px 52px",

          }}
        />


        {/* =================================================
            LEFT NETWORK EFFECT
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            bottom-[-220px]
            h-[650px]
            w-[850px]
            rounded-full
            bg-cyan-500/[0.07]
            blur-[130px]
          "
        />


        <div
          className="
            pointer-events-none
            absolute
            -left-20
            bottom-[-180px]
            h-[520px]
            w-[620px]
            rounded-full
            bg-violet-600/[0.10]
            blur-[110px]
          "
        />


        <div
          className="
            pointer-events-none
            absolute
            right-[-200px]
            bottom-[-250px]
            h-[700px]
            w-[700px]
            rounded-full
            bg-violet-500/[0.10]
            blur-[160px]
          "
        />


        {/* =================================================
            PARTICLE NETWORK
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            h-[430px]
            w-[58%]
            opacity-40
          "
          style={{

            backgroundImage:
              `
                radial-gradient(
                  circle at 10% 70%,
                  rgba(34,211,238,0.8) 0px,
                  transparent 2px
                ),
                radial-gradient(
                  circle at 25% 55%,
                  rgba(139,92,246,0.9) 0px,
                  transparent 3px
                ),
                radial-gradient(
                  circle at 45% 75%,
                  rgba(34,211,238,0.8) 0px,
                  transparent 2px
                ),
                radial-gradient(
                  circle at 62% 48%,
                  rgba(139,92,246,0.7) 0px,
                  transparent 2px
                ),
                radial-gradient(
                  circle at 78% 78%,
                  rgba(34,211,238,0.7) 0px,
                  transparent 3px
                )
              `,

          }}
        />


        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            relative
            z-30
            flex
            h-[84px]
            items-center
            justify-between
            border-b
            border-white/[0.07]
            bg-[#070b18]/80
            px-5
            backdrop-blur-2xl
            sm:px-8
            lg:px-12
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-violet-400/30
                bg-gradient-to-br
                from-violet-500/30
                via-indigo-500/20
                to-cyan-500/20
                shadow-[0_0_35px_rgba(124,58,237,0.35)]
              "
            >

              <BrainCircuit
                size={25}
                className="
                  text-cyan-300
                "
              />

            </div>


            <div>

              <div
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >

                HireSense

                <span
                  className="
                    ml-1
                    text-violet-400
                  "
                >

                  AI

                </span>

              </div>


              <div
                className="
                  mt-0.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-slate-500
                "
              >

                AI Career Intelligence

              </div>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <button
              type="button"
              onClick={
                switchAuthStyle
              }
              className="
                group
                relative
                flex
                items-center
                gap-2
                overflow-hidden
                rounded-2xl
                border
                border-violet-400/50
                bg-gradient-to-r
                from-violet-500/[0.16]
                via-indigo-500/[0.12]
                to-cyan-500/[0.10]
                px-4
                py-2.5
                text-xs
                font-semibold
                text-violet-200
                shadow-[0_0_28px_rgba(124,58,237,0.16)]
                transition
                hover:border-cyan-400/60
                hover:shadow-[0_0_35px_rgba(34,211,238,0.18)]
              "
            >

              <Sparkles
                size={15}
                className="
                  text-cyan-300
                  transition
                  group-hover:rotate-12
                "
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >

                Switch to Modern UI

              </span>


              <span
                className="
                  sm:hidden
                "
              >

                Switch UI

              </span>

            </button>


            <div
              className="
                hidden
                h-8
                w-px
                bg-white/[0.08]
                sm:block
              "
            />


            <button
              type="button"
              onClick={() =>
                setLightMode(
                  (
                    value
                  ) =>
                    !value
                )
              }
              className="
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-white/[0.05]
                hover:text-cyan-300
                sm:flex
              "
            >

              {lightMode
                ? (
                  <Sun
                    size={20}
                  />
                )
                : (
                  <Moon
                    size={20}
                  />
                )}

            </button>


            <div
              className="
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.03]
                text-slate-400
                sm:flex
              "
            >

              <UserRound
                size={19}
              />

            </div>

          </div>

        </header>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main
          className="
            relative
            z-10
            mx-auto
            grid
            min-h-[calc(100vh-84px)]
            max-w-[1800px]
            items-center
            gap-12
            px-6
            py-12
            sm:px-10
            lg:grid-cols-[0.95fr_1.05fr]
            lg:px-20
            xl:px-28
          "
        >

          {/* =============================================
              LEFT CONTENT
          ============================================= */}

          <section
            className="
              flex
              flex-col
              justify-center
              lg:pr-10
            "
          >

            <div
              className="
                mb-8
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/50
                bg-cyan-400/[0.05]
                px-4
                py-2
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-cyan-200
                shadow-[0_0_30px_rgba(34,211,238,0.08)]
              "
            >

              <Zap
                size={14}
                className="
                  fill-cyan-300
                  text-cyan-300
                "
              />

              AI-Powered Career Intelligence

            </div>


            <h1
              className="
                max-w-[720px]
                text-5xl
                font-semibold
                leading-[1.08]
                tracking-tight
                text-white
                sm:text-6xl
                xl:text-7xl
              "
            >

              Build your career

              <br />

              with

              <span
                className="
                  ml-3
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-violet-400
                  bg-clip-text
                  text-transparent
                "
              >

                intelligent

              </span>

              <br />

              <span
                className="
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-violet-400
                  bg-clip-text
                  text-transparent
                "
              >

                insights.

              </span>

            </h1>


            <p
              className="
                mt-8
                max-w-[690px]
                text-base
                leading-8
                text-slate-400
                sm:text-lg
              "
            >

              Practice interviews, analyze your resume,
              understand your skills, and discover exactly
              what recruiters are looking for.

            </p>


            <div
              className="
                mt-14
                grid
                max-w-[720px]
                gap-5
                sm:grid-cols-3
              "
            >

              <FeatureCard
                icon={
                  <BrainCircuit
                    size={22}
                  />
                }
                title={
                  <>
                    AI Interview
                    <br />
                    Intelligence
                  </>
                }
                description="
                  Real-time feedback and
                  detailed evaluation.
                "
                accent="violet"
              />


              <FeatureCard
                icon={
                  <BarChart3
                    size={22}
                  />
                }
                title={
                  <>
                    Career
                    <br />
                    Analytics
                  </>
                }
                description="
                  Track progress and
                  discover improvement areas.
                "
                accent="cyan"
              />


              <FeatureCard
                icon={
                  <ShieldCheck
                    size={22}
                  />
                }
                title={
                  <>
                    Secure
                    <br />
                    Profile
                  </>
                }
                description="
                  Your interview and career
                  insights stay organized.
                "
                accent="violet"
              />

            </div>


            <div
              className="
                mt-14
                text-xs
                text-slate-600
              "
            >

              © 2026 HireSense AI

            </div>

          </section>


          {/* =============================================
              LOGIN CARD
          ============================================= */}

          <section
            className="
              relative
              mx-auto
              w-full
              max-w-[690px]
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                -inset-[1px]
                rounded-[32px]
                bg-gradient-to-br
                from-cyan-400/35
                via-transparent
                to-violet-500/35
                opacity-60
                blur-[1px]
              "
            />


            <div
              className="
                relative
                rounded-[32px]
                border
                border-white/[0.10]
                bg-[#0a0e1d]/85
                p-7
                shadow-[0_30px_100px_rgba(0,0,0,0.45)]
                backdrop-blur-2xl
                sm:p-10
                lg:p-14
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-5
                "
              >

                <div
                  className="
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-violet-400/35
                    bg-gradient-to-br
                    from-violet-500/25
                    to-cyan-500/15
                    text-violet-300
                    shadow-[0_0_30px_rgba(124,58,237,0.18)]
                  "
                >

                  <Lock
                    size={27}
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-3xl
                      font-semibold
                      tracking-tight
                      text-white
                      sm:text-4xl
                    "
                  >

                    Welcome back

                  </h2>


                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-slate-400
                      sm:text-base
                    "
                  >

                    Continue building your career
                    with HireSense AI.

                  </p>

                </div>

              </div>


              {/* =========================================
                  TABS
              ========================================= */}

              <div
                className="
                  mt-10
                  grid
                  grid-cols-2
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#101525]
                  p-1
                "
              >

                <div
                  className="
                    rounded-xl
                    border
                    border-violet-400/50
                    bg-gradient-to-r
                    from-violet-500/20
                    via-indigo-500/20
                    to-cyan-500/15
                    px-4
                    py-3.5
                    text-center
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_0_20px_rgba(124,58,237,0.12)]
                  "
                >

                  Login

                </div>


                <Link
                  to="/signup"
                  className="
                    rounded-xl
                    px-4
                    py-3.5
                    text-center
                    text-sm
                    font-medium
                    text-slate-400
                    transition
                    hover:text-white
                  "
                >

                  Sign Up

                </Link>

              </div>


              {/* =========================================
                  FORM
              ========================================= */}

              <form
                onSubmit={
                  handleLogin
                }
                className="
                  mt-10
                  space-y-7
                "
              >

                <div>

                  <label
                    className="
                      mb-3
                      block
                      text-sm
                      font-medium
                      text-slate-300
                    "
                  >

                    Email Address

                  </label>


                  <div
                    className="
                      relative
                    "
                  >

                    <Mail
                      size={20}
                      className="
                        pointer-events-none
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-slate-500
                      "
                    />


                    <input
                      type="email"
                      value={email}
                      onChange={
                        (
                          event
                        ) =>
                          setEmail(
                            event.target.value
                          )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="
                        h-16
                        w-full
                        rounded-2xl
                        border
                        border-white/[0.10]
                        bg-[#101524]/80
                        pl-14
                        pr-5
                        text-base
                        text-white
                        outline-none
                        transition
                        placeholder:text-slate-600
                        hover:border-white/[0.16]
                        focus:border-cyan-400/50
                        focus:bg-[#111827]
                        focus:ring-4
                        focus:ring-cyan-400/[0.06]
                      "
                    />

                  </div>

                </div>


                <div>

                  <label
                    className="
                      mb-3
                      block
                      text-sm
                      font-medium
                      text-slate-300
                    "
                  >

                    Password

                  </label>


                  <div
                    className="
                      relative
                    "
                  >

                    <Lock
                      size={20}
                      className="
                        pointer-events-none
                        absolute
                        left-5
                        top-1/2
                        -translate-y-1/2
                        text-slate-500
                      "
                    />


                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={
                        (
                          event
                        ) =>
                          setPassword(
                            event.target.value
                          )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="
                        h-16
                        w-full
                        rounded-2xl
                        border
                        border-white/[0.10]
                        bg-[#101524]/80
                        pl-14
                        pr-14
                        text-base
                        text-white
                        outline-none
                        transition
                        placeholder:text-slate-600
                        hover:border-white/[0.16]
                        focus:border-violet-400/50
                        focus:bg-[#111827]
                        focus:ring-4
                        focus:ring-violet-400/[0.06]
                      "
                    />


                    <button
                      type="button"
                      onClick={
                        () =>
                          setShowPassword(
                            (
                              value
                            ) =>
                              !value
                          )
                      }
                      className="
                        absolute
                        right-5
                        top-1/2
                        -translate-y-1/2
                        text-slate-500
                        transition
                        hover:text-cyan-300
                      "
                    >

                      {showPassword
                        ? (
                          <EyeOff
                            size={20}
                          />
                        )
                        : (
                          <Eye
                            size={20}
                          />
                        )}

                    </button>

                  </div>


                  <div
                    className="
                      mt-4
                      flex
                      justify-end
                    "
                  >

                    <button
                      type="button"
                      className="
                        text-sm
                        font-medium
                        text-violet-400
                        transition
                        hover:text-violet-300
                      "
                    >

                      Forgot password?

                    </button>

                  </div>

                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    flex
                    h-16
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-500
                    via-blue-500
                    to-violet-500
                    text-base
                    font-semibold
                    text-white
                    shadow-[0_18px_45px_rgba(79,70,229,0.28)]
                    transition
                    hover:brightness-110
                    hover:shadow-[0_22px_55px_rgba(79,70,229,0.38)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading
                    ? "Signing in..."
                    : "Sign In to HireSense"}


                  {!loading && (

                    <ArrowRight
                      size={21}
                      className="
                        transition
                        group-hover:translate-x-1
                      "
                    />

                  )}

                </button>

              </form>


              <div
                className="
                  mt-8
                  text-center
                  text-sm
                  text-slate-500
                "
              >

                Don&apos;t have an account?


                <Link
                  to="/signup"
                  className="
                    ml-2
                    font-semibold
                    text-violet-400
                    transition
                    hover:text-violet-300
                  "
                >

                  Create one

                </Link>

              </div>

            </div>

          </section>

        </main>

      </div>

    );

  }


  /* =========================================================
     MODERN UI
  ========================================================= */

  return (

    <div
      className="
        min-h-screen
        bg-[#f8faff]
        text-[#182338]
      "
    >

      <div
        className="
          grid
          min-h-screen
          lg:grid-cols-2
        "
      >

        <section
          className="
            hidden
            bg-[#132946]
            p-12
            text-white
            lg:flex
            lg:flex-col
            lg:justify-center
          "
        >

          <div
            className="
              mb-10
              flex
              items-center
              gap-3
            "
          >

            <BrainCircuit
              className="
                text-[#8eb5ff]
              "
            />

            <span
              className="
                text-xl
                font-bold
              "
            >

              HireSense AI

            </span>

          </div>


          <h1
            className="
              text-6xl
              font-semibold
              leading-tight
            "
          >

            Build your career with

            <span
              className="
                block
                text-[#8eb5ff]
              "
            >

              intelligent insights.

            </span>

          </h1>

        </section>


        <section
          className="
            relative
            flex
            items-center
            justify-center
            p-6
          "
        >

          <button
            type="button"
            onClick={
              switchAuthStyle
            }
            className="
              absolute
              right-6
              top-6
              rounded-xl
              border
              border-[#dce4f2]
              bg-white
              px-4
              py-2
              text-xs
              font-semibold
              text-[#53627a]
            "
          >

            Switch to HireSense UI

          </button>


          <form
            onSubmit={
              handleLogin
            }
            className="
              w-full
              max-w-md
              space-y-5
            "
          >

            <h2
              className="
                text-3xl
                font-semibold
              "
            >

              Welcome back

            </h2>


            <input
              type="email"
              value={email}
              onChange={
                (
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
              }
              placeholder="Email address"
              className="
                h-14
                w-full
                rounded-xl
                border
                border-slate-200
                px-4
              "
            />


            <input
              type="password"
              value={password}
              onChange={
                (
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
              }
              placeholder="Password"
              className="
                h-14
                w-full
                rounded-xl
                border
                border-slate-200
                px-4
              "
            />


            <button
              type="submit"
              disabled={loading}
              className="
                h-14
                w-full
                rounded-xl
                bg-[#466fc9]
                font-semibold
                text-white
              "
            >

              {loading
                ? "Signing in..."
                : "Sign In to HireSense"}

            </button>


            <Link
              to="/signup"
              className="
                block
                text-center
                text-sm
                text-[#466fc9]
              "
            >

              Create an account

            </Link>

          </form>

        </section>

      </div>

    </div>

  );

}


/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: ReactNode;
  title: ReactNode;
  description: string;
  accent: "cyan" | "violet";
}) {

  const accentClass =
    accent === "cyan"
      ? `
        border-cyan-400/20
        hover:border-cyan-400/40
      `
      : `
        border-violet-400/20
        hover:border-violet-400/40
      `;


  const iconClass =
    accent === "cyan"
      ? `
        bg-cyan-400/[0.08]
        text-cyan-300
      `
      : `
        bg-violet-500/[0.10]
        text-violet-300
      `;


  return (

    <div
      className={`
        min-h-[190px]
        rounded-[24px]
        border
        bg-[#0e1424]/75
        p-6
        backdrop-blur-xl
        transition
        hover:-translate-y-1
        ${accentClass}
      `}
    >

      <div
        className={`
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >

        {icon}

      </div>


      <h3
        className="
          mt-5
          text-base
          font-semibold
          leading-6
          text-white
        "
      >

        {title}

      </h3>


      <p
        className="
          mt-3
          text-sm
          leading-6
          text-slate-500
        "
      >

        {description}

      </p>

    </div>

  );

}


export default Login;