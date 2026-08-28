import type {
  ReactNode,
} from "react";

type PremiumButtonProps = {

  children: ReactNode;

  variant?:
    | "primary"
    | "secondary";

  className?: string;

  onClick?: () => void | Promise<void>;
};

function PremiumButton({

  children,

  variant = "primary",

  className = "",

  onClick,
}: PremiumButtonProps) {

  return (

    <button
      onClick={onClick}
      className={`

        px-6
        py-4
        rounded-4xl
        font-semibold
        transition-all
        duration-300

        ${
          variant === "primary"

            ? `
              bg-cyan-400
              text-black
              hover:scale-[1.02]
              hover:shadow-lg
              hover:shadow-cyan-500/30
            `

            : `
              bg-white/5
              border
              border-white/10
              text-white
              hover:bg-white/10
            `
        }

        ${className}
      `}
    >

      {children}

    </button>
  );
}

export default PremiumButton;