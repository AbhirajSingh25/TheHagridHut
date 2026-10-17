import HagridsLogo from "./shared/HagridsLogo";

interface HireSenseLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  compact?: boolean;
  className?: string;
  to?: string;
}

export default function HireSenseLogo({
  showText = true,
  compact = false,
  className = "",
  to = "/dashboard",
}: HireSenseLogoProps) {
  return (
    <HagridsLogo
      variant={!showText ? "minimal" : compact ? "compact" : "full"}
      className={className}
      to={to}
    />
  );
}