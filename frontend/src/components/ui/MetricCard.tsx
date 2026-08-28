import {
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ElementType;
  accent?: "purple" | "cyan" | "green" | "amber";
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "purple",
}: MetricCardProps) {

  const accents = {
    purple: {
      icon:
        "text-purple-400 bg-purple-500/10 border-purple-500/20",
      glow:
        "group-hover:bg-purple-500/10",
      line:
        "from-purple-500/0 via-purple-500/50 to-purple-500/0",
      value:
        "text-white",
    },

    cyan: {
      icon:
        "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      glow:
        "group-hover:bg-cyan-500/10",
      line:
        "from-cyan-500/0 via-cyan-500/50 to-cyan-500/0",
      value:
        "text-white",
    },

    green: {
      icon:
        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glow:
        "group-hover:bg-emerald-500/10",
      line:
        "from-emerald-500/0 via-emerald-500/50 to-emerald-500/0",
      value:
        "text-white",
    },

    amber: {
      icon:
        "text-amber-400 bg-amber-500/10 border-amber-500/20",
      glow:
        "group-hover:bg-amber-500/10",
      line:
        "from-amber-500/0 via-amber-500/50 to-amber-500/0",
      value:
        "text-white",
    },
  };

  const theme = accents[accent];


  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#0b0b10]/80
        p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-white/[0.12]
        hover:bg-[#0d0d13]
      "
    >

      {/* ambient glow */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          opacity-0
          blur-3xl
          transition
          duration-500
          ${theme.glow}
        `}
      />


      {/* top row */}

      <div
        className="
          relative
          z-10
          flex
          items-start
          justify-between
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            ${theme.icon}
          `}
        >

          {Icon ? (
            <Icon size={17} />
          ) : (
            <TrendingUp size={17} />
          )}

        </div>


        <ArrowUpRight
          size={15}
          className="
            text-emerald-400/70
            transition
            duration-300
            group-hover:text-emerald-400
          "
        />

      </div>


      {/* content */}

      <div
        className="
          relative
          z-10
          mt-7
        "
      >

        <p
          className="
            text-[11px]
            font-medium
            text-slate-500
          "
        >
          {title}
        </p>


        <div
          className="
            mt-1
            flex
            items-baseline
            gap-2
          "
        >

          <h3
            className={`
              text-3xl
              font-semibold
              tracking-tight
              ${theme.value}
            `}
          >
            {value}
          </h3>

        </div>


        {description && (
          <p
            className="
              mt-2
              text-[10px]
              text-slate-600
            "
          >
            {description}
          </p>
        )}

      </div>


      {/* bottom accent */}

      <div
        className={`
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-px
          w-full
          bg-gradient-to-r
          ${theme.line}
          opacity-60
        `}
      />

    </div>
  );
}


export default MetricCard;