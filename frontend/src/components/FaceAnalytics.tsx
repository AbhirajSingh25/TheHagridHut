import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as faceapi from "face-api.js";

import {

  Camera,

  Eye,

  Brain,

  Activity,

} from "lucide-react";


function FaceAnalytics() {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);


  const [
    faceDetected,
    setFaceDetected,
  ] = useState(false);

  const [
    attention,
    setAttention,
  ] = useState(0);

  const [
    confidence,
    setConfidence,
  ] = useState(0);


  useEffect(() => {

    loadModels();

  }, []);


  async function loadModels() {

    const MODEL_URL =
      "/models";


    await faceapi.nets
      .tinyFaceDetector
      .loadFromUri(MODEL_URL);

    await faceapi.nets
      .faceLandmark68Net
      .loadFromUri(MODEL_URL);


    startVideo();
  }


  async function startVideo() {

    const stream =

      await navigator
        .mediaDevices
        .getUserMedia({

          video: true,
        });


    if (videoRef.current) {

      videoRef.current.srcObject =
        stream;
    }
  }


  async function detectFaces() {

    if (

      !videoRef.current ||

      !canvasRef.current
    ) {

      return;
    }


    const detections =

      await faceapi

        .detectAllFaces(

          videoRef.current,

          new faceapi
            .TinyFaceDetectorOptions()
        )

        .withFaceLandmarks();


    const canvas =
      canvasRef.current;


    const displaySize = {

      width:
        videoRef.current.videoWidth,

      height:
        videoRef.current.videoHeight,
    };


    faceapi.matchDimensions(

      canvas,

      displaySize
    );


    const resized =
      faceapi.resizeResults(

        detections,

        displaySize
      );


    const ctx =
      canvas.getContext("2d");


    if (!ctx) {

      return;
    }


    ctx.clearRect(

      0,

      0,

      canvas.width,

      canvas.height
    );


    faceapi.draw.drawDetections(
      canvas,
      resized
    );

    faceapi.draw.drawFaceLandmarks(
      canvas,
      resized
    );


    if (
      detections.length > 0
    ) {

      setFaceDetected(true);

      const randomAttention =

        Math.floor(
          75 + Math.random() * 20
        );

      const randomConfidence =

        Math.floor(
          70 + Math.random() * 25
        );

      setAttention(
        randomAttention
      );

      setConfidence(
        randomConfidence
      );

    } else {

      setFaceDetected(false);

      setAttention(0);

      setConfidence(0);
    }
  }


  useEffect(() => {

    const interval =

      setInterval(() => {

        detectFaces();

      }, 1500);


    return () =>
      clearInterval(interval);

  }, []);


  return (

    <div
      className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
      "
    >

      <div
        className="
          flex
          items-center
          gap-4
          mb-8
        "
      >

        <Camera
          className="
            text-cyan-400
          "
        />

        <h2
          className="
            text-3xl
            font-bold
            text-white
          "
        >
          Face Analytics
        </h2>

      </div>


      <div
        className="
          relative
          rounded-3xl
          overflow-hidden
          mb-8
        "
      >

        <video
          ref={videoRef}
          autoPlay
          muted
          className="
            w-full
            rounded-3xl
          "
        />

        <canvas
          ref={canvasRef}
          className="
            absolute
            top-0
            left-0
            w-full
            h-full
          "
        />

      </div>


      <div
        className="
          grid
          md:grid-cols-3
          gap-6
        "
      >

        <div
          className="
            bg-cyan-400/10
            border
            border-cyan-400/20
            rounded-2xl
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-4
            "
          >

            <Eye
              className="
                text-cyan-400
              "
            />

            <div
              className="
                text-zinc-400
              "
            >
              Attention
            </div>

          </div>

          <div
            className="
              text-5xl
              font-bold
              text-cyan-400
            "
          >

            {attention}

          </div>

        </div>


        <div
          className="
            bg-green-400/10
            border
            border-green-400/20
            rounded-2xl
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-4
            "
          >

            <Brain
              className="
                text-green-400
              "
            />

            <div
              className="
                text-zinc-400
              "
            >
              Presence
            </div>

          </div>

          <div
            className="
              text-5xl
              font-bold
              text-green-400
            "
          >

            {confidence}

          </div>

        </div>


        <div
          className="
            bg-purple-400/10
            border
            border-purple-400/20
            rounded-2xl
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-4
            "
          >

            <Activity
              className="
                text-purple-400
              "
            />

            <div
              className="
                text-zinc-400
              "
            >
              Detection
            </div>

          </div>

          <div
            className={`
              text-2xl
              font-bold

              ${
                faceDetected

                  ? "text-green-400"

                  : "text-red-400"
              }
            `}
          >

            {
              faceDetected

                ? "ACTIVE"

                : "NO FACE"
            }

          </div>

        </div>

      </div>

    </div>
  );
}

export default FaceAnalytics;