import { Link } from "react-router-dom";

type HagridsLogoProps = {
  variant?: "full" | "compact" | "minimal" | "mark-only" | "stacked";
  className?: string;
  to?: string;
  inverse?: boolean;
};

export function HagridsHutMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 rounded-lg bg-[#49372B] text-[#FAF5EC] shadow-sm transition-transform duration-200 group-hover:scale-[1.03] ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        {/* Soft curly chimney smoke */}
        <path
          d="M21 7C20.5 5.5 22 4.5 21.5 3"
          stroke="#E5D6BE"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Chimney */}
        <path
          d="M20 9V7H23V11"
          stroke="#F3EADD"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cottage Roofline (Gabled study roof) */}
        <path
          d="M5 14L16 6L27 14"
          stroke="#F3EADD"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cottage Walls */}
        <path
          d="M8 13.5V25C8 25.55 8.45 26 9 26H23C23.55 26 24 25.55 24 25V13.5"
          stroke="#F3EADD"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Warm Lit Study Window with Muntins */}
        <rect
          x="12"
          y="15"
          width="8"
          height="8"
          rx="1"
          fill="#FAF5EC"
          fillOpacity="0.95"
        />
        <line
          x1="16"
          y1="15"
          x2="16"
          y2="23"
          stroke="#49372B"
          strokeWidth="1.2"
        />
        <line
          x1="12"
          y1="19"
          x2="20"
          y2="19"
          stroke="#49372B"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

export default function HagridsLogo({
  variant = "full",
  className = "",
  to = "/",
  inverse = false,
}: HagridsLogoProps) {
  const content = (
    <div className={`group flex items-center gap-3 select-none text-left ${className}`}>
      <HagridsHutMark size={variant === "compact" ? 32 : 38} />

      {variant !== "mark-only" && variant !== "minimal" && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span
              className={`font-serif text-lg tracking-tight font-semibold ${
                inverse ? "text-[#FAF5EC]" : "text-[#302820]"
              } group-hover:text-[#AC7256] transition-colors`}
            >
              Hagrid's Hut
            </span>
          </div>

          {(variant === "full" || variant === "stacked") && (
            <span
              className={`text-[11px] font-sans tracking-normal ${
                inverse ? "text-[#E5D6BE]/80" : "text-[#6B5D50]"
              }`}
            >
              A product of <span className="font-medium text-[#AC7256]">The Sorted Club</span>
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block focus:outline-none" aria-label="Hagrid's Hut homepage">
        {content}
      </Link>
    );
  }

  return content;
}
