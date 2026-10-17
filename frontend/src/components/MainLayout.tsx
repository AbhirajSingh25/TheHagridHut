import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Camera,
  ChevronDown,
  ChevronRight,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  X,
  Zap,
  Building2,
  MoreHorizontal,
  PlayCircle,
  Target,
  FileCheck2,
  Award,
  UsersRound,
  ShieldCheck,
  BriefcaseBusiness,
  Smartphone
} from "lucide-react";

import HagridsLogo from "./shared/HagridsLogo";
import ExperienceToggle from "./shared/ExperienceToggle";
import AmbientSoundController from "./shared/AmbientSoundController";
import InstallAppModal from "./shared/InstallAppModal";
import { useTheme } from "../context/ThemeContext";

type Props = {
  children: ReactNode;
};


type NavItem = {
  name: string;
  path: string;
  icon: ReactNode;
  badge?: string;
  accent?: "violet" | "cyan" | "emerald";
};


function MainLayout({
  children,
}: Props) {

  const location = useLocation();

  const navigate = useNavigate();


  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  const [
    collapsed,
    setCollapsed,
  ] = useState(false);


  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);


  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);


  const [
    moreOpen,
    setMoreOpen,
  ] = useState(false);


  const [
    morePinned,
    setMorePinned,
  ] = useState(false);


  const [
    profileImage,
    setProfileImage,
  ] = useState("");


  const [
    user,
    setUser,
  ] = useState<any>({});

  const { experience, setExperience } = useTheme();
  const [installModalOpen, setInstallModalOpen] = useState(false);


  /* =========================================================
     USER
     ========================================================= */

  useEffect(() => {

    try {

      const storedUser =
        localStorage.getItem("user");


      if (storedUser) {

        setUser(
          JSON.parse(storedUser)
        );

      }


      const storedProfile =
        localStorage.getItem(
          "hiresense_profile"
        );


      if (storedProfile) {

        const parsedProfile =
          JSON.parse(storedProfile);

        setProfileImage(
          parsedProfile?.avatar ||
          ""
        );

      } else {

        setProfileImage(
          ""
        );

      }

    } catch {

      setUser({});

    }

  }, [
    location.pathname,
  ]);


  useEffect(() => {

    function syncProfileImage() {

      try {

        const storedProfile =
          localStorage.getItem(
            "hiresense_profile"
          );

        const parsedProfile =
          storedProfile
            ? JSON.parse(storedProfile)
            : {};

        setProfileImage(
          parsedProfile?.avatar ||
          ""
        );

      } catch {

        setProfileImage(
          ""
        );

      }

    }


    window.addEventListener(
      "hiresense-profile-updated",
      syncProfileImage
    );

    window.addEventListener(
      "storage",
      syncProfileImage
    );

    return () => {

      window.removeEventListener(
        "hiresense-profile-updated",
        syncProfileImage
      );

      window.removeEventListener(
        "storage",
        syncProfileImage
      );

    };

  }, []);


  /* =========================================================
     CLOSE MOBILE SIDEBAR
     ========================================================= */

  useEffect(() => {

    setMobileOpen(false);
    setProfileMenuOpen(false);
    setMoreOpen(false);
    setMorePinned(false);

  }, [
    location.pathname,
  ]);


  /* =========================================================
     KEYBOARD SHORTCUTS
     ========================================================= */

  useEffect(() => {

    function handleKeyDown(
      event: KeyboardEvent
    ) {

      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {

        event.preventDefault();

        setSearchOpen(true);

      }


      if (
        event.key === "Escape"
      ) {

        setSearchOpen(false);

        setMobileOpen(false);

      }

    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, []);


  /* =========================================================
     RESET SEARCH
     ========================================================= */

  useEffect(() => {

    if (!searchOpen) {

      setSearchQuery("");

    }

  }, [
    searchOpen,
  ]);


  /* =========================================================
     LOGOUT
     ========================================================= */

  function logout() {

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "access_token"
    );


    navigate(
      "/login"
    );

  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  const primaryNavigation: NavItem[] = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <LayoutDashboard size={17} />
      ),
    },

    {
      name: "Mock Interview",
      path: "/mock-interview",
      icon: (
        <Brain size={17} />
      ),
      badge: "AI",
      accent: "violet",
    },

    {
      name: "Resume Analyzer",
      path: "/resume-analyzer",
      icon: (
        <FileText size={17} />
      ),
    },

    {
      name: "History",
      path: "/history",
      icon: (
        <History size={17} />
      ),
    },

    {
      name: "Reports",
      path: "/reports",
      icon: (
        <BarChart3 size={17} />
      ),
    },

  ];


  const intelligenceNavigation: NavItem[] = [

    {
      name: "Speech Analysis",
      path: "/speech-intelligence",
      icon: (
        <Mic size={17} />
      ),
      accent: "cyan",
    },

    {
      name: "Vision Analysis",
      path: "/vision-analysis",
      icon: (
        <Camera size={17} />
      ),
      accent: "cyan",
    },

    {
      name: "Analytics",
      path: "/analytics",
      icon: (
        <Activity size={17} />
      ),
    },

    {
      name: "AI Copilot",
      path: "/copilot",
      icon: (
        <Bot size={17} />
      ),
      badge: "AI",
      accent: "violet",
    },

  ];


  const moreNavigation: NavItem[] = [

    {
      name: "Practice Mode",
      path: "/practice",
      icon: (
        <PlayCircle size={17} />
      ),
      accent: "violet",
    },

    {
      name: "Live Interview",
      path: "/live-interview",
      icon: (
        <Mic size={17} />
      ),
      accent: "cyan",
    },

    {
      name: "JD Matcher",
      path: "/jd-matcher",
      icon: (
        <FileCheck2 size={17} />
      ),
      accent: "cyan",
    },

    {
      name: "Hiring Probability",
      path: "/hiring-probability",
      icon: (
        <Target size={17} />
      ),
      accent: "emerald",
    },

    {
      name: "Candidate Intelligence",
      path: "/candidate-intelligence",
      icon: (
        <UsersRound size={17} />
      ),
      accent: "violet",
    },

    {
      name: "Achievements",
      path: "/achievements",
      icon: (
        <Award size={17} />
      ),
      accent: "emerald",
    },

    {
      name: "Certificate",
      path: "/certificate",
      icon: (
        <Trophy size={17} />
      ),
      accent: "emerald",
    },

    {
      name: "Recruiter Dashboard",
      path: "/recruiter",
      icon: (
        <BriefcaseBusiness size={17} />
      ),
      accent: "violet",
    },

    {
      name: "Admin Center",
      path: "/admin",
      icon: (
        <ShieldCheck size={17} />
      ),
      accent: "cyan",
    },

  ];


  const utilityNavigation: NavItem[] = [

    {
      name: "Profile",
      path: "/profile",
      icon: (
        <UserRound size={17} />
      ),
    },

    {
      name: "Settings",
      path: "/settings",
      icon: (
        <Settings size={17} />
      ),
    },

  ];


  const allNavigation = useMemo(() => {

    return [

      ...primaryNavigation,

      ...intelligenceNavigation,

      ...moreNavigation,

      ...utilityNavigation,

    ];

  }, []);


  /* =========================================================
     ACTIVE ROUTE
     ========================================================= */

  function isActive(
    path: string
  ) {

    if (
      path === "/dashboard"
    ) {

      return (
        location.pathname === path
      );

    }


    return (

      location.pathname === path ||

      location.pathname.startsWith(
        `${path}/`
      )

    );

  }


  /* =========================================================
     SEARCH RESULTS
     ========================================================= */

  const filteredNavigation =
    allNavigation.filter(
      (item) => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (!query) {

          return true;

        }


        return (
          item.name
            .toLowerCase()
            .includes(query)
        );

      }
    );


  /* =========================================================
     NAV ITEM
     ========================================================= */

  function renderNavItem(
    item: NavItem
  ) {

    const active =
      isActive(item.path);


    const accentClass =
      item.accent === "cyan"
        ? active
          ? "text-cyan-300"
          : "text-[var(--muted)] group-hover:text-cyan-300"
        : item.accent === "emerald"
          ? active
            ? "text-emerald-300"
            : "text-[var(--muted)] group-hover:text-emerald-300"
          : active
            ? "text-violet-300"
            : "text-[var(--muted)] group-hover:text-violet-300";


    const activeBackground =
      item.accent === "cyan"
        ? `
          border-cyan-400/20
          bg-cyan-400/[0.07]
          shadow-[inset_0_0_20px_rgba(34,211,238,0.035)]
        `
        : item.accent === "emerald"
          ? `
            border-emerald-400/20
            bg-emerald-400/[0.07]
            shadow-[inset_0_0_20px_rgba(52,211,153,0.035)]
          `
          : `
            border-violet-400/20
            bg-violet-500/[0.11]
            shadow-[inset_0_0_20px_rgba(139,92,246,0.045)]
          `;


    const indicatorColor =
      item.accent === "cyan"
        ? `
          bg-cyan-400
          shadow-[0_0_10px_rgba(34,211,238,0.8)]
        `
        : item.accent === "emerald"
          ? `
            bg-emerald-400
            shadow-[0_0_10px_rgba(52,211,153,0.8)]
          `
          : `
            bg-violet-400
            shadow-[0_0_10px_rgba(167,139,250,0.8)]
          `;


    return (

      <Link
        key={item.path}
        to={item.path}
        title={
          collapsed
            ? item.name
            : undefined
        }
        className={`
          group
          relative
          flex
          h-11
          items-center
          rounded-xl
          border
          transition-all
          duration-200

          ${
            collapsed
              ? "justify-center px-3"
              : "gap-3 px-3.5"
          }

          ${
            active
              ? `
                text-[var(--text)]
                ${activeBackground}
              `
              : `
                border-transparent
                text-[var(--muted)]
                hover:border-[var(--border)]
                hover:bg-[var(--overlay-soft)]
                hover:text-[var(--text)]
              `
          }
        `}
      >

        {active && (

          <span
            className={`
              absolute
              left-0
              top-1/2
              h-5
              w-0.5
              -translate-y-1/2
              rounded-full
              ${indicatorColor}
            `}
          />

        )}


        <span
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            transition-all
            duration-200
            ${accentClass}
          `}
        >

          {item.icon}

        </span>


        {!collapsed && (

          <>

            <span
              className="
                min-w-0
                flex-1
                truncate
                text-[13px]
                font-medium
              "
            >

              {item.name}

            </span>


            {item.badge && (

              <span
                className="
                  rounded-md
                  border
                  border-violet-400/20
                  bg-violet-400/10
                  px-1.5
                  py-0.5
                  font-mono
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-violet-300
                "
              >

                {item.badge}

              </span>

            )}


            {active &&
              !item.badge && (

                <ChevronRight
                  size={13}
                  className="
                    text-violet-300/60
                  "
                />

              )}

          </>

        )}

      </Link>

    );

  }


  /* =========================================================
     COMMAND PALETTE NAVIGATE
     ========================================================= */

  function handleQuickNavigate(
    path: string
  ) {

    setSearchOpen(false);

    navigate(path);

  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <div
      className="
        min-h-screen
        bg-[var(--bg)]
        text-[var(--text)]
      "
    >

      {/* =====================================================
          GLOBAL BACKGROUND
          ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            left-[12%]
            top-[-180px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-600/[0.035]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[-160px]
            right-[5%]
            h-[380px]
            w-[380px]
            rounded-full
            bg-cyan-500/[0.025]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
          "
          style={{
            backgroundImage:
              `
                linear-gradient(
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                )
              `,
            backgroundSize:
              "48px 48px",
          }}
        />

      </div>


      {/* =====================================================
          MOBILE BACKDROP
          ===================================================== */}

      {mobileOpen && (

        <button
          aria-label="Close navigation"
          className="
            fixed
            inset-0
            z-40
            cursor-default
            bg-black/70
            backdrop-blur-sm
            lg:hidden
          "
          onClick={() =>
            setMobileOpen(false)
          }
        />

      )}


      {/* =====================================================
          SIDEBAR
          IMPORTANT:
          Expanded = 255px
          Collapsed = 78px
          ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          h-screen

          border-r
          border-[var(--border)]

          bg-[var(--bg-elevated-glass)]
          backdrop-blur-2xl

          transition-all
          duration-300

          lg:fixed
          lg:z-20

          ${
            collapsed
              ? "w-[78px]"
              : "w-[255px]"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        <div
          className="
            flex
            h-full
            flex-col
          "
        >

          {/* =================================================
              BRAND
              ================================================= */}

          <div
            className={`
              flex
              h-[72px]
              shrink-0
              items-center
              border-b
              border-[var(--border)]

              ${
                collapsed
                  ? "justify-center px-3"
                  : "justify-between px-5"
              }
            `}
          >

            <HagridsLogo
              variant={collapsed ? "minimal" : "full"}
              to="/dashboard"
            />


            <button
              onClick={() =>
                setMobileOpen(false)
              }
              className="
                rounded-lg
                p-2
                text-[var(--muted)]
                transition
                hover:bg-[var(--overlay-med)]
                hover:text-[var(--text)]
                lg:hidden
              "
            >

              <X size={18} />

            </button>

          </div>


          {/* =================================================
              NAVIGATION
              ================================================= */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-3
              py-5
            "
          >

            {!collapsed && (

              <p
                className="
                  mb-2
                  px-3
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[var(--text-faint)]
                "
              >
                Workspace
              </p>

            )}


            <div className="space-y-1">

              {
                primaryNavigation.map(
                  renderNavItem
                )
              }

            </div>


            <div
              className="
                my-5
                h-px
                bg-[var(--overlay-med)]
              "
            />


            {!collapsed && (

              <p
                className="
                  mb-2
                  px-3
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[var(--text-faint)]
                "
              >
                Intelligence
              </p>

            )}


            <div className="space-y-1">

              {
                intelligenceNavigation.map(
                  renderNavItem
                )
              }


              <div
                className="relative pt-1"
                onMouseEnter={() =>
                  setMoreOpen(true)
                }
                onMouseLeave={() => {
                  if (!morePinned) {
                    window.setTimeout(
                      () => {
                        if (!morePinned) {
                          setMoreOpen(false);
                        }
                      },
                      140
                    );
                  }
                }}
              >

                <button
                  type="button"
                  onClick={() => {
                    const next = !morePinned;
                    setMorePinned(next);
                    setMoreOpen(next);
                  }}
                  title={
                    collapsed
                      ? "More features"
                      : undefined
                  }
                  className={`
                    group
                    relative
                    flex
                    h-11
                    w-full
                    items-center
                    rounded-xl
                    border
                    transition-all
                    duration-200
                    ${
                      collapsed
                        ? "justify-center px-3"
                        : "gap-3 px-3.5"
                    }
                    ${
                      moreOpen
                        ? "border-violet-400/20 bg-violet-500/[0.08] text-violet-200"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--overlay-soft)] hover:text-[var(--text)]"
                    }
                  `}
                  aria-expanded={moreOpen}
                >

                  <span
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition
                      ${
                        moreOpen
                          ? "bg-violet-400/10 text-violet-300"
                          : "text-[var(--muted)] group-hover:text-violet-300"
                      }
                    `}
                  >
                    <MoreHorizontal size={18} />
                  </span>

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-[13px] font-medium">
                        More
                      </span>

                      <ChevronRight
                        size={13}
                        className={`transition-transform ${
                          moreOpen
                            ? "translate-x-0.5 text-violet-300"
                            : "text-[var(--text-faint)]"
                        }`}
                      />
                    </>
                  )}

                </button>

              </div>

            </div>


            <div
              className="
                my-5
                h-px
                bg-[var(--overlay-med)]
              "
            />


            {!collapsed && (

              <p
                className="
                  mb-2
                  px-3
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[var(--text-faint)]
                "
              >
                Account
              </p>

            )}


            <div className="space-y-1">

              {
                utilityNavigation.map(
                  renderNavItem
                )
              }

            </div>

          </div>


          {/* =================================================
              BOTTOM
              ================================================= */}

          <div
            className={`
              shrink-0
              border-t
              border-[var(--border)]

              ${
                collapsed
                  ? "p-3"
                  : "p-4"
              }
            `}
          >

            {/* AI STATUS */}

            <div
              className={`
                mb-3
                rounded-xl
                border
                border-emerald-400/10
                bg-emerald-400/[0.025]

                ${
                  collapsed
                    ? "flex justify-center p-2"
                    : "p-3"
                }
              `}
              title={
                collapsed
                  ? "AI systems online"
                  : undefined
              }
            >

              <div
                className={`
                  flex
                  items-center

                  ${
                    collapsed
                      ? "justify-center"
                      : "gap-2"
                  }
                `}
              >

                <span
                  className="
                    relative
                    flex
                    h-2
                    w-2
                  "
                >

                  <span
                    className="
                      absolute
                      inline-flex
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-emerald-400
                      opacity-50
                    "
                  />

                  <span
                    className="
                      relative
                      inline-flex
                      h-2
                      w-2
                      rounded-full
                      bg-emerald-400
                    "
                  />

                </span>


                {!collapsed && (

                  <span
                    className="
                      font-mono
                      text-[9px]
                      uppercase
                      tracking-[0.16em]
                      text-emerald-400/70
                    "
                  >
                    AI systems online
                  </span>

                )}

              </div>

            </div>


            <button
              onClick={logout}
              title={
                collapsed
                  ? "Sign out"
                  : undefined
              }
              className={`
                flex
                h-10
                w-full
                items-center
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--overlay-soft)]
                text-[var(--muted)]
                transition-all
                duration-200

                hover:border-red-400/15
                hover:bg-red-400/[0.05]
                hover:text-red-300

                ${
                  collapsed
                    ? "justify-center"
                    : "gap-3 px-3"
                }
              `}
            >

              <LogOut size={16} />


              {!collapsed && (

                <span
                  className="
                    text-xs
                    font-medium
                  "
                >
                  Sign out
                </span>

              )}

            </button>

          </div>

        </div>

      </aside>


      {moreOpen && (

        <aside
          className={`
            fixed
            top-[72px]
            z-[60]
            hidden
            h-[calc(100vh-72px)]
            w-[280px]
            overflow-y-auto
            border-r
            border-[var(--border)]
            bg-[var(--bg-elevated-glass)]
            p-4
            shadow-[24px_0_70px_rgba(0,0,0,0.45)]
            backdrop-blur-2xl
            transition-all
            duration-200
            lg:block
            ${
              collapsed
                ? "left-[78px]"
                : "left-[255px]"
            }
          `}
          onMouseEnter={() =>
            setMoreOpen(true)
          }
          onMouseLeave={() => {
            if (!morePinned) {
              setMoreOpen(false);
            }
          }}
        >

          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-violet-300">
                Extended workspace
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                More capabilities
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setMorePinned(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--overlay-med)] hover:text-[var(--text)]"
              aria-label="Close more menu"
            >
              <X size={15} />
            </button>
          </div>


          <div className="mt-4 space-y-1">

            {moreNavigation.map((item) => {

              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setMoreOpen(false);
                    setMorePinned(false);
                  }}
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-left
                    transition-all
                    ${
                      active
                        ? "border-violet-400/20 bg-violet-500/[0.09] text-[var(--text)]"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--overlay-soft)] hover:text-[var(--text)]"
                    }
                  `}
                >

                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    active
                      ? "border-violet-400/15 bg-violet-400/[0.08] text-violet-300"
                      : "border-[var(--border)] bg-[var(--overlay-soft)] text-[var(--muted)] group-hover:text-violet-300"
                  }`}>
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[var(--text-faint)]">
                      {active ? "Current section" : "Open workspace"}
                    </span>
                  </span>

                  <ChevronRight
                    size={14}
                    className="text-[var(--text-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-soft)]"
                  />

                </button>
              );

            })}

          </div>


          <div className="mt-6 rounded-2xl border border-violet-400/10 bg-violet-500/[0.04] p-4">
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                Workspace extensions
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Less-used capabilities stay here so the main sidebar remains focused instead of turning into a junk drawer. Humanity survives another menu.
            </p>
          </div>

        </aside>

      )}


      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <div
        className={`
          relative
          z-10
          min-h-screen
          transition-all
          duration-300

          ${
            collapsed
              ? "lg:ml-[78px]"
              : "lg:ml-[255px]"
          }
        `}
      >

        {/* ===================================================
            TOPBAR
            =================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-[72px]
            items-center
            justify-between
            border-b
            border-[var(--border)]
            bg-[var(--bg-glass)]
            px-4
            backdrop-blur-2xl
            sm:px-6
            lg:px-8
          "
        >

          {/* LEFT */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[var(--border)]
                bg-[var(--overlay-soft)]
                text-[var(--text-soft)]
                transition
                hover:text-[var(--text)]
                lg:hidden
              "
            >

              <Menu size={18} />

            </button>


            <button
              onClick={() =>
                setCollapsed(
                  (previous) =>
                    !previous
                )
              }
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[var(--border)]
                bg-[var(--overlay-soft)]
                text-[var(--muted)]
                transition
                hover:border-violet-400/20
                hover:text-violet-300
                lg:flex
              "
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >

              {
                collapsed
                  ? (
                    <PanelLeftOpen
                      size={17}
                    />
                  )
                  : (
                    <PanelLeftClose
                      size={17}
                    />
                  )
              }

            </button>


            <div
              className="
                hidden
                h-5
                w-px
                bg-[var(--overlay-med)]
                sm:block
              "
            />


            <div className="hidden sm:block">
              <p
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-[var(--text-faint)]
                "
              >
                Hagrid's Hut / {experience === "cozy" ? "Study Desk" : "Advanced Telemetry"}
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-medium
                  text-[var(--text-soft)]
                "
              >
                {experience === "cozy" ? "by The Sorted Club" : "Professional Career OS"}
              </p>
            </div>

          </div>


          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <ExperienceToggle variant="compact" className="hidden sm:inline-flex" />
            <AmbientSoundController />

            <button
              onClick={() =>
                setSearchOpen(true)
              }
              className="
                group
                flex
                h-9
                items-center
                gap-2
                rounded-lg
                border
                border-[var(--border)]
                bg-[var(--overlay-soft)]
                px-3
                text-[var(--muted)]
                transition
                hover:border-[var(--border-hover)]
                hover:text-[var(--text-soft)]
              "
            >

              <Search size={15} />

              <span
                className="
                  hidden
                  text-[11px]
                  sm:block
                "
              >
                Search
              </span>

              <kbd
                className="
                  hidden
                  rounded
                  border
                  border-[var(--border)]
                  bg-[var(--overlay-soft)]
                  px-1.5
                  py-0.5
                  font-mono
                  text-[8px]
                  text-[var(--text-faint)]
                  md:block
                "
              >
                Ctrl K
              </kbd>

            </button>


            <button
              onClick={() =>
                navigate(
                  "/copilot"
                )
              }
              title="AI Copilot"
              className="
                relative
                hidden
                h-9
                items-center
                gap-2
                rounded-lg
                border
                border-violet-400/15
                bg-violet-500/[0.07]
                px-3
                text-violet-300
                transition
                hover:border-violet-400/30
                hover:bg-violet-500/[0.12]
                lg:flex
              "
            >

              <Bot size={15} />

              <span
                className="
                  text-[11px]
                  font-medium
                "
              >
                AI Copilot
              </span>

            </button>


            <button
              onClick={() =>
                navigate(
                  "/notifications"
                )
              }
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-[var(--border)]
                bg-[var(--overlay-soft)]
                text-[var(--muted)]
                transition
                hover:border-[var(--border-hover)]
                hover:text-[var(--text)]
              "
            >

              <Bell size={16} />

              <span
                className="
                  absolute
                  right-2
                  top-2
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-violet-400
                  shadow-[0_0_8px_rgba(167,139,250,0.7)]
                "
              />

            </button>


            <div
              className="
                ml-1
                h-7
                w-px
                bg-[var(--overlay-med)]
              "
            />


            <div
              className="
                relative
              "
            >

              <button
                onClick={() =>
                  setProfileMenuOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  transition
                "
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >

                <div
                  className="
                    relative
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-500
                    to-fuchsia-500
                    text-xs
                    font-bold
                    text-[var(--text)]
                    transition
                    group-hover:shadow-[0_0_22px_rgba(139,92,246,0.22)]
                  "
                >

                  {profileImage ? (

                    <img
                      src={profileImage}
                      alt="Profile"
                      className="
                        h-full
                        w-full
                        rounded-xl
                        object-cover
                      "
                    />

                  ) : (

                    (
                      user?.username ||
                      user?.email ||
                      "A"
                    )
                      .charAt(0)
                      .toUpperCase()

                  )}

                </div>


                <div
                  className="
                    hidden
                    text-left
                    md:block
                  "
                >

                  <p
                    className="
                      max-w-[110px]
                      truncate
                      text-[11px]
                      font-semibold
                      text-[var(--text-soft)]
                    "
                  >

                    {
                      user?.username ||
                      "Candidate"
                    }

                  </p>


                  <p
                    className="
                      font-mono
                      text-[8px]
                      uppercase
                      tracking-wider
                      text-[var(--muted)]
                    "
                  >
                    Candidate
                  </p>

                </div>


                <ChevronDown
                  size={14}
                  className={`
                    hidden
                    text-[var(--muted)]
                    transition-transform
                    duration-200
                    lg:block
                    ${
                      profileMenuOpen
                        ? "rotate-180 text-violet-300"
                        : "group-hover:text-[var(--text-soft)]"
                    }
                  `}
                />

              </button>


              {profileMenuOpen && (

                <div
                  role="menu"
                  className="
                    absolute
                    right-0
                    top-[calc(100%+12px)]
                    z-50
                    w-[260px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--bg-elevated-glass)]
                    p-2
                    shadow-[0_28px_90px_rgba(0,0,0,0.5)]
                    backdrop-blur-2xl
                  "
                >

                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--overlay-soft)]
                      p-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-violet-500
                        to-fuchsia-500
                        text-sm
                        font-bold
                        text-[var(--text)]
                      "
                    >

                      {profileImage ? (

                        <img
                          src={profileImage}
                          alt="Profile"
                          className="
                            h-full
                            w-full
                            rounded-xl
                            object-cover
                          "
                        />

                      ) : (

                        (
                          user?.username ||
                          user?.email ||
                          "A"
                        )
                          .charAt(0)
                          .toUpperCase()

                      )}

                    </div>


                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-xs
                          font-semibold
                          text-[var(--text)]
                        "
                      >
                        {user?.username || "Candidate"}
                      </p>

                      <p
                        className="
                          mt-1
                          truncate
                          text-[10px]
                          text-[var(--muted)]
                        "
                      >
                        {
                          user?.email ||
                          "Personal workspace"
                        }
                      </p>

                    </div>

                  </div>


                  {[
                    {
                      label: "Profile",
                      description: "Career identity",
                      icon: <UserRound size={16} />,
                      path: "/profile",
                    },
                    {
                      label: "Achievements",
                      description: "Progress milestones",
                      icon: <Trophy size={16} />,
                      path: "/achievements",
                    },
                    {
                      label: "Certificate",
                      description: "Interview credentials",
                      icon: <FileText size={16} />,
                      path: "/certificate",
                    },
                    {
                      label: "Leaderboard",
                      description: "Performance rankings",
                      icon: <Trophy size={16} />,
                      path: "/leaderboard",
                    },
                    {
                      label: "Settings",
                      description: "Workspace preferences",
                      icon: <Settings size={16} />,
                      path: "/settings",
                    },
                  ].map((item) => (

                    <button
                      key={item.path}
                      role="menuitem"
                      onClick={() =>
                        navigate(item.path)
                      }
                      className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        transition
                        hover:bg-[var(--overlay-med)]
                      "
                    >

                      <span
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-[var(--border)]
                          bg-[var(--overlay-soft)]
                          text-[var(--muted)]
                          transition
                          group-hover:border-violet-400/15
                          group-hover:bg-violet-500/[0.06]
                          group-hover:text-violet-300
                        "
                      >
                        {item.icon}
                      </span>

                      <span className="min-w-0 flex-1">

                        <span
                          className="
                            block
                            text-xs
                            font-medium
                            text-[var(--text-soft)]
                            transition
                            group-hover:text-[var(--text)]
                          "
                        >
                          {item.label}
                        </span>

                        <span
                          className="
                            mt-0.5
                            block
                            text-[10px]
                            text-[var(--muted)]
                          "
                        >
                          {item.description}
                        </span>

                      </span>

                      <ChevronRight
                        size={14}
                        className="
                          text-[var(--text-faint)]
                          transition
                          group-hover:text-violet-300
                        "
                      />

                    </button>

                  ))}


                  <div
                    className="
                      my-2
                      h-px
                      bg-[var(--overlay-med)]
                    "
                  />


                  <button
                    role="menuitem"
                    onClick={() =>
                      navigate("/admin")
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-cyan-400/10
                      bg-cyan-400/[0.025]
                      px-3
                      py-3
                      text-left
                      transition
                      hover:border-cyan-400/20
                      hover:bg-cyan-400/[0.06]
                    "
                  >

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-400/15
                        bg-cyan-400/[0.06]
                        text-cyan-300
                      "
                    >
                      <Building2 size={16} />
                    </span>

                    <span className="min-w-0 flex-1">

                      <span
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          font-semibold
                          text-cyan-100
                        "
                      >
                        Administration

                        <span
                          className="
                            rounded-md
                            border
                            border-cyan-400/15
                            bg-cyan-400/[0.06]
                            px-1.5
                            py-0.5
                            font-mono
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-cyan-300
                          "
                        >
                          Admin
                        </span>

                      </span>

                      <span
                        className="
                          mt-1
                          block
                          text-[10px]
                          text-[var(--muted)]
                        "
                      >
                        Platform control center
                      </span>

                    </span>

                    <ChevronRight
                      size={14}
                      className="
                        text-cyan-400/50
                        transition
                        group-hover:text-cyan-300
                      "
                    />

                  </button>

                </div>

              )}

            </div>

          </div>

        </header>


        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <main
          className="
            relative
            z-10
            min-h-screen
            px-4
            sm:px-6
            lg:px-8
            py-6
            sm:py-8
            pb-24
            lg:pb-8
          "
        >

          {children}

        </main>

      </div>


      {/* =====================================================
          SEARCH COMMAND PALETTE
          ===================================================== */}

      {searchOpen && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-start
            justify-center
            bg-black/70
            px-4
            pt-[15vh]
            backdrop-blur-md
          "
          onMouseDown={() =>
            setSearchOpen(false)
          }
        >

          <div
            className="
              w-full
              max-w-xl
              overflow-hidden
              rounded-2xl
              border
              border-[var(--border)]
              bg-[var(--bg-elevated)]
              shadow-[0_30px_100px_rgba(0,0,0,0.55)]
            "
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className="
                flex
                items-center
                gap-3
                border-b
                border-[var(--border)]
                px-4
              "
            >

              <Search
                size={17}
                className="text-[var(--muted)]"
              />


              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search Hagrid's Hut..."
                className="
                  h-14
                  flex-1
                  bg-transparent
                  text-sm
                  text-[var(--text)]
                  outline-none
                  placeholder:text-[var(--text-faint)]
                "
                onKeyDown={(event) => {

                  if (
                    event.key === "Escape"
                  ) {

                    setSearchOpen(false);

                  }


                  if (
                    event.key === "Enter" &&
                    filteredNavigation.length > 0
                  ) {

                    handleQuickNavigate(
                      filteredNavigation[0].path
                    );

                  }

                }}
              />


              <kbd
                className="
                  rounded-md
                  border
                  border-[var(--border)]
                  px-2
                  py-1
                  font-mono
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                ESC
              </kbd>

            </div>


            <div className="p-3">

              <p
                className="
                  px-2
                  pb-2
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.18em]
                  text-[var(--text-faint)]
                "
              >
                Quick navigation
              </p>


              <div
                className="
                  max-h-[360px]
                  space-y-1
                  overflow-y-auto
                "
              >

                {
                  filteredNavigation.map(
                    (item) => (

                      <button
                        key={item.path}
                        onClick={() =>
                          handleQuickNavigate(
                            item.path
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-left
                          text-[var(--text-soft)]
                          transition
                          hover:bg-[var(--overlay-med)]
                          hover:text-[var(--text)]
                        "
                      >

                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-[var(--overlay-soft)]
                            text-[var(--muted)]
                          "
                        >

                          {item.icon}

                        </span>


                        <span
                          className="
                            flex-1
                            text-sm
                          "
                        >

                          {item.name}

                        </span>


                        <ChevronRight
                          size={13}
                          className="
                            text-[var(--text-faint)]
                          "
                        />

                      </button>

                    )
                  )
                }


                {
                  filteredNavigation.length === 0 && (

                    <div
                      className="
                        px-4
                        py-10
                        text-center
                      "
                    >

                      <Search
                        size={24}
                        className="
                          mx-auto
                          mb-3
                          text-[var(--text-faint)]
                        "
                      />

                      <p
                        className="
                          text-sm
                          text-[var(--muted)]
                        "
                      >
                        No navigation found
                      </p>

                    </div>

                  )
                }

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-2
                border-t
                border-[var(--border)]
                px-4
                py-3
              "
            >

              <Sparkles
                size={13}
                className="text-violet-400"
              />


              <span
                className="
                  text-[10px]
                  text-[var(--muted)]
                "
              >
                Hagrid's Hut command center · A product of The Sorted Club
              </span>


              <MessageSquareText
                size={12}
                className="
                  ml-auto
                  text-violet-400/50
                "
              />


              <Zap
                size={12}
                className="
                  text-cyan-400/50
                "
              />

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION (Phones & Tablets)
          Ergonomic bottom touch targets + iOS safe area insets
          ===================================================== */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="
          lg:hidden
          fixed
          bottom-0
          left-0
          right-0
          z-40
          bg-[var(--bg-elevated-glass)]
          border-t
          border-[var(--border)]
          backdrop-blur-2xl
          px-3
          py-2
          flex
          items-center
          justify-around
          shadow-[0_-10px_30px_rgba(0,0,0,0.45)]
        "
        style={{ paddingBottom: "max(var(--safe-bottom), 8px)" }}
      >
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive("/dashboard") ? "text-[#E8AD62] font-semibold" : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Desk</span>
        </Link>

        <Link
          to="/practice"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive("/practice") ? "text-[#E8AD62] font-semibold" : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <Mic size={18} />
          <span>Practice</span>
        </Link>

        <Link
          to="/resume"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive("/resume") ? "text-[#E8AD62] font-semibold" : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <FileText size={18} />
          <span>Resume</span>
        </Link>

        <Link
          to="/reports"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive("/reports") ? "text-[#E8AD62] font-semibold" : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <BarChart3 size={18} />
          <span>Reports</span>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

    </div>

  );

}


export default MainLayout;