interface Props {

  confidence: number;

  communication: number;

  technical: number;
}

function RealtimeFeedback({

  confidence,

  communication,

  technical,
}: Props) {

  const items = [
    {
      label: "Confidence",
      value: confidence,
      color: "bg-cyan-400",
    },
    {
      label: "Communication",
      value: communication,
      color: "bg-green-400",
    },
    {
      label: "Technical",
      value: technical,
      color: "bg-purple-400",
    },
  ];

  return (

    <div
      className="
        rounded-[32px]
        border
        border-white/5
        bg-black/20
        p-8
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          mb-8
        "
      >
        AI Feedback
      </h2>

      <div className="space-y-8">

        {items.map((item) => (

          <div key={item.label}>

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <span
                className="
                  text-lg
                  text-zinc-300
                "
              >
                {item.label}
              </span>

              <span
                className="
                  text-xl
                  font-bold
                "
              >
                {item.value}%
              </span>

            </div>


            <div
              className="
                h-4
                rounded-full
                bg-white/5
                overflow-hidden
              "
            >

              <div
                className={`
                  h-full
                  rounded-full
                  ${item.color}
                `}
                style={{
                  width: `${item.value}%`,
                }}
              />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default RealtimeFeedback;