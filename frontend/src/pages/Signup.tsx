import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";

import "./Signup.css";


const API_BASE_URL =
  "http://127.0.0.1:8000";


type SignupForm = {

  username: string;

  email: string;

  password: string;

  confirmPassword: string;

};


function Signup() {

  const navigate =
    useNavigate();


  const {
    login,
  } = useAuth();


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    isLightMode,
    setIsLightMode,
  ] = useState(false);


  const [
    formData,
    setFormData,
  ] = useState<SignupForm>({

    username:
      "",

    email:
      "",

    password:
      "",

    confirmPassword:
      "",

  });


  function handleChange(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      previous => ({

        ...previous,

        [name]:
          value,

      })
    );


    setError("");


    setSuccess("");

  }


  function validateForm() {

    const username =
      formData.username.trim();


    const email =
      formData.email.trim();


    if (!username) {

      setError(
        "Please enter your full name."
      );

      return false;

    }


    if (username.length < 2) {

      setError(
        "Your name must contain at least 2 characters."
      );

      return false;

    }


    if (!email) {

      setError(
        "Please enter your email address."
      );

      return false;

    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        email
      )
    ) {

      setError(
        "Please enter a valid email address."
      );

      return false;

    }


    if (!formData.password) {

      setError(
        "Please create a password."
      );

      return false;

    }


    if (
      formData.password.length < 6
    ) {

      setError(
        "Password must contain at least 6 characters."
      );

      return false;

    }


    if (
      formData.password
      !==
      formData.confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return false;

    }


    return true;

  }


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (
      !validateForm()
    ) {

      return;

    }


    setLoading(true);


    setError("");


    setSuccess("");


    try {

      const response =
        await fetch(

          `${API_BASE_URL}/auth/signup`,

          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                username:
                  formData
                    .username
                    .trim(),

                email:
                  formData
                    .email
                    .trim()
                    .toLowerCase(),

                password:
                  formData.password,

              }),

          }

        );


      let data;


      try {

        data =
          await response.json();

      }

      catch {

        data = {};

      }


      if (!response.ok) {

        throw new Error(

          data.detail
          ||
          data.message
          ||
          "Unable to create your account."

        );

      }


      const token =
        data.token
        ||
        data.access_token;


      const user =
        data.user
        ||
        {

          email:
            formData
              .email
              .trim()
              .toLowerCase(),

        };


      if (!token) {

        throw new Error(
          "Account created, but no authentication token was returned."
        );

      }


      login(
        user,
        token
      );


      setSuccess(
        "Account created successfully. Redirecting..."
      );


      setTimeout(

        () => {

          navigate(
            "/dashboard",
            {
              replace:
                true,
            }
          );

        },

        800

      );

    }

    catch (
      err:
        unknown
    ) {

      const message =
        err instanceof Error

          ?

          err.message

          :

          "Something went wrong while creating your account.";


      setError(
        message
      );

    }

    finally {

      setLoading(
        false
      );

    }

  }


  return (

    <div
      className={
        isLightMode

          ?

          "signup-page signup-light-mode"

          :

          "signup-page"
      }
    >


      <div
        className="signup-background-grid"
      />


      <div
        className="signup-background-glow signup-glow-one"
      />


      <div
        className="signup-background-glow signup-glow-two"
      />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="signup-header"
      >

        <button
          type="button"
          className="signup-brand"
          onClick={
            () =>
              navigate(
                "/login"
              )
          }
        >

          <div
            className="signup-brand-icon"
          >

            <BrainCircuit
              size={22}
            />

          </div>


          <div
            className="signup-brand-text"
          >

            <span>
              HireSense
              <strong>
                AI
              </strong>
            </span>


            <small>
              AI CAREER INTELLIGENCE
            </small>

          </div>

        </button>


        <div
          className="signup-header-actions"
        >

          <button
            type="button"
            className="signup-theme-button"
            onClick={
              () =>
                setIsLightMode(
                  previous =>
                    !previous
                )
            }
          >

            {isLightMode

              ?

              <Moon
                size={16}
              />

              :

              <Sun
                size={16}
              />

            }


            Switch to Modern UI

          </button>


          <button
            type="button"
            className="signup-header-login"
            onClick={
              () =>
                navigate(
                  "/login"
                )
            }
          >

            Sign In

          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="signup-main"
      >


        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <section
          className="signup-hero-section"
        >

          <div
            className="signup-status-pill"
          >

            <Sparkles
              size={14}
            />

            START YOUR CAREER INTELLIGENCE JOURNEY

          </div>


          <h1>

            Turn every
            <br />

            interview into

            <span>
              your advantage.
            </span>

          </h1>


          <p>

            Build your professional profile,
            prepare with AI, analyze your performance,
            and make smarter career decisions.

          </p>


          <div
            className="signup-feature-cards"
          >


            <div
              className="signup-feature-card"
            >

              <div
                className="signup-feature-icon"
              >

                <BrainCircuit
                  size={21}
                />

              </div>


              <div>

                <h3>
                  AI Intelligence
                </h3>


                <p>
                  Adaptive interview analysis.
                </p>

              </div>

            </div>


            <div
              className="signup-feature-card"
            >

              <div
                className="signup-feature-icon cyan"
              >

                <BarChart3
                  size={21}
                />

              </div>


              <div>

                <h3>
                  Analytics
                </h3>


                <p>
                  Track your career growth.
                </p>

              </div>

            </div>


            <div
              className="signup-feature-card"
            >

              <div
                className="signup-feature-icon purple"
              >

                <ShieldCheck
                  size={21}
                />

              </div>


              <div>

                <h3>
                  Secure
                </h3>


                <p>
                  Your data stays protected.
                </p>

              </div>

            </div>


          </div>

        </section>


        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <section
          className="signup-auth-section"
        >

          <div
            className="signup-auth-card"
          >


            <div
              className="signup-auth-heading"
            >

              <div
                className="signup-heading-icon"
              >

                <User
                  size={24}
                />

              </div>


              <div>

                <h2>
                  Create your account
                </h2>


                <p>
                  Start your HireSense AI journey.
                </p>

              </div>

            </div>


            {/* TABS */}

            <div
              className="signup-tabs"
            >

              <button
                type="button"
                className="signup-tab"
                onClick={
                  () =>
                    navigate(
                      "/login"
                    )
                }
              >

                Login

              </button>


              <button
                type="button"
                className="signup-tab signup-tab-active"
              >

                Sign Up

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="signup-form"
            >


              {/* FULL NAME */}

              <div
                className="signup-input-group"
              >

                <label
                  htmlFor="username"
                >
                  Full Name
                </label>


                <div
                  className="signup-input-wrapper"
                >

                  <User
                    size={18}
                  />


                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={
                      formData.username
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="name"
                    disabled={
                      loading
                    }
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div
                className="signup-input-group"
              >

                <label
                  htmlFor="email"
                >
                  Email Address
                </label>


                <div
                  className="signup-input-wrapper"
                >

                  <Mail
                    size={18}
                  />


                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="email"
                    disabled={
                      loading
                    }
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div
                className="signup-input-group"
              >

                <label
                  htmlFor="password"
                >
                  Password
                </label>


                <div
                  className="signup-input-wrapper"
                >

                  <Lock
                    size={18}
                  />


                  <input
                    id="password"
                    type={
                      showPassword

                        ?

                        "text"

                        :

                        "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    disabled={
                      loading
                    }
                  />


                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={
                      () =>
                        setShowPassword(
                          previous =>
                            !previous
                        )
                    }
                  >

                    {showPassword

                      ?

                      <EyeOff
                        size={18}
                      />

                      :

                      <Eye
                        size={18}
                      />

                    }

                  </button>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div
                className="signup-input-group"
              >

                <label
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>


                <div
                  className="signup-input-wrapper"
                >

                  <Lock
                    size={18}
                  />


                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword

                        ?

                        "text"

                        :

                        "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    disabled={
                      loading
                    }
                  />


                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={
                      () =>
                        setShowConfirmPassword(
                          previous =>
                            !previous
                        )
                    }
                  >

                    {showConfirmPassword

                      ?

                      <EyeOff
                        size={18}
                      />

                      :

                      <Eye
                        size={18}
                      />

                    }

                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <div
                  className="signup-message signup-error"
                >

                  <AlertCircle
                    size={18}
                  />


                  <span>
                    {error}
                  </span>

                </div>

              )}


              {/* SUCCESS */}

              {success && (

                <div
                  className="signup-message signup-success"
                >

                  <CheckCircle2
                    size={18}
                  />


                  <span>
                    {success}
                  </span>

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="signup-submit-button"
                disabled={
                  loading
                }
              >

                {loading

                  ?

                  <>

                    <Loader2
                      size={20}
                      className="signup-spin"
                    />

                    Creating account...

                  </>

                  :

                  <>

                    Create HireSense Account

                    <ArrowRight
                      size={20}
                    />

                  </>

                }

              </button>

            </form>


            <div
              className="signup-bottom-text"
            >

              Already have an account?

              <button
                type="button"
                onClick={
                  () =>
                    navigate(
                      "/login"
                    )
                }
              >

                Sign in

              </button>

            </div>


          </div>

        </section>


      </main>

    </div>

  );

}


export default Signup;