import {
  ReactNode,
} from "react";


type Props = {

  children: ReactNode;

  className?: string;
};


function Card({

  children,

  className = "",

}: Props) {

  return (

    <div
      className={`
        rounded-[32px]
        border
        border-white/5
        bg-[#070707]
        backdrop-blur-xl
        ${className}
      `}
    >

      {children}

    </div>
  );
}

export default Card;