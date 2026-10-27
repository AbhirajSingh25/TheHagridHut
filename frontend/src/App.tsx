import type {
  ReactNode,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


import {
  useAuth,
} from "./context/AuthContext";


/* =========================================================
   LAYOUT
========================================================= */

import HireSenseBackground
  from "./components/effects/HireSenseBackground";


/* =========================================================
   PROTECTED ROUTE
========================================================= */

import ProtectedRoute
  from "./components/ProtectedRoute";


/* =========================================================
   AUTHENTICATION
========================================================= */

import Login
  from "./pages/Login";

import Signup
  from "./pages/Signup";

import Home
  from "./pages/Home";


/* =========================================================
   CORE WORKSPACE
========================================================= */

import Dashboard
  from "./pages/Dashboard";

import Profile
  from "./pages/Profile";

import Settings
  from "./pages/Settings";

import Notifications
  from "./pages/Notifications";

import HistoryPage
  from "./pages/History";


/* =========================================================
   RESUME INTELLIGENCE
========================================================= */

import ResumeAnalyzer
  from "./pages/ResumeAnalyzer";

import JDMatcher
  from "./pages/JDMatcher";


/* =========================================================
   INTERVIEW SYSTEM
========================================================= */

import LiveInterview
  from "./pages/LiveInterview";

import PracticeMode
  from "./pages/PracticeMode";

import InterviewPlayback
  from "./pages/InterviewPlayback";

import CompanyInterview
  from "./pages/CompanyInterview";


/* =========================================================
   AI INTELLIGENCE
========================================================= */

import SpeechIntelligence
  from "./pages/SpeechIntelligence";

import VisionAnalysis
  from "./pages/VisionAnalysis";

import Analytics
  from "./pages/Analytics";

import AICopilot
  from "./pages/AICopilot";

import CandidateIntelligence
  from "./pages/CandidateIntelligence";


/* =========================================================
   PERFORMANCE
========================================================= */

import Reports
  from "./pages/Reports";

import HiringProbability
  from "./pages/HiringProbability";

import Leaderboard
  from "./pages/Leaderboard";

import Certificate
  from "./pages/Certificate";

import Achievements
  from "./pages/Achievements";


/* =========================================================
   EXTENDED WORKSPACE
========================================================= */

import RecruiterDashboard
  from "./pages/RecruiterDashboard";

import AdminPanel
  from "./pages/AdminPanel";


/* =========================================================
   FALLBACK
========================================================= */

import UnavailableRoute
  from "./pages/UnavailableRoute";


/* =========================================================
   OPTIONAL AUTH PAGE WRAPPER
========================================================= */

function AuthPage({
  children,
}: {
  children: ReactNode;
}) {

  const {
    isLoading,
  } =
    useAuth();


  if (
    isLoading
  ) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#1E252B] text-sm text-[#C4D2D5] font-serif">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#D6A879] animate-ping" />
          <span>Entering Hagrid's Hut...</span>
        </div>
      </div>

    );

  }


  /*
    IMPORTANT:

    We intentionally do NOT redirect
    authenticated users to /dashboard here.

    This allows you to manually visit:

    /login
    /signup

    even if you are already logged in.

    Useful for testing both authentication
    UI designs.
  */


  return (

    <>

      {children}

    </>

  );

}


/* =========================================================
   APPLICATION
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <HireSenseBackground />


      <Routes>


        {/* =================================================
            ROOT
        ================================================= */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/login"
          element={

            <AuthPage>

              <Login />

            </AuthPage>

          }
        />


        <Route
          path="/signup"
          element={

            <AuthPage>

              <Signup />

            </AuthPage>

          }
        />


        {/* =================================================
            MAIN WORKSPACE
        ================================================= */}

        <Route
          path="/dashboard"
          element={

            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>

          }
        />


        <Route
          path="/profile"
          element={

            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>

          }
        />


        <Route
          path="/settings"
          element={

            <ProtectedRoute>

              <Settings />

            </ProtectedRoute>

          }
        />


        <Route
          path="/notifications"
          element={

            <ProtectedRoute>

              <Notifications />

            </ProtectedRoute>

          }
        />


        <Route
          path="/history"
          element={

            <ProtectedRoute>

              <HistoryPage />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            RESUME INTELLIGENCE
        ================================================= */}

        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />


        <Route
          path="/jd-matcher"
          element={

            <ProtectedRoute>

              <JDMatcher />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            INTERVIEW SYSTEM
        ================================================= */}

        <Route
          path="/mock-interview"
          element={

            <ProtectedRoute>

              <LiveInterview />

            </ProtectedRoute>

          }
        />


        <Route
          path="/live-interview"
          element={

            <ProtectedRoute>

              <LiveInterview />

            </ProtectedRoute>

          }
        />


        <Route
          path="/company-interview"
          element={

            <ProtectedRoute>

              <CompanyInterview />

            </ProtectedRoute>

          }
        />


        <Route
          path="/practice"
          element={

            <ProtectedRoute>

              <PracticeMode />

            </ProtectedRoute>

          }
        />


        <Route
          path="/playback/:id"
          element={

            <ProtectedRoute>

              <InterviewPlayback />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            AI INTELLIGENCE
        ================================================= */}

        <Route
          path="/speech-intelligence"
          element={
            <ProtectedRoute>
              <SpeechIntelligence />
            </ProtectedRoute>
          }
        />

        <Route
          path="/speech"
          element={
            <ProtectedRoute>
              <SpeechIntelligence />
            </ProtectedRoute>
          }
        />


        <Route
          path="/vision-analysis"
          element={

            <ProtectedRoute>

              <VisionAnalysis />

            </ProtectedRoute>

          }
        />


        <Route
          path="/analytics"
          element={

            <ProtectedRoute>

              <Analytics />

            </ProtectedRoute>

          }
        />


        <Route
          path="/candidate-intelligence"
          element={

            <ProtectedRoute>

              <CandidateIntelligence />

            </ProtectedRoute>

          }
        />


        <Route
          path="/copilot"
          element={

            <ProtectedRoute>

              <AICopilot />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <Route
          path="/reports"
          element={

            <ProtectedRoute>

              <Reports />

            </ProtectedRoute>

          }
        />


        <Route
          path="/hiring-probability"
          element={

            <ProtectedRoute>

              <HiringProbability />

            </ProtectedRoute>

          }
        />


        <Route
          path="/leaderboard"
          element={

            <ProtectedRoute>

              <Leaderboard />

            </ProtectedRoute>

          }
        />


        <Route
          path="/certificate"
          element={

            <ProtectedRoute>

              <Certificate />

            </ProtectedRoute>

          }
        />


        <Route
          path="/achievements"
          element={

            <ProtectedRoute>

              <Achievements />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            EXTENDED WORKSPACE
        ================================================= */}

        <Route
          path="/recruiter"
          element={

            <ProtectedRoute>

              <RecruiterDashboard />

            </ProtectedRoute>

          }
        />


        <Route
          path="/admin"
          element={

            <ProtectedRoute>

              <AdminPanel />

            </ProtectedRoute>

          }
        />


        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={

            <ProtectedRoute>

              <UnavailableRoute />

            </ProtectedRoute>

          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;