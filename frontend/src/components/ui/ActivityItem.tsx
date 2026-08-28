interface Props {

  role: string;

  score: string;

  date: string;
}

function ActivityItem({

  role,

  score,

  date,
}: Props) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        p-5
        rounded-3xl
        border
        border-white/5
        bg-black/20
        hover:border-cyan-500/20
        transition-all
      "
    >

      <div>

        <h3
          className="
            text-xl
            font-bold
            mb-2
          "
        >
          {role}
        </h3>

        <p
          className="
            text-zinc-500
          "
        >
          {date}
        </p>

      </div>


      <div
        className="
          text-2xl
          font-black
          text-cyan-400
        "
      >
        {score}
      </div>

    </div>
  );
}

export default ActivityItem;