import {

  RadarChart,

  PolarGrid,

  PolarAngleAxis,

  Radar,

  ResponsiveContainer,

} from "recharts";

interface Props {

  data: {
    subject: string;
    score: number;
  }[];
}

function SkillsRadarChart({

  data,
}: Props) {

  return (

    <div
      className="
        glass-card
        rounded-[30px]
        p-6
        border
        border-red-500/10
        h-[380px]
      "
    >

      <h3
        className="
          text-2xl
          font-bold
          mb-4
        "
      >
        Skills Radar
      </h3>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <RadarChart
          data={data}
        >

          <PolarGrid
            stroke="#222"
          />

          <PolarAngleAxis
            dataKey="subject"
            stroke="#888"
          />

          <Radar
            dataKey="score"
            stroke="#ff1e1e"
            fill="#ff1e1e"
            fillOpacity={0.35}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default SkillsRadarChart;