import ParticleScene from "./ParticleScene";

export default function HireSenseBackground() {
  return (
    <div
      className="
        fixed
top-0
left-0
w-full
h-screen
pointer-events-none
z-0
      "
      aria-hidden="true"
    >
      {/* Grid */}
      <div
        className="
          hs-grid
          absolute
          inset-0
          opacity-40
        "
      />

      {/* Aurora */}
      <div className="hs-aurora" />

      {/* 3D neural sphere */}
      <ParticleScene />

      {/* Dark readability layer */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,8,18,0.28)_70%,rgba(7,8,18,0.7)_100%)]
        "
      />
    </div>
  );
}