import { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, CheckCircle2, Shield } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#241B16] border border-[#E8AD62]/40 shadow-2xl text-left overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#E8AD62]/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#B9AB97] hover:text-[#FFF7E9] hover:bg-[#1A1512] transition-colors"
          aria-label="Close installation dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <HagridsLogo variant="compact" to="" />
          <div>
            <h3 id="install-modal-title" className="font-display font-bold text-lg text-[#FFF7E9]">
              Install Hagrid's Hut
            </h3>
            <p className="text-xs text-[#E8AD62]">The Sorted Club App Experience</p>
          </div>
        </div>

        <p className="text-sm text-[#EFE4D2] mb-5 leading-relaxed">
          Open your study anytime with a single tap. Enjoy fullscreen focus, fast loading, and an intimate offline-ready workspace.
        </p>

        {/* Features List */}
        <div className="space-y-2.5 mb-6 text-xs text-[#B9AB97]">
          <div className="flex items-center gap-2 text-[#FFF7E9]">
            <CheckCircle2 className="w-4 h-4 text-[#536B4F]" />
            <span>Dedicated study workspace without browser address bars</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFF7E9]">
            <CheckCircle2 className="w-4 h-4 text-[#536B4F]" />
            <span>Instant access to Resume Workshop and Interview Practice</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFF7E9]">
            <Shield className="w-4 h-4 text-[#E8AD62]" />
            <span>Securely connected to your existing account and records</span>
          </div>
        </div>

        {/* Platform Specific Action */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-[#536B4F]/20 border border-[#536B4F]/40 text-center">
            <p className="text-sm font-semibold text-[#80C8B5]">Hagrid's Hut is already installed!</p>
            <p className="text-xs text-[#B9AB97] mt-1">You can launch it directly from your home screen or apps.</p>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-[#1A1512] border border-[#E8AD62]/20 text-xs text-[#EFE4D2] space-y-2">
            <p className="font-semibold text-[#E8AD62] flex items-center gap-1.5">
              <Share className="w-4 h-4" /> To install on iPhone or iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#B9AB97]">
              <li>Tap the <span className="text-[#FFF7E9] font-medium">Share button</span> at the bottom of Safari</li>
              <li>Scroll down and select <span className="text-[#FFF7E9] font-medium">"Add to Home Screen"</span></li>
              <li>Tap <span className="text-[#FFF7E9] font-medium">Add</span> in the top-right corner</li>
            </ol>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className={`w-full py-3.5 px-5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
              deferredPrompt
                ? "bg-gradient-to-r from-[#E8AD62] to-[#D97706] text-[#211B17] hover:brightness-105 active:scale-[0.99]"
                : "bg-[#2E231C] text-[#B9AB97] border border-[#E8AD62]/20"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{deferredPrompt ? "Install Now on This Device" : "Add to Home Screen (Browser Menu)"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
