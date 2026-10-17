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
        bg-[#030303]
        text-white
      "
    >
      <div className="flex flex-col items-center justify-center">

        {/* Animated Loader */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            relative
            mb-8
            h-24
            w-24
            rounded-full
            border-4
            border-[#ff0040]/15
            border-t-[#ff0040]
            border-r-[#ff0040]/40
          "
        />

        {/* Logo */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            text-4xl
            font-black
            tracking-tight
          "
        >
          Hagrid's Hut
          <span className="block text-xs font-normal text-[#E8AD62] tracking-wider uppercase mt-1">
            by The Sorted Club
          </span>
        </motion.h1>

        {/* Status */}
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            delay: 0.15,
          }}
          className="
            mt-3
            text-sm
            tracking-wide
            text-zinc-500
          "
        >
          Initializing AI systems...
        </motion.p>

        {/* Loading indicator */}
        <div className="mt-6 flex items-center gap-1.5">
          <motion.span
            animate={{
              opacity: [0.25, 1, 0.25],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 0,
            }}
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#ff0040]
            "
          />

          <motion.span
            animate={{
              opacity: [0.25, 1, 0.25],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 0.2,
            }}
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#ff0040]
            "
          />

          <motion.span
            animate={{
              opacity: [0.25, 1, 0.25],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 0.4,
            }}
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#ff0040]
            "
          />
        </div>

      </div>
    </div>
  );
}

export default LoadingScreen;