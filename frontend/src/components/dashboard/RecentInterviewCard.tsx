import {
  Laptop,
} from "lucide-react";

interface Props {

  role: string;

  company: string;

  score: number;

  status: string;

  time: string;
}

function RecentInterviewCard({

  role,

  company,

  score,

  status,

  time,
}: Props) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        p-5
        border-b
        border-white/5
      "
    >

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            w-12
            h-12
            rounded-xl
            bg-red-500/10
            flex
            items-center
            justify-center
            text-red-500
          "
        >

          <Laptop size={18} />

        </div>

        <div>

          <h4
            className="
              font-bold
              text-white
            "
          >
            {role}
          </h4>

          <p
            className="
              text-sm
              text-zinc-500
            "
          >
            {company} · {time}
          </p>

        </div>

      </div>

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-bold

            ${
              status === "PASSED"

                ? "bg-green-500/10 text-green-400"

                : "bg-yellow-500/10 text-yellow-400"
            }
          `}
        >
          {status}
        </div>

        <div
          className="
            w-12
            h-12
            rounded-full
            border-4
            border-red-500
            flex
            items-center
            justify-center
            font-bold
          "
        >
          {score}
        </div>

      </div>

    </div>
  );
}

export default RecentInterviewCard;