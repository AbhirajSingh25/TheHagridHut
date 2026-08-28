import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import PremiumCard from "./PremiumCard";

import PremiumButton from "./PremiumButton";

function WelcomePanel() {

  const settings =
    JSON.parse(
      localStorage.getItem(
        "hiresense-settings"
      ) || "{}"
    );

  const name =
    settings.name ||
    "Candidate";

  const role =
    settings.role ||
    "Software Engineer";

  const difficulty =
    settings.difficulty ||
    "Intermediate";

  return (
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
        duration: 0.5,
      }}
    >

      <PremiumCard className="p-8 lg:p-10 overflow-hidden">

        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 text-cyan-300 text-sm font-semibold">

            <Sparkles size={16} />

            AI Assistant Active

          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mt-8 max-w-3xl">

            Welcome back, {name}

          </h2>

          <p className="text-gray-400 text-base sm:text-lg leading-8 mt-6 max-w-2xl">

            Your AI interview workspace is ready.
            Continue preparing for
            <span className="text-cyan-300">
              {" "}
              {role}
            </span>
            {" "}
            interviews with
            <span className="text-purple-300">
              {" "}
              {difficulty}
            </span>
            {" "}
            difficulty analysis and recruiter-focused evaluation.

          </p>

          <div className="grid md:grid-cols-3 gap-5 mt-10">

            <div className="rounded-2xl bg-white/5 border border-white/5 p-5">

              <p className="text-gray-400 text-sm">

                Recommended Next Step

              </p>

              <h3 className="text-white font-semibold text-lg mt-4">

                Start mock interview

              </h3>

            </div>

            <div className="rounded-2xl bg-white/5 border border-white/5 p-5">

              <p className="text-gray-400 text-sm">

                AI Focus Area

              </p>

              <h3 className="text-white font-semibold text-lg mt-4">

                Communication clarity

              </h3>

            </div>

            <div className="rounded-2xl bg-white/5 border border-white/5 p-5">

              <p className="text-gray-400 text-sm">

                Recruiter Readiness

              </p>

              <h3 className="text-green-400 font-semibold text-lg mt-4">

                Improving steadily

              </h3>

            </div>

          </div>

          <div className="mt-10 flex flex-wrap gap-4">

            <PremiumButton>

              <div className="flex items-center gap-3">

                Continue Preparation

                <ArrowRight size={18} />

              </div>

            </PremiumButton>

            <PremiumButton variant="secondary">

              View Reports

            </PremiumButton>

          </div>

        </div>

      </PremiumCard>

    </motion.div>
  );
}

export default WelcomePanel;