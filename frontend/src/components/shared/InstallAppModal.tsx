import { useState, useEffect } from "react";
import { X, Smartphone, Share, CheckCircle2, Shield } from "lucide-react";
import HagridsLogo from "./HagridsLogo";

export default function InstallAppModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Check if already in standalone display
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true);
    }

    // Capture Chrome/Android install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-xl bg-[#FAF5EC] dark:bg-[#2A231C] text-[#302820] dark:text-[#FAF5EC] border border-[#49372B]/20 dark:border-[#E5D6BE]/20 shadow-xl text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md text-[#6B5D50] dark:text-[#B8AFA3] hover:bg-[#F0E9DC] dark:hover:bg-[#342C25] transition-colors"
          aria-label="Close installation dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <HagridsLogo variant="compact" to="" />
        </div>

        <div className="space-y-1 mb-4">
          <h3 id="install-modal-title" className="font-serif text-xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
            Install Hagrid's Hut
          </h3>
          <p className="text-xs text-[#AC7256] font-medium">A product of The Sorted Club</p>
        </div>

        <p className="text-sm text-[#6B5D50] dark:text-[#B8AFA3] mb-5 leading-relaxed">
          Open your study anytime with a single tap. Enjoy fullscreen focus, fast loading, and an intimate offline-ready workspace.
        </p>

        {/* Features List */}
        <div className="space-y-2.5 mb-6 text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
          <div className="flex items-center gap-2 text-[#302820] dark:text-[#FAF5EC]">
            <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
            <span>Dedicated study workspace without browser address bars</span>
          </div>
          <div className="flex items-center gap-2 text-[#302820] dark:text-[#FAF5EC]">
            <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
            <span>Instant access to Resume Workshop and Interview Practice</span>
          </div>
          <div className="flex items-center gap-2 text-[#302820] dark:text-[#FAF5EC]">
            <Shield className="w-4 h-4 text-[#AC7256]" />
            <span>Securely connected to your existing account and records</span>
          </div>
        </div>

        {/* Platform Specific Action */}
        {isInstalled ? (
          <div className="p-4 rounded-lg bg-[#7A8065]/15 border border-[#7A8065]/30 text-center">
            <p className="text-sm font-semibold text-[#657A57]">Hagrid's Hut is already installed!</p>
            <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] mt-1">You can launch it directly from your home screen or apps.</p>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-lg bg-[#F0E9DC] dark:bg-[#342C25] border border-[#49372B]/15 text-xs text-[#49372B] dark:text-[#E5D6BE] space-y-2">
            <p className="font-semibold text-[#AC7256] flex items-center gap-1.5">
              <Share className="w-4 h-4" /> To install on iPhone or iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#6B5D50] dark:text-[#B8AFA3]">
              <li>Tap the <span className="font-medium text-[#302820] dark:text-[#FAF5EC]">Share button</span> at the bottom of Safari</li>
              <li>Scroll down and select <span className="font-medium text-[#302820] dark:text-[#FAF5EC]">"Add to Home Screen"</span></li>
              <li>Tap <span className="font-medium text-[#302820] dark:text-[#FAF5EC]">Add</span> in the top-right corner</li>
            </ol>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className="btn-primary w-full justify-center py-3"
          >
            <Smartphone className="w-4 h-4" />
            <span>{deferredPrompt ? "Install Now on This Device" : "Add to Home Screen"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
