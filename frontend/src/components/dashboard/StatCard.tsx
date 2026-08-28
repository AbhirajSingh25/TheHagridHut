import {
  LucideIcon,
  TrendingUp,
} from "lucide-react";

type Props = {

  title: string;

  value: string;

  subtitle: string;

  growth: string;

  icon: LucideIcon;
};

function StatCard({

  title,

  value,

  subtitle,

  growth,

  icon: Icon,
}: Props) {

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-red-500/10
        bg-gradient-to-br
        from-[#0a0a0a]
        to-[#070707]
        p-7
        min-h-[220px]
        transition-all
        duration-500
        hover:border-red-500/30
        hover:-translate-y-1
        hover:shadow-[0_0_50px_rgba(255,0,0,0.12)]
      "
    >

      {/* GLOW */}

      <div
        className="
          absolute
          top-[-60px]
          right-[-60px]
          w-[180px]
          h-[180px]
          bg-red-500/10
          blur-[80px]
          rounded-full
        "
      />



      {/* TOP */}

      <div
        className="
          relative
          z-10
          flex
          items-start
          justify-between
          mb-10
        "
      >

        <div>

          <p
            className="
              text-zinc-500
              text-sm
              mb-2
            "
          >
            {title}
          </p>

          <h2
            className="
              text-6xl
              font-black
              text-white
              leading-none
            "
          >
            {value}
          </h2>

        </div>


        <div
          className="
            w-16
            h-16
            rounded-2xl
            bg-red-500/10
            border
            border-red-500/20
            flex
            items-center
            justify-center
          "
        >

          <Icon
            size={30}
            className="
              text-red-400
            "
          />

        </div>

      </div>



      {/* FOOTER */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-between
        "
      >

        <p
          className="
            text-zinc-500
          "
        >
          {subtitle}
        </p>

        <div
          className="
            flex
            items-center
            gap-2
            text-emerald-400
            font-semibold
          "
        >

          <TrendingUp size={18} />

          {growth}

        </div>

      </div>

    </div>
  );
}

export default StatCard;