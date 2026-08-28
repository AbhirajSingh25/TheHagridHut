const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

async function request(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          data?.error ||
          `API Error ${response.status}`
      );
    }

    return data;

  } catch (error) {
    console.error(
      "API Error:",
      error
    );

    throw error;
  }
}

/* ====================================
   AUTH
==================================== */

export async function signup(
  username: string,
  email: string,
  password: string
) {
  return request(
    "/auth/signup",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }
  );
}

export async function login(
  email: string,
  password: string
) {
  return request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
}

/* ====================================
   DASHBOARD
==================================== */

export async function getDashboardStats() {
  return request(
    "/dashboard"
  );
}

/* ====================================
   INTERVIEW
==================================== */

export async function generateQuestions(
  role: string,
  level: string = "Intermediate"
) {
  return request(
    "/generate-questions",
    {
      method: "POST",
      body: JSON.stringify({
        role,
        level,
      }),
    }
  );
}

/*
   Starts the interview by generating
   the first interview question.

   This avoids requiring a separate
   backend endpoint just to begin.
*/
export async function startInterview(
  role: string,
  level: string
) {
  const data =
    await generateQuestions(
      role,
      level
    );

  const questions =
    Array.isArray(data)
      ? data
      : data?.questions || [];

  return {
    question:
      questions[0] ||
      `Tell me about yourself and why you are interested in the ${role} role.`,
    questions,
  };
}

/*
   Generates the next adaptive question.

   The existing backend already has:
   /api/interview/generate-followup

   So we reuse that endpoint instead
   of inventing another backend route.
*/
export async function getNextQuestion(
  role: string,
  level: string,
  previousQuestion: string,
  previousAnswer: string
) {
  return request(
    "/api/interview/generate-followup",
    {
      method: "POST",
      body: JSON.stringify({
        role,
        level,
        question: previousQuestion,
        answer: previousAnswer,
      }),
    }
  );
}

/*
   speechMetrics is optional because
   LiveInterview currently calls this
   function with only question + answer.
*/
export async function aiEvaluate(
  question: string,
  answer: string,
  speechMetrics: any = null
) {
  const payload: any = {
    question,
    answer,
  };

  if (speechMetrics) {
    payload.speech_metrics =
      speechMetrics;
  }

  return request(
    "/api/interview/evaluate-answer",
    {
      method: "POST",
      body: JSON.stringify(
        payload
      ),
    }
  );
}

export async function generateFollowupQuestion(
  question: string,
  answer: string,
  role: string,
  level: string
) {
  return request(
    "/api/interview/generate-followup",
    {
      method: "POST",
      body: JSON.stringify({
        question,
        answer,
        role,
        level,
      }),
    }
  );
}

export async function generateInterviewReport(
  data: {
    role: string;
    level: string;
    questions: string[];
    answers: string[];
    evaluations: any[];
  }
) {
  return request(
    "/api/interview/generate-report",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function saveInterview(
  data: {
    role: string;
    level: string;
    questions: string[];
    answers: string[];
    evaluations: any[];
    final_report?: Record<string, any> | null;
    resume_score?: number;
    jd_match_score?: number;
    speech_score?: number;
    filler_words?: number;
    speaking_speed?: number;
    pause_score?: number;
    pronunciation_score?: number;
    hiring_probability?: number;
    candidate_score?: number;
    recruiter_recommendation?: string;
    expected_salary?: string;
    certificate_id?: string;
  }
) {
  return request(
    "/api/interview/save-interview",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function getInterviewHistory() {
  return request(
    "/api/interview/history"
  );
}

/* ====================================
   SPEECH AI
==================================== */

export async function analyzeSpeech(
  formData: FormData
) {
  const token =
    localStorage.getItem("token");

  const response =
    await fetch(
      `${API_BASE_URL}/api/speech/analyze`,
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Speech API Error:",
      response.status,
      errorText
    );

    throw new Error(
      `Speech analysis failed: ${response.status}`
    );
  }

  return response.json();
}

/* ====================================
   VISION AI
==================================== */

export async function analyzeVision(
  formData: FormData
) {
  const token =
    localStorage.getItem("token");

  const response =
    await fetch(
      `${API_BASE_URL}/vision/analyze`,
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Vision API Error:",
      response.status,
      errorText
    );

    throw new Error(
      `Vision analysis failed: ${response.status}`
    );
  }

  return response.json();
}

/* ====================================
   AI COPILOT
==================================== */

export async function askAICopilot(
  message: string
) {
  return request(
    "/api/ai-copilot",
    {
      method: "POST",
      body: JSON.stringify({
        message,
      }),
    }
  );
}

/* ====================================
   REPORTS / SESSIONS
==================================== */

export async function getFinalReport() {
  return request(
    "/final-report"
  );
}

export async function getInterviewSessions() {
  return request(
    "/api/interview/history"
  );
}

export async function getInterviewSession(
  id: string
) {
  return request(
    `/api/interview/session/${id}`
  );
}

export async function getLatestReport() {
  return request(
    "/api/interview/latest-report"
  );
}

/* ====================================
   LEADERBOARD
==================================== */

export async function getLeaderboard() {
  return request(
    "/leaderboard"
  );
}

/* ====================================
   ADMIN
==================================== */

export async function getAdminStats() {
  return request(
    "/admin/stats"
  );
}

/* ====================================
   HIRING PROBABILITY
==================================== */

export async function getHiringProbability(
  confidence: number,
  communication: number,
  technical: number
) {
  return request(
    "/api/hiring-probability",
    {
      method: "POST",
      body: JSON.stringify({
        confidence,
        communication,
        technical,
      }),
    }
  );
}

/* ====================================
   RECRUITER
==================================== */

export async function getRecruiterDashboard() {
  return request(
    "/api/recruiter-dashboard"
  );
}

export async function getRecruiterInsights() {
  return request(
    "/recruiter-insights"
  );
}

/* ====================================
   ACHIEVEMENTS
==================================== */

export async function getAchievements() {
  return request(
    "/achievements"
  );
}

/* ====================================
   CERTIFICATE
==================================== */

export function downloadCertificate(
  candidateName: string,
  score: number
) {
  window.open(
    `${API_BASE_URL}/certificate/${candidateName}/${score}`,
    "_blank"
  );
}

/* ====================================
   ANALYTICS
==================================== */

export async function getAnalytics() {
  return request(
    "/analytics"
  );
}

/* ====================================
   PLAYBACK
==================================== */

export async function getPlayback(
  sessionId: string
) {
  return request(
    `/api/interview/playback/${sessionId}`
  );
}

/* ====================================
   CANDIDATE INTELLIGENCE
==================================== */

export async function getCandidateIntelligence() {
  return request(
    "/api/candidate/intelligence"
  );
}