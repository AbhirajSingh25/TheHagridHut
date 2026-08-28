import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "Mon",
    score: 72,
  },
  {
    name: "Tue",
    score: 81,
  },
  {
    name: "Wed",
    score: 78,
  },
  {
    name: "Thu",
    score: 89,
  },
  {
    name: "Fri",
    score: 93,
  },
  {
    name: "Sat",
    score: 95,
  },
];

function PerformanceChart() {

  return (

    <div
      className="
        w-full
        h-[320px]
      "
    >

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <AreaChart
          data={data}
        >

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
            dataKey="name"
            stroke="#71717a"
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorScore)"
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}

export default PerformanceChart;

