import { motion } from "framer-motion";

type Props = {

  listening:boolean;

};

export default function AudioVisualizer({

  listening,

}:Props){

  return(

    <div
      className="
        flex
        items-end
        justify-center
        gap-2
        h-28
      "
    >

      {

        Array.from({

          length:30

        }).map((_,index)=>(

          <motion.div

            key={index}

            animate={

              listening

              ?

              {

                height:[20,70,25,60,30]

              }

              :

              {

                height:20

              }

            }

            transition={{

              repeat:Infinity,

              duration:0.8,

              delay:index*0.03

            }}

            className="
              w-2
              rounded-full
              bg-gradient-to-t
              from-red-600
              via-red-400
              to-white
            "

          />

        ))

      }

    </div>

  );

}