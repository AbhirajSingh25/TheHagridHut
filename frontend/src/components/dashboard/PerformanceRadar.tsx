import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";


type Props = {

  confidence: number;

  communication: number;

  technical: number;

  problemSolving: number;

  leadership: number;
};


function PerformanceRadar({

  confidence,

  communication,

  technical,

  problemSolving,

  leadership,

}: Props) {

  const data = [

    {
      subject: "Confidence",
      value: confidence,
      fullMark: 100,
    },

    {
      subject: "Communication",
      value: communication,
      fullMark: 100,
    },

    {
      subject: "Technical",
      value: technical,
      fullMark: 100,
    },

    {
      subject: "Problem Solving",
      value: problemSolving,
      fullMark: 100,
    },

    {
      subject: "Leadership",
      value: leadership,
      fullMark: 100,
    },
  ];


  return (

    <div
      className="
        w-full
        h-full
        min-h-[420px]
      "
    >

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <RadarChart
          data={data}
        >

          <PolarGrid
            stroke="#27272a"
          />

          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "#ffffff",
              fontSize: 14,
            }}
          />

          <Radar
            name="Performance"
            dataKey="value"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.45}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default PerformanceRadar;