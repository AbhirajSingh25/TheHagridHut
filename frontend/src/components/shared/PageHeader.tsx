type Props = {

  badge: string;

  title: string;

  description: string;
};

function PageHeader({

  badge,

  title,

  description,
}: Props) {

  return (

    <div className="mb-14">

      <div
        className="
          inline-flex
          items-center
          gap-2
          px-5
          py-2
          rounded-full
          border
          border-red-500/20
          bg-red-500/5
          text-red-400
          uppercase
          tracking-[0.35em]
          text-xs
          font-bold
          mb-6
        "
      >
        {badge}
      </div>

      <h1
        className="
          text-7xl
          font-black
          leading-none
          mb-6
        "
      >
        {title}
      </h1>

      <p
        className="
          text-zinc-500
          text-2xl
          max-w-4xl
          leading-relaxed
        "
      >
        {description}
      </p>

    </div>
  );
}

export default PageHeader;