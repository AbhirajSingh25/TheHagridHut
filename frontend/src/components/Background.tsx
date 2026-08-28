import { motion } from "framer-motion";

function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">

      <div className="absolute inset-0 bg-[#050816]" />

      <div
        className="
          absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
          bg-[size:40px_40px]
        "
      />

      <motion.div
        animate={{
          x: [0, 80, -80, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[140px]"
      />

      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-purple-500/20 blur-[140px]"
      />

    </div>
  );
}

export default Background;