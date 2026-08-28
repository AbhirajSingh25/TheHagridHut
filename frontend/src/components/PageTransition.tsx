import {
  motion,
} from "framer-motion";

interface Props {

  children: React.ReactNode;
}

function PageTransition({

  children,
}: Props) {

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      exit={{
        opacity: 0,
        y: -20,
      }}

      transition={{
        duration: 0.35,
      }}
    >

      {children}

    </motion.div>
  );
}

export default PageTransition;