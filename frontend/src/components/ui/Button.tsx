import { ButtonHTMLAttributes } from "react";

type Props =
  ButtonHTMLAttributes<HTMLButtonElement> & {

    children: React.ReactNode;

    className?: string;
  };

function Button({

  children,

  className = "",

  ...props

}: Props) {

  return (

    <button
      {...props}
      className={`
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        gap-3
        px-8
        py-4
        rounded-2xl
        bg-red-600
        hover:bg-red-500
        text-white
        font-black
        transition-all
        duration-300
        hover:scale-[1.02]
        active:scale-[0.98]
        shadow-[0_0_40px_rgba(255,0,0,0.25)]
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-white/10
          via-transparent
          to-transparent
        "
      />

      <span className="relative z-10">

        {children}

      </span>

    </button>
  );
}

export default Button;