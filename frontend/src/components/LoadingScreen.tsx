import { motion } from "framer-motion";

function LoadingScreen() {
  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#070812]
      "
    >
      {/* Ambient glow */}
      <div
        className="
          pointer-events-none
          absolute
          h-[500px]
          w-[500px]
          rounded-full
          bg-violet-600/10
          blur-[120px]
        "
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
        "
      >
        {/* Spinner */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            mb-7
            h-20
            w-20
            rounded-full
            border
            border-violet-400/10
            border-t-violet-400
            border-r-cyan-400/70
            shadow-[0_0_40px_rgba(139,92,246,0.18)]
          "
        />

        {/* Brand */}
        <h1
          className="
            text-3xl
            font-display
            font-bold
            tracking-tight
            text-[#FFF7E9]
          "
        >
          Hagrid's Hut
          <span className="block text-xs font-normal text-[#E8AD62] tracking-wider uppercase mt-1">
            a product of The Sorted Club
          </span>
        </h1>

        <p
          className="
            mt-3
            font-mono
            text-[10px]
            uppercase
            tracking-[0.2em]
            text-zinc-500
          "
        >
          Initializing AI systems...
        </p>

        <div
          className="
            mt-6
            h-px
            w-32
            overflow-hidden
            bg-white/5
          "
        >
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              h-full
              w-1/2
              bg-gradient-to-r
              from-transparent
              via-violet-400
              to-transparent
            "
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;