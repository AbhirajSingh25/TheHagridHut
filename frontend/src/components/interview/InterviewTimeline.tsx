import {
  motion,
} from "framer-motion";

import {

  Brain,

  Mic,

  Sparkles,

  Activity,

} from "lucide-react";


interface Props {

  transcript: string;

  aiFeedback: string;
}


function InterviewTimeline({

  transcript,

  aiFeedback,
}: Props) {

  const timeline = [

    {
      icon:
        Mic,

      title:
        "Candidate Speaking",

      description:

        transcript ||

        "Waiting for speech input...",
    },

    {
      icon:
        Brain,

      title:
        "AI Analysis",

      description:

        aiFeedback ||

        "AI evaluating response quality...",
    },

    {
      icon:
        Sparkles,

      title:
        "Recruiter Intelligence",

      description:
        "Confidence and communication metrics updating in real-time.",
    },

    {
      icon:
        Activity,

      title:
        "Behavior Tracking",

      description:
        "Monitoring pacing, posture, and eye contact.",
    },
  ];


  return (

    <div
      className="
        bg-[#070B14]
        border
        border-red-500/20
        rounded-[32px]
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

          <Activity
            className="
              text-red-400
            "
          />

        </div>


        <div>

          <h2
            className="
              text-3xl
              font-black
              text-white
            "
          >
            Live Timeline
          </h2>

          <p className="text-zinc-500">
            Real-time AI interview memory
          </p>

        </div>

      </div>


      <div className="space-y-6">

        {timeline.map((item, index) => {

          const Icon =
            item.icon;

          return (

            <motion.div

              key={item.title}

              initial={{
                opacity: 0,
                x: 30,
              }}

              animate={{
                opacity: 1,
                x: 0,
              }}

              transition={{
                delay:
                  index * 0.1,
              }}

              className="
                flex
                gap-5
              "
            >

              <div
                className="
                  flex
                  flex-col
                  items-center
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-red-500/20
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Icon
                    size={20}
                    className="
                      text-red-400
                    "
                  />

                </div>


                {

                  index !==
                  timeline.length - 1 && (

                    <div
                      className="
                        w-[2px]
                        flex-1
                        bg-red-500/20
                        mt-3
                      "
                    />
                  )
                }

              </div>


              <div
                className="
                  flex-1
                  pb-10
                "
              >

                <h3
                  className="
                    text-xl
                    font-bold
                    text-white
                    mb-3
                  "
                >
                  {item.title}
                </h3>


                <p
                  className="
                    text-zinc-400
                    leading-relaxed
                  "
                >
                  {item.description}
                </p>

              </div>

            </motion.div>
          );
        })}

      </div>

    </div>
  );
}

export default InterviewTimeline;