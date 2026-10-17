import { useTheme } from "../../context/ThemeContext";
import ParticleScene from "./ParticleScene";

export default function HireSenseBackground() {
  const { experience } = useTheme();
  const isCozy = experience === "cozy";

  if (isCozy) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft Hearth Radial Light */}
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(232,173,98,0.12),transparent_70%)] blur-3xl animate-amber-pulse" />
        
        {/* Deep Wood / Forest Shadow Corner */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-[radial-gradient(circle_at_bottom_right,rgba(83,107,79,0.08),transparent_65%)] blur-2xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[radial-gradient(circle_at_bottom_left,rgba(53,37,29,0.2),transparent_60%)] blur-2xl" />

        {/* Ambient Dark Readability Layer */}
        <div className="absolute inset-0 bg-[#1A1512]/40" />
      </div>
    );
  }

  // Advanced Mode (Modernized HireSense AI)
  return (
    <div
      className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Grid */}
      <div className="hs-grid absolute inset-0 opacity-30" />

      {/* Emerald / Cyan Aurora */}
      <div className="hs-aurora opacity-75" />

      {/* 3D neural sphere */}
      <ParticleScene />

      {/* Dark readability layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,9,14,0.35)_70%,rgba(7,9,14,0.8)_100%)]" />
    </div>
  );
}