import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import MainLayout from "../components/MainLayout";
import PageLayout from "../components/PageLayout";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../services/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  icon: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string | null;
}

function getStyles(type: string) {
  switch (type) {
    case "success":
      return "bg-green-500/10 text-green-300";
    case "warning":
      return "bg-yellow-500/10 text-yellow-300";
    case "achievement":
      return "bg-purple-500/10 text-purple-300";
    default:
      return "bg-cyan-500/10 text-cyan-300";
  }
}

function formatTime(isoString: string | null) {
  if (!isoString) return "";

  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch {
      // Non-critical - re-sync on next load rather than blocking the UI.
    }
  };

  const handleMarkAllRead = async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
      setError("Could not mark all as read. Please try again.");
    }
  };

  const handleDismiss = async (id: number) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      setNotifications(previous);
      setError("Could not dismiss this notification. Please try again.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <MainLayout>
      <AnimatedPage>
        <PageLayout
          title="Notifications"
          subtitle="AI-generated interview updates and recruiter intelligence"
        >
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-6 py-4">
              {error}
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark all as read ({unreadCount} unread)
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-gray-400 text-center py-16">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <PremiumCard className="p-12 text-center text-gray-400">
              You're all caught up. Notifications about your interviews,
              schedules, and progress will show up here.
            </PremiumCard>
          ) : (
            <div className="space-y-5">
              {notifications.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard
                    className={`p-8 ${item.is_read ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex-1">
                        <div
                          className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${getStyles(
                            item.notification_type
                          )}`}
                        >
                          {item.title}
                        </div>

                        <p className="text-gray-300 leading-8 mt-6 text-lg">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-4 mt-4">
                          {!item.is_read && (
                            <button
                              onClick={() => handleMarkRead(item.id)}
                              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={() => handleDismiss(item.id)}
                            className="text-gray-500 hover:text-gray-300 text-sm font-semibold"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>

                      <div className="text-gray-500 text-sm whitespace-nowrap">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          )}
        </PageLayout>
      </AnimatedPage>
    </MainLayout>
  );
}

export default Notifications;
