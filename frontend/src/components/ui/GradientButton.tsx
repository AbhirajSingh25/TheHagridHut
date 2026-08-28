type Props = {
  text: string;
  onClick?: () => void;
  className?: string;
};

function GradientButton({
  text,
  onClick,
  className = "",
}: Props) {

  return (

    <button
      onClick={onClick}
      className={`
        relative
        overflow-hidden
        rounded-2xl
        px-8
        py-4
        font-bold
        text-white
        bg-gradient-to-r
        from-red-600
        to-red-500
        hover:scale-[1.03]
        active:scale-[0.98]
        transition-all
        duration-300
        shadow-[0_0_40px_rgba(255,0,0,0.35)]
        ${className}
      `}
    >

      <span
        className="
          absolute
          inset-0
          bg-white/10
          opacity-0
          hover:opacity-100
          transition-all
        "
      />

      <span className="relative z-10">
        {text}
      </span>

    </button>
  );
}

export default GradientButton;