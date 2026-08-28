import {
  motion,
} from "framer-motion";

function InterviewProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {

  const progress =
    (current / total) * 100;

  return (
    <div>

      <div className="flex items-center justify-between mb-4">

        <p className="text-gray-400 text-sm">

          Interview Progress

        </p>

        <p className="text-cyan-300 text-sm font-semibold">

          {current}/{total}

        </p>

      </div>

      <div className="h-3 rounded-full bg-white/5 overflow-hidden">

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            duration: 0.5,
          }}
          className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500"
        />

      </div>

    </div>
  );
}

export default InterviewProgress;