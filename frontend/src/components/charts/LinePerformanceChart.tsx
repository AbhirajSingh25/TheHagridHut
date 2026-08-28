import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 81 },
  { day: "Wed", score: 77 },
  { day: "Thu", score: 89 },
  { day: "Fri", score: 94 },
  { day: "Sat", score: 91 },
  { day: "Sun", score: 98 },
];

function LinePerformanceChart() {

  return (

    <div className="h-[360px]">

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
                offset="0%"
                stopColor="#ff0000"
                stopOpacity={0.8}
              />

              <stop
                offset="100%"
                stopColor="#ff0000"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>

          <XAxis
            dataKey="day"
            stroke="#666"
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#ff0000"
            fill="url(#colorScore)"
            strokeWidth={4}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}

export default LinePerformanceChart;