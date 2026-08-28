type Props = {

  badge?: string;

  title: string;

  subtitle?: string;
};

function SectionTitle({

  badge,

  title,

  subtitle,
}: Props) {

  return (

    <div
      className="
        mb-10
      "
    >

      {
        badge && (

          <div
            className="
              inline-flex
              items-center
              px-5
              py-2
              rounded-full
              border
              border-red-500/20
              bg-red-500/5
              text-red-400
              text-xs
              tracking-[5px]
              uppercase
              mb-6
            "
          >
            {badge}
          </div>
        )
      }

      <h1
        className="
          text-6xl
          font-black
          text-white
          leading-tight
          mb-4
        "
      >
        {title}
      </h1>

      {
        subtitle && (

          <p
            className="
              text-zinc-400
              text-xl
              max-w-4xl
              leading-relaxed
            "
          >
            {subtitle}
          </p>
        )
      }

    </div>
  );
}

export default SectionTitle;