import { useEffect, useRef, useState } from "react";

export type CatState = "sleeping" | "sitting" | "stretching" | "grooming";

interface StudyCatProps {
  className?: string;
  onInteract?: (state: CatState) => void;
}

const CAT_SPRITES: Record<CatState, string> = {
  sleeping: "/images/room/cat_sleeping.png",
  sitting: "/images/room/cat_sitting.png",
  stretching: "/images/room/cat_stretching.png",
  grooming: "/images/room/cat_grooming.png",
};

const CAT_MESSAGES: Record<CatState, string[]> = {
  sleeping: [
    "Zzz... soft breathing...",
    "Purrrrrr...",
    "Warm and safe in the study.",
  ],
  sitting: [
    "Mrrp? Ready for your next step?",
    "You've got this.",
    "One practice question at a time.",
    "The rain is peaceful tonight.",
  ],
  stretching: [
    "Big stretch! Time to tackle your goals.",
    "Shake off the nerves.",
    "Stand tall, speak clearly.",
  ],
  grooming: [
    "Polishing up, just like your resume.",
    "Every detail counts.",
    "Taking a calm moment.",
  ],
};

export default function StudyCat({ className = "", onInteract }: StudyCatProps) {
  const [state, setState] = useState<CatState>("sleeping");
  const [message, setMessage] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic natural state machine (peaceful, not erratic)
  useEffect(() => {
    const cycleState = () => {
      // Don't interrupt if user recently clicked
      if (isInteracting) return;

      setState((current) => {
        const rand = Math.random();
        if (current === "sleeping") {
          return rand < 0.35 ? "sitting" : "sleeping";
        }
        if (current === "sitting") {
          return rand < 0.4 ? "stretching" : rand < 0.7 ? "grooming" : "sleeping";
        }
        if (current === "stretching") {
          return "sitting";
        }
        if (current === "grooming") {
          return rand < 0.6 ? "sleeping" : "sitting";
        }
        return "sleeping";
      });
    };

    // Cycle every 16 to 28 seconds
    const interval = setInterval(cycleState, 18000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, [isInteracting]);

  const handleInteraction = () => {
    // Pick next state and an encouraging message
    const nextStates: Record<CatState, CatState> = {
      sleeping: "sitting",
      sitting: "stretching",
      stretching: "grooming",
      grooming: "sitting",
    };

    const next = nextStates[state] || "sitting";
    setState(next);
    setIsInteracting(true);

    const pool = CAT_MESSAGES[next];
    const quote = pool[Math.floor(Math.random() * pool.length)];
    setMessage(quote);

    if (onInteract) {
      onInteract(next);
    }

    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setMessage(null);
    }, 4200);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 9000);
  };

  return (
    <div
      className={`relative inline-block select-none cursor-pointer group ${className}`}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleInteraction();
        }
      }}
      aria-label={`Study companion cat, currently ${state}. Click to interact.`}
    >
      {/* Speech Bubble */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          <div className="relative px-3 py-1.5 rounded-xl bg-[#FBF7EE] text-[#2C241E] text-xs font-serif font-medium shadow-md border border-[#E1D4C1] whitespace-nowrap">
            <span>{message}</span>
            {/* Bubble arrow pointing down */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#FBF7EE]" />
          </div>
        </div>
      )}

      {/* Cat Artwork with subtle breathing / resting animation */}
      <div className="relative transition-transform duration-300 group-hover:scale-105 active:scale-95">
        <img
          src={CAT_SPRITES[state]}
          alt={`Ginger tabby cat ${state}`}
          className="w-full h-auto drop-shadow-[0_4px_12px_rgba(39,26,14,0.18)] pointer-events-none"
          loading="eager"
        />

        {/* Small floating hover hint */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-90 group-focus-visible:opacity-90 transition-opacity text-[10px] uppercase tracking-wider font-sans text-[#F7F3EB] bg-[#273D4B]/80 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap">
          Gently Pet
        </div>
      </div>
    </div>
  );
}
