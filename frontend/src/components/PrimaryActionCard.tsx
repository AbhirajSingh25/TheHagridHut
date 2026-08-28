import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import PremiumButton from "./PremiumButton";

function PrimaryActionCard() {

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
      className="relative overflow-hidden rounded-[36px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-[#0b1120] to-[#050816] p-8 sm:p-10 lg:p-12"
    >

      <div className="absolute top-0 right-0 w-[340px] h-[340px] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 max-w-3xl">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-semibold">

          <Sparkles size={16} />

          AI Interview Workspace

        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mt-8">

          Continue preparing for your next interview

        </h1>

        <p className="text-gray-400 text-lg leading-8 mt-8 max-w-2xl">

          Practice technical interviews,
          improve communication,
          analyze recruiter readiness
          and receive AI-powered evaluation reports.

        </p>

        <div className="flex flex-wrap gap-4 mt-10">

          <PremiumButton>

            <div className="flex items-center gap-3">

              Start Mock Interview

              <ArrowRight size={18} />

            </div>

          </PremiumButton>

          <PremiumButton variant="secondary">

            View Reports

          </PremiumButton>

        </div>

      </div>

    </motion.div>
  );
}

export default PrimaryActionCard;