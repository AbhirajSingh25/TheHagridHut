import {
  useEffect,
  useRef,
  useState,
} from "react";

function FaceTracker() {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const [

    eyeContact,

    setEyeContact,

  ] = useState(92);

  const [

    posture,

    setPosture,

  ] = useState("Excellent");


  useEffect(() => {

    async function startCamera() {

      try {

        const stream =
          await navigator.mediaDevices.getUserMedia({

            video: true,
          });

        if (videoRef.current) {

          videoRef.current.srcObject =
            stream;
        }

      } catch (error) {

        console.error(error);
      }
    }

    startCamera();

  }, []);


  return (

    <div
      className="
        relative
        rounded-[32px]
        overflow-hidden
        border
        border-red-500/20
        bg-black
      "
    >

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="
          w-full
          h-[420px]
          object-cover
        "
      />


      <div
        className="
          absolute
          top-5
          left-5
          bg-black/70
          border
          border-red-500/20
          rounded-2xl
          px-5
          py-4
          backdrop-blur-xl
        "
      >

        <p
          className="
            text-zinc-400
            text-sm
          "
        >
          Eye Contact
        </p>

        <h2
          className="
            text-3xl
            font-black
            text-red-400
          "
        >
          {eyeContact}%
        </h2>

      </div>


      <div
        className="
          absolute
          top-5
          right-5
          bg-black/70
          border
          border-red-500/20
          rounded-2xl
          px-5
          py-4
          backdrop-blur-xl
        "
      >

        <p
          className="
            text-zinc-400
            text-sm
          "
        >
          Posture
        </p>

        <h2
          className="
            text-2xl
            font-black
            text-white
          "
        >
          {posture}
        </h2>

      </div>

    </div>
  );
}

export default FaceTracker;