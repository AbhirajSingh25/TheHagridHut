import React, { useEffect, useState } from "react";
import {
  Bell,
  Brain,
  Check,
  ChevronRight,
  CircleAlert,
  Database,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Volume2,
} from "lucide-react";

import {
  getSettings,
  updateAppearanceSettings,
  updateNotificationSettings,
  updateAIPreferences,
  updatePrivacySettings,
  updateSecuritySettings,
  changePassword,
} from "../services/api";

import { useTheme } from "../context/ThemeContext";

type SettingsSection =
  | "appearance"
  | "notifications"
  | "ai"
  | "privacy"
  | "security"
  | "data";

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function Toggle({
  enabled,
  onChange,
  disabled = false,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) {
          onChange(!enabled);
        }
      }}
      aria-label="Toggle setting"
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "999px",
        border: "1px solid",
        borderColor: enabled
          ? "#AC7256"
          : "rgba(148, 163, 184, 0.25)",
        background: enabled
          ? "#AC7256"
          : "rgba(73, 55, 43, 0.12)",
        padding: "3px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: enabled ? "flex-end" : "flex-start",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          display: "block",
        }}
      />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function SettingRow({
  icon,
  title,
  description,
  children,
}: SettingRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "20px 0",
        borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.05))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#a78bfa",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "#f8fafc",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: description ? "5px" : 0,
            }}
          >
            {title}
          </div>

          {description && (
            <div
              style={{
                color: "#64748b",
                fontSize: "12px",
                lineHeight: 1.5,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

const sidebarItems: {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette size={17} />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={17} />,
  },
  {
    id: "ai",
    label: "AI Preferences",
    icon: <Brain size={17} />,
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: <Shield size={17} />,
  },
  {
    id: "security",
    label: "Security",
    icon: <Lock size={17} />,
  },
  {
    id: "data",
    label: "Data",
    icon: <Database size={17} />,
  },
];

const Settings: React.FC = () => {
  const { theme: activeTheme, setTheme: applyTheme, experience, setExperience } = useTheme();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("appearance");

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [appearance, setAppearance] = useState({
    theme: "dark",
    compactMode: false,
    animations: true,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    interview: true,
    report: true,
    // These two have no backend field yet, so they stay
    // browser-local (see the "(saved on this device only)"
    // note next to them below) rather than pretending to sync.
    achievements: true,
    sound: true,
    marketing: false,
  });

  const [aiPreferences, setAiPreferences] = useState({
    followUps: true,
    detailedFeedback: true,
    adaptiveDifficulty: true,
    // No backend field for this one yet - browser-local only.
    speechInsights: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    analytics: true,
    personalizedExperience: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    // Fields with no backend equivalent (achievements/sound/speech
    // insights toggles) still read/write a small local-only cache,
    // since there's genuinely nowhere on the server to persist them.
    const localOnly = localStorage.getItem(
      "hiresense-settings-local-only"
    );

    if (localOnly) {
      try {
        const parsed = JSON.parse(localOnly);

        if (typeof parsed.achievements === "boolean") {
          setNotifications((prev) => ({
            ...prev,
            achievements: parsed.achievements,
          }));
        }

        if (typeof parsed.sound === "boolean") {
          setNotifications((prev) => ({
            ...prev,
            sound: parsed.sound,
          }));
        }

        if (typeof parsed.speechInsights === "boolean") {
          setAiPreferences((prev) => ({
            ...prev,
            speechInsights: parsed.speechInsights,
          }));
        }
      } catch {
        // Ignore malformed local cache - defaults above still apply.
      }
    }

    const loadSettings = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getSettings();

        if (data.appearance) {
          setAppearance((prev) => ({
            ...prev,
            theme: data.appearance.theme ?? prev.theme,
            compactMode:
              data.appearance.compact_mode ?? prev.compactMode,
            animations:
              data.appearance.animations_enabled ?? prev.animations,
          }));
        }

        if (data.notifications) {
          setNotifications((prev) => ({
            ...prev,
            email:
              data.notifications.email_notifications ?? prev.email,
            interview:
              data.notifications.interview_reminders ??
              prev.interview,
            report:
              data.notifications.performance_notifications ??
              prev.report,
            marketing:
              data.notifications.product_updates ?? prev.marketing,
          }));
        }

        if (data.ai_preferences) {
          setAiPreferences((prev) => ({
            ...prev,
            followUps:
              data.ai_preferences.ai_suggestions_enabled ??
              prev.followUps,
            detailedFeedback:
              data.ai_preferences.ai_feedback_level === "detailed",
            adaptiveDifficulty:
              data.ai_preferences.interview_difficulty === "adaptive",
          }));
        }

        if (data.privacy) {
          setPrivacy((prev) => ({
            ...prev,
            profileVisible:
              data.privacy.profile_visibility !== "private",
            analytics:
              data.privacy.analytics_tracking ?? prev.analytics,
            personalizedExperience:
              data.privacy.data_collection ??
              prev.personalizedExperience,
          }));
        }

        if (data.security) {
          setSecurity((prev) => ({
            ...prev,
            twoFactor:
              data.security.two_factor_enabled ?? prev.twoFactor,
            loginAlerts:
              data.security.login_alerts ?? prev.loginAlerts,
          }));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your settings. Showing defaults instead."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setError("");

    // Cache the fields that have no backend support yet, locally.
    localStorage.setItem(
      "hiresense-settings-local-only",
      JSON.stringify({
        achievements: notifications.achievements,
        sound: notifications.sound,
        speechInsights: aiPreferences.speechInsights,
      })
    );

    try {
      await Promise.all([
        updateAppearanceSettings({
          theme: appearance.theme,
          compact_mode: appearance.compactMode,
          animations_enabled: appearance.animations,
        }),
        updateNotificationSettings({
          email_notifications: notifications.email,
          interview_reminders: notifications.interview,
          performance_notifications: notifications.report,
          product_updates: notifications.marketing,
        }),
        updateAIPreferences({
          ai_suggestions_enabled: aiPreferences.followUps,
          ai_feedback_level: aiPreferences.detailedFeedback
            ? "detailed"
            : "balanced",
          interview_difficulty: aiPreferences.adaptiveDifficulty
            ? "adaptive"
            : "medium",
        }),
        updatePrivacySettings({
          profile_visibility: privacy.profileVisible
            ? "public"
            : "private",
          analytics_tracking: privacy.analytics,
          data_collection: privacy.personalizedExperience,
        }),
        updateSecuritySettings({
          two_factor_enabled: security.twoFactor,
          login_alerts: security.loginAlerts,
        }),
      ]);

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const submitPasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError("Both fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");

      window.setTimeout(() => {
        setPasswordSuccess(false);
        setChangingPassword(false);
      }, 2000);
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Could not change your password. Please try again."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case "appearance":
        return "Appearance";
      case "notifications":
        return "Notifications";
      case "ai":
        return "AI Preferences";
      case "privacy":
        return "Privacy";
      case "security":
        return "Security";
      case "data":
        return "Data Management";
      default:
        return "Settings";
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case "appearance":
        return "Customize the atmosphere, theme, and density of your Hagrid's Hut workspace.";
      case "notifications":
        return "Control when and how Hagrid's Hut keeps you informed.";
      case "ai":
        return "Personalize how Hagrid's Hut Groq AI supports your interview preparation.";
      case "privacy":
        return "Manage your visibility, data sharing, and study personalization.";
      case "security":
        return "Protect your account and manage important security controls.";
      case "data":
        return "Download, manage, or export data associated with your study sessions.";
      default:
        return "";
    }
  };

  const renderAppearance = () => (
    <>
      <SettingRow
        icon={<Sparkles size={18} />}
        title="Product Experience Mode"
        description="Switch between The Cozy Experience (warm ambient study) and Advanced Mode (modernized HireSense telemetry)."
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => setExperience("cozy")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor:
                experience === "cozy"
                  ? "rgba(232,173,98,0.7)"
                  : "rgba(148,163,184,0.15)",
              background:
                experience === "cozy"
                  ? "rgba(232,173,98,0.18)"
                  : "rgba(255,255,255,0.03)",
              color:
                experience === "cozy"
                  ? "#F6CD8B"
                  : "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            🕯️ Cozy Experience (Default)
          </button>

          <button
            type="button"
            onClick={() => setExperience("advanced")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 14px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor:
                experience === "advanced"
                  ? "rgba(16,185,129,0.7)"
                  : "rgba(148,163,184,0.15)",
              background:
                experience === "advanced"
                  ? "rgba(16,185,129,0.18)"
                  : "rgba(255,255,255,0.03)",
              color:
                experience === "advanced"
                  ? "#34D399"
                  : "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            ⚡ Advanced Mode
          </button>
        </div>
      </SettingRow>

      <SettingRow
        icon={<Moon size={18} />}
        title="Theme"
        description="Choose the visual theme for your workspace."
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAppearance({
                ...appearance,
                theme: "dark",
              });
              applyTheme("dark", false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor:
                activeTheme === "dark"
                  ? "rgba(139,92,246,0.7)"
                  : "rgba(148,163,184,0.15)",
              background:
                activeTheme === "dark"
                  ? "rgba(124,58,237,0.18)"
                  : "rgba(255,255,255,0.03)",
              color:
                activeTheme === "dark"
                  ? "#ddd6fe"
                  : "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <Moon size={14} />
            Dark
          </button>

          <button
            type="button"
            onClick={() => {
              setAppearance({
                ...appearance,
                theme: "light",
              });
              applyTheme("light", false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor:
                activeTheme === "light"
                  ? "rgba(6,182,212,0.7)"
                  : "rgba(148,163,184,0.15)",
              background:
                activeTheme === "light"
                  ? "rgba(6,182,212,0.12)"
                  : "rgba(255,255,255,0.03)",
              color:
                activeTheme === "light"
                  ? "#67e8f9"
                  : "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <Sun size={14} />
            Light
          </button>

          <button
            type="button"
            onClick={() => {
              setAppearance({
                ...appearance,
                theme: "system",
              });
              applyTheme("system", false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor:
                activeTheme === "system"
                  ? "rgba(16,185,129,0.7)"
                  : "rgba(148,163,184,0.15)",
              background:
                activeTheme === "system"
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(255,255,255,0.03)",
              color:
                activeTheme === "system"
                  ? "#6ee7b7"
                  : "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <Laptop size={14} />
            System
          </button>
        </div>
      </SettingRow>

      <SettingRow
        icon={<Eye size={18} />}
        title="Compact interface"
        description="Reduce spacing and density for a more compact workspace."
      >
        <Toggle
          enabled={appearance.compactMode}
          onChange={(value) =>
            setAppearance({
              ...appearance,
              compactMode: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Sparkles size={18} />}
        title="Interface animations"
        description="Enable subtle transitions and visual motion across the platform."
      >
        <Toggle
          enabled={appearance.animations}
          onChange={(value) =>
            setAppearance({
              ...appearance,
              animations: value,
            })
          }
        />
      </SettingRow>
    </>
  );

  const renderNotifications = () => (
    <>
      <SettingRow
        icon={<Mail size={18} />}
        title="Email notifications"
        description="Receive important updates through your registered email."
      >
        <Toggle
          enabled={notifications.email}
          onChange={(value) =>
            setNotifications({
              ...notifications,
              email: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Bell size={18} />}
        title="Interview reminders"
        description="Get reminders for scheduled and unfinished interview sessions."
      >
        <Toggle
          enabled={notifications.interview}
          onChange={(value) =>
            setNotifications({
              ...notifications,
              interview: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<CircleAlert size={18} />}
        title="Report updates"
        description="Be notified when interview analysis and reports are ready."
      >
        <Toggle
          enabled={notifications.report}
          onChange={(value) =>
            setNotifications({
              ...notifications,
              report: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Sparkles size={18} />}
        title="Achievement alerts"
        description="Receive notifications when you unlock new milestones. (Saved on this device only.)"
      >
        <Toggle
          enabled={notifications.achievements}
          onChange={(value) =>
            setNotifications({
              ...notifications,
              achievements: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Volume2 size={18} />}
        title="Notification sounds"
        description="Play subtle sounds for important activity and updates. (Saved on this device only.)"
      >
        <Toggle
          enabled={notifications.sound}
          onChange={(value) =>
            setNotifications({
              ...notifications,
              sound: value,
            })
          }
        />
      </SettingRow>
    </>
  );

  const renderAI = () => (
    <>
      <SettingRow
        icon={<Brain size={18} />}
        title="AI follow-up questions"
        description="Allow Hagrid's Hut AI to ask dynamic follow-up questions during interviews."
      >
        <Toggle
          enabled={aiPreferences.followUps}
          onChange={(value) =>
            setAiPreferences({
              ...aiPreferences,
              followUps: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Sparkles size={18} />}
        title="Detailed AI feedback"
        description="Generate deeper explanations and improvement recommendations."
      >
        <Toggle
          enabled={aiPreferences.detailedFeedback}
          onChange={(value) =>
            setAiPreferences({
              ...aiPreferences,
              detailedFeedback: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Brain size={18} />}
        title="Adaptive difficulty"
        description="Allow interview questions to adjust according to your performance."
      >
        <Toggle
          enabled={aiPreferences.adaptiveDifficulty}
          onChange={(value) =>
            setAiPreferences({
              ...aiPreferences,
              adaptiveDifficulty: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Volume2 size={18} />}
        title="Speech intelligence"
        description="Enable speech pacing, filler word, and delivery insights. (Saved on this device only.)"
      >
        <Toggle
          enabled={aiPreferences.speechInsights}
          onChange={(value) =>
            setAiPreferences({
              ...aiPreferences,
              speechInsights: value,
            })
          }
        />
      </SettingRow>
    </>
  );

  const renderPrivacy = () => (
    <>
      <SettingRow
        icon={<UserRound size={18} />}
        title="Public profile visibility"
        description="Allow selected profile information to appear in rankings and achievements."
      >
        <Toggle
          enabled={privacy.profileVisible}
          onChange={(value) =>
            setPrivacy({
              ...privacy,
              profileVisible: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Globe2 size={18} />}
        title="Anonymous analytics"
        description="Help improve HireSense through anonymous product analytics."
      >
        <Toggle
          enabled={privacy.analytics}
          onChange={(value) =>
            setPrivacy({
              ...privacy,
              analytics: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<Sparkles size={18} />}
        title="Personalized recommendations"
        description="Use your interview activity to personalize learning and career suggestions."
      >
        <Toggle
          enabled={privacy.personalizedExperience}
          onChange={(value) =>
            setPrivacy({
              ...privacy,
              personalizedExperience: value,
            })
          }
        />
      </SettingRow>
    </>
  );

  const renderSecurity = () => (
    <>
      <SettingRow
        icon={<Fingerprint size={18} />}
        title="Two-factor authentication"
        description="Add an additional verification step to protect your account."
      >
        <Toggle
          enabled={security.twoFactor}
          onChange={(value) =>
            setSecurity({
              ...security,
              twoFactor: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<ShieldCheck size={18} />}
        title="Login alerts"
        description="Receive notifications when your account is accessed from a new device."
      >
        <Toggle
          enabled={security.loginAlerts}
          onChange={(value) =>
            setSecurity({
              ...security,
              loginAlerts: value,
            })
          }
        />
      </SettingRow>

      <SettingRow
        icon={<KeyRound size={18} />}
        title="Password"
        description="Your password was last updated for your account security."
      >
        <button
          type="button"
          onClick={() => {
            setChangingPassword(!changingPassword);
            setPasswordError("");
            setPasswordSuccess(false);
          }}
          style={{
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#cbd5e1",
            padding: "9px 13px",
            borderRadius: "10px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {changingPassword ? "Cancel" : "Change password"}
        </button>
      </SettingRow>

      {changingPassword && (
        <div
          style={{
            marginTop: "6px",
            marginBottom: "20px",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(148,163,184,0.14)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(11,17,32,0.8)",
              color: "#f8fafc",
              outline: "none",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="New password (min. 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(11,17,32,0.8)",
              color: "#f8fafc",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {passwordError && (
            <p
              style={{
                color: "#fca5a5",
                fontSize: "12px",
                marginTop: "10px",
              }}
            >
              {passwordError}
            </p>
          )}

          {passwordSuccess && (
            <p
              style={{
                color: "#6ee7b7",
                fontSize: "12px",
                marginTop: "10px",
              }}
            >
              Password changed successfully.
            </p>
          )}

          <button
            type="button"
            onClick={submitPasswordChange}
            disabled={passwordSaving}
            style={{
              marginTop: "14px",
              border: "1px solid rgba(6,182,212,0.35)",
              background: "rgba(6,182,212,0.12)",
              color: "#67e8f9",
              padding: "9px 16px",
              borderRadius: "10px",
              fontSize: "12px",
              cursor: passwordSaving ? "not-allowed" : "pointer",
              opacity: passwordSaving ? 0.6 : 1,
            }}
          >
            {passwordSaving ? "Updating..." : "Update password"}
          </button>
        </div>
      )}
    </>
  );

  const renderData = () => (
    <>
      <SettingRow
        icon={<Download size={18} />}
        title="Export my data"
        description="Download a copy of your interview history and account information."
      >
        <button
          type="button"
          style={{
            border: "1px solid rgba(6,182,212,0.25)",
            background: "rgba(6,182,212,0.08)",
            color: "#67e8f9",
            padding: "9px 13px",
            borderRadius: "10px",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <Download size={14} />
          Export
        </button>
      </SettingRow>

      <SettingRow
        icon={<Database size={18} />}
        title="Clear local preferences"
        description="Remove locally stored interface and preference settings from this browser."
      >
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("hiresense-settings");
            window.location.reload();
          }}
          style={{
            border: "1px solid rgba(251,191,36,0.25)",
            background: "rgba(251,191,36,0.08)",
            color: "#fcd34d",
            padding: "9px 13px",
            borderRadius: "10px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Clear preferences
        </button>
      </SettingRow>

      <SettingRow
        icon={<Trash2 size={18} />}
        title="Delete account"
        description="Permanently delete your HireSense account and associated data."
      >
        <button
          type="button"
          style={{
            border: "1px solid rgba(239,68,68,0.28)",
            background: "rgba(239,68,68,0.08)",
            color: "#fca5a5",
            padding: "9px 13px",
            borderRadius: "10px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Delete account
        </button>
      </SettingRow>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "appearance":
        return renderAppearance();

      case "notifications":
        return renderNotifications();

      case "ai":
        return renderAI();

      case "privacy":
        return renderPrivacy();

      case "security":
        return renderSecurity();

      case "data":
        return renderData();

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        color: "#f8fafc",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#a78bfa",
              fontSize: "10px",
              letterSpacing: "0.22em",
              fontWeight: 700,
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={13} />
            Workspace preferences
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Settings
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748b",
              fontSize: "14px",
              lineHeight: 1.7,
              maxWidth: "650px",
            }}
          >
            Customize your workspace, AI experience, privacy,
            security, and account preferences.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              background:
                "linear-gradient(145deg, rgba(17,24,39,0.82), rgba(10,14,25,0.92))",
              border:
                "1px solid rgba(148,163,184,0.12)",
              borderRadius: "18px",
              padding: "10px",
              boxShadow:
                "0 18px 60px rgba(0,0,0,0.2)",
              position: "sticky",
              top: "20px",
            }}
          >
            <div
              style={{
                padding: "13px 12px 11px",
                color: "#64748b",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.2em",
              }}
            >
              PREFERENCES
            </div>

            {sidebarItems.map((item) => {
              const isActive =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  style={{
                    width: "100%",
                    border: "1px solid",
                    borderColor: isActive
                      ? "rgba(139,92,246,0.35)"
                      : "transparent",
                    background: isActive
                      ? "linear-gradient(90deg, rgba(124,58,237,0.18), rgba(139,92,246,0.07))"
                      : "transparent",
                    color: isActive
                      ? "#f5f3ff"
                      : "#94a3b8",
                    borderRadius: "11px",
                    padding: "13px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "3px",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      fontSize: "13px",
                      fontWeight: isActive
                        ? 600
                        : 500,
                    }}
                  >
                    <span
                      style={{
                        color: isActive
                          ? "#a78bfa"
                          : "#64748b",
                        display: "flex",
                      }}
                    >
                      {item.icon}
                    </span>

                    {item.label}
                  </span>

                  <ChevronRight
                    size={15}
                    style={{
                      color: isActive
                        ? "#a78bfa"
                        : "#475569",
                    }}
                  />
                </button>
              );
            })}
          </aside>

          <section
            style={{
              background:
                "linear-gradient(145deg, rgba(17,24,39,0.72), rgba(7,10,18,0.94))",
              border:
                "1px solid rgba(148,163,184,0.12)",
              borderRadius: "20px",
              overflow: "hidden",
              minWidth: 0,
              boxShadow:
                "0 18px 70px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                padding:
                  "30px 32px 24px",
                borderBottom:
                  "1px solid rgba(148,163,184,0.09)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "22px",
                      fontWeight: 700,
                    }}
                  >
                    {getSectionTitle()}
                  </h2>

                  <p
                    style={{
                      margin: "9px 0 0",
                      color: "#64748b",
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {getSectionDescription()}
                  </p>
                </div>

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "13px",
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(6,182,212,0.08))",
                    border:
                      "1px solid rgba(139,92,246,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} />
                </div>
              </div>
            </div>

            <div
              style={{
                padding:
                  "8px 32px 24px",
                minHeight: "430px",
              }}
            >
              {renderContent()}
            </div>

            <div
              style={{
                borderTop:
                  "1px solid rgba(148,163,184,0.09)",
                padding:
                  "18px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "16px",
              }}
            >
              {error && (
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || loading}
                style={{
                  minWidth: "140px",
                  padding: "11px 16px",
                  border: "none",
                  borderRadius: "11px",
                  cursor: saving || loading ? "not-allowed" : "pointer",
                  opacity: saving || loading ? 0.7 : 1,
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: saved
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  boxShadow:
                    "0 8px 28px rgba(124,58,237,0.22)",
                  transition: "all 0.25s ease",
                }}
              >
                {saved ? (
                  <>
                    <Check size={16} />
                    Saved
                  </>
                ) : saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save size={16} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 900px) {
            .settings-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 700px) {
            .settings-page {
              padding: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Settings;