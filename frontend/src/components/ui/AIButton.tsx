import React from "react";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "terracotta" | "moss";
  disabled?: boolean;
}

export default function AIButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
}: Props) {
  const variantStyles = {
    primary:
      "bg-[#49372B] hover:bg-[#372A21] text-[#FAF5EC] dark:bg-[#FAF5EC] dark:text-[#302820] dark:hover:bg-[#E5D6BE]",
    secondary:
      "bg-transparent border border-[#49372B]/20 dark:border-[#E5D6BE]/20 text-[#302820] dark:text-[#F3EADD] hover:bg-[#F0E9DC] dark:hover:bg-[#383029]",
    terracotta:
      "bg-[#AC7256] hover:bg-[#976046] text-[#FAF5EC]",
    moss:
      "bg-[#7A8065] hover:bg-[#686E54] text-[#FAF5EC]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        px-5
        py-2.5
        font-medium
        text-sm
        transition-all
        duration-150
        active:scale-[0.98]
        disabled:opacity-60
        disabled:cursor-not-allowed
        shadow-sm
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}