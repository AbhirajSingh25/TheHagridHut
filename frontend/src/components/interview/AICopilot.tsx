import {
  motion,
} from "framer-motion";

import {

  Sparkles,

  Brain,

  AlertTriangle,

  Mic,

  Eye,

} from "lucide-react";


interface Props {

  confidence: number;

  transcript: string;
}


function AICopilot({

  confidence,

  transcript,
}: Props) {

  const suggestions = [

    "Use STAR framework for behavioral answers",

    "Add measurable impact metrics",

    "Maintain slower pacing",

    "Improve technical depth",

    "Reduce filler words",
  ];


  return (

    <motion.div

      initial={{
        x: 100,
        opacity: 0,
      }}

      animate={{
        x: 0,
        opacity: 1,
      }}

      className="
        fixed
        right-8
        top-24
        w-[380px]
        z-50
      "
    >

      <div
        className="
          bg-[#070B14]/95
          backdrop-blur-2xl
          border
          border-red-500/20
          rounded-[32px]
          p-7
          shadow-[0_0_60px_rgba(255,0,0,0.15)]
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            gap-4
            mb-8
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-red-500/20
              flex
              items-center
              justify-center
            "
          >

            <Brain
              className="
                text-red-400
              "
            />

          </div>


          <div>

            <h2
              className="
                text-2xl
                font-black
                text-white
              "
            >
              AI Copilot
            </h2>

            <p className="text-zinc-500">
              Real-time recruiter intelligence
            </p>

          </div>

        </div>


        {/* METRICS */}

        <div className="grid grid-cols-2 gap-4 mb-8">

          <div
            className="
              bg-black/30
              border
              border-white/5
              rounded-2xl
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                mb-3
              "
            >

              <Mic
                size={18}
                className="
                  text-red-400
                "
              />

              <p className="text-zinc-400">
                Confidence
              </p>

            </div>


            <h3
              className="
                text-4xl
                font-black
                text-white
              "
            >
              {confidence}%
            </h3>

          </div>


          <div
            className="
              bg-black/30
              border
              border-white/5
              rounded-2xl
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                mb-3
              "
            >

              <Eye
                size={18}
                className="
                  text-red-400
                "
              />

              <p className="text-zinc-400">
                Eye Contact
              </p>

            </div>


            <h3
              className="
                text-4xl
                font-black
                text-white
              "
            >
              87%
            </h3>

          </div>

        </div>


        {/* LIVE ANALYSIS */}

        <div className="mb-8">

          <div
            className="
              flex
              items-center
              gap-3
              mb-5
            "
          >

            <Sparkles
              className="
                text-red-400
              "
            />

            <h3
              className="
                text-xl
                font-bold
                text-white
              "
            >
              Live Suggestions
            </h3>

          </div>


          <div className="space-y-4">

            {suggestions.map((item) => (

              <motion.div

                key={item}

                whileHover={{
                  scale: 1.02,
                }}

                className="
                  bg-black/30
                  border
                  border-white/5
                  rounded-2xl
                  p-4
                  flex
                  gap-3
                  items-start
                "
              >

                <AlertTriangle
                  size={18}
                  className="
                    text-yellow-400
                    mt-1
                  "
                />

                <p
                  className="
                    text-zinc-300
                    leading-relaxed
                  "
                >
                  {item}
                </p>

              </motion.div>
            ))}

          </div>

        </div>


        {/* TRANSCRIPT */}

        <div>

          <h3
            className="
              text-xl
              font-bold
              mb-4
              text-white
            "
          >
            Live Transcript
          </h3>


          <div
            className="
              bg-black/30
              border
              border-white/5
              rounded-2xl
              p-5
              h-[140px]
              overflow-y-auto
            "
          >

            <p
              className="
                text-zinc-400
                leading-relaxed
              "
            >
              {

                transcript ||

                "Waiting for transcript..."
              }
            </p>

          </div>

        </div>

      </div>

    </motion.div>
  );
}

export default AICopilot;