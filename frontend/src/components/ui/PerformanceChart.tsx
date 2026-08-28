import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { day: "1", score: 35 },
  { day: "5", score: 42 },
  { day: "10", score: 67 },
  { day: "15", score: 51 },
  { day: "20", score: 72 },
  { day: "25", score: 78 },
  { day: "30", score: 95 },
];

function PerformanceChart() {

  return (

    <div
      className="
        w-full
        h-[320px]
      "
    >

      <ResponsiveContainer>

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
                stopColor="#06b6d4"
                stopOpacity={0.5}
              />

              <stop
                offset="95%"
                stopColor="#06b6d4"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>

          <XAxis
            dataKey="day"
            stroke="#71717a"
          />

          <YAxis
            stroke="#71717a"
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#22d3ee"
            fillOpacity={1}
            fill="url(#colorScore)"
            strokeWidth={4}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}

export default PerformanceChart;