import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  AudioLines,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock3,
  Download,
  FileAudio,
  Loader2,
  Mic,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
  TrendingUp,
  Upload,
  Volume2,
  Waves,
  X,
  Zap,
} from "lucide-react";

import {
  analyzeSpeech,
} from "../services/api";


/* =========================================================
   TYPES
   ========================================================= */

type SpeechMetrics = {
  duration_seconds: number;
  word_count: number;
  wpm: number;
  filler_words: number;
  filler_breakdown: Record<string, number>;
  pacing_score: number;
  filler_score: number;
};

type AIScores = {
  communication_score: number;
  confidence_score: number;
  clarity_score: number;
  grammar_score: number;
  professionalism_score: number;
};

type SpeechResult = {
  success: boolean;
  transcript: string;
  speech_metrics: SpeechMetrics;
  ai_scores: AIScores;
  analysis: {
    clarity: string;
    grammar: string;
    professionalism: string;
    sentiment: string;
    answer_structure: string;
  };
  strengths: string[];
  improvements: string[];
  recruiter_feedback: string;
  hire_recommendation: string;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(
  totalSeconds: number
) {
  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}


function clampScore(
  value: number
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
}


function getScoreColor(
  score: number
) {
  if (score >= 85) {
    return "text-emerald-400";
  }

  if (score >= 70) {
    return "text-cyan-400";
  }

  if (score >= 50) {
    return "text-amber-400";
  }

  return "text-red-400";
}


function getScoreBackground(
  score: number
) {
  if (score >= 85) {
    return "bg-emerald-500/10 border-emerald-500/20";
  }

  if (score >= 70) {
    return "bg-cyan-500/10 border-cyan-500/20";
  }

  if (score >= 50) {
    return "bg-amber-500/10 border-amber-500/20";
  }

  return "bg-red-500/10 border-red-500/20";
}


function getRecommendationStyle(
  recommendation: string
) {
  const value =
    recommendation.toLowerCase();

  if (
    value.includes("strong") ||
    value.includes("recommended")
  ) {
    return {
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      background: "bg-emerald-500/10",
    };
  }

  if (
    value.includes("potential")
  ) {
    return {
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      background: "bg-cyan-500/10",
    };
  }

  return {
    text: "text-amber-400",
    border: "border-amber-500/20",
    background: "bg-amber-500/10",
  };
}


/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  score,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  icon: any;
  score?: number;
}) {
  const color =
    score !== undefined
      ? getScoreColor(score)
      : "text-cyan-400";

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#0b0d14]/80
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
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.025]
          "
        >
          <Icon
            size={18}
            className={color}
          />
        </div>

        {score !== undefined && (
          <span
            className={`
              text-xs
              font-bold
              ${color}
            `}
          >
            {score}%
          </span>
        )}
      </div>

      <div
        className="
          text-2xl
          font-semibold
          tracking-tight
          text-white
        "
      >
        {value}
      </div>

      <div
        className="
          mt-1
          text-[11px]
          font-medium
          uppercase
          tracking-[0.16em]
          text-slate-500
        "
      >
        {label}
      </div>

      <p
        className="
          mt-3
          text-xs
          leading-relaxed
          text-slate-500
        "
      >
        {subtitle}
      </p>
    </div>
  );
}


/* =========================================================
   SCORE ROW
   ========================================================= */

