import {
  motion,
} from "framer-motion";

function AnimatedPage({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
    >

      {children}

    </motion.div>
  );
}

export default AnimatedPage;