import { useEffect, useRef, useState } from "react";

export type CatState = "sleeping" | "sitting" | "stretching" | "grooming" | "walking";
export type CatSpot = "chair" | "floor" | "desk_edge";

interface StudyCatProps {
  className?: string;
  onInteract?: (state: CatState, spot: CatSpot) => void;
}

const CAT_SPRITES: Record<CatState, string> = {
  sleeping: "/images/room/cat_sleeping.png",
  sitting: "/images/room/cat_sitting.png",
  stretching: "/images/room/cat_stretching.png",
  grooming: "/images/room/cat_grooming.png",
  walking: "/images/room/cat_walking.png",
};

// Valid room destinations mapped to % coordinates within the room frame
const SPOTS: Record<CatSpot, { left: number; top: number; width: number; height: number; zIndex: number; flip: boolean }> = {
  chair: {
    left: 77, // On the armchair cushion
    top: 68,
    width: 14,
    height: 18,
    zIndex: 25,
    flip: false,
  },
  floor: {
    left: 63, // On the floor rug beside the book stack
    top: 78,
    width: 15,
    height: 19,
    zIndex: 28,
    flip: false,
  },
  desk_edge: {
    left: 48, // Beside the wooden desk
    top: 79,
    width: 15,
    height: 19,
    zIndex: 28,
    flip: true, // Facing towards the desk/laptop
  },
};

const CAT_MESSAGES: Record<Exclude<CatState, "walking">, string[]> = {
  sleeping: [
    "Zzz... soft breathing...",
    "Purrrrrr...",
    "Warm and quiet in the study.",
  ],
  sitting: [
    "Mrrp? Ready for your next step?",
    "You've got this.",
    "One practice question at a time.",
    "The rain is peaceful tonight.",
    "Listening closely.",
  ],
  stretching: [
    "Big stretch! Time to tackle your goals.",
    "Shake off the interview nerves.",
    "Stand tall, speak clearly.",
  ],
  grooming: [
    "Polishing up, just like your resume.",
    "Every small detail counts.",
    "Taking a calm pause.",
  ],
};

export default function StudyCat({ className = "", onInteract }: StudyCatProps) {
  const [currentSpot, setCurrentSpot] = useState<CatSpot>("chair");
  const [state, setState] = useState<CatState>("sleeping");
  const [message, setMessage] = useState<string | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic natural state machine (calm, lifelike, not chaotic)
  useEffect(() => {
    const cycle = () => {
      if (isInteracting || isWalking) return;

      const roll = Math.random();

      // Occasionally walk to a new spot in the room (every ~30-45s)
      if (roll < 0.28) {
        const spotKeys: CatSpot[] = ["chair", "floor", "desk_edge"];
        const nextSpots = spotKeys.filter((s) => s !== currentSpot);
        const destination = nextSpots[Math.floor(Math.random() * nextSpots.length)];

        // Start walking transition
        setIsWalking(true);
        setState("walking");
        setFacingLeft(SPOTS[destination].left < SPOTS[currentSpot].left);

        // Target spot update
        setCurrentSpot(destination);

        // After walking across (approx 3.2s transition), settle into sitting or stretching
        if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
        walkTimeoutRef.current = setTimeout(() => {
          setIsWalking(false);
          const arrivalPose: CatState = destination === "chair" ? "sleeping" : "sitting";
          setState(arrivalPose);
          setFacingLeft(SPOTS[destination].flip);
        }, 3200);

        return;
      }

      // In-place gentle state changes
      setState((prev) => {
        if (currentSpot === "chair") {
          return roll < 0.65 ? "sleeping" : "sitting";
        }
        if (prev === "sitting") {
          return roll < 0.45 ? "stretching" : roll < 0.75 ? "grooming" : "sitting";
        }
        if (prev === "stretching") {
          return "sitting";
        }
        if (prev === "grooming") {
          return "sitting";
        }
        return "sitting";
      });
    };

    const interval = setInterval(cycle, 18000 + Math.random() * 10000);
    return () => {
      clearInterval(interval);
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    };
  }, [currentSpot, isInteracting, isWalking]);

  const handleInteraction = () => {
    if (isWalking) return; // Let it finish its stroll

    setIsInteracting(true);

    // Cycle reaction pose
    let nextState: CatState;
    if (state === "sleeping") {
      nextState = "sitting";
    } else if (state === "sitting") {
      nextState = "stretching";
    } else if (state === "stretching") {
      nextState = "grooming";
    } else {
      nextState = "sitting";
    }

    setState(nextState);

    // Pick quiet career encouragement
    const pool = CAT_MESSAGES[nextState as keyof typeof CAT_MESSAGES] || CAT_MESSAGES.sitting;
    const quote = pool[Math.floor(Math.random() * pool.length)];
    setMessage(quote);

    if (onInteract) {
      onInteract(nextState, currentSpot);
    }

    // Speech bubble hides after 4s
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setMessage(null);
      setIsInteracting(false);
    }, 4000);
  };

  const spot = SPOTS[currentSpot];

  return (
    <div
      style={{
        position: "absolute",
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: `${spot.width}%`,
        maxWidth: "230px",
        zIndex: spot.zIndex,
        transition: isWalking ? "left 3.2s cubic-bezier(0.4, 0, 0.2, 1), top 3.2s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        transform: `translate(-50%, -50%) ${facingLeft ? "scaleX(-1)" : "scaleX(1)"}`,
      }}
      className={`select-none cursor-pointer group ${className}`}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleInteraction();
        }
      }}
      aria-label={`Study companion cat, currently ${state} near the ${currentSpot}. Click to interact.`}
    >
      {/* Speech Bubble (Counter-transformed if cat is flipped so text is always right-side up) */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          style={{
            transform: facingLeft ? "scaleX(-1) translateX(50%)" : "translateX(-50%)",
          }}
          className="absolute -top-14 left-1/2 z-40 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          <div className="relative px-3 py-1.5 rounded-xl bg-[#FBF7EE] text-[#2C241E] text-xs font-serif font-medium shadow-md border border-[#E1D4C1] whitespace-nowrap">
            <span>{message}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#FBF7EE]" />
          </div>
        </div>
      )}

      {/* Cat Artwork Sprite with subtle breathing / resting effect */}
      <div className="relative transition-transform duration-300 group-hover:scale-105 active:scale-95">
        <img
          src={CAT_SPRITES[state]}
          alt={`Ginger tabby study cat ${state}`}
          className="w-full h-auto drop-shadow-[0_6px_14px_rgba(30,20,12,0.22)] pointer-events-none"
          loading="eager"
        />

        {/* Quiet hover cue */}
        {!isWalking && (
          <div
            style={{
              transform: facingLeft ? "scaleX(-1) translateX(50%)" : "translateX(-50%)",
            }}
            className="absolute -bottom-2 left-1/2 opacity-0 group-hover:opacity-90 group-focus-visible:opacity-90 transition-opacity text-[10px] uppercase tracking-wider font-sans text-[#F7F3EB] bg-[#273D4B]/80 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap"
          >
            Gently Pet
          </div>
        )}
      </div>
    </div>
  );
}
