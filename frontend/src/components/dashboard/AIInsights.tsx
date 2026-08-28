import {
  Brain,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

type Insight = {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  color: string;
  bg: string;
};

const insights: Insight[] = [
  {
    icon: TrendingUp,
    title: "Confidence Increased",
    description:
      "Your communication confidence improved by 14% this week.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Brain,
    title: "Technical Depth",
    description:
      "Strong system design reasoning detected in recent interviews.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: AlertTriangle,
    title: "Filler Words",
    description:
      "AI detected repetitive filler usage under pressure situations.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Recruiter Impression",
    description:
      "Your responses match high-performing candidate patterns.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

export default function AIInsights() {
  return (
    <section
      className="
        h-full
        rounded-2xl
        border border-white/[0.07]
        bg-[#090a10]/80
        p-5
        backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p
            className="
              mb-1.5
              text-[10px]
              font-medium
              uppercase
              tracking-[0.22em]
              text-violet-400
            "
          >
            AI INSIGHT
          </p>

          <h2
            className="
              text-lg
              font-semibold
              tracking-tight
              text-white
            "
          >
            Your next move
          </h2>
        </div>

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-violet-500/20
            bg-violet-500/10
          "
        >
          <Sparkles
            size={16}
            className="text-violet-400"
          />
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="space-y-2.5">
        {insights.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                rounded-xl
                border border-white/[0.06]
                bg-white/[0.015]
                p-3.5
                transition-colors
                duration-200
                hover:border-white/[0.1]
                hover:bg-white/[0.025]
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${item.bg}
                  `}
                >
                  <Icon
                    size={15}
                    className={item.color}
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      text-xs
                      font-semibold
                      text-white
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-relaxed
                      text-slate-500
                    "
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}