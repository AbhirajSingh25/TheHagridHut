import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Activity,
  AudioLines,
  Brain,
  BriefcaseBusiness,
  ChevronDown,
  Clock3,
  Gauge,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Square,
  Volume2,
  Waves,
  X,
  Zap,
} from "lucide-react";

import {
  aiEvaluate,
  getNextQuestion,
  startInterview as startInterviewRequest,
} from "../services/api";


/* =========================================================
   TYPES
   ========================================================= */

type SpeechRecognitionInstance = {
  start: () => void;
  stop: () => void;
  abort: () => void;

  continuous: boolean;
  interimResults: boolean;
  lang: string;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
};


/* =========================================================
   CONFIGURATION
   ========================================================= */

const ROLES = [
  "Software Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "Cybersecurity Analyst",
];

const LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const INITIAL_QUESTION =
  "Tell me about yourself and walk me through the experience that makes you a strong fit for this role.";


/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}


/* =========================================================
   LIVE INTERVIEW
   ========================================================= */

function LiveInterview() {

  /* =======================================================
     REFS
     ======================================================= */

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(null);

  const finalTranscriptRef =
    useRef("");

  const wasPausedRef =
    useRef(false);


  /* =======================================================
     INTERVIEW SETUP
     ======================================================= */

  const [
    role,
    setRole,
  ] = useState("Software Engineer");

  const [
    level,
    setLevel,
  ] = useState("Intermediate");

  const [
    roleMenuOpen,
    setRoleMenuOpen,
  ] = useState(false);

  const [
    levelMenuOpen,
    setLevelMenuOpen,
  ] = useState(false);


  /* =======================================================
     SESSION STATE
     ======================================================= */

  const [
    sessionStarted,
    setSessionStarted,
  ] = useState(false);

  const [
    sessionPaused,
    setSessionPaused,
  ] = useState(false);

  const [
    sessionEnded,
    setSessionEnded,
  ] = useState(false);

  const [
    listening,
    setListening,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0);


  /* =======================================================
     QUESTION STATE
     ======================================================= */

  const [
    question,
    setQuestion,
  ] = useState(INITIAL_QUESTION);

  const [
    questionNumber,
    setQuestionNumber,
  ] = useState(1);

  const [
    questionsCompleted,
    setQuestionsCompleted,
  ] = useState(0);

  const [
    questionChanging,
    setQuestionChanging,
  ] = useState(false);


  /* =======================================================
     VOICE / TRANSCRIPT
     ======================================================= */

  const [
    transcript,
    setTranscript,
  ] = useState("");

  const [
    interimTranscript,
    setInterimTranscript,
  ] = useState("");

  const [
    micLevel,
    setMicLevel,
  ] = useState(0);


  /* =======================================================
     AI EVALUATION
     ======================================================= */

  const [
    confidence,
    setConfidence,
  ] = useState(0);

  const [
    communication,
    setCommunication,
  ] = useState(0);

  const [
    technical,
    setTechnical,
  ] = useState(0);

  const [
    overall,
    setOverall,
  ] = useState(0);

  const [
    aiFeedback,
    setAiFeedback,
  ] = useState(
    "The AI interviewer is ready. Start the session and speak naturally."
  );


  /* =======================================================
     SESSION TIMER
     ======================================================= */

  useEffect(() => {

    if (
      !sessionStarted ||
      sessionPaused ||
      sessionEnded
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {

        setElapsedSeconds(
          (previous) =>
            previous + 1
        );

      }, 1000);


    return () => {
      window.clearInterval(timer);
    };

  }, [
    sessionStarted,
    sessionPaused,
    sessionEnded,
  ]);


  /* =======================================================
     ORB / VOICE ANIMATION
     ======================================================= */

  useEffect(() => {

    if (!listening) {

      setMicLevel(0);

      return;
    }


    const interval =
      window.setInterval(() => {

        setMicLevel(
          25 + Math.random() * 75
        );

      }, 180);


    return () => {
      window.clearInterval(interval);
    };

  }, [listening]);


  /* =======================================================
     CLEANUP
     ======================================================= */

  useEffect(() => {

    return () => {

      recognitionRef.current?.abort();

    };

  }, []);


  /* =======================================================
     SPEECH RECOGNITION
     ======================================================= */

  function getSpeechRecognition() {

    const BrowserWindow =
      window as any;

    return (
      BrowserWindow.SpeechRecognition ||
      BrowserWindow.webkitSpeechRecognition
    );

  }


  function startListening() {

    if (sessionPaused) {
      return;
    }

    if (recognitionRef.current) {
      return;
    }


    const SpeechRecognition =
      getSpeechRecognition();


    if (!SpeechRecognition) {

      setAiFeedback(
        "Speech recognition is not supported by this browser. Use Chrome or Edge for voice interaction."
      );

      return;

    }


    const recognition =
      new SpeechRecognition() as SpeechRecognitionInstance;


    recognition.continuous =
      true;

    recognition.interimResults =
      true;

    recognition.lang =
      "en-US";


    recognitionRef.current =
      recognition;


    recognition.onstart = () => {

      setListening(true);

    };


    recognition.onresult = (
      event: any
    ) => {

      let finalText = "";
      let interimText = "";


      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {

        const result =
          event.results[index];


        const spokenText =
          result[0].transcript;


        if (result.isFinal) {

          finalText +=
            spokenText + " ";

        } else {

          interimText +=
            spokenText + " ";

        }

      }


      if (finalText.trim()) {

        finalTranscriptRef.current =
          `${finalTranscriptRef.current} ${finalText}`.trim();


        setTranscript(
          finalTranscriptRef.current
        );

      }


      setInterimTranscript(
        interimText.trim()
      );

    };


    recognition.onerror = () => {

      setListening(false);

      recognitionRef.current =
        null;

    };


    recognition.onend = () => {

      setListening(false);

      recognitionRef.current =
        null;


      if (
        !wasPausedRef.current &&
        sessionStarted &&
        !sessionEnded &&
        !sessionPaused
      ) {

        window.setTimeout(
          () => {

            if (
              !recognitionRef.current &&
              !sessionPaused
            ) {

              startListening();

            }

          },
          300
        );

      }

    };


    recognition.start();

  }


  function stopListening() {

    wasPausedRef.current =
      true;

    recognitionRef.current?.stop();

    recognitionRef.current =
      null;

    setListening(false);

  }


  /* =======================================================
     START INTERVIEW
     ======================================================= */

  async function handleStartInterview() {

    if (loading) {
      return;
    }


    try {

      setLoading(true);

      setAiFeedback(
        "Preparing your AI interviewer..."
      );


      const response =
        await startInterviewRequest(
          role,
          level
        );


      const generatedQuestion =
        response?.question ||
        INITIAL_QUESTION;


      setQuestion(
        generatedQuestion
      );

      setQuestionNumber(1);

      setQuestionsCompleted(0);

      setTranscript("");

      setInterimTranscript("");

      finalTranscriptRef.current =
        "";

      setSessionStarted(true);

      setSessionPaused(false);

      setSessionEnded(false);

      wasPausedRef.current =
        false;

      setAiFeedback(
        "Interview started. Take a moment to think, then answer naturally."
      );


      window.setTimeout(
        () => {

          startListening();

        },
        350
      );


    } catch (error) {

      console.error(
        "Failed to start interview:",
        error
      );


      setQuestion(
        INITIAL_QUESTION
      );

      setSessionStarted(true);

      setSessionPaused(false);

      setSessionEnded(false);

      setAiFeedback(
        "The AI question service is unavailable, so the interview has started with a fallback question."
      );


      window.setTimeout(
        () => {

          startListening();

        },
        350
      );


    } finally {

      setLoading(false);

    }

  }


  /* =======================================================
     PAUSE / RESUME
     ======================================================= */

  function handlePauseResume() {

    if (!sessionStarted) {
      return;
    }


    if (sessionPaused) {

      setSessionPaused(false);

      wasPausedRef.current =
        false;

      setAiFeedback(
        "Interview resumed. Continue when you are ready."
      );


      window.setTimeout(
        () => {

          startListening();

        },
        250
      );


      return;

    }


    stopListening();

    setSessionPaused(true);

    setAiFeedback(
      "Interview paused. Your timer and microphone are both paused."
    );

  }


  /* =======================================================
     GENERATE NEW QUESTION
     ======================================================= */

  async function handleChangeQuestion() {

    if (
      loading ||
      questionChanging ||
      !sessionStarted
    ) {
      return;
    }


    try {

      setQuestionChanging(true);

      setLoading(true);


      const response =
        await getNextQuestion(
          role,
          level,
          question,
          transcript ||
            "The candidate requested a different question."
        );


      const newQuestion =
        response?.question;


      if (newQuestion) {

        setQuestion(
          newQuestion
        );

        setQuestionNumber(
          (previous) =>
            previous + 1
        );

        setTranscript("");

        setInterimTranscript("");

        finalTranscriptRef.current =
          "";

        setAiFeedback(
          "A new AI-generated question has been loaded."
        );

      }

    } catch (error) {

      console.error(
        "Failed to change question:",
        error
      );

      setAiFeedback(
        "Unable to generate a new question right now. Try again in a moment."
      );

    } finally {

      setQuestionChanging(false);

      setLoading(false);

    }

  }


  /* =======================================================
     SUBMIT ANSWER + NEXT QUESTION
     ======================================================= */

  async function handleSubmitAnswer() {

    const candidateAnswer =
      transcript.trim();


    if (
      !candidateAnswer ||
      loading ||
      sessionPaused
    ) {
      return;
    }


    try {

      setLoading(true);

      stopListening();

      setAiFeedback(
        "Analyzing your answer..."
      );


      const evaluation =
        await aiEvaluate(
          question,
          candidateAnswer
        );


      const nextConfidence =
        clampScore(
          Number(
            evaluation?.confidence ??
              evaluation?.confidence_score ??
              80
          )
        );

      const nextCommunication =
        clampScore(
          Number(
            evaluation?.communication ??
              evaluation?.communication_score ??
              78
          )
        );

      const nextTechnical =
        clampScore(
          Number(
            evaluation?.technical ??
              evaluation?.technical_score ??
              evaluation?.score ??
              75
          )
        );

      const nextOverall =
        clampScore(
          Number(
            evaluation?.overall ??
              (
                nextConfidence +
                nextCommunication +
                nextTechnical
              ) / 3
          )
        );


      setConfidence(
        nextConfidence
      );

      setCommunication(
        nextCommunication
      );

      setTechnical(
        nextTechnical
      );

      setOverall(
        nextOverall
      );


      setAiFeedback(
        evaluation?.feedback ||
          evaluation?.summary ||
          "Answer analyzed. The AI interviewer is preparing your next question."
      );


      const response =
        await getNextQuestion(
          role,
          level,
          question,
          candidateAnswer
        );


      const nextQuestion =
        response?.question ||
        "Tell me about a difficult problem you solved and explain how you approached it.";


      setQuestion(
        nextQuestion
      );

      setQuestionNumber(
        (previous) =>
          previous + 1
      );

      setQuestionsCompleted(
        (previous) =>
          previous + 1
      );


      setTranscript("");

      setInterimTranscript("");

      finalTranscriptRef.current =
        "";


      if (!sessionPaused) {

        wasPausedRef.current =
          false;

        window.setTimeout(
          () => {

            startListening();

          },
          500
        );

      }


    } catch (error) {

      console.error(
        "Answer analysis failed:",
        error
      );


      setAiFeedback(
        "Your answer was recorded, but live AI evaluation failed. You can continue with the interview."
      );


      setQuestionsCompleted(
        (previous) =>
          previous + 1
      );


      setTranscript("");

      setInterimTranscript("");

      finalTranscriptRef.current =
        "";


      if (!sessionPaused) {

        wasPausedRef.current =
          false;

        startListening();

      }


    } finally {

      setLoading(false);

    }

  }


  /* =======================================================
     SKIP QUESTION
     ======================================================= */

  async function handleSkipQuestion() {

    if (
      !sessionStarted ||
      loading ||
      sessionPaused
    ) {
      return;
    }


    try {

      setLoading(true);

      stopListening();


      const response =
        await getNextQuestion(
          role,
          level,
          question,
          "Candidate skipped this question."
        );


      setQuestion(
        response?.question ||
          "What is one technical decision you made that had a significant impact on a project?"
      );


      setQuestionNumber(
        (previous) =>
          previous + 1
      );


      setTranscript("");

      setInterimTranscript("");

      finalTranscriptRef.current =
        "";


      setAiFeedback(
        "Question skipped. The AI interviewer has moved to a new topic."
      );


      wasPausedRef.current =
        false;


      window.setTimeout(
        () => {

          startListening();

        },
        300
      );


    } catch (error) {

      console.error(
        "Failed to skip question:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  /* =======================================================
     END INTERVIEW
     ======================================================= */

  function handleEndInterview() {

    stopListening();

    setSessionEnded(true);

    setSessionPaused(false);

    setAiFeedback(
      "Interview session ended. Your latest performance signals are preserved on this screen."
    );

  }


  /* =======================================================
     RESTART
     ======================================================= */

  function handleRestart() {

    stopListening();

    setSessionStarted(false);

    setSessionPaused(false);

    setSessionEnded(false);

    setElapsedSeconds(0);

    setQuestion(INITIAL_QUESTION);

    setQuestionNumber(1);

    setQuestionsCompleted(0);

    setTranscript("");

    setInterimTranscript("");

    finalTranscriptRef.current =
      "";

    setConfidence(0);

    setCommunication(0);

    setTechnical(0);

    setOverall(0);

    setAiFeedback(
      "Your AI interviewer is ready for a new session."
    );

  }


  /* =======================================================
     UI HELPERS
     ======================================================= */

  const currentProgress =
    Math.min(
      100,
      questionsCompleted * 20
    );


  const orbScale =
    listening
      ? 1 + micLevel / 1000
      : 1;


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className="
        relative
        min-h-full
        overflow-hidden
        text-white
      "
    >

      {/* ===================================================
          TOP SESSION BAR
          =================================================== */}

      <div
        className="
          mb-5
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#090a10]/80
          px-4
          py-3
          backdrop-blur-xl
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-3
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.025]
              px-3
              py-2
              text-xs
              font-semibold
              text-slate-300
            "
          >
            <span
              className={`
                h-2
                w-2
                rounded-full
                ${
                  sessionEnded
                    ? "bg-red-400"
                    : sessionPaused
                    ? "bg-amber-400"
                    : sessionStarted
                    ? "bg-emerald-400"
                    : "bg-violet-400"
                }
              `}
            />

            {
              sessionEnded
                ? "Session ended"
                : sessionPaused
                ? "Paused"
                : sessionStarted
                ? "Interview active"
                : "Ready to begin"
            }

          </div>


          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              text-slate-500
            "
          >
            <Brain
              size={15}
              className="text-cyan-400"
            />

            AI interviewer

          </div>


          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              text-slate-500
            "
          >
            <AudioLines
              size={15}
              className="text-violet-400"
            />

            Voice environment

          </div>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            text-slate-500
          "
        >
          <Clock3 size={14} />

          {
            sessionEnded
              ? "Session completed"
              : sessionPaused
              ? "Session paused"
              : sessionStarted
              ? "Session in progress"
              : "Session not started"
          }

        </div>

      </div>



      {/* ===================================================
          MAIN GRID
          =================================================== */}

      <div
        className="
          grid
          gap-5
          xl:grid-cols-[minmax(0,1fr)_340px]
        "
      >


        {/* =================================================
            MAIN INTERVIEW PANEL
            ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.07]
            bg-[#090a10]/80
            px-5
            py-6
            backdrop-blur-xl
            sm:px-7
          "
        >

          {/* Background glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[18%]
              h-[420px]
              w-[420px]
              -translate-x-1/2
              rounded-full
              bg-violet-600/[0.05]
              blur-[120px]
            "
          />


          {/* Heading */}

          <div
            className="
              relative
              z-10
              text-center
            "
          >

            <div
              className="
                mb-3
                flex
                items-center
                justify-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.32em]
                text-cyan-300
              "
            >
              <Activity size={13} />

              Recruiter simulation

            </div>


            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              {
                sessionEnded
                  ? "Interview session complete."
                  : sessionStarted
                  ? sessionPaused
                    ? "Your interview is paused."
                    : "Your AI interviewer is listening."
                  : "Your AI interviewer is ready."
              }
            </h1>


            <p
              className="
                mx-auto
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-slate-500
              "
            >
              {
                sessionStarted
                  ? "Speak naturally. The interviewer adapts questions and evaluates communication, confidence, and technical reasoning."
                  : "Choose your role and experience level, then launch the simulation."
              }
            </p>

          </div>



          {/* =================================================
              QUESTION
              ================================================= */}

          {
            sessionStarted &&
            !sessionEnded && (
              <div
                className="
                  relative
                  z-10
                  mx-auto
                  mt-6
                  max-w-4xl
                  rounded-2xl
                  border
                  border-violet-400/15
                  bg-black/20
                  p-4
                  sm:p-5
                "
              >

                <div
                  className="
                    mb-3
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-xl
                        bg-violet-500/10
                        text-violet-300
                      "
                    >
                      <Brain size={15} />
                    </div>


                    <div>

                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.24em]
                          text-violet-300
                        "
                      >
                        Current question
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-600
                        "
                      >
                        Question {questionNumber}

                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >

                    <button
                      type="button"
                      onClick={
                        handleChangeQuestion
                      }
                      disabled={
                        questionChanging ||
                        loading ||
                        sessionPaused
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-white/[0.08]
                        bg-white/[0.025]
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-slate-300
                        transition
                        hover:border-violet-400/30
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <RotateCcw size={14} />

                      Change question

                    </button>


                    <button
                      type="button"
                      onClick={
                        handleSkipQuestion
                      }
                      disabled={
                        loading ||
                        sessionPaused
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-white/[0.08]
                        bg-white/[0.025]
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-slate-400
                        transition
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <SkipForward size={14} />

                      Skip

                    </button>

                  </div>

                </div>


                <p
                  className="
                    text-base
                    leading-relaxed
                    text-slate-200
                    sm:text-lg
                  "
                >
                  {question}
                </p>

              </div>
            )
          }



          {/* =================================================
              AI ORB
              ================================================= */}

          <div
            className="
              relative
              z-10
              mx-auto
              mt-4
              flex
              min-h-[380px]
              max-w-[760px]
              items-center
              justify-center
              sm:min-h-[440px]
            "
          >

            <div
              className={`
                hs-orb
                ${
                  listening
                    ? "hs-orb-listening"
                    : ""
                }
                ${
                  sessionPaused
                    ? "hs-orb-paused"
                    : ""
                }
              `}
              style={{
                transform:
                  `scale(${orbScale})`,
              }}
            >

              <div className="hs-orb-glow" />

              <div className="hs-orb-core" />

              <div className="hs-orb-ring hs-orb-ring-one" />

              <div className="hs-orb-ring hs-orb-ring-two" />

              <div className="hs-orb-ring hs-orb-ring-three" />

              <div className="hs-orb-particle hs-orb-particle-one" />

              <div className="hs-orb-particle hs-orb-particle-two" />

              <div className="hs-orb-particle hs-orb-particle-three" />

              <div className="hs-orb-particle hs-orb-particle-four" />

            </div>

          </div>



          {/* =================================================
              ROLE + LEVEL UNDER ORB
              ================================================= */}

          {
            !sessionStarted && (
              <div
                className="
                  relative
                  z-20
                  mx-auto
                  grid
                  max-w-3xl
                  gap-4
                  sm:grid-cols-2
                "
              >


                {/* ROLE DROPDOWN */}

                <div className="relative">

                  <p
                    className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-cyan-300
                    "
                  >
                    <BriefcaseBusiness size={13} />

                    Target role

                  </p>


                  <button
                    type="button"
                    onClick={() => {

                      setRoleMenuOpen(
                        (previous) =>
                          !previous
                      );

                      setLevelMenuOpen(false);

                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-violet-400/20
                      bg-[#0d0f18]/90
                      px-4
                      py-4
                      text-left
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_0_30px_rgba(124,58,237,0.08)]
                      transition
                      hover:border-violet-400/45
                    "
                  >
                    {role}

                    <ChevronDown
                      size={17}
                      className="
                        text-violet-300
                      "
                    />

                  </button>


                  {
                    roleMenuOpen && (
                      <div
                        className="
                          absolute
                          bottom-[calc(100%+8px)]
                          left-0
                          right-0
                          z-50
                          max-h-72
                          overflow-y-auto
                          rounded-2xl
                          border
                          border-violet-400/20
                          bg-[#0a0b12]
                          p-2
                          shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                        "
                      >

                        {
                          ROLES.map(
                            (item) => (

                              <button
                                key={item}
                                type="button"
                                onClick={() => {

                                  setRole(item);

                                  setRoleMenuOpen(
                                    false
                                  );

                                }}
                                className={`
                                  w-full
                                  rounded-xl
                                  px-3
                                  py-3
                                  text-left
                                  text-sm
                                  transition
                                  ${
                                    role === item
                                      ? "bg-violet-500/15 text-white"
                                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                                  }
                                `}
                              >
                                {item}
                              </button>

                            )
                          )
                        }

                      </div>
                    )
                  }

                </div>



                {/* LEVEL DROPDOWN */}

                <div className="relative">

                  <p
                    className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-cyan-300
                    "
                  >
                    <Gauge size={13} />

                    Experience level

                  </p>


                  <button
                    type="button"
                    onClick={() => {

                      setLevelMenuOpen(
                        (previous) =>
                          !previous
                      );

                      setRoleMenuOpen(false);

                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-cyan-400/15
                      bg-[#0d0f18]/90
                      px-4
                      py-4
                      text-left
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_0_30px_rgba(34,211,238,0.05)]
                      transition
                      hover:border-cyan-400/35
                    "
                  >
                    {level}

                    <ChevronDown
                      size={17}
                      className="
                        text-cyan-300
                      "
                    />

                  </button>


                  {
                    levelMenuOpen && (
                      <div
                        className="
                          absolute
                          bottom-[calc(100%+8px)]
                          left-0
                          right-0
                          z-50
                          rounded-2xl
                          border
                          border-cyan-400/15
                          bg-[#0a0b12]
                          p-2
                          shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                        "
                      >

                        {
                          LEVELS.map(
                            (item) => (

                              <button
                                key={item}
                                type="button"
                                onClick={() => {

                                  setLevel(item);

                                  setLevelMenuOpen(
                                    false
                                  );

                                }}
                                className={`
                                  w-full
                                  rounded-xl
                                  px-3
                                  py-3
                                  text-left
                                  text-sm
                                  transition
                                  ${
                                    level === item
                                      ? "bg-cyan-500/10 text-white"
                                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                                  }
                                `}
                              >
                                {item}
                              </button>

                            )
                          )
                        }

                      </div>
                    )
                  }

                </div>

              </div>
            )
          }



          {/* =================================================
              ACTION CONTROLS
              ================================================= */}

          <div
            className="
              relative
              z-10
              mt-6
              flex
              flex-col
              items-center
              justify-center
              gap-3
            "
          >

            {
              !sessionStarted ? (

                <button
                  type="button"
                  onClick={
                    handleStartInterview
                  }
                  disabled={loading}
                  className="
                    inline-flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-violet-500
                    via-indigo-500
                    to-cyan-500
                    px-7
                    py-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_0_40px_rgba(124,58,237,0.22)]
                    transition
                    hover:scale-[1.02]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Play size={17} />

                  {
                    loading
                      ? "Preparing interview..."
                      : "Start interview"
                  }

                </button>

              ) : sessionEnded ? (

                <button
                  type="button"
                  onClick={
                    handleRestart
                  }
                  className="
                    inline-flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-violet-400/25
                    bg-violet-500/10
                    px-7
                    py-4
                    text-sm
                    font-semibold
                    text-violet-200
                    transition
                    hover:bg-violet-500/15
                  "
                >
                  <RotateCcw size={17} />

                  Start new interview

                </button>

              ) : (

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  <button
                    type="button"
                    onClick={
                      handlePauseResume
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      border-white/[0.09]
                      bg-white/[0.03]
                      px-5
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:border-amber-400/30
                    "
                  >
                    {
                      sessionPaused ? (
                        <>
                          <Play
                            size={17}
                            className="text-emerald-400"
                          />

                          Resume

                        </>
                      ) : (
                        <>
                          <Pause
                            size={17}
                            className="text-amber-400"
                          />

                          Pause

                        </>
                      )
                    }

                  </button>


                  <button
                    type="button"
                    onClick={
                      handleSubmitAnswer
                    }
                    disabled={
                      loading ||
                      sessionPaused ||
                      !transcript.trim()
                    }
                    className="
                      inline-flex
                      items-center
                      gap-3
                      rounded-2xl
                      bg-gradient-to-r
                      from-violet-500
                      to-cyan-500
                      px-6
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_0_35px_rgba(34,211,238,0.12)]
                      transition
                      hover:scale-[1.02]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Zap size={17} />

                    {
                      loading
                        ? "Analyzing..."
                        : "Submit answer"
                    }

                  </button>


                  <button
                    type="button"
                    onClick={
                      handleEndInterview
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      border-red-400/15
                      bg-red-500/[0.04]
                      px-5
                      py-3.5
                      text-sm
                      font-medium
                      text-red-300
                      transition
                      hover:bg-red-500/[0.08]
                    "
                  >
                    <Square size={15} />

                    End

                  </button>

                </div>

              )
            }


            <p
              className="
                text-center
                text-xs
                text-slate-600
              "
            >
              {
                !sessionStarted
                  ? "Voice intelligence activates when the interview begins."
                  : sessionPaused
                  ? "Timer and microphone are paused. Resume whenever you are ready."
                  : listening
                  ? "AI is listening to your answer in real time."
                  : "Microphone is temporarily inactive."
              }
            </p>

          </div>


          {/* =================================================
              FEEDBACK
              ================================================= */}

          <div
            className="
              relative
              z-10
              mx-auto
              mt-6
              max-w-3xl
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.015]
              px-4
              py-3
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <Sparkles
                size={16}
                className="
                  mt-0.5
                  shrink-0
                  text-violet-400
                "
              />

              <div>

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  AI interviewer

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-relaxed
                    text-slate-400
                  "
                >
                  {aiFeedback}
                </p>

              </div>

            </div>

          </div>

        </section>



        {/* =================================================
            RIGHT SIDE PANEL
            ================================================= */}

        <aside
          className="
            space-y-5
          "
        >


          {/* PERFORMANCE */}

          <section
            className="
              rounded-[26px]
              border
              border-white/[0.07]
              bg-[#090a10]/80
              p-5
              backdrop-blur-xl
            "
          >

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.26em]
                    text-violet-300
                  "
                >
                  Live performance

                </p>

                <h2
                  className="
                    mt-2
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Performance signals

                </h2>

              </div>


              <Activity
                size={18}
                className="text-cyan-400"
              />

            </div>


            <PerformanceRow
              label="Technical"
              value={technical}
              color="bg-violet-400"
            />

            <PerformanceRow
              label="Communication"
              value={communication}
              color="bg-cyan-400"
            />

            <PerformanceRow
              label="Confidence"
              value={confidence}
              color="bg-emerald-400"
            />

            <PerformanceRow
              label="Overall"
              value={overall}
              color="bg-amber-400"
            />

          </section>



          {/* TRANSCRIPT */}

          <section
            className="
              rounded-[26px]
              border
              border-white/[0.07]
              bg-[#090a10]/80
              p-5
              backdrop-blur-xl
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.26em]
                    text-emerald-300
                  "
                >
                  Speech intelligence

                </p>

                <h2
                  className="
                    mt-2
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Live transcript

                </h2>

              </div>


              {
                listening ? (
                  <Mic
                    size={17}
                    className="
                      animate-pulse
                      text-emerald-400
                    "
                  />
                ) : (
                  <MicOff
                    size={17}
                    className="text-slate-600"
                  />
                )
              }

            </div>


            <div
              className="
                min-h-[170px]
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/20
                p-4
              "
            >

              {
                transcript ||
                interimTranscript ? (

                  <p
                    className="
                      text-sm
                      leading-relaxed
                      text-slate-300
                    "
                  >

                    {transcript}

                    {
                      interimTranscript && (
                        <span
                          className="
                            text-cyan-300/70
                          "
                        >
                          {" "}
                          {interimTranscript}
                        </span>
                      )
                    }

                  </p>

                ) : (

                  <p
                    className="
                      text-xs
                      leading-relaxed
                      text-slate-600
                    "
                  >
                    {
                      sessionStarted
                        ? "Start speaking. Your live transcript will appear here."
                        : "Start the interview to activate speech intelligence."
                    }
                  </p>

                )
              }

            </div>

          </section>



          {/* INTERVIEW CONTEXT */}

          <section
            className="
              rounded-[26px]
              border
              border-white/[0.07]
              bg-[#090a10]/80
              p-5
              backdrop-blur-xl
            "
          >

            <p
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.26em]
                text-cyan-300
              "
            >
              Interview context

            </p>


            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

              <ContextItem
                label="Role"
                value={role}
              />

              <ContextItem
                label="Level"
                value={level}
              />

              <ContextItem
                label="Questions"
                value={
                  sessionStarted
                    ? `#${questionNumber}`
                    : "--"
                }
              />

              <ContextItem
                label="Status"
                value={
                  sessionEnded
                    ? "Ended"
                    : sessionPaused
                    ? "Paused"
                    : sessionStarted
                    ? "Active"
                    : "Standby"
                }
              />

              <ContextItem
                label="Completed"
                value={
                  sessionStarted
                    ? `${questionsCompleted}`
                    : "--"
                }
              />

              <ContextItem
                label="Voice"
                value={
                  listening
                    ? "Listening"
                    : sessionPaused
                    ? "Paused"
                    : "Ready"
                }
              />

            </div>

          </section>

        </aside>

      </div>



      {/* ===================================================
          BOTTOM METRICS
          =================================================== */}

      <section
        className="
          mt-5
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <MetricCard
          icon={<Clock3 size={18} />}
          label="Session time"
          value={formatTime(elapsedSeconds)}
          accent="text-violet-300"
        />

        <MetricCard
          icon={<Waves size={18} />}
          label="Progress"
          value={`${currentProgress}%`}
          accent="text-cyan-300"
        />

        <MetricCard
          icon={
            listening
              ? <Mic size={18} />
              : <MicOff size={18} />
          }
          label="Speech status"
          value={
            sessionPaused
              ? "PAUSED"
              : listening
              ? "LISTENING"
              : sessionStarted
              ? "READY"
              : "STANDBY"
          }
          accent="text-emerald-300"
        />

        <MetricCard
          icon={<Volume2 size={18} />}
          label="Overall score"
          value={
            overall
              ? `${overall}`
              : "--"
          }
          accent="text-amber-300"
        />

      </section>



      {/* ===================================================
          TIPS
          =================================================== */}

      <div
        className="
          mt-5
          flex
          items-start
          justify-between
          gap-4
          rounded-2xl
          border
          border-white/[0.06]
          bg-[#090a10]/75
          px-5
          py-4
          backdrop-blur-xl
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              mt-0.5
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-violet-500/10
              text-violet-300
            "
          >
            <Sparkles size={16} />
          </div>


          <div>

            <p
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Tips for best results
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-relaxed
                text-slate-500
              "
            >
              Speak clearly • Take a moment to think • Structure your answers • Be concise • Pause the session whenever you need
            </p>

          </div>

        </div>


        <X
          size={17}
          className="
            shrink-0
            text-slate-600
          "
        />

      </div>



      {/* ===================================================
          ORB STYLES
          =================================================== */}

      <style>
        {`

          .hs-orb {
            position: relative;
            width: min(340px, 70vw);
            aspect-ratio: 1;
            transition:
              transform 180ms ease,
              filter 300ms ease;
            animation:
              hsOrbFloat 7s ease-in-out infinite;
          }

          .hs-orb-glow {
            position: absolute;
            inset: 12%;
            border-radius: 42% 58% 55% 45%;
            background:
              radial-gradient(
                circle at 35% 30%,
                rgba(139, 92, 246, 0.65),
                transparent 32%
              ),
              radial-gradient(
                circle at 72% 60%,
                rgba(34, 211, 238, 0.42),
                transparent 35%
              ),
              radial-gradient(
                circle at 40% 80%,
                rgba(99, 102, 241, 0.35),
                transparent 42%
              );
            filter:
              blur(35px);
            opacity: 0.95;
            animation:
              hsGlowShift 9s ease-in-out infinite alternate;
          }

          .hs-orb-core {
            position: absolute;
            inset: 18%;
            border-radius:
              44% 56% 52% 48%
              / 58% 42% 58% 42%;
            background:
              radial-gradient(
                circle at 32% 28%,
                rgba(167, 139, 250, 0.95),
                transparent 18%
              ),
              radial-gradient(
                circle at 68% 64%,
                rgba(34, 211, 238, 0.75),
                transparent 24%
              ),
              radial-gradient(
                circle at 50% 50%,
                rgba(15, 23, 42, 0.2),
                rgba(2, 6, 23, 0.88) 70%
              );
            box-shadow:
              inset 0 0 70px
                rgba(139, 92, 246, 0.25),
              0 0 70px
                rgba(99, 102, 241, 0.16);
            animation:
              hsCoreMorph 10s ease-in-out infinite;
          }

          .hs-orb-ring {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 84%;
            height: 84%;
            border-radius:
              52% 48% 42% 58%
              / 40% 60% 48% 52%;
            border:
              1px solid
              rgba(139, 92, 246, 0.32);
            transform:
              translate(-50%, -50%);
            filter:
              drop-shadow(
                0 0 12px
                rgba(139, 92, 246, 0.35)
              );
          }

          .hs-orb-ring-one {
            border-color:
              rgba(34, 211, 238, 0.45);
            animation:
              hsRingRotate 9s linear infinite;
          }

          .hs-orb-ring-two {
            width: 105%;
            height: 58%;
            border-color:
              rgba(139, 92, 246, 0.42);
            animation:
              hsRingRotateReverse
              12s linear infinite;
          }

          .hs-orb-ring-three {
            width: 55%;
            height: 110%;
            border-color:
              rgba(96, 165, 250, 0.24);
            animation:
              hsRingTilt 8s ease-in-out infinite;
          }

          .hs-orb-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 999px;
            box-shadow:
              0 0 18px currentColor;
          }

          .hs-orb-particle-one {
            left: 8%;
            top: 24%;
            color:
              rgb(139, 92, 246);
            background:
              currentColor;
            animation:
              hsParticleOne
              5s ease-in-out infinite;
          }

          .hs-orb-particle-two {
            right: 7%;
            top: 62%;
            color:
              rgb(34, 211, 238);
            background:
              currentColor;
            animation:
              hsParticleTwo
              6s ease-in-out infinite;
          }

          .hs-orb-particle-three {
            left: 26%;
            bottom: 7%;
            width: 5px;
            height: 5px;
            color:
              rgb(167, 139, 250);
            background:
              currentColor;
            animation:
              hsParticleThree
              7s ease-in-out infinite;
          }

          .hs-orb-particle-four {
            right: 30%;
            top: 8%;
            width: 6px;
            height: 6px;
            color:
              rgb(96, 165, 250);
            background:
              currentColor;
            animation:
              hsParticleFour
              5.5s ease-in-out infinite;
          }

          .hs-orb-listening {
            filter:
              saturate(1.25)
              brightness(1.15);
          }

          .hs-orb-listening
          .hs-orb-core {
            animation-duration:
              2.6s;
          }

          .hs-orb-listening
          .hs-orb-ring {
            filter:
              drop-shadow(
                0 0 22px
                rgba(34, 211, 238, 0.55)
              );
          }

          .hs-orb-paused {
            animation-play-state:
              paused;
            opacity:
              0.65;
          }

          @keyframes hsOrbFloat {
            0%, 100% {
              transform:
                translateY(0)
                rotate(0deg);
            }

            50% {
              transform:
                translateY(-10px)
                rotate(2deg);
            }
          }

          @keyframes hsGlowShift {
            0% {
              transform:
                scale(0.92)
                rotate(0deg);
            }

            100% {
              transform:
                scale(1.12)
                rotate(180deg);
            }
          }

          @keyframes hsCoreMorph {
            0% {
              border-radius:
                44% 56% 52% 48%
                / 58% 42% 58% 42%;
              transform:
                rotate(0deg)
                scale(1);
            }

            33% {
              border-radius:
                58% 42% 62% 38%
                / 45% 60% 40% 55%;
              transform:
                rotate(8deg)
                scale(1.04);
            }

            66% {
              border-radius:
                38% 62% 46% 54%
                / 60% 38% 62% 40%;
              transform:
                rotate(-6deg)
                scale(0.97);
            }

            100% {
              border-radius:
                44% 56% 52% 48%
                / 58% 42% 58% 42%;
              transform:
                rotate(0deg)
                scale(1);
            }
          }

          @keyframes hsRingRotate {
            from {
              transform:
                translate(-50%, -50%)
                rotate(0deg);
            }

            to {
              transform:
                translate(-50%, -50%)
                rotate(360deg);
            }
          }

          @keyframes hsRingRotateReverse {
            from {
              transform:
                translate(-50%, -50%)
                rotate(0deg);
            }

            to {
              transform:
                translate(-50%, -50%)
                rotate(-360deg);
            }
          }

          @keyframes hsRingTilt {
            0%, 100% {
              transform:
                translate(-50%, -50%)
                rotate(18deg)
                scale(0.92);
            }

            50% {
              transform:
                translate(-50%, -50%)
                rotate(-24deg)
                scale(1.05);
            }
          }

          @keyframes hsParticleOne {
            0%, 100% {
              transform:
                translate(0, 0);
            }

            50% {
              transform:
                translate(34px, 22px);
            }
          }

          @keyframes hsParticleTwo {
            0%, 100% {
              transform:
                translate(0, 0);
            }

            50% {
              transform:
                translate(-38px, -28px);
            }
          }

          @keyframes hsParticleThree {
            0%, 100% {
              transform:
                translate(0, 0)
                scale(1);
            }

            50% {
              transform:
                translate(24px, -42px)
                scale(1.7);
            }
          }

          @keyframes hsParticleFour {
            0%, 100% {
              transform:
                translate(0, 0);
            }

            50% {
              transform:
                translate(-18px, 38px);
            }
          }

        `}
      </style>

    </div>

  );
}


/* =========================================================
   PERFORMANCE ROW
   ========================================================= */

function PerformanceRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {

  const hasValue =
    value > 0;


  return (

    <div className="mb-4 last:mb-0">

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <span
          className="
            text-xs
            text-slate-400
          "
        >
          {label}
        </span>


        <span
          className="
            text-xs
            font-semibold
            text-slate-300
          "
        >
          {
            hasValue
              ? `${value}`
              : "Pending"
          }
        </span>

      </div>


      <div
        className="
          h-1.5
          overflow-hidden
          rounded-full
          bg-white/[0.06]
        "
      >

        <div
          className={`
            h-full
            rounded-full
            ${color}
            transition-all
            duration-700
          `}
          style={{
            width:
              hasValue
                ? `${value}%`
                : "0%",
          }}
        />

      </div>

    </div>

  );

}


/* =========================================================
   CONTEXT ITEM
   ========================================================= */

function ContextItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div
      className="
        min-h-[82px]
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-3
      "
    >

      <p
        className="
          text-[10px]
          text-slate-600
        "
      >
        {label}
      </p>


      <p
        className="
          mt-3
          text-sm
          font-semibold
          leading-snug
          text-slate-200
        "
      >
        {value}
      </p>

    </div>

  );

}


/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#090a10]/75
        p-5
        backdrop-blur-xl
      "
    >

      <div
        className={`
          ${accent}
        `}
      >
        {icon}
      </div>


      <p
        className="
          mt-4
          text-xl
          font-semibold
          text-white
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-xs
          text-slate-600
        "
      >
        {label}
      </p>

    </div>

  );

}


export default LiveInterview;