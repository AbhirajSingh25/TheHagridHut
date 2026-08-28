import {
  LucideIcon,
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
        rounded-[32px]
        border
        border-white/5
        bg-gradient-to-b
        from-[#0f0f0f]
        to-[#070707]
        p-7
        relative
        overflow-hidden
      "
    >

      {/* GLOW */}

      <div
        className="
          absolute
          top-[-80px]
          right-[-80px]
          w-[180px]
          h-[180px]
          rounded-full
          bg-red-500/[0.06]
          blur-3xl
        "
      />


      <div
        className="
          relative
          z-10
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-8
          "
        >

          <div>

            <p
              className="
                text-zinc-500
                mb-3
              "
            >
              {title}
            </p>

            <h2
              className="
                text-5xl
                font-black
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
              className="
                text-red-400
              "
              size={30}
            />

          </div>

        </div>


        <div
          className="
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
              text-green-400
              font-bold
            "
          >
            {growth}
          </div>

        </div>

      </div>

    </div>
  );
}

export default StatCard;