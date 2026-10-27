import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative
        rounded-xl
        border
        border-[#49372B]/12
        dark:border-[#E5D6BE]/12
        bg-[#FAF5EC]
        dark:bg-[#2E2721]
        text-[#302820]
        dark:text-[#F3EADD]
        shadow-sm
        transition-all
        duration-200
        hover:border-[#49372B]/25
        dark:hover:border-[#E5D6BE]/25
        hover:shadow-md
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}