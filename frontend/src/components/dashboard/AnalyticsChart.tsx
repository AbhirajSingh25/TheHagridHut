import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

const data = [

  {
    day: "Mon",
    score: 64,
  },

  {
    day: "Tue",
    score: 78,
  },

  {
    day: "Wed",
    score: 71,
  },

  {
    day: "Thu",
    score: 90,
  },

  {
    day: "Fri",
    score: 97,
  },

  {
    day: "Sat",
    score: 92,
  },

  {
    day: "Sun",
    score: 100,
  },
];

function AnalyticsChart() {

  return (

    <div
      className="
        rounded-[32px]
        border
        border-red-500/10
        bg-[#080808]
        p-8
        h-[420px]
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >

        <div>

          <h2
            className="
              text-3xl
              font-bold
              text-white
              mb-2
            "
          >
            Score Trend
          </h2>

          <p
            className="
              text-zinc-500
            "
          >
            AI interview growth analytics
          </p>

        </div>


        <div
          className="
            px-5
            py-2
            rounded-xl
            bg-blue-500/10
            border
            border-blue-500/20
            text-blue-400
            text-sm
            font-semibold
          "
        >
          LAST 7 SESSIONS
        </div>

      </div>



      <div className="h-[280px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart data={data}>

            <defs>

              <linearGradient
                id="colorScore"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="5%"
                  stopColor="#ef4444"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="#ef4444"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>


            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#71717a",
              }}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorScore)"
              strokeWidth={4}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default AnalyticsChart;