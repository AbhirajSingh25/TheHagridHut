type Props = {
  name: string;
  role: string;
  score: number;
  rank: number;
};

function TopPerformerCard({
  name,
  role,
  score,
  rank,
}: Props) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-red-500/20
        bg-black
        p-8
        hover:border-red-500/40
        transition-all
      "
    >
      <div
        className="
          absolute
          top-0
          right-0
          w-32
          h-32
          bg-red-500/10
          blur-3xl
        "
      />

      <div
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >
        <div
          className="
            text-5xl
            font-black
            text-red-500
          "
        >
          #{rank}
        </div>

        <div
          className="
            w-16
            h-16
            rounded-full
            bg-red-500/20
            flex
            items-center
            justify-center
            text-2xl
            font-black
          "
        >
          {name[0]}
        </div>
      </div>

      <h2
        className="
          text-3xl
          font-black
          mb-2
        "
      >
        {name}
      </h2>

      <p
        className="
          text-zinc-500
          mb-8
        "
      >
        {role}
      </p>

      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <span className="text-zinc-500">
          AI Score
        </span>

        <span
          className="
            text-4xl
            font-black
            text-red-400
          "
        >
          {score}
        </span>
      </div>
    </div>
  );
}

export default TopPerformerCard;