import { motion } from "framer-motion";

function CTA() {
  return (
    <section className="py-32 px-6 relative">

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="
          max-w-5xl mx-auto
          rounded-[40px]
          border border-white/10
          bg-white/5
          backdrop-blur-2xl
          p-16
          text-center
          relative
          overflow-hidden
        "
      >

        <div className="absolute inset-0 bg-cyan-500/5" />

        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight relative z-10">
          Ready to Master
          <span className="text-cyan-400 drop-shadow-[0_0_20px_cyan]">
            {" "}AI Interviews?
          </span>
        </h2>

        <p className="text-gray-400 text-lg mt-8 max-w-2xl mx-auto relative z-10">
          Practice technical, HR, and behavioral interviews with
          AI-powered real-time feedback and advanced analytics.
        </p>

        <div className="mt-12 relative z-10">
          <button className="
            px-10 py-5
            rounded-2xl
            bg-cyan-500
            hover:bg-cyan-400
            transition-all duration-300
            shadow-[0_0_50px_rgba(34,211,238,0.7)]
            text-lg font-bold
          ">
            Start Your AI Interview
          </button>
        </div>

      </motion.div>
    </section>
  );
}

export default CTA;