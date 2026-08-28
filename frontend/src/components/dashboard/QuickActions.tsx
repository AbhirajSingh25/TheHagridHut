import {
  useNavigate,
} from "react-router-dom";

import {
  Brain,
  Mic,
  BarChart3,
  Trophy,
  Sparkles,
  ArrowRight,
} from "lucide-react";


function QuickActions() {

  const navigate =
    useNavigate();


  const actions = [

    {
      title: "Start AI Interview",
      subtitle:
        "Launch recruiter-grade interview simulation",

      icon: Brain,

      route: "/live-interview",

      glow:
        "shadow-[0_0_40px_rgba(239,68,68,0.25)]",

      border:
        "border-red-500/20",

      iconBg:
        "bg-red-500/10",

      iconColor:
        "text-red-400",
    },

    {
      title: "Practice Mode",
      subtitle:
        "Train communication and technical rounds",

      icon: Mic,

      route: "/practice",

      glow:
        "shadow-[0_0_40px_rgba(6,182,212,0.2)]",

      border:
        "border-cyan-500/20",

      iconBg:
        "bg-cyan-500/10",

      iconColor:
        "text-cyan-400",
    },

    {
      title: "Analytics",
      subtitle:
        "View AI performance intelligence",

      icon: BarChart3,

      route: "/analytics",

      glow:
        "shadow-[0_0_40px_rgba(34,197,94,0.18)]",

      border:
        "border-green-500/20",

      iconBg:
        "bg-green-500/10",

      iconColor:
        "text-green-400",
    },

    {
      title: "Leaderboard",
      subtitle:
        "Track global ranking and growth",

      icon: Trophy,

      route: "/leaderboard",

      glow:
        "shadow-[0_0_40px_rgba(234,179,8,0.18)]",

      border:
        "border-yellow-500/20",

      iconBg:
        "bg-yellow-500/10",

      iconColor:
        "text-yellow-400",
    },
  ];


  return (

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-5
      "
    >

      {actions.map((action) => {

        const Icon =
          action.icon;

        return (

          <button
            key={action.title}

            onClick={() =>
              navigate(
                action.route
              )
            }

            className={`
              group
              relative
              overflow-hidden
              rounded-[32px]
              border
              ${action.border}
              bg-[#080808]
              p-7
              text-left
              transition-all
              duration-300
              hover:scale-[1.02]
              ${action.glow}
            `}
          >

            {/* GLOW */}

            <div
              className="
                absolute
                top-[-60px]
                right-[-60px]
                w-[140px]
                h-[140px]
                rounded-full
                bg-white/[0.03]
                blur-3xl
              "
            />


            {/* CONTENT */}

            <div className="relative z-10">

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-8
                "
              >

                <div
                  className={`
                    w-16
                    h-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    ${action.iconBg}
                  `}
                >

                  <Icon
                    className={action.iconColor}
                    size={30}
                  />

                </div>


                <ArrowRight
                  className="
                    text-zinc-600
                    transition-all
                    duration-300
                    group-hover:text-white
                    group-hover:translate-x-1
                  "
                />

              </div>


              <h3
                className="
                  text-2xl
                  font-black
                  mb-3
                "
              >
                {action.title}
              </h3>

              <p
                className="
                  text-zinc-500
                  leading-relaxed
                "
              >
                {action.subtitle}
              </p>


              {/* FOOTER */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-6
                  text-sm
                  text-zinc-600
                "
              >

                <Sparkles
                  size={14}
                />

                AI Powered

              </div>

            </div>

          </button>
        );
      })}

    </div>
  );
}

export default QuickActions;
