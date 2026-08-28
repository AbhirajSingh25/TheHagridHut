import {
  motion,
} from "framer-motion";


interface Props {

  stats: {

    interviews: number;

    confidence: number;

    communication: number;

    technical: number;
  };
}


function AnalyticsCards({

  stats,
}: Props) {

  const cards = [

    {
      title:
        "Interviews",

      value:
        stats.interviews,
    },

    {
      title:
        "Confidence",

      value:
        `${stats.confidence}%`,
    },

    {
      title:
        "Communication",

      value:
        `${stats.communication}%`,
    },

    {
      title:
        "Technical",

      value:
        `${stats.technical}%`,
    },
  ];


  return (

    <div
      className="
        grid
        grid-cols-4
        gap-6
      "
    >

      {cards.map((card, index) => (

        <motion.div

          key={card.title}

          initial={{
            opacity: 0,
            y: 40,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay:
              index * 0.1,
          }}

          className="
            bg-[#070B14]
            border
            border-red-500/20
            rounded-[32px]
            p-8
            relative
            overflow-hidden
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


          <p
            className="
              text-zinc-500
              text-lg
              mb-4
            "
          >
            {card.title}
          </p>


          <h2
            className="
              text-5xl
              font-black
              text-white
            "
          >
            {card.value}
          </h2>

        </motion.div>
      ))}

    </div>
  );
}

export default AnalyticsCards;