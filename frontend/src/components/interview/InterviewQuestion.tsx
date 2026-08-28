import { motion } from "framer-motion";

type Props = {
  question: string;
  questionNumber: number;
  totalQuestions: number;
};

export default function InterviewQuestion({

  question,

  questionNumber,

  totalQuestions,

}: Props) {

  return (

    <motion.div

      initial={{
        opacity:0,
        y:30,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      transition={{
        duration:0.5,
      }}

      className="
        w-full
        max-w-4xl
        mx-auto
        text-center
      "

    >

      <p
        className="
          uppercase
          tracking-[0.3em]
          text-red-400
          text-xs
          mb-4
        "
      >

        QUESTION {questionNumber} / {totalQuestions}

      </p>

      <h2
        className="
          text-4xl
          font-black
          leading-relaxed
        "
      >

        {question}

      </h2>

    </motion.div>

  );

}