function ScoreRow({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const color =
    score >= 85
      ? "bg-emerald-400"
      : score >= 70
        ? "bg-cyan-400"
        : score >= 50
          ? "bg-amber-400"
          : "bg-red-400";

  return (
    <div>
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
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
          className={`
            text-xs
            font-bold
            ${getScoreColor(score)}
          `}
        >
          {score}
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
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}


/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function SpeechIntelligence() {

  /* =======================================================
     REFS
     ======================================================= */

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const mediaStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const audioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const analyserRef =
    useRef<AnalyserNode | null>(
      null
    );

  const animationFrameRef =
    useRef<number | null>(
      null
    );

  const audioChunksRef =
    useRef<Blob[]>([]);


  /* =======================================================
     STATE
     ======================================================= */

  const [
    recording,
    setRecording,
  ] = useState(false);

  const [
    paused,
    setPaused,
  ] = useState(false);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0);

  const [
    micLevel,
    setMicLevel,
  ] = useState(0);

  const [
    audioFile,
    setAudioFile,
  ] = useState<File | null>(
    null
  );

  const [
    result,
    setResult,
  ] = useState<SpeechResult | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    dragActive,
    setDragActive,
  ] = useState(false);


  /* =======================================================
     TIMER
     ======================================================= */

  useEffect(() => {

    if (
      !recording ||
      paused
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {

          setElapsedSeconds(
            previous =>
              previous + 1
          );

        },
        1000
      );

    return () => {

      window.clearInterval(
        timer
      );

    };

  }, [
    recording,
    paused,
  ]);


  /* =======================================================
     CLEANUP
     ======================================================= */

  useEffect(() => {

    return () => {

      if (
        animationFrameRef.current
      ) {

        cancelAnimationFrame(
          animationFrameRef.current
        );

      }

      mediaStreamRef.current
        ?.getTracks()
        .forEach(
          track =>
            track.stop()
        );

      audioContextRef.current
        ?.close()
        .catch(
          () => {}
        );

    };

  }, []);


  /* =======================================================
     AUDIO VISUALIZATION
     ======================================================= */

  function updateAudioLevel() {

    const analyser =
      analyserRef.current;

    if (!analyser) {
      return;
    }

    const dataArray =
      new Uint8Array(
        analyser.fftSize
      );

    analyser.getByteTimeDomainData(
      dataArray
    );

    let sum = 0;

    for (
      let index = 0;
      index < dataArray.length;
      index++
    ) {

      const normalized =
        (
          dataArray[index] -
          128
        ) /
        128;

      sum +=
        normalized *
        normalized;

    }

    const rms =
      Math.sqrt(
        sum /
        dataArray.length
      );

    const level =
      Math.min(
        100,
        Math.max(
          0,
          rms * 350
        )
      );

    setMicLevel(
      previous =>
        previous * 0.65 +
        level * 0.35
    );

    animationFrameRef.current =
      requestAnimationFrame(
        updateAudioLevel
      );

  }


  /* =======================================================
     START RECORDING
     ======================================================= */

  async function startRecording() {

    try {

      setError("");
      setResult(null);
      setAudioFile(null);

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

      mediaStreamRef.current =
        stream;

      const AudioContextClass =
        window.AudioContext ||
        (
          window as any
        ).webkitAudioContext;

      if (AudioContextClass) {

        const audioContext =
          new AudioContextClass();

        audioContextRef.current =
          audioContext;

        const source =
          audioContext
            .createMediaStreamSource(
              stream
            );

        const analyser =
          audioContext
            .createAnalyser();

        analyser.fftSize =
          512;

        source.connect(
          analyser
        );

        analyserRef.current =
          analyser;

        updateAudioLevel();

      }

      let mimeType =
        "";

      if (
        MediaRecorder
          .isTypeSupported(
            "audio/webm;codecs=opus"
          )
      ) {

        mimeType =
          "audio/webm;codecs=opus";

      } else if (
        MediaRecorder
          .isTypeSupported(
            "audio/webm"
          )
      ) {

        mimeType =
          "audio/webm";

      }

      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType,
              }
            )
          : new MediaRecorder(
              stream
            );

      audioChunksRef.current =
        [];

      recorder.ondataavailable =
        event => {

          if (
            event.data.size > 0
          ) {

            audioChunksRef.current
              .push(
                event.data
              );

          }

        };

      recorder.onstop =
        () => {

          const blob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  "audio/webm",
              }
            );

          const file =
            new File(
              [blob],
              `speech-recording-${Date.now()}.webm`,
              {
                type:
                  blob.type ||
                  "audio/webm",
              }
            );

          setAudioFile(
            file
          );

          stopAudioVisualization();

        };

      mediaRecorderRef.current =
        recorder;

      recorder.start(
        250
      );

      setElapsedSeconds(
        0
      );

      setRecording(
        true
      );

      setPaused(
        false
      );

    } catch (
      recordingError
    ) {

      console.error(
        recordingError
      );

      setError(
        "Microphone access was denied or unavailable. Please allow microphone permission and try again."
      );

    }

  }


  /* =======================================================
     STOP AUDIO VISUALIZATION
     ======================================================= */

  function stopAudioVisualization() {

    if (
      animationFrameRef.current
    ) {

      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;

    }

    setMicLevel(
      0
    );

    mediaStreamRef.current
      ?.getTracks()
      .forEach(
        track =>
          track.stop()
      );

    mediaStreamRef.current =
      null;

    audioContextRef.current
      ?.close()
      .catch(
        () => {}
      );

    audioContextRef.current =
      null;

    analyserRef.current =
      null;

  }


  /* =======================================================
     STOP RECORDING
     ======================================================= */

  function stopRecording() {

    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {

      recorder.stop();

    }

    setRecording(
      false
    );

    setPaused(
      false
    );

  }


  /* =======================================================
     PAUSE / RESUME
     ======================================================= */

  function togglePause() {

    const recorder =
      mediaRecorderRef.current;

    if (!recorder) {
      return;
    }

    if (
      recorder.state ===
      "recording"
    ) {

      recorder.pause();

      setPaused(
        true
      );

      return;

    }

    if (
      recorder.state ===
      "paused"
    ) {

      recorder.resume();

      setPaused(
        false
      );

    }

  }


  /* =======================================================
     FILE SELECT
     ======================================================= */

  function handleFile(
    file: File
  ) {

    if (
      !file.type.startsWith(
        "audio/"
      )
    ) {

      setError(
        "Please select a valid audio file."
      );

      return;

    }

    setError("");
    setResult(null);

    setAudioFile(
      file
    );

  }


  /* =======================================================
     ANALYZE AUDIO
     ======================================================= */

  async function handleAnalyze() {

    if (!audioFile) {

      setError(
        "Record or upload an audio file before starting analysis."
      );

      return;

    }

    try {

      setError("");

      setProcessing(
        true
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        audioFile
      );

      const response =
        await analyzeSpeech(
          formData
        );

      setResult(
        response
      );

    } catch (
      analysisError
    ) {

      console.error(
        analysisError
      );

      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Speech analysis failed. Please try again."
      );

    } finally {

      setProcessing(
        false
      );

    }

  }


  /* =======================================================
     DOWNLOAD TRANSCRIPT
     ======================================================= */

  function downloadTranscript() {

    if (
      !result?.transcript
    ) {
      return;
    }

    const blob =
      new Blob(
        [
          result.transcript,
        ],
        {
          type:
            "text/plain",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "hiresense-transcript.txt";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );

  }


  /* =======================================================
     RESET
     ======================================================= */

  function handleReset() {

    stopRecording();

    setAudioFile(
      null
    );

    setResult(
      null
    );

    setError("");

    setElapsedSeconds(
      0
    );

  }


  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const recommendationStyle =
    result
      ? getRecommendationStyle(
          result.hire_recommendation
        )
      : null;

  const confidence =
    result
      ? clampScore(
          result.ai_scores
            .confidence_score
        )
      : 0;

  const communication =
    result
      ? clampScore(
          result.ai_scores
            .communication_score
        )
      : 0;

  const clarity =
    result
      ? clampScore(
          result.ai_scores
            .clarity_score
        )
      : 0;

  const professionalism =
    result
      ? clampScore(
          result.ai_scores
            .professionalism_score
        )
      : 0;


  /* =======================================================
     UI
     ======================================================= */

  return (

    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        pb-10
      "
    >

      {/* ===================================================
          HEADER
          =================================================== */}

      <section
        className="
          mb-6
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
                shadow-[0_0_14px_rgba(52,211,153,0.9)]
              "
            />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-emerald-400
              "
            >
              Voice Intelligence
            </span>

          </div>

          <h1
            className="
              text-3xl
              font-semibold
              tracking-tight
              text-white
              sm:text-4xl
            "
          >
            Speech Intelligence
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-relaxed
              text-slate-500
            "
          >
            Record your voice or upload an interview response.
            HireSense analyzes communication quality, pacing,
            confidence, filler words, clarity, and recruiter
            readiness.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {audioFile && (

            <div
              className="
                hidden
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-4
                py-3
                md:flex
                md:items-center
                md:gap-3
              "
            >

              <FileAudio
                size={17}
                className="
                  text-cyan-400
                "
              />

              <div>

                <p
                  className="
                    max-w-[180px]
                    truncate
                    text-xs
                    font-medium
                    text-white
                  "
                >
                  {audioFile.name}
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-slate-500
                  "
                >
                  Ready for analysis
                </p>

              </div>

            </div>

          )}

          <button
            type="button"
            onClick={handleReset}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.02]
              px-4
              py-3
              text-xs
              font-semibold
              text-slate-300
              transition
              hover:border-white/[0.14]
              hover:bg-white/[0.05]
            "
          >

            <RefreshCw
              size={15}
            />

            Reset

          </button>

        </div>

      </section>


      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (

        <div
          className="
            mb-6
            flex
            items-start
            justify-between
            gap-4
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/[0.06]
            p-4
          "
        >

          <div
            className="
              flex
              gap-3
            "
          >

            <AlertTriangle
              size={18}
              className="
                mt-0.5
                shrink-0
                text-red-400
              "
            />

            <p
              className="
                text-sm
                leading-relaxed
                text-red-300
              "
            >
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="
              text-red-400
              transition
              hover:text-red-300
            "
          >

            <X
              size={18}
            />

          </button>

        </div>

      )}


      {/* ===================================================
          MAIN RECORDING AREA
          =================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/[0.08]
          bg-[#090b12]/90
          p-5
          backdrop-blur-xl
          sm:p-8
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[500px]
            w-[500px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-500/[0.035]
            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-400/30
            to-transparent
          "
        />


        <div
          className="
            relative
            grid
            gap-8
            lg:grid-cols-[1.2fr_0.8fr]
          "
        >


          {/* ===============================================
              RECORDER
              =============================================== */}

          <div
            className="
              flex
              min-h-[430px]
              flex-col
              items-center
              justify-center
              rounded-3xl
              border
              border-white/[0.06]
              bg-black/[0.18]
              px-5
              py-10
              text-center
            "
          >

            {/* STATUS */}

            <div
              className="
                mb-7
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-slate-500
              "
            >

              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${
                    recording
                      ? paused
                        ? "bg-amber-400"
                        : "animate-pulse bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                      : "bg-slate-600"
                  }
                `}
              />

              {
                recording
                  ? paused
                    ? "Recording paused"
                    : "Listening live"
                  : audioFile
                    ? "Audio ready"
                    : "Microphone idle"
              }

            </div>


            {/* VOICE CORE */}

            <div
              className="
                relative
                mb-8
                flex
                h-52
                w-52
                items-center
                justify-center
                sm:h-60
                sm:w-60
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  border
                  border-cyan-400/10
                  transition-all
                  duration-150
                "
                style={{
                  transform:
                    `scale(${1 + micLevel / 280})`,
                  opacity:
                    recording
                      ? 0.8
                      : 0.35,
                }}
              />

              <div
                className="
                  absolute
                  inset-5
                  rounded-full
                  border
                  border-violet-400/10
                  transition-all
                  duration-150
                "
                style={{
                  transform:
                    `rotate(${micLevel * 2}deg) scale(${1 + micLevel / 380})`,
                }}
              />

              <div
                className="
                  absolute
                  inset-10
                  rounded-full
                  bg-gradient-to-br
                  from-cyan-400/25
                  via-violet-500/20
                  to-red-500/15
                  blur-2xl
                  transition-all
                  duration-150
                "
                style={{
                  transform:
                    `scale(${0.9 + micLevel / 180})`,
                  opacity:
                    recording
                      ? 0.95
                      : 0.35,
                }}
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  h-28
                  w-28
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/[0.08]
                  bg-[#0b0e16]
                  shadow-[0_0_80px_rgba(34,211,238,0.08)]
                  transition-all
                  duration-150
                "
                style={{
                  transform:
                    `scale(${1 + micLevel / 500})`,
                }}
              >

                {recording ? (

                  paused ? (

                    <Pause
                      size={30}
                      className="
                        text-amber-400
                      "
                    />

                  ) : (

                    <Waves
                      size={32}
                      className="
                        text-cyan-400
                      "
                    />

                  )

                ) : (

                  <Mic
                    size={30}
                    className="
                      text-slate-400
                    "
                  />

                )}

              </div>

            </div>


            {/* TIME */}

            <div
              className="
                mb-3
                font-mono
                text-4xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              {formatTime(
                elapsedSeconds
              )}
            </div>

            <p
              className="
                mb-8
                max-w-sm
                text-sm
                leading-relaxed
                text-slate-500
              "
            >
              {
                recording
                  ? paused
                    ? "Your recording is safely paused. Resume whenever you are ready."
                    : "Speak naturally. The voice core reacts to your real microphone input."
                  : audioFile
                    ? "Your audio is ready for deep AI speech analysis."
                    : "Record an answer directly or upload an existing interview response."
              }
            </p>


            {/* CONTROLS */}

            <div
              className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-3
              "
            >

              {!recording && !audioFile && (

                <button
                  type="button"
                  onClick={
                    startRecording
                  }
                  className="
                    inline-flex
                    min-w-[180px]
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    border
                    border-cyan-400/20
                    bg-gradient-to-r
                    from-cyan-500/90
                    to-violet-500/90
                    px-6
                    py-4
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_0_40px_rgba(34,211,238,0.12)]
                    transition
                    hover:scale-[1.02]
                    hover:shadow-[0_0_55px_rgba(34,211,238,0.2)]
                  "
                >

                  <Mic
                    size={19}
                  />

                  Start recording

                </button>

              )}


              {recording && (

                <>

                  <button
                    type="button"
                    onClick={
                      togglePause
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/[0.09]
                      bg-white/[0.04]
                      px-5
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-white/[0.08]
                    "
                  >

                    {paused ? (

                      <Play
                        size={17}
                      />

                    ) : (

                      <Pause
                        size={17}
                      />

                    )}

                    {
                      paused
                        ? "Resume"
                        : "Pause"
                    }

                  </button>


                  <button
                    type="button"
                    onClick={
                      stopRecording
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-red-500/20
                      bg-red-500/[0.08]
                      px-5
                      py-3.5
                      text-sm
                      font-semibold
                      text-red-300
                      transition
                      hover:bg-red-500/[0.14]
                    "
                  >

                    <Square
                      size={16}
                    />

                    Stop

                  </button>

                </>

              )}


              {audioFile && !recording && (

                <button
                  type="button"
                  onClick={
                    handleAnalyze
                  }
                  disabled={
                    processing
                  }
                  className="
                    inline-flex
                    min-w-[180px]
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    border
                    border-violet-400/20
                    bg-gradient-to-r
                    from-violet-500/90
                    to-cyan-500/90
                    px-6
                    py-4
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:scale-[1.02]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {processing ? (

                    <Loader2
                      size={19}
                      className="
                        animate-spin
                      "
                    />

                  ) : (

                    <Brain
                      size={19}
                    />

                  )}

                  {
                    processing
                      ? "Analyzing speech..."
                      : "Analyze voice"
                  }

                </button>

              )}

            </div>

          </div>


          {/* ===============================================
              UPLOAD
              =============================================== */}

          <div
            className="
              flex
              flex-col
              justify-center
            "
          >

            <div
              className="
                mb-5
              "
            >

              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                "
              >

                <AudioLines
                  size={16}
                  className="
                    text-violet-400
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-violet-400
                  "
                >
                  Analysis Engine
                </span>

              </div>

              <h2
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Voice performance lab
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-relaxed
                  text-slate-500
                "
              >
                HireSense combines transcription, objective
                speech metrics, filler-word detection and
                recruiter-style AI evaluation.
              </p>

            </div>


            <label
              onDragEnter={() =>
                setDragActive(
                  true
                )
              }
              onDragLeave={() =>
                setDragActive(
                  false
                )
              }
              onDragOver={
                event => {

                  event.preventDefault();

                  setDragActive(
                    true
                  );

                }
              }
              onDrop={
                event => {

                  event.preventDefault();

                  setDragActive(
                    false
                  );

                  const file =
                    event.dataTransfer
                      .files[0];

                  if (file) {

                    handleFile(
                      file
                    );

                  }

                }
              }
              className={`
                mb-6
                flex
                min-h-[180px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                px-6
                text-center
                transition-all
                ${
                  dragActive
                    ? "border-cyan-400/50 bg-cyan-400/[0.05]"
                    : "border-white/[0.09] bg-white/[0.015] hover:border-white/[0.16] hover:bg-white/[0.025]"
                }
              `}
            >

              <input
                type="file"
                accept="audio/*"
                className="
                  hidden
                "
                onChange={
                  event => {

                    const file =
                      event.target
                        .files?.[0];

                    if (file) {

                      handleFile(
                        file
                      );

                    }

                  }
                }
              />

              <div
                className="
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.07]
                "
              >

                <Upload
                  size={21}
                  className="
                    text-cyan-400
                  "
                />

              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Upload interview audio
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Drag audio here or click to browse
              </p>

            </label>


            <div
              className="
                grid
                grid-cols-2
                gap-3
              "
            >

              <div
                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.015]
                  p-4
                "
              >

                <Clock3
                  size={16}
                  className="
                    mb-3
                    text-cyan-400
                  "
                />

                <p
                  className="
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  Pacing
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-relaxed
                    text-slate-500
                  "
                >
                  Speaking speed and rhythm
                </p>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.015]
                  p-4
                "
              >

                <Zap
                  size={16}
                  className="
                    mb-3
                    text-violet-400
                  "
                />

                <p
                  className="
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  Fillers
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-relaxed
                    text-slate-500
                  "
                >
                  Detect repetitive speech
                </p>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.015]
                  p-4
                "
              >

                <Brain
                  size={16}
                  className="
                    mb-3
                    text-emerald-400
                  "
                />

                <p
                  className="
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  AI Review
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-relaxed
                    text-slate-500
                  "
                >
                  Recruiter communication analysis
                </p>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.015]
                  p-4
                "
              >

                <ShieldCheck
                  size={16}
                  className="
                    mb-3
                    text-amber-400
                  "
                />

                <p
                  className="
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  Readiness
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-relaxed
                    text-slate-500
                  "
                >
                  Hiring recommendation
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          RESULTS
          =================================================== */}

      {result && (

        <section
          className="
            mt-6
            space-y-6
          "
        >


          {/* ===============================================
              RESULT HEADER
              =============================================== */}

          <div
            className="
              flex
              flex-col
              gap-5
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#0b0d14]/80
              p-5
              backdrop-blur-xl
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div
              className="
                flex
                items-start
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/[0.08]
                "
              >

                <CheckCircle2
                  size={22}
                  className="
                    text-emerald-400
                  "
                />

              </div>

              <div>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-emerald-400
                  "
                >
                  Analysis complete
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Your voice intelligence report
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                >
                  {result.speech_metrics.word_count} words analyzed across{" "}
                  {Math.round(
                    result.speech_metrics
                      .duration_seconds
                  )}{" "}
                  seconds of speech.
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {recommendationStyle && (

                <div
                  className={`
                    rounded-xl
                    border
                    px-4
                    py-3
                    ${recommendationStyle.border}
                    ${recommendationStyle.background}
                  `}
                >

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-slate-500
                    "
                  >
                    AI Recommendation
                  </p>

                  <p
                    className={`
                      mt-1
                      text-sm
                      font-bold
                      ${recommendationStyle.text}
                    `}
                  >
                    {
                      result
                        .hire_recommendation
                    }
                  </p>

                </div>

              )}


              <button
                type="button"
                onClick={
                  downloadTranscript
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-4
                  py-3
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/[0.06]
                "
              >

                <Download
                  size={15}
                />

                Transcript

              </button>

            </div>

          </div>


          {/* ===============================================
              PRIMARY METRICS
              =============================================== */}

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            <MetricCard
              label="Speaking Speed"
              value={`${result.speech_metrics.wpm} WPM`}
              subtitle="Measured speaking pace"
              icon={Clock3}
              score={
                result.speech_metrics
                  .pacing_score
              }
            />

            <MetricCard
              label="Filler Words"
              value={
                result.speech_metrics
                  .filler_words
              }
              subtitle="Detected repeated filler usage"
              icon={AlertTriangle}
              score={
                result.speech_metrics
                  .filler_score
              }
            />

            <MetricCard
              label="Confidence"
              value={`${confidence}%`}
              subtitle="AI communication confidence"
              icon={TrendingUp}
              score={
                confidence
              }
            />

            <MetricCard
              label="Communication"
              value={`${communication}%`}
              subtitle="Overall verbal communication"
              icon={Activity}
              score={
                communication
              }
            />

          </div>


          {/* ===============================================
              ANALYSIS GRID
              =============================================== */}

          <div
            className="
              grid
              gap-6
              xl:grid-cols-[0.85fr_1.15fr]
            "
          >


            {/* SCORES */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0d14]/80
                p-6
              "
            >

              <div
                className="
                  mb-6
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-500/15
                    bg-cyan-500/[0.07]
                  "
                >

                  <BarChart3
                    size={17}
                    className="
                      text-cyan-400
                    "
                  />

                </div>

                <div>

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-cyan-400
                    "
                  >
                    Performance Signals
                  </p>

                  <h3
                    className="
                      mt-1
                      text-base
                      font-semibold
                      text-white
                    "
                  >
                    AI communication scores
                  </h3>

                </div>

              </div>


              <div
                className="
                  space-y-5
                "
              >

                <ScoreRow
                  label="Communication"
                  score={
                    communication
                  }
                />

                <ScoreRow
                  label="Confidence"
                  score={
                    confidence
                  }
                />

                <ScoreRow
                  label="Clarity"
                  score={
                    clarity
                  }
                />

                <ScoreRow
                  label="Grammar"
                  score={
                    clampScore(
                      result.ai_scores
                        .grammar_score
                    )
                  }
                />

                <ScoreRow
                  label="Professionalism"
                  score={
                    professionalism
                  }
                />

              </div>

            </div>


            {/* RECRUITER INSIGHT */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#0b0d14]/80
                p-6
              "
            >

              <div
                className="
                  mb-6
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Sparkles
                      size={14}
                      className="
                        text-violet-400
                      "
                    />

                    <span
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.2em]
                        text-violet-400
                      "
                    >
                      Recruiter Intelligence
                    </span>

                  </div>

                  <h3
                    className="
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    AI recruiter assessment
                  </h3>

                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-violet-500/15
                    bg-violet-500/[0.07]
                    p-2.5
                  "
                >

                  <Brain
                    size={18}
                    className="
                      text-violet-400
                    "
                  />

                </div>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-white/[0.018]
                  p-5
                "
              >

                <p
                  className="
                    text-sm
                    leading-7
                    text-slate-300
                  "
                >
                  {
                    result
                      .recruiter_feedback
                  }
                </p>

              </div>


              <div
                className="
                  mt-5
                  grid
                  gap-4
                  md:grid-cols-2
                "
              >

                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.015]
                    p-4
                  "
                >

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-slate-500
                    "
                  >
                    Clarity
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {
                      result
                        .analysis
                        .clarity
                    }
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.015]
                    p-4
                  "
                >

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-slate-500
                    "
                  >
                    Answer Structure
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {
                      result
                        .analysis
                        .answer_structure
                    }
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.015]
                    p-4
                  "
                >

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-slate-500
                    "
                  >
                    Sentiment
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {
                      result
                        .analysis
                        .sentiment
                    }
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.015]
                    p-4
                  "
                >

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-slate-500
                    "
                  >
                    Professionalism
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {
                      result
                        .analysis
                        .professionalism
                    }
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ===============================================
              TRANSCRIPT
              =============================================== */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#0b0d14]/80
              p-6
            "
          >

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
                gap-4
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
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-500/15
                    bg-cyan-500/[0.07]
                  "
                >

                  <Volume2
                    size={17}
                    className="
                      text-cyan-400
                    "
                  />

                </div>

                <div>

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-cyan-400
                    "
                  >
                    Transcription
                  </p>

                  <h3
                    className="
                      mt-1
                      text-base
                      font-semibold
                      text-white
                    "
                  >
                    What HireSense heard
                  </h3>

                </div>

              </div>


              <span
                className="
                  text-xs
                  text-slate-500
                "
              >
                {
                  result
                    .speech_metrics
                    .word_count
                }{" "}
                words
              </span>

            </div>


            <div
              className="
                max-h-[300px]
                overflow-y-auto
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-5
              "
            >

              <p
                className="
                  whitespace-pre-wrap
                  text-sm
                  leading-8
                  text-slate-300
                "
              >
                {
                  result
                    .transcript
                }
              </p>

            </div>

          </div>


          {/* ===============================================
              STRENGTHS / IMPROVEMENTS
              =============================================== */}

          <div
            className="
              grid
              gap-6
              lg:grid-cols-2
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-emerald-500/15
                bg-emerald-500/[0.025]
                p-6
              "
            >

              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-3
                "
              >

                <CheckCircle2
                  size={19}
                  className="
                    text-emerald-400
                  "
                />

                <h3
                  className="
                    text-base
                    font-semibold
                    text-white
                  "
                >
                  Strengths detected
                </h3>

              </div>


              <div
                className="
                  space-y-3
                "
              >

                {
                  result
                    .strengths
                    .length
                    ? result
                        .strengths
                        .map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="
                                flex
                                gap-3
                                rounded-xl
                                border
                                border-emerald-500/10
                                bg-black/[0.12]
                                p-4
                              "
                            >

                              <CheckCircle2
                                size={16}
                                className="
                                  mt-0.5
                                  shrink-0
                                  text-emerald-400
                                "
                              />

                              <p
                                className="
                                  text-sm
                                  leading-relaxed
                                  text-slate-300
                                "
                              >
                                {item}
                              </p>

                            </div>

                          )
                        )
                    : (
                      <p
                        className="
                          text-sm
                          text-slate-500
                        "
                      >
                        Complete a longer recording to generate deeper strengths.
                      </p>
                    )
                }

              </div>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-amber-500/15
                bg-amber-500/[0.025]
                p-6
              "
            >

              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-3
                "
              >

                <TrendingUp
                  size={19}
                  className="
                    text-amber-400
                  "
                />

                <h3
                  className="
                    text-base
                    font-semibold
                    text-white
                  "
                >
                  Improvement opportunities
                </h3>

              </div>


              <div
                className="
                  space-y-3
                "
              >

                {
                  result
                    .improvements
                    .length
                    ? result
                        .improvements
                        .map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="
                                flex
                                gap-3
                                rounded-xl
                                border
                                border-amber-500/10
                                bg-black/[0.12]
                                p-4
                              "
                            >

                              <TrendingUp
                                size={16}
                                className="
                                  mt-0.5
                                  shrink-0
                                  text-amber-400
                                "
                              />

                              <p
                                className="
                                  text-sm
                                  leading-relaxed
                                  text-slate-300
                                "
                              >
                                {item}
                              </p>

                            </div>

                          )
                        )
                    : (
                      <p
                        className="
                          text-sm
                          text-slate-500
                        "
                      >
                        No major improvement areas were detected.
                      </p>
                    )
                }

              </div>

            </div>

          </div>


          {/* ===============================================
              FILLER BREAKDOWN
              =============================================== */}

          {
            Object.keys(
              result.speech_metrics
                .filler_breakdown ||
                {}
            ).length > 0 && (

              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-[#0b0d14]/80
                  p-6
                "
              >

                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-amber-500/15
                      bg-amber-500/[0.07]
                    "
                  >

                    <Zap
                      size={17}
                      className="
                        text-amber-400
                      "
                    />

                  </div>

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-amber-400
                      "
                    >
                      Speech Pattern Detection
                    </p>

                    <h3
                      className="
                        mt-1
                        text-base
                        font-semibold
                        text-white
                      "
                    >
                      Filler word breakdown
                    </h3>

                  </div>

                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                  "
                >

                  {
                    Object.entries(
                      result
                        .speech_metrics
                        .filler_breakdown
                    ).map(
                      (
                        [
                          word,
                          count,
                        ]
                      ) => (

                        <div
                          key={word}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-white/[0.07]
                            bg-white/[0.02]
                            px-4
                            py-3
                          "
                        >

                          <span
                            className="
                              text-sm
                              font-medium
                              text-white
                            "
                          >
                            {word}
                          </span>

                          <span
                            className="
                              rounded-lg
                              bg-amber-500/[0.1]
                              px-2
                              py-1
                              text-xs
                              font-bold
                              text-amber-400
                            "
                          >
                            {count}
                          </span>

                        </div>

                      )
                    )
                  }

                </div>

              </div>

            )
          }

        </section>

      )}

    </div>

  );

}