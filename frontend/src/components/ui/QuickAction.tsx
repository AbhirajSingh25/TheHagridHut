import {
  LucideIcon,
} from "lucide-react";

interface Props {

  icon: LucideIcon;

  title: string;

  description: string;
}

function QuickAction({

  icon: Icon,

  title,

  description,
}: Props) {

  return (

    <button
      className="
        group
        text-left
        p-6
        rounded-3xl
        border
        border-white/5
        bg-black/20
        hover:border-cyan-500/30
        hover:bg-cyan-500/5
        transition-all
        duration-300
      "
    >

      <div
        className="
          w-16
          h-16
          rounded-2xl
          bg-cyan-500/10
          border
          border-cyan-500/20
          flex
          items-center
          justify-center
          mb-6
          group-hover:scale-110
          transition-all
        "
      >

        <Icon
          size={28}
          className="
            text-cyan-400
          "
        />

      </div>


      <h3
        className="
          text-2xl
          font-bold
          mb-3
        "
      >
        {title}
      </h3>

      <p
        className="
          text-zinc-400
          leading-relaxed
        "
      >
        {description}
      </p>

    </button>
  );
}

export default QuickAction;