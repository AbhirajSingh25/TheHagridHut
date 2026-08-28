type PageHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
};


function PageHeader({
  badge,
  title,
  description,
}: PageHeaderProps) {


  return (

    <div>

      <div
        className="
          mb-3
          flex
          items-center
          gap-2
        "
      >

        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-emerald-400
            shadow-[0_0_12px_rgba(52,211,153,0.8)]
          "
        />

        <span
          className="
            text-[10px]
            uppercase
            tracking-[0.35em]
            font-semibold
            text-emerald-400
          "
        >
          AI Systems Online
        </span>


      </div>



      <h1
        className="
          text-4xl
          md:text-5xl
          font-semibold
          tracking-tight
          text-white
        "
      >

        {title}

      </h1>



      <p
        className="
          mt-4
          max-w-xl
          text-sm
          leading-relaxed
          text-slate-400
        "
      >

        {description}

      </p>


    </div>

  );

}


export default PageHeader;