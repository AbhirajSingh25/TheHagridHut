import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import MainLayout from "../components/MainLayout";

import {
  generateQuestions,
} from "../services/api";

import {
  Brain,
  Briefcase,
  BarChart3,
  Cpu,
} from "lucide-react";


function MockInterview() {

  const navigate =
    useNavigate();

  const [
    selectedRole,
    setSelectedRole,
  ] = useState(
    "Software Engineer"
  );

  const [
    selectedCompany,
    setSelectedCompany,
  ] = useState(
    "Google"
  );

  const [
    cameraEnabled,
    setCameraEnabled,
  ] = useState(true);

  const [
    voiceEnabled,
    setVoiceEnabled,
  ] = useState(true);

  const [
    copilotEnabled,
    setCopilotEnabled,
  ] = useState(true);


  const roles = [

    {
      title:
        "Software Engineer",

      level:
        "L3-L6",

      icon:
        Briefcase,
    },

    {
      title:
        "Product Manager",

      level:
        "Associate-Director",

      icon:
        Brain,
    },

    {
      title:
        "Data Scientist",

      level:
        "Junior-Senior",

      icon:
        BarChart3,
    },

    {
      title:
        "ML Engineer",

      level:
        "Research-Applied",

      icon:
        Cpu,
    },
  ];


  const companies = [

    "Google",

    "Meta",

    "Amazon",

    "Apple",

    "Netflix",

    "Stripe",

    "OpenAI",

    "Anthropic",
  ];


  async function handleStartInterview() {

    try {

      const data =
        await generateQuestions(

          selectedRole,

          "Intermediate"
        );


      localStorage.setItem(

        "mockQuestions",

        JSON.stringify(
          data.questions
        )
      );


      localStorage.setItem(

        "mockRole",

        selectedRole
      );


      localStorage.setItem(

        "mockCompany",

        selectedCompany
      );


      navigate(
        "/live-interview"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Backend connection failed"
      );
    }
  }


  return (

    <MainLayout>

      <div className="text-white">

        <div className="mb-10">

          <p
            className="
              text-cyan-400
              uppercase
              tracking-[0.3em]
              text-sm
              font-bold
              mb-4
            "
          >
            AI INTERVIEW SYSTEM
          </p>


          <h1
            className="
              text-7xl
              font-black
              leading-none
              mb-5
            "
          >
            Live AI Interview
          </h1>


          <p
            className="
              text-zinc-400
              text-2xl
            "
          >
            Configure your interview session with real AI-powered conversation
          </p>

        </div>


        <div
          className="
            grid
            grid-cols-12
            gap-6
          "
        >

          <div
            className="
              col-span-6
              border
              border-red-900/40
              rounded-[40px]
              bg-black/40
              p-8
            "
          >

            <h2
              className="
                text-5xl
                font-bold
                mb-10
              "
            >
              Select Role
            </h2>


            <div className="grid grid-cols-2 gap-6">

              {roles.map((role) => {

                const Icon =
                  role.icon;

                const active =
                  selectedRole === role.title;

                return (

                  <button
                    key={role.title}
                    onClick={() =>
                      setSelectedRole(role.title)
                    }
                    className={`
                      text-left
                      rounded-[30px]
                      border
                      p-7
                      transition-all
                      min-h-[240px]

                      ${
                        active

                        ? `
                          border-red-500
                          bg-red-950/30
                          shadow-[0_0_40px_rgba(255,0,0,0.15)]
                        `

                        : `
                          border-zinc-800
                          bg-black/30
                          hover:border-red-800
                        `
                      }
                    `}
                  >

                    <div
                      className="
                        w-16
                        h-16
                        rounded-2xl
                        border
                        border-zinc-700
                        flex
                        items-center
                        justify-center
                        mb-8
                      "
                    >

                      <Icon size={30} />

                    </div>


                    <h3
                      className="
                        text-3xl
                        font-bold
                        mb-4
                      "
                    >
                      {role.title}
                    </h3>


                    <p
                      className="
                        text-zinc-500
                        text-xl
                      "
                    >
                      {role.level}
                    </p>

                  </button>
                );
              })}

            </div>

          </div>


          <div
            className="
              col-span-3
              border
              border-red-900/40
              rounded-[40px]
              bg-black/40
              p-8
            "
          >

            <h2
              className="
                text-5xl
                font-bold
                mb-10
              "
            >
              Target Company
            </h2>


            <div className="space-y-5">

              {companies.map((company) => (

                <button
                  key={company}
                  onClick={() =>
                    setSelectedCompany(company)
                  }
                  className={`
                    w-full
                    py-5
                    rounded-2xl
                    border
                    text-xl
                    transition-all

                    ${
                      selectedCompany === company

                      ? `
                        border-red-500
                        bg-red-950/30
                      `

                      : `
                        border-zinc-800
                        bg-black/30
                        hover:border-red-800
                      `
                    }
                  `}
                >
                  {company}
                </button>
              ))}

            </div>

          </div>


          <div
            className="
              col-span-3
              flex
              flex-col
              gap-6
            "
          >

            <div
              className="
                border
                border-red-900/40
                rounded-[40px]
                bg-black/40
                p-8
              "
            >

              <h2
                className="
                  text-5xl
                  font-bold
                  mb-10
                "
              >
                Session Settings
              </h2>


              <div className="space-y-10">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-2xl font-bold">
                      Camera
                    </h3>

                    <p className="text-zinc-500 text-lg">
                      AI vision analysis
                    </p>

                  </div>

                </div>


                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-2xl font-bold">
                      Voice Mode
                    </h3>

                    <p className="text-zinc-500 text-lg">
                      Speech recognition
                    </p>

                  </div>

                </div>


                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-2xl font-bold">
                      AI Copilot
                    </h3>

                    <p className="text-zinc-500 text-lg">
                      Live answer hints
                    </p>

                  </div>

                </div>

              </div>

            </div>


            <button

              onClick={handleStartInterview}

              className="
                w-full
                py-7
                rounded-[30px]
                bg-red-900
                hover:bg-red-800
                text-3xl
                font-black
                transition-all
              "
            >
              Start Interview
            </button>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default MockInterview;