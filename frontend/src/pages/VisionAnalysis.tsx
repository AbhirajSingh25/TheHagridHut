import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  CircleStop,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Video,
  VideoOff,
  X,
} from "lucide-react";

import {
  analyzeVision,
} from "../services/api";


type VisionMetrics = {
  eyeContact: number;
  attention: number;
  faceVisibility: number;
  posture: number;
  expression: string;
  confidence: number;
};


const DEFAULT_METRICS: VisionMetrics = {
  eyeContact: 0,
  attention: 0,
  faceVisibility: 0,
  posture: 0,
  expression: "Waiting",
  confidence: 0,
};


function VisionAnalysis() {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [stream, setStream] =
    useState<MediaStream | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [metrics, setMetrics] =
    useState<VisionMetrics>(
      DEFAULT_METRICS
    );


  /* ============================================
     CLEANUP CAMERA
  ============================================ */

  useEffect(() => {

    return () => {

      stream?.getTracks().forEach(
        (track) => track.stop()
      );

    };

  }, [stream]);


  /* ============================================
     START CAMERA
  ============================================ */

  async function startCamera() {

    try {

      setError("");
      setSuccess("");
      setPreviewUrl(null);
      setSelectedFile(null);

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: "user",
            },

            audio: false,
          }
        );

      setStream(mediaStream);
      setCameraActive(true);

      setTimeout(() => {

        if (videoRef.current) {

          videoRef.current.srcObject =
            mediaStream;

        }

      }, 100);

    } catch (err) {

      console.error(
        "Camera access failed:",
        err
      );

      setError(
        "Camera access was denied or unavailable."
      );

    }

  }


  /* ============================================
     STOP CAMERA
  ============================================ */

  function stopCamera() {

    stream?.getTracks().forEach(
      (track) => track.stop()
    );

    setStream(null);
    setCameraActive(false);

    if (videoRef.current) {

      videoRef.current.srcObject =
        null;

    }

  }


  /* ============================================
     HANDLE IMAGE UPLOAD
  ============================================ */

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    stopCamera();

    setSelectedFile(file);

    const url =
      URL.createObjectURL(file);

    setPreviewUrl(url);

  }


  /* ============================================
     CAPTURE CAMERA FRAME
  ============================================ */

  async function captureFrame() {

    if (
      !videoRef.current ||
      !canvasRef.current
    ) {

      return;

    }

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {

        if (!blob) {
          return;
        }

        const file =
          new File(
            [blob],
            "vision-capture.jpg",
            {
              type:
                "image/jpeg",
            }
          );

        setSelectedFile(file);

        const url =
          URL.createObjectURL(blob);

        setPreviewUrl(url);

        stopCamera();

      },

      "image/jpeg",

      0.95
    );

  }


  /* ============================================
     REMOVE IMAGE
  ============================================ */

  function removeImage() {

    if (previewUrl) {

      URL.revokeObjectURL(
        previewUrl
      );

    }

    setPreviewUrl(null);
    setSelectedFile(null);
    setError("");
    setSuccess("");

    setMetrics(
      DEFAULT_METRICS
    );

    if (fileInputRef.current) {

      fileInputRef.current.value =
        "";

    }

  }


  /* ============================================
     ANALYZE VISION
  ============================================ */

  async function handleAnalyze() {

    if (!selectedFile) {

      setError(
        "Capture an image or upload one before analysis."
      );

      return;

    }

    try {

      setAnalyzing(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const result =
        await analyzeVision(
          formData
        );

      setMetrics({

        eyeContact:
          Math.round(
            result.eye_contact ??
            result.eyeContact ??
            result.metrics?.eye_contact ??
            0
          ),

        attention:
          Math.round(
            result.attention ??
            result.attention_score ??
            result.metrics?.attention ??
            0
          ),

        faceVisibility:
          Math.round(
            result.face_visibility ??
            result.faceVisibility ??
            result.metrics?.face_visibility ??
            0
          ),

        posture:
          Math.round(
            result.posture ??
            result.posture_score ??
            result.metrics?.posture ??
            0
          ),

        expression:
          result.expression ??
          result.facial_expression ??
          result.metrics?.expression ??
          "Detected",

        confidence:
          Math.round(
            result.confidence ??
            result.confidence_score ??
            result.metrics?.confidence ??
            0
          ),

      });

      setSuccess(
        "Vision analysis completed successfully."
      );

    } catch (err) {

      console.error(
        "Vision analysis failed:",
        err
      );

      setError(
        "Vision analysis could not be completed. The frontend is ready, but the backend endpoint still needs to return analysis data."
      );

    } finally {

      setAnalyzing(false);

    }

  }


  const hasImage =
    Boolean(previewUrl);

  const hasMetrics =
    metrics.eyeContact > 0 ||
    metrics.attention > 0 ||
    metrics.faceVisibility > 0 ||
    metrics.posture > 0;


  return (

    <div className="relative min-h-full overflow-hidden px-5 pb-10 pt-5 lg:px-7">

      {/* ========================================
          BACKGROUND ATMOSPHERE
      ======================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            left-[12%]
            top-[8%]
            h-[380px]
            w-[380px]
            rounded-full
            bg-cyan-500/5
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            right-[10%]
            top-[28%]
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-500/5
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            bottom-[-120px]
            left-[40%]
            h-[320px]
            w-[320px]
            rounded-full
            bg-blue-500/5
            blur-[130px]
          "
        />

      </div>


      <div className="relative z-10">


        {/* ========================================
            HERO
        ======================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            relative
            mb-6
            overflow-hidden
            rounded-[26px]
            border
            border-white/[0.08]
            bg-[#0a0d16]/80
            p-6
            backdrop-blur-xl
            lg:p-8
          "
        >

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-[45%]
              bg-gradient-to-l
              from-violet-500/[0.10]
              via-cyan-500/[0.03]
              to-transparent
            "
          />

          <div className="relative">

            <div
              className="
                mb-4
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.32em]
                text-cyan-300
              "
            >

              <ScanFace size={13} />

              Vision Intelligence

            </div>


            <div
              className="
                flex
                flex-col
                justify-between
                gap-6
                xl:flex-row
                xl:items-end
              "
            >

              <div>

                <h1
                  className="
                    text-3xl
                    font-semibold
                    tracking-tight
                    text-white
                    lg:text-4xl
                  "
                >

                  Vision Analysis

                </h1>


                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-slate-400
                  "
                >

                  Analyze interview presence through
                  facial visibility, eye contact,
                  posture, attention signals and
                  visual confidence.

                </p>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-xs
                  text-slate-400
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-emerald-400/15
                    bg-emerald-400/[0.05]
                    px-4
                    py-2
                  "
                >

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_14px_rgba(52,211,153,0.9)]
                    "
                  />

                  AI SYSTEM READY

                </div>

              </div>

            </div>

          </div>

        </motion.div>


        {/* ========================================
            STATUS MESSAGES
        ======================================== */}

        <AnimatePresence>

          {error && (

            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="
                mb-5
                flex
                items-center
                justify-between
                gap-4
                rounded-2xl
                border
                border-red-500/25
                bg-red-500/[0.06]
                px-5
                py-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-red-300
                "
              >

                <AlertCircle
                  size={18}
                />

                {error}

              </div>


              <button
                onClick={() =>
                  setError("")
                }
                className="
                  text-red-300
                  transition
                  hover:text-white
                "
              >

                <X size={17} />

              </button>

            </motion.div>

          )}


          {success && (

            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="
                mb-5
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-500/20
                bg-emerald-500/[0.06]
                px-5
                py-4
                text-sm
                text-emerald-300
              "
            >

              <CheckCircle2
                size={18}
              />

              {success}

            </motion.div>

          )}

        </AnimatePresence>


        {/* ========================================
            MAIN GRID
        ======================================== */}

        <div
          className="
            grid
            gap-6
            xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]
          "
        >


          {/* ======================================
              CAMERA / IMAGE AREA
          ====================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
            className="
              overflow-hidden
              rounded-[26px]
              border
              border-white/[0.08]
              bg-[#090c15]/85
              backdrop-blur-xl
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-white/[0.06]
                px-5
                py-4
                lg:px-6
              "
            >

              <div>

                <div
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.28em]
                    text-violet-300
                  "
                >

                  Live Vision Environment

                </div>


                <div
                  className="
                    mt-2
                    text-lg
                    font-semibold
                    text-white
                  "
                >

                  Camera Intelligence

                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-3
                  py-1.5
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-slate-400
                "
              >

                <span
                  className={`
                    h-2
                    w-2
                    rounded-full
                    ${
                      cameraActive
                        ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                        : "bg-slate-600"
                    }
                  `}
                />

                {cameraActive
                  ? "Camera Live"
                  : "Vision Standby"}

              </div>

            </div>


            {/* VIEWPORT */}

            <div
              className="
                relative
                min-h-[520px]
                bg-[#060811]
              "
            >

              {/* CAMERA */}

              {cameraActive && (

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                  "
                />

              )}


              {/* IMAGE PREVIEW */}

              {!cameraActive &&
                previewUrl && (

                  <img
                    src={previewUrl}
                    alt="Vision preview"
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                    "
                  />

                )}


              {/* EMPTY STATE */}

              {!cameraActive &&
                !previewUrl && (

                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      flex-col
                      items-center
                      justify-center
                      p-8
                      text-center
                    "
                  >

                    <motion.div
                      animate={{
                        rotate: [
                          0,
                          360,
                        ],
                      }}
                      transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="
                        absolute
                        h-[280px]
                        w-[280px]
                        rounded-full
                        border
                        border-cyan-400/[0.07]
                      "
                    />


                    <motion.div
                      animate={{
                        rotate: [
                          360,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="
                        absolute
                        h-[210px]
                        w-[210px]
                        rounded-full
                        border
                        border-violet-400/[0.08]
                      "
                    />


                    <div
                      className="
                        relative
                        z-10
                        mb-6
                        flex
                        h-24
                        w-24
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-cyan-400/20
                        bg-cyan-400/[0.05]
                        shadow-[0_0_80px_rgba(34,211,238,0.08)]
                      "
                    >

                      <ScanFace
                        size={38}
                        className="
                          text-cyan-300
                        "
                      />

                    </div>


                    <h3
                      className="
                        relative
                        z-10
                        text-xl
                        font-semibold
                        text-white
                      "
                    >

                      Visual signal ready

                    </h3>


                    <p
                      className="
                        relative
                        z-10
                        mt-3
                        max-w-sm
                        text-sm
                        leading-6
                        text-slate-400
                      "
                    >

                      Start your camera or upload an
                      interview image to activate the
                      vision intelligence engine.

                    </p>

                  </div>

                )}


              {/* ANALYZING OVERLAY */}

              {analyzing && (

                <div
                  className="
                    absolute
                    inset-0
                    z-20
                    flex
                    items-center
                    justify-center
                    bg-[#05070d]/75
                    backdrop-blur-sm
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      items-center
                    "
                  >

                    <Loader2
                      size={42}
                      className="
                        animate-spin
                        text-cyan-300
                      "
                    />

                    <div
                      className="
                        mt-5
                        text-lg
                        font-semibold
                        text-white
                      "
                    >

                      Analyzing visual signals

                    </div>

                    <div
                      className="
                        mt-2
                        text-sm
                        text-slate-400
                      "
                    >

                      Processing facial and posture data

                    </div>

                  </div>

                </div>

              )}


              {/* CAMERA HUD */}

              {(cameraActive ||
                previewUrl) && (

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-5
                    rounded-[24px]
                    border
                    border-cyan-300/20
                  "
                >

                  <div
                    className="
                      absolute
                      left-0
                      top-0
                      h-8
                      w-8
                      rounded-tl-2xl
                      border-l-2
                      border-t-2
                      border-cyan-300
                    "
                  />

                  <div
                    className="
                      absolute
                      right-0
                      top-0
                      h-8
                      w-8
                      rounded-tr-2xl
                      border-r-2
                      border-t-2
                      border-cyan-300
                    "
                  />

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-8
                      w-8
                      rounded-bl-2xl
                      border-b-2
                      border-l-2
                      border-cyan-300
                    "
                  />

                  <div
                    className="
                      absolute
                      bottom-0
                      right-0
                      h-8
                      w-8
                      rounded-br-2xl
                      border-b-2
                      border-r-2
                      border-cyan-300
                    "
                  />

                </div>

              )}


              {/* LIVE STATUS */}

              {cameraActive && (

                <div
                  className="
                    absolute
                    left-7
                    top-7
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-red-400/20
                    bg-[#080a12]/80
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-red-300
                    backdrop-blur-md
                  "
                >

                  <span
                    className="
                      h-2
                      w-2
                      animate-pulse
                      rounded-full
                      bg-red-400
                    "
                  />

                  Live

                </div>

              )}


              {/* ACTION BAR */}

              <div
                className="
                  absolute
                  bottom-5
                  left-1/2
                  z-30
                  flex
                  -translate-x-1/2
                  items-center
                  gap-3
                  rounded-[22px]
                  border
                  border-white/[0.09]
                  bg-[#0b0e18]/85
                  p-3
                  shadow-2xl
                  backdrop-blur-xl
                "
              >

                {!cameraActive && !previewUrl && (

                  <>

                    <button
                      onClick={startCamera}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-gradient-to-r
                        from-violet-600
                        to-cyan-500
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:scale-[1.02]
                        active:scale-[0.98]
                      "
                    >

                      <Camera
                        size={17}
                      />

                      Start camera

                    </button>


                    <button
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-white/[0.09]
                        bg-white/[0.04]
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-slate-200
                        transition
                        hover:bg-white/[0.08]
                      "
                    >

                      <ImagePlus
                        size={17}
                      />

                      Upload

                    </button>

                  </>

                )}


                {cameraActive && (

                  <>

                    <button
                      onClick={captureFrame}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-gradient-to-r
                        from-violet-600
                        to-cyan-500
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:scale-[1.02]
                      "
                    >

                      <ScanFace
                        size={17}
                      />

                      Capture

                    </button>


                    <button
                      onClick={stopCamera}
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-red-400/20
                        bg-red-500/[0.06]
                        text-red-300
                        transition
                        hover:bg-red-500/[0.12]
                      "
                    >

                      <VideoOff
                        size={18}
                      />

                    </button>

                  </>

                )}


                {previewUrl && (

                  <>

                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-gradient-to-r
                        from-violet-600
                        to-cyan-500
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:scale-[1.02]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >

                      <Sparkles
                        size={17}
                      />

                      Analyze vision

                    </button>


                    <button
                      onClick={removeImage}
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/[0.08]
                        bg-white/[0.03]
                        text-slate-400
                        transition
                        hover:bg-white/[0.07]
                        hover:text-white
                      "
                    >

                      <X
                        size={18}
                      />

                    </button>

                  </>

                )}

              </div>

            </div>

          </motion.div>


          {/* ======================================
              RIGHT ANALYTICS
          ====================================== */}

          <div
            className="
              flex
              flex-col
              gap-6
            "
          >


            {/* SCORE */}

            <motion.div
              initial={{
                opacity: 0,
                x: 16,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.15,
              }}
              className="
                rounded-[26px]
                border
                border-white/[0.08]
                bg-[#090c15]/85
                p-6
                backdrop-blur-xl
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <div
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.28em]
                      text-cyan-300
                    "
                  >

                    Presence Score

                  </div>


                  <div
                    className="
                      mt-2
                      text-lg
                      font-semibold
                      text-white
                    "
                  >

                    Visual performance

                  </div>

                </div>


                <Eye
                  size={20}
                  className="
                    text-violet-300
                  "
                />

              </div>


              <div
                className="
                  mt-7
                  flex
                  items-end
                  justify-between
                  gap-5
                "
              >

                <div>

                  <div
                    className="
                      text-5xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >

                    {hasMetrics
                      ? metrics.confidence
                      : "--"}

                    <span
                      className="
                        ml-1
                        text-lg
                        text-slate-500
                      "
                    >

                      %

                    </span>

                  </div>


                  <div
                    className="
                      mt-3
                      text-xs
                      text-slate-500
                    "
                  >

                    Overall visual confidence

                  </div>

                </div>


                <div
                  className="
                    relative
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-violet-400/15
                    bg-violet-500/[0.05]
                  "
                >

                  <div
                    className="
                      absolute
                      inset-2
                      rounded-full
                      border
                      border-cyan-400/10
                    "
                  />

                  <ShieldCheck
                    size={27}
                    className="
                      relative
                      z-10
                      text-cyan-300
                    "
                  />

                </div>

              </div>

            </motion.div>


            {/* METRICS */}

            <motion.div
              initial={{
                opacity: 0,
                x: 16,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.22,
              }}
              className="
                rounded-[26px]
                border
                border-white/[0.08]
                bg-[#090c15]/85
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

                  <div
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.28em]
                      text-violet-300
                    "
                  >

                    Vision Signals

                  </div>


                  <div
                    className="
                      mt-2
                      text-lg
                      font-semibold
                      text-white
                    "
                  >

                    Real-time indicators

                  </div>

                </div>


                <Video
                  size={19}
                  className="
                    text-cyan-300
                  "
                />

              </div>


              <MetricRow
                label="Eye contact"
                value={metrics.eyeContact}
                icon={
                  <Eye size={15} />
                }
              />

              <MetricRow
                label="Attention"
                value={metrics.attention}
                icon={
                  <ScanFace size={15} />
                }
              />

              <MetricRow
                label="Face visibility"
                value={metrics.faceVisibility}
                icon={
                  <Camera size={15} />
                }
              />

              <MetricRow
                label="Posture"
                value={metrics.posture}
                icon={
                  <Sparkles size={15} />
                }
              />

            </motion.div>


            {/* EXPRESSION */}

            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.28,
              }}
              className="
                rounded-[26px]
                border
                border-white/[0.08]
                bg-gradient-to-br
                from-violet-500/[0.08]
                via-[#090c15]/90
                to-cyan-500/[0.05]
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <div
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.28em]
                      text-cyan-300
                    "
                  >

                    Expression

                  </div>


                  <div
                    className="
                      mt-3
                      text-2xl
                      font-semibold
                      text-white
                    "
                  >

                    {metrics.expression}

                  </div>

                </div>


                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-white/[0.04]
                  "
                >

                  {metrics.expression ===
                  "Waiting" ? (

                    <EyeOff
                      size={21}
                      className="
                        text-slate-400
                      "
                    />

                  ) : (

                    <CheckCircle2
                      size={21}
                      className="
                        text-emerald-300
                      "
                    />

                  )}

                </div>

              </div>

            </motion.div>

          </div>

        </div>


        {/* ========================================
            PRIVACY STRIP
        ======================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.35,
          }}
          className="
            mt-6
            flex
            flex-col
            justify-between
            gap-4
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.015]
            px-5
            py-4
            text-xs
            text-slate-500
            lg:flex-row
            lg:items-center
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <ShieldCheck
              size={17}
              className="
                text-emerald-400
              "
            />

            Visual analysis is designed for
            interview performance signals.

          </div>


          <div
            className="
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
                bg-cyan-400
              "
            />

            Camera data is processed through the
            HireSense analysis pipeline.

          </div>

        </motion.div>


        {/* HIDDEN INPUTS */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <canvas
          ref={canvasRef}
          className="hidden"
        />

      </div>

    </div>

  );

}


/* ============================================
   METRIC ROW
============================================ */

function MetricRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {

  const displayValue =
    value > 0
      ? value
      : 0;


  return (

    <div
      className="
        mb-4
        last:mb-0
      "
    >

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            text-slate-400
          "
        >

          <span
            className="
              text-cyan-300
            "
          >

            {icon}

          </span>

          {label}

        </div>


        <div
          className="
            text-xs
            font-semibold
            text-slate-200
          "
        >

          {value > 0
            ? `${value}%`
            : "Waiting"}

        </div>

      </div>


      <div
        className="
          h-1.5
          overflow-hidden
          rounded-full
          bg-white/[0.05]
        "
      >

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width:
              `${displayValue}%`,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-violet-500
            via-cyan-400
            to-emerald-400
          "
        />

      </div>

    </div>

  );

}


export default VisionAnalysis;