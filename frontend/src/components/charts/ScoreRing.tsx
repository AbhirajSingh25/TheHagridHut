import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

interface Props {

  value: number;

  label: string;
}

function ScoreRing({

  value,

  label,
}: Props) {

  return (

    <div
      className="
        glass-card
        rounded-[28px]
        p-6
        flex
        flex-col
        items-center
        justify-center
        border
        border-red-500/10
      "
    >

      <div className="w-28 h-28">

        <CircularProgressbar

          value={value}

          text={`${value}`}

          styles={buildStyles({

            pathColor: "#ff1e1e",

            textColor: "#ffffff",

            trailColor: "#1a1a1a",
          })}
        />

      </div>

      <p
        className="
          text-zinc-400
          mt-5
          font-medium
        "
      >
        {label}
      </p>

    </div>
  );
}

export default ScoreRing;