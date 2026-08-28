import {
  ChevronRight,
} from "lucide-react";

interface Props {

  title: string;

  description: string;
}

function InsightCard({

  title,

  description,
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
        bg-black/30
        hover:border-cyan-500/30
        transition-all
        duration-300
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
          {title}
        </h3>

        <p
          className="
            text-zinc-400
          "
        >
          {description}
        </p>

      </div>

      <ChevronRight
        className="
          text-zinc-500
        "
      />

    </div>
  );
}

export default InsightCard;