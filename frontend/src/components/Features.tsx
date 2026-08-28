import FeatureCard from "./FeatureCard";

import {
  FaMicrophone,
  FaBrain,
  FaEye,
  FaChartLine,
} from "react-icons/fa";

function Features() {
  return (
    <section
      id="features"
      className="py-32 px-6 relative"
    >

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-20">

          <h2 className="text-5xl font-bold">
            AI-Powered Interview Intelligence
          </h2>

          <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg">
            HireSense AI combines NLP, computer vision,
            speech analysis, and LLM evaluation to help
            candidates improve interview performance.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <FeatureCard
            title="Speech Analysis"
            description="Analyze confidence, filler words, speaking pace, and communication clarity."
            icon={FaMicrophone}
          />

          <FeatureCard
            title="LLM Evaluation"
            description="AI evaluates technical depth, relevance, and answer quality in real time."
            icon={FaBrain}
          />

          <FeatureCard
            title="Eye Tracking"
            description="Computer vision tracks attention, posture, and eye contact."
            icon={FaEye}
          />

          <FeatureCard
            title="Analytics Dashboard"
            description="Track performance trends with visual analytics and improvement reports."
            icon={FaChartLine}
          />

        </div>
      </div>
    </section>
  );
}

export default Features;