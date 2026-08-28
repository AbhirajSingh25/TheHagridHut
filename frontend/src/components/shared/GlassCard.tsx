type Props = {

  children: React.ReactNode;

  className?: string;
};

function GlassCard({

  children,

  className = "",
}: Props) {

  return (

    <div
      className={`
        rounded-[32px]
        border
        border-red-500/10
        bg-[#050505]
        backdrop-blur-xl
        shadow-[0_0_50px_rgba(255,0,0,0.05)]
        ${className}
      `}
    >

      {children}

    </div>
  );
}

export default GlassCard;