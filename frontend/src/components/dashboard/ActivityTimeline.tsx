import {
  Brain,
  Trophy,
  Mic,
  Sparkles,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const timeline = [
  {
    icon: Trophy,
    title: "Google SWE Interview",
    description:
      "AI recruiter rated your technical reasoning in the top 8%.",
    time: "2 hours ago",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },

  {
    icon: Brain,
    title: "AI Evaluation Completed",
    description:
      "Confidence score increased from 84% to 91%.",
    time: "5 hours ago",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },

  {
    icon: Mic,
    title: "Speech Intelligence Updated",
    description:
      "Voice clarity and pacing metrics improved significantly.",
    time: "Yesterday",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },

  {
    icon: Sparkles,
    title: "New Achievement Unlocked",
    description:
      "Completed 10 AI mock interviews consecutively.",
    time: "2 days ago",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },

  {
    icon: CheckCircle2,
    title: "Recruiter Approval Simulation",
    description:
      "Your behavioral interview responses passed recruiter benchmarks.",
    time: "3 days ago",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

function ActivityTimeline() {
  return (
    <div className="space-y-5">
      {timeline.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="relative flex gap-4"
          >
            {/* CONNECTING LINE */}

            {index !== timeline.length - 1 && (
              <div
                className="
                  absolute
                  left-[19px]
                  top-11
                  h-[calc(100%-20px)]
                  w-px
                  bg-white/[0.06]
                "
              />
            )}

            {/* ICON */}

            <div
              className={`
                relative
                z-10
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.06]
                ${item.bg}
              `}
            >
              <Icon
                size={16}
                className={item.color}
              />
            </div>

            {/* CONTENT */}

            <div className="min-w-0 flex-1 pb-5">
              <div
                className="
                  flex
                  flex-col
                  gap-1
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {item.title}
                </h3>

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    text-[11px]
                    text-slate-500
                  "
                >
                  <Clock3 size={12} />

                  {item.time}
                </div>
              </div>

              <p
                className="
                  mt-1.5
                  max-w-2xl
                  text-xs
                  leading-relaxed
                  text-slate-500
                "
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityTimeline;