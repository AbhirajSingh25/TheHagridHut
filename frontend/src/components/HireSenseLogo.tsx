import React from "react";

interface HireSenseLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  compact?: boolean;
  className?: string;
}

const sizes = {
  sm: {
    icon: 32,
    text: "text-lg",
  },
  md: {
    icon: 42,
    text: "text-xl",
  },
  lg: {
    icon: 58,
    text: "text-3xl",
  },
};

function HireSenseLogo({
  size = "md",
  showText = true,
  compact = false,
  className = "",
}: HireSenseLogoProps) {
  const current = sizes[size];

  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
    >
      <div
        className="relative shrink-0"
        style={{
          width: current.icon,
          height: current.icon,
        }}
      >
        {/* Glow */}
        <div
          className="
            absolute
            inset-0
            rounded-xl
            bg-[#ff0040]/20
            blur-xl
          "
        />

        {/* Icon */}
        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          <defs>
            <linearGradient
              id="hiresense-logo-gradient"
              x1="10"
              y1="10"
              x2="90"
              y2="90"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ff335f" />
              <stop offset="0.5" stopColor="#ff0040" />
              <stop offset="1" stopColor="#b8002f" />
            </linearGradient>

            <linearGradient
              id="hiresense-logo-inner"
              x1="25"
              y1="20"
              x2="75"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#ffd7df" />
            </linearGradient>
          </defs>

          {/* Outer hexagonal frame */}
          <path
            d="
              M50 4
              L91 27
              L91 73
              L50 96
              L9 73
              L9 27
              Z
            "
            fill="url(#hiresense-logo-gradient)"
          />

          {/* Inner cutout */}
          <path
            d="
              M50 14
              L81 32
              L81 68
              L50 86
              L19 68
              L19 32
              Z
            "
            fill="#050505"
          />

          {/* H */}
          <path
            d="
              M29 27
              H39
              V44
              H61
              V27
              H71
              V73
              H61
              V54
              H39
              V73
              H29
              Z
            "
            fill="url(#hiresense-logo-inner)"
          />

          {/* AI signal line */}
          <path
            d="M43 49H57"
            stroke="#ff0040"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && !compact && (
        <div className="flex flex-col leading-none">
          <span
            className={`
              ${current.text}
              font-black
              tracking-tight
              text-white
            `}
          >
            HireSense
            <span className="text-[#ff0040]">AI</span>
          </span>

          {size !== "sm" && (
            <span
              className="
                mt-1
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-zinc-500
              "
            >
              Interview Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default HireSenseLogo;