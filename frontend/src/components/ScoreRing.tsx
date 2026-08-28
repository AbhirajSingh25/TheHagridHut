function ScoreRing({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {

  return (
    <div className="flex flex-col items-center">

      <div
        className={`w-28 h-28 rounded-full border-[10px] flex items-center justify-center ${color}`}
      >

        <div className="text-center">

          <h3 className="text-2xl font-bold text-white">

            {score}%

          </h3>

        </div>

      </div>

      <p className="text-gray-400 mt-4 text-sm">

        {label}

      </p>

    </div>
  );
}

export default ScoreRing;