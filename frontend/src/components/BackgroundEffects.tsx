function BackgroundEffects() {

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute bottom-[-180px] right-[-120px] w-[460px] h-[460px] rounded-full bg-purple-500/10 blur-3xl" />

      <div className="absolute top-[30%] right-[20%] w-[280px] h-[280px] rounded-full bg-pink-500/5 blur-3xl" />

      <div className="absolute inset-0 opacity-[0.03]">

        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize:
              "32px 32px",
          }}
        />

      </div>

    </div>
  );
}

export default BackgroundEffects;