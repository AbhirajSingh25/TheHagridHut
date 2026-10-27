import React from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ElementType;
  accent?: "terracotta" | "moss" | "brass" | "walnut" | "purple" | "cyan" | "green" | "amber";
}

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "terracotta",
}: MetricCardProps) {
  // Map any legacy accent to our tactile palette
  const accentStyles = {
    terracotta: "text-[#AC7256] bg-[#AC7256]/10 border-[#AC7256]/20",
    purple: "text-[#AC7256] bg-[#AC7256]/10 border-[#AC7256]/20",
    moss: "text-[#7A8065] bg-[#7A8065]/10 border-[#7A8065]/20",
    green: "text-[#7A8065] bg-[#7A8065]/10 border-[#7A8065]/20",
    brass: "text-[#B39460] bg-[#B39460]/10 border-[#B39460]/20",
    amber: "text-[#B39460] bg-[#B39460]/10 border-[#B39460]/20",
    cyan: "text-[#7A8065] bg-[#7A8065]/10 border-[#7A8065]/20",
    walnut: "text-[#49372B] dark:text-[#E5D6BE] bg-[#49372B]/10 border-[#49372B]/20",
  };

  const style = accentStyles[accent] || accentStyles.terracotta;

  return (
    <div className="study-card p-5 flex flex-col justify-between text-left">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${style}`}>
          {Icon ? <Icon size={16} /> : <TrendingUp size={16} />}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium text-[#6B5D50] dark:text-[#B8AFA3]">
          {title}
        </p>
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#302820] dark:text-[#FAF5EC]">
          {value}
        </h3>
        {description && (
          <p className="text-[11px] text-[#9B8D7F] leading-normal pt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}