interface Props {
  children: string;
  className?: string;
}

export default function SectionTitle({
  children,
  className = "",
}: Props) {
  return (
    <h2 className={`font-serif text-xl sm:text-2xl font-semibold text-[#302820] dark:text-[#FAF5EC] mb-4 text-left ${className}`}>
      {children}
    </h2>
  );
}