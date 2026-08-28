import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center z-10 px-6"
      >

        <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">

          <span className="text-white">
            Crack Interviews
          </span>

          <br />

          <span className="text-cyan-400 drop-shadow-[0_0_30px_cyan]">
            Using AI
          </span>

        </h1>

        <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          AI-powered interview copilot with speech analysis,
          eye-contact tracking, NLP evaluation, and personalized
          performance analytics.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">

          <Link
            to="/signup"
            className="
              px-8 py-4 rounded-2xl
              bg-cyan-500 hover:bg-cyan-400
              transition-all duration-300
              shadow-[0_0_40px_rgba(34,211,238,0.7)]
              text-lg font-semibold
            "
          >
            Start Interview
          </Link>

          <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-lg">
            Watch Demo
          </button>

        </div>
      </motion.div>
    </section>
  );
}

export default Hero;