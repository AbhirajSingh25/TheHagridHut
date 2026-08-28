import {
  motion,
} from "framer-motion";

function SettingToggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {

  return (
    <motion.button
      whileTap={{
        scale: 0.95,
      }}
      onClick={onClick}
      className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
        enabled
          ? "bg-cyan-500"
          : "bg-white/10"
      }`}
    >

      <motion.div
        animate={{
          x: enabled
            ? 30
            : 4,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className="absolute top-1 w-7 h-7 rounded-full bg-white"
      />

    </motion.button>
  );
}

export default SettingToggle;