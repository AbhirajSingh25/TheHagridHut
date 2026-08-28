import {
  motion,
} from "framer-motion";

function PremiumCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {

  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
            }
          : {}
      }
      transition={{
        duration: 0.25,
      }}
      className={`
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-white/[0.045]
        backdrop-blur-2xl
        shadow-[0_8px_40px_rgba(0,0,0,0.25)]
        ${className}
      `}
    >

      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10">

        {children}

      </div>

    </motion.div>
  );
}

export default PremiumCard;