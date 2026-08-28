type Props = {
  name: string;
  role: string;
  score: number;
};

function CandidateCard({
  name,
  role,
  score,
}: Props) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-white/5
        bg-[#080808]
        p-6
        hover:border-red-500/20
        transition-all
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          mb-6
        "
      >
        <div>
          <h3
            className="
              text-2xl
              font-bold
              mb-2
            "
          >
            {name}
          </h3>

          <p className="text-zinc-500">
            {role}
          </p>
        </div>

        <div
          className="
            w-16
            h-16
            rounded-full
            border-4
            border-red-500
            flex
            items-center
            justify-center
            text-xl
            font-black
          "
        >
          {score}
        </div>
      </div>

      <button
        className="
          w-full
          py-4
          rounded-2xl
          bg-red-600
          hover:bg-red-500
          font-bold
          transition-all
        "
      >
        View Full Report
      </button>
    </div>
  );
}

export default CandidateCard;