function AIOrb() {

  return (

    <div
      className="
        relative
        w-[320px]
        h-[320px]
        flex
        items-center
        justify-center
      "
    >

      <div
        className="
          absolute
          inset-0
          rounded-full
          bg-red-500/20
          blur-[100px]
          animate-pulse
        "
      />


      <div
        className="
          absolute
          w-full
          h-full
          rounded-full
          border
          border-red-500/20
          animate-spin
        "
        style={{
          animationDuration: "12s",
        }}
      />


      <div
        className="
          absolute
          w-[260px]
          h-[260px]
          rounded-full
          border
          border-cyan-400/20
          animate-spin
        "
        style={{
          animationDuration: "8s",
          animationDirection: "reverse",
        }}
      />


      <div
        className="
          relative
          w-[180px]
          h-[180px]
          rounded-full
          bg-gradient-to-br
          from-red-500
          via-red-600
          to-red-900
          shadow-[0_0_80px_rgba(255,0,0,0.5)]
          flex
          items-center
          justify-center
        "
      >

        <div
          className="
            absolute
            inset-4
            rounded-full
            border
            border-white/20
          "
        />


        <div
          className="
            w-24
            h-24
            rounded-full
            bg-black/30
            backdrop-blur-xl
            border
            border-white/20
          "
        />

      </div>

    </div>
  );
}

export default AIOrb;