interface Props {

  title: string;

  subtitle?: string;

  action?: React.ReactNode;
}

function SectionTitle({

  title,

  subtitle,

  action,
}: Props) {

  return (

    <div
      className="
        flex
        items-start
        justify-between
        mb-8
      "
    >

      <div>

        <h2
          className="
            text-3xl
            font-black
            tracking-tight
            text-white
          "
        >
          {title}
        </h2>

        {

          subtitle && (

            <p
              className="
                text-zinc-500
                mt-2
                text-sm
              "
            >
              {subtitle}
            </p>
          )
        }

      </div>

      {action}

    </div>
  );
}

export default SectionTitle;