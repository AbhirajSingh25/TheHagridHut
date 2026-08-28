import {
  Brain,
  Activity,
  Waves,
  Sparkles,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import PremiumCard from "./PremiumCard";

const systems = [

  {
    title:
      "Speech Analysis",

    status:
      "Active",

    icon:
      Waves,

    color:
      "text-cyan-300",
  },

  {
    title:
      "Vision Tracking",

    status:
      "Monitoring",

    icon:
      Activity,

    color:
      "text-purple-300",
  },

  {
    title:
      "AI Evaluation",

    status:
      "Processing",

    icon:
      Brain,

    color:
      "text-green-300",
  },

  {
    title:
      "Recruiter Intelligence",

    status:
      "Optimized",

    icon:
      Sparkles,

    color:
      "text-pink-300",
  },
];

function AIStatusPanel() {

  return (
    <PremiumCard className="p-8 overflow-hidden">

      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10">

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white">

              AI Systems

            </h2>

            <p className="text-gray-400 mt-2">

              Live interview intelligence infrastructure

            </p>

          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-green-500/10 border border-green-500/20">

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            <span className="text-green-300 text-sm font-semibold">

              All Systems Operational

            </span>

          </div>

        </div>

        <div className="grid sm:grid-cols-2 gap-5 mt-10">

          {systems.map(
            (
              item,
              index
            ) => {

              const Icon =
                item.icon;

              return (

                <motion.div
                  key={index}
                  whileHover={{
                    y: -4,
                  }}
                  className="rounded-3xl bg-white/5 border border-white/5 p-6"
                >

                  <div className="flex items-center justify-between">

                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>

                      <Icon size={24} />

                    </div>

                    <div className="flex items-center gap-2">

                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />

                      <span className="text-sm text-gray-400">

                        {item.status}

                      </span>

                    </div>

                  </div>

                  <h3 className="text-white font-semibold text-xl mt-6">

                    {item.title}

                  </h3>

                </motion.div>

              );
            }
          )}

        </div>

      </div>

    </PremiumCard>
  );
}

export default AIStatusPanel;