import {
  NavLink,
} from "react-router-dom";

import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Trophy,
  Settings,
  Sparkles,
  Mic,
  Users,
  LogOut,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";


function Sidebar() {

  const {
    logout,
  } = useAuth();


  const links = [

    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },

    {
      name: "Live Interview",
      icon: Brain,
      path: "/live-interview",
    },

    {
      name: "Practice",
      icon: Mic,
      path: "/practice",
    },

    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },

    {
      name: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
    },

    {
      name: "Recruiter",
      icon: Users,
      path: "/recruiter",
    },

    {
      name: "AI Copilot",
      icon: Sparkles,
      path: "/copilot",
    },

    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];


  return (

    <aside
      className="
        hidden
        lg:flex
        flex-col
        justify-between
        w-[300px]
        min-h-screen
        border-r
        border-white/5
        bg-[#050505]
        px-6
        py-8
        sticky
        top-0
      "
    >

      {/* TOP */}

      <div>

        {/* LOGO */}

        <div
          className="
            flex
            items-center
            gap-4
            mb-12
          "
        >

          <div
            className="
              w-16
              h-16
              rounded-3xl
              bg-gradient-to-br
              from-red-500
              to-red-900
              flex
              items-center
              justify-center
              shadow-[0_0_40px_rgba(255,0,0,0.35)]
            "
          >

            <Brain
              size={30}
            />

          </div>


          <div>

            <h1
              className="
                text-3xl
                font-black
                text-white
              "
            >
              HireSense
            </h1>

            <p
              className="
                text-zinc-500
                text-sm
              "
            >
              AI Interview OS
            </p>

          </div>

        </div>



        {/* NAVIGATION */}

        <div className="space-y-3">

          {links.map((link) => {

            const Icon =
              link.icon;

            return (

              <NavLink
                key={link.name}
                to={link.path}

                className={({
                  isActive,
                }) =>
                  `
                    flex
                    items-center
                    gap-4
                    px-5
                    py-4
                    rounded-2xl
                    transition-all
                    duration-300
                    border

                    ${
                      isActive

                        ? `
                          bg-red-500/10
                          border-red-500/20
                          text-white
                          shadow-[0_0_30px_rgba(255,0,0,0.12)]
                        `

                        : `
                          border-transparent
                          text-zinc-500
                          hover:bg-white/[0.03]
                          hover:text-white
                        `
                    }
                  `
                }
              >

                <Icon
                  size={22}
                />

                <span
                  className="
                    font-semibold
                  "
                >
                  {link.name}
                </span>

              </NavLink>
            );
          })}

        </div>

      </div>



      {/* BOTTOM */}

      <div>

        <button
          onClick={logout}

          className="
            w-full
            flex
            items-center
            gap-4
            px-5
            py-4
            rounded-2xl
            text-zinc-500
            hover:text-red-400
            hover:bg-red-500/10
            transition-all
            duration-300
          "
        >

          <LogOut
            size={22}
          />

          <span
            className="
              font-semibold
            "
          >
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;