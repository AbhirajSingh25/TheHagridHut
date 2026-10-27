type PageHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
};

export default function PageHeader({
  badge,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="space-y-2 text-left">
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5D6BE]/60 dark:bg-[#342C25] text-[11px] font-medium text-[#49372B] dark:text-[#E5D6BE] border border-[#49372B]/10 dark:border-[#E5D6BE]/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AC7256]" />
          <span>{badge}</span>
        </div>
      )}

      <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#302820] dark:text-[#FAF5EC]">
        {title}
      </h1>

      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-[#6B5D50] dark:text-[#B8AFA3]">
          {description}
        </p>
      )}
    </div>
  );
}