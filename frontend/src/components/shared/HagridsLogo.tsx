import { Link } from "react-router-dom";

type HagridsLogoProps = {
  variant?: "full" | "compact" | "minimal";
  className?: string;
  to?: string;
};

export default function HagridsLogo({
  variant = "full",
  className = "",
  to = "/",
}: HagridsLogoProps) {
  const content = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Ambient Lantern Icon */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#35251D] via-[#241B16] to-[#1A1512] border border-[#E8AD62]/30 shadow-md group-hover:border-[#E8AD62]/60 transition-all duration-300">
        {/* Soft amber radial glow */}
        <div className="absolute inset-0 rounded-xl bg-[#E8AD62]/10 blur-sm group-hover:bg-[#E8AD62]/20 transition-colors" />

        {/* Custom SVG Lantern */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-[#E8AD62] relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Lantern Top Loop */}
          <circle cx="12" cy="3.5" r="1.5" stroke="#E8AD62" />
          {/* Lantern Cap */}
          <path d="M7 6h10l-1.5 2H8.5L7 6z" fill="#E8AD62" fillOpacity="0.4" stroke="#E8AD62" />
          {/* Lantern Chamber */}
          <path d="M8.5 8h7l1 8h-9l1-8z" stroke="#E8AD62" />
          {/* Flame inside */}
          <path
            d="M12 10.5c-.8 1-1 1.8-.7 2.5.3.7 1 .9 1.4.9.4 0 1.1-.2 1.4-.9.3-.7.1-1.5-.7-2.5z"
            fill="#FDE68A"
            stroke="none"
          />
          {/* Base */}
          <path d="M7.5 16h9l-.5 2h-8l-.5-2z" fill="#E8AD62" fillOpacity="0.4" stroke="#E8AD62" />
        </svg>
      </div>

      {variant !== "minimal" && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-lg tracking-wide text-[#FFF7E9] group-hover:text-[#FDE68A] transition-colors">
              Hagrid's Hut
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-[#536B4F]/30 text-[#80C8B5] border border-[#536B4F]/40 tracking-wider">
              Hut
            </span>
          </div>
          {variant === "full" && (
            <span className="text-[11px] font-medium tracking-normal text-[#B9AB97]/80">
              a product of <span className="text-[#E8AD62] font-semibold">The Sorted Club</span>
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
