import CountUp from "react-countup";

interface Props {

  title: string;

  value: number;

  suffix?: string;

  color?: string;
}

function AnalyticsCard({

  title,

  value,

  suffix = "",

  color = "text-cyan-400",
}: Props) {

  return (

    <div
      className="
        rounded-[32px]
        border
        border-white/5
        bg-gradient-to-b
        from-[#0f172a]
        to-[#020617]
        p-8
        relative
        overflow-hidden
      "
    >

      <div
        className="
          absolute
          top-0
          right-0
          w-40
          h-40
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative z-10">

        <p
          className="
            text-zinc-400
            mb-4
            text-lg
          "
        >
          {title}
        </p>

        <h2
          className={`
            text-6xl
            font-black
            ${color}
          `}
        >

          <CountUp
            end={value}
            duration={2}
          />

          {suffix}

        </h2>

      </div>

    </div>
  );
}

export default AnalyticsCard;