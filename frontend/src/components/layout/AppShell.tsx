import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  Video,
  Mic2,
  BarChart3,
  ClipboardCheck,
  Trophy,
  Users,
  Bot,
  Settings,
  Award,
  Target,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "../../context/AuthContext";

import "../../styles/app-shell.css";


type AppShellProps = {
  children: ReactNode;
};


type NavigationItem = {
  label: string;
  path: string;
  icon: React.ElementType;
};


const mainNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Resume Analyzer",
    path: "/resume-analyzer",
    icon: FileText,
  },
  {
    label: "JD Matcher",
    path: "/jd-matcher",
    icon: BriefcaseBusiness,
  },
  {
    label: "Live Interview",
    path: "/live-interview",
    icon: Video,
  },
  {
    label: "Practice Arena",
    path: "/practice",
    icon: Target,
  },
  {
    label: "Coding Interview",
    path: "/coding",
    icon: Code2,
  },
];


const intelligenceNavigation: NavigationItem[] = [
  {
    label: "Speech Intelligence",
    path: "/speech-intelligence",
    icon: Mic2,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ClipboardCheck,
  },
  {
    label: "AI Copilot",
    path: "/copilot",
    icon: Bot,
  },
];


const progressNavigation: NavigationItem[] = [
  {
    label: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: Award,
  },
  {
    label: "Certificate",
    path: "/certificate",
    icon: ShieldCheck,
  },
];


const recruiterNavigation: NavigationItem[] = [
  {
    label: "Recruiter",
    path: "/recruiter",
    icon: Users,
  },
  {
    label: "Candidate Intelligence",
    path: "/candidate-intelligence",
    icon: Sparkles,
  },
];


function NavigationSection({
  title,
  items,
  collapsed,
}: {
  title: string;
  items: NavigationItem[];
  collapsed: boolean;
}) {
  return (
    <div className="hs-nav-section">

      {!collapsed && (
        <div className="hs-nav-section-title">
          {title}
        </div>
      )}

      <div className="hs-nav-items">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "hs-nav-item",
                  isActive
                    ? "hs-nav-item-active"
                    : "",
                ].join(" ")
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
            >

              <Icon
                size={17}
                strokeWidth={1.8}
              />

              {!collapsed && (
                <span>
                  {item.label}
                </span>
              )}

            </NavLink>
          );
        })}

      </div>
    </div>
  );
}


export default function AppShell({
  children,
}: AppShellProps) {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    isAuthenticated,
    user,
    logout,
  } = useAuth();

  const [
    collapsed,
    setCollapsed,
  ] = useState(false);


  useEffect(() => {

    const stored =
      localStorage.getItem(
        "hiresense_sidebar_collapsed",
      );

    if (stored === "true") {
      setCollapsed(true);
    }

  }, []);


  const toggleSidebar = () => {

    setCollapsed(
      (previous) => {

        const next =
          !previous;

        localStorage.setItem(
          "hiresense_sidebar_collapsed",
          String(next),
        );

        return next;
      },
    );
  };


  const handleLogout = () => {

    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };


  const currentPath =
    location.pathname;


  const pageTitle =
    currentPath === "/dashboard"
      ? "Dashboard"
      : currentPath.includes(
          "resume",
        )
        ? "Resume Intelligence"
        : currentPath.includes(
            "jd-matcher",
          )
          ? "Job Description Matcher"
          : currentPath.includes(
              "live-interview",
            )
            ? "Live Interview"
            : currentPath.includes(
                "practice",
              )
              ? "Practice Arena"
              : currentPath.includes(
                  "speech",
                )
                ? "Speech Intelligence"
                : currentPath.includes(
                    "analytics",
                  )
                  ? "Analytics"
                  : currentPath.includes(
                      "reports",
                    )
                    ? "Interview Reports"
                    : currentPath.includes(
                        "copilot",
                      )
                      ? "AI Copilot"
                      : currentPath.includes(
                          "leaderboard",
                        )
                        ? "Leaderboard"
                        : currentPath.includes(
                            "recruiter",
                          )
                          ? "Recruiter Intelligence"
                          : currentPath.includes(
                              "candidate-intelligence",
                            )
                            ? "Candidate Intelligence"
                            : currentPath.includes(
                                "achievements",
                              )
                              ? "Achievements"
                              : currentPath.includes(
                                  "certificate",
                                )
                                ? "Certificate"
                                : "HireSense AI";


  return (
    <div
      className={[
        "hs-app-shell",
        collapsed
          ? "hs-sidebar-collapsed"
          : "",
      ].join(" ")}
    >

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="hs-sidebar">

        {/* Brand */}

        <div className="hs-sidebar-brand">

          <button
            className="hs-brand"
            onClick={() =>
              navigate("/dashboard")
            }
          >

            <div className="hs-brand-mark">
              H
            </div>

            {!collapsed && (
              <div className="hs-brand-text">

                <span>
                  HireSense
                </span>

                <span className="hs-brand-ai">
                  AI
                </span>

              </div>
            )}

          </button>

          <button
            className="hs-collapse-button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >

            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}

          </button>

        </div>


        {/* User */}

        <div
          className={[
            "hs-sidebar-user",
            collapsed
              ? "hs-sidebar-user-collapsed"
              : "",
          ].join(" ")}
        >

          <div className="hs-user-avatar">

            {(
              user?.email ||
"U"
            )
              .charAt(0)
              .toUpperCase()}

          </div>

          {!collapsed && (
            <div className="hs-user-info">

              <div className="hs-user-name">
                {user?.email ||
  "Candidate"}
              </div>

              <div className="hs-user-role">
                AI Candidate
              </div>

            </div>
          )}

        </div>


        {/* Navigation */}

        <nav className="hs-sidebar-navigation">

          <NavigationSection
            title="Workspace"
            items={mainNavigation}
            collapsed={collapsed}
          />

          <NavigationSection
            title="Intelligence"
            items={intelligenceNavigation}
            collapsed={collapsed}
          />

          <NavigationSection
            title="Progress"
            items={progressNavigation}
            collapsed={collapsed}
          />

          <NavigationSection
            title="Recruiter"
            items={recruiterNavigation}
            collapsed={collapsed}
          />

        </nav>


        {/* Bottom */}

        <div className="hs-sidebar-bottom">

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                "hs-nav-item",
                isActive
                  ? "hs-nav-item-active"
                  : "",
              ].join(" ")
            }
            title={
              collapsed
                ? "Settings"
                : undefined
            }
          >

            <Settings
              size={17}
              strokeWidth={1.8}
            />

            {!collapsed && (
              <span>
                Settings
              </span>
            )}

          </NavLink>


          <button
            className="hs-logout-button"
            onClick={handleLogout}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
          >

            <LogOut
              size={17}
              strokeWidth={1.8}
            />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="hs-main">

        {/* Topbar */}

        <header className="hs-topbar">

          <div>

            <div className="hs-breadcrumb">
              HireSense AI
              <span>/</span>
              {pageTitle}
            </div>

            <h1 className="hs-page-title">
              {pageTitle}
            </h1>

          </div>


          <div className="hs-topbar-actions">

            <div className="hs-ai-status">

              <span className="hs-ai-status-dot" />

              AI Systems Online

            </div>


            <button
              className="hs-topbar-button"
              onClick={() =>
                navigate(
                  "/live-interview",
                )
              }
            >

              <Sparkles size={16} />

              Start Interview

            </button>

          </div>

        </header>


        {/* Page */}

        <section className="hs-main-content">

          {children}

        </section>

      </main>

    </div>
  );
}