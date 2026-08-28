import MainLayout from "../components/MainLayout";


function InterviewAnalysis() {

  return (

    <MainLayout>

      <div
        className="
          min-h-screen
          text-white
          p-10
        "
      >

        <h1
          className="
            text-5xl
            font-bold
            mb-6
          "
        >
          Interview Analysis
        </h1>

        <div
          className="
            bg-white/5
            border
            border-white/10
            rounded-3xl
            p-10
          "
        >

          <p
            className="
              text-zinc-400
              text-lg
            "
          >
            AI-powered interview analytics dashboard.
          </p>

        </div>

      </div>

    </MainLayout>
  );
}

export default InterviewAnalysis;