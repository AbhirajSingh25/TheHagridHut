import {
  useEffect,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

const transcriptLines = [

  "I recently worked on a full-stack AI interview platform using React and FastAPI.",

  "One challenge was improving realtime interview responsiveness and UI scalability.",

  "I optimized component structure and improved frontend workflow organization.",

  "I also integrated analytics systems and recruiter-focused reporting experiences.",

  "My goal is building products that feel polished, scalable and production-ready.",
];

function LiveTranscript() {

  const [
    visibleLines,
    setVisibleLines,
  ] = useState<string[]>([]);

  useEffect(() => {

    let index = 0;

    const interval =
      setInterval(() => {

        setVisibleLines(
          (prev) => [

            ...prev,
            transcriptLines[index],
          ]
        );

        index++;

        if (
          index >=
          transcriptLines.length
        ) {

          clearInterval(interval);
        }

      }, 2500);

    return () =>
      clearInterval(interval);

  }, []);

  return (
    <div className="space-y-4">

      <AnimatePresence>

        {visibleLines.map(
          (
            line,
            index
          ) => (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="rounded-3xl bg-white/5 border border-white/5 p-5"
            >

              <p className="text-gray-300 leading-8">

                {line}

              </p>

            </motion.div>

          )
        )}

      </AnimatePresence>

    </div>
  );
}

export default LiveTranscript;