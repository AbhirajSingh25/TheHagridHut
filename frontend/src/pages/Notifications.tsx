import {
  motion,
} from "framer-motion";

import MainLayout from "../components/MainLayout";

import PageLayout from "../components/PageLayout";

import AnimatedPage from "../components/AnimatedPage";

import PremiumCard from "../components/PremiumCard";

const notifications = [

  {
    title:
      "AI Readiness Improved",

    message:
      "Your confidence score increased by 12% this week.",

    type:
      "success",

    time:
      "2 hours ago",
  },

  {
    title:
      "Upcoming Interview",

    message:
      "Mock interview session scheduled for tomorrow at 11:00 AM.",

    type:
      "info",

    time:
      "5 hours ago",
  },

  {
    title:
      "Recruiter Signal",

    message:
      "Communication consistency is improving significantly.",

    type:
      "success",

    time:
      "1 day ago",
  },

  {
    title:
      "AI Recommendation",

    message:
      "Practice system design interviews to improve recruiter readiness.",

    type:
      "warning",

    time:
      "2 days ago",
  },

  {
    title:
      "Achievement Unlocked",

    message:
      "Completed 10 AI interview sessions.",

    type:
      "achievement",

    time:
      "3 days ago",
  },
];

function Notifications() {

  const getStyles =
    (type: string) => {

      switch (type) {

        case "success":

          return "bg-green-500/10 text-green-300";

        case "warning":

          return "bg-yellow-500/10 text-yellow-300";

        case "achievement":

          return "bg-purple-500/10 text-purple-300";

        default:

          return "bg-cyan-500/10 text-cyan-300";
      }
    };

  return (
    <MainLayout>

      <AnimatedPage>

        <PageLayout
          title="Notifications"
          subtitle="AI-generated interview updates and recruiter intelligence"
        >

          <div className="space-y-5">

            {notifications.map(
              (
                item,
                index
              ) => (

                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                >

                  <PremiumCard className="p-8">

                    <div className="flex items-start justify-between gap-6 flex-wrap">

                      <div className="flex-1">

                        <div className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${getStyles(item.type)}`}>

                          {item.title}

                        </div>

                        <p className="text-gray-300 leading-8 mt-6 text-lg">

                          {item.message}

                        </p>

                      </div>

                      <div className="text-gray-500 text-sm whitespace-nowrap">

                        {item.time}

                      </div>

                    </div>

                  </PremiumCard>

                </motion.div>

              )
            )}

          </div>

        </PageLayout>

      </AnimatedPage>

    </MainLayout>
  );
}

export default Notifications;