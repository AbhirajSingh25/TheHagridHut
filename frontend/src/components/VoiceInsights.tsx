import {

  Mic,

  Activity,

  Brain,

  AlertTriangle,

} from "lucide-react";


function VoiceInsights({
  analysis,
}: any) {

  if (!analysis) {

    return null;
  }


  return (

    <div
      className="
        grid
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
        mt-10
      "
    >

      <div
        className="
          bg-cyan-400/10
          border
          border-cyan-400/20
          rounded-3xl
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            mb-4
          "
        >

          <Mic
            className="
              text-cyan-400
            "
          />

          <div
            className="
              text-zinc-400
            "
          >
            Words
          </div>

        </div>

        <div
          className="
            text-5xl
            font-bold
            text-cyan-400
          "
        >

          {
            analysis.wordCount
          }

        </div>

      </div>


      <div
        className="
          bg-purple-400/10
          border
          border-purple-400/20
          rounded-3xl
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            mb-4
          "
        >

          <Activity
            className="
              text-purple-400
            "
          />

          <div
            className="
              text-zinc-400
            "
          >
            WPM
          </div>

        </div>

        <div
          className="
            text-5xl
            font-bold
            text-purple-400
          "
        >

          {
            analysis.wordsPerMinute
          }

        </div>

      </div>


      <div
        className="
          bg-red-400/10
          border
          border-red-400/20
          rounded-3xl
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            mb-4
          "
        >

          <AlertTriangle
            className="
              text-red-400
            "
          />

          <div
            className="
              text-zinc-400
            "
          >
            Fillers
          </div>

        </div>

        <div
          className="
            text-5xl
            font-bold
            text-red-400
          "
        >

          {
            analysis.fillerCount
          }

        </div>

      </div>


      <div
        className="
          bg-green-400/10
          border
          border-green-400/20
          rounded-3xl
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            mb-4
          "
        >

          <Brain
            className="
              text-green-400
            "
          />

          <div
            className="
              text-zinc-400
            "
          >
            Confidence
          </div>

        </div>

        <div
          className="
            text-5xl
            font-bold
            text-green-400
          "
        >

          {
            analysis.confidence
          }

        </div>

      </div>

    </div>
  );
}

export default VoiceInsights;