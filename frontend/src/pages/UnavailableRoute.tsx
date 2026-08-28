import {
  ArrowLeft,
  Bot,
  Home,
  Radar,
  SearchX,
  Sparkles,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


function UnavailableRoute() {
  const navigate = useNavigate();


  return (
    <div
      className="
        relative
        min-h-[calc(100vh-140px)]
        overflow-hidden
        px-3
        py-6
        sm:px-5
        lg:px-7
      "
    >

      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[560px]
          w-[560px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-violet-500/[0.05]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-[12%]
          top-[16%]
          h-[260px]
          w-[260px]
          rounded-full
          bg-cyan-400/[0.035]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[5%]
          right-[10%]
          h-[280px]
          w-[280px]
          rounded-full
          bg-fuchsia-500/[0.035]
          blur-[130px]
        "
      />


      {/* =====================================================
          SUBTLE GRID
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.03]
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.45) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.45) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "48px 48px",
        }}
      />


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[calc(100vh-170px)]
          max-w-5xl
          items-center
          justify-center
        "
      >

        <div
          className="
            w-full
            max-w-3xl
            text-center
          "
        >

          {/* =================================================
              ANIMATED SIGNAL
          ================================================== */}

          <div
            className="
              relative
              mx-auto
              mb-9
              flex
              h-44
              w-44
              items-center
              justify-center
            "
          >

            <div
              className="
                absolute
                inset-0
                animate-[spin_26s_linear_infinite]
                rounded-full
                border
                border-violet-400/[0.12]
              "
            />

            <div
              className="
                absolute
                inset-4
                animate-[spin_18s_linear_infinite_reverse]
                rounded-[38%]
                border
                border-cyan-400/[0.16]
              "
            />

            <div
              className="
                absolute
                inset-9
                animate-[spin_14s_linear_infinite]
                rounded-full
                border
                border-fuchsia-400/[0.14]
              "
            />

            <div
              className="
                absolute
                h-28
                w-28
                rounded-full
                bg-violet-500/[0.10]
                blur-3xl
              "
            />

            <div
              className="
                relative
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                border
                border-white/[0.08]
                bg-[#0b0e18]/95
                shadow-[0_0_55px_rgba(139,92,246,0.16)]
                backdrop-blur-xl
              "
            >
              <SearchX
                size={30}
                className="text-violet-300"
              />
            </div>


            <span
              className="
                absolute
                right-3
                top-5
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-cyan-400
                shadow-[0_0_16px_rgba(34,211,238,0.9)]
              "
            />

            <span
              className="
                absolute
                bottom-8
                left-1
                h-2.5
                w-2.5
                animate-pulse
                rounded-full
                bg-violet-400
                shadow-[0_0_18px_rgba(167,139,250,0.9)]
              "
            />

          </div>


          {/* =================================================
              SYSTEM LABEL
          ================================================== */}

          <div
            className="
              mb-5
              flex
              items-center
              justify-center
              gap-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.3em]
              text-cyan-300
            "
          >
            <Radar size={13} />

            Route Unavailable
          </div>


          {/* =================================================
              CODE
          ================================================== */}

          <div
            className="
              mb-4
              font-mono
              text-[clamp(72px,15vw,150px)]
              font-bold
              leading-none
              tracking-[-0.08em]
              text-transparent
              bg-clip-text
              bg-gradient-to-b
              from-white
              via-slate-300
              to-slate-700
            "
          >
            404
          </div>


          {/* =================================================
              TITLE
          ================================================== */}

          <h1
            className="
              text-3xl
              font-semibold
              tracking-tight
              text-white
              sm:text-4xl
            "
          >
            This intelligence route is unavailable.
          </h1>


          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-7
              text-slate-500
            "
          >
            The destination you requested is not available in
            the current HireSense workspace. It may have moved,
            been removed, or never been deployed.
          </p>


          {/* =================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              mt-8
              flex
              flex-col
              justify-center
              gap-3
              sm:flex-row
            "
          >

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="
                group
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-violet-400/25
                bg-violet-500/[0.11]
                px-6
                text-sm
                font-semibold
                text-violet-100
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-violet-400/45
                hover:bg-violet-500/[0.16]
                hover:shadow-[0_14px_35px_rgba(139,92,246,0.14)]
              "
            >
              <Home size={16} />

              Return to Dashboard

              <Sparkles
                size={14}
                className="
                  text-violet-300
                  transition-transform
                  duration-200
                  group-hover:rotate-12
                "
              />
            </button>


            <button
              onClick={() =>
                navigate(-1)
              }
              className="
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                px-6
                text-sm
                font-medium
                text-slate-400
                transition-all
                duration-200
                hover:border-white/[0.15]
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              <ArrowLeft size={16} />

              Go Back
            </button>

          </div>


          {/* =================================================
              SYSTEM STATUS
          ================================================== */}

          <div
            className="
              mx-auto
              mt-10
              flex
              max-w-md
              items-center
              gap-3
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.018]
              px-4
              py-3.5
              text-left
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-400/10
                bg-cyan-400/[0.05]
              "
            >
              <Bot
                size={16}
                className="text-cyan-300"
              />
            </div>


            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-500
                "
              >
                HireSense Navigation
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                Core intelligence systems remain operational.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default UnavailableRoute;