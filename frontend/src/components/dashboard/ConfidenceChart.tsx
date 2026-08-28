import {

  LineChart,

  Line,

  XAxis,

  Tooltip,

  ResponsiveContainer,

} from "recharts";


function ConfidenceChart() {

  const data = [

    {
      day: "Mon",
      confidence: 65,
    },

    {
      day: "Tue",
      confidence: 72,
    },

    {
      day: "Wed",
      confidence: 74,
    },

    {
      day: "Thu",
      confidence: 81,
    },

    {
      day: "Fri",
      confidence: 86,
    },

    {
      day: "Sat",
      confidence: 91,
    },
  ];


  return (

    <div
      className="
        bg-[#070B14]
        border
        border-red-500/20
        rounded-[32px]
        p-8
        h-[420px]
      "
    >

      <h2
        className="
          text-3xl
          font-bold
          mb-8
        "
      >
        Confidence Growth
      </h2>


      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={data}
        >

          <XAxis
            dataKey="day"
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#ef4444"
            strokeWidth={4}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default ConfidenceChart;