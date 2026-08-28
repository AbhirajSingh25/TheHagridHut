import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

function GlassCard({
  children,
  className = "",
}: GlassCardProps) {

  return (

    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/[0.07]
        bg-[#080910]/75
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        transition-all
        duration-300
        hover:border-purple-500/20
        ${className}
      `}
    >

      {/* purple ambient glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-purple-600/[0.06]
          blur-3xl
          transition
          duration-500
          group-hover:bg-purple-600/[0.12]
        "
      />


      {/* cyan ambient glow */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          left-1/3
          h-52
          w-52
          rounded-full
          bg-cyan-500/[0.04]
          blur-3xl
        "
      />


      <div
        className="
          relative
          z-10
        "
      >
        {children}
      </div>


    </div>

  );
}


export default GlassCard;