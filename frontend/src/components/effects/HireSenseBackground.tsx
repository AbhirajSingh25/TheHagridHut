import { useTheme } from "../../context/ThemeContext";

export default function HireSenseBackground() {
  const { experience } = useTheme();
  const isCozy = experience === "cozy";

  if (isCozy) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Very subtle warm study corner tone (restrained, no pulsing animations) */}
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_top_right,rgba(172,114,86,0.04),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[350px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(122,128,101,0.03),transparent_70%)]" />
      </div>
    );
  }

  // Advanced Mode (Quiet, clean dark backdrop)
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#1C1E20]/50" />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_top_right,rgba(122,128,101,0.04),transparent_70%)]" />
    </div>
  );
}