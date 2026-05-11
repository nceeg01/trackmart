import { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  unit,
  trend,
  detail,
  accent,
  testId,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  detail?: string;
  accent?: "default" | "good" | "warn" | "bad";
  testId?: string;
  icon?: ReactNode;
}) {
  const accentColor =
    accent === "good"
      ? "text-emerald-400"
      : accent === "warn"
      ? "text-amber-400"
      : accent === "bad"
      ? "text-rose-400"
      : "text-primary";

  return (
    <div
      className="rounded-lg border border-card-border bg-card px-4 py-3.5 flex flex-col gap-1.5"
      data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground font-medium">{label}</div>
        {icon && <div className={`${accentColor} opacity-80`}>{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-semibold tabular leading-none" data-testid={testId ? `${testId}-value` : undefined}>
          {value}
        </span>
        {unit && <span className="text-[12px] text-muted-foreground tabular">{unit}</span>}
      </div>
      {(trend || detail) && (
        <div className="text-[11.5px] text-muted-foreground leading-snug">
          {trend && <span className={`${accentColor} font-medium`}>{trend}</span>}
          {trend && detail && <span className="mx-1">·</span>}
          {detail && <span>{detail}</span>}
        </div>
      )}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  testId,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-card-border bg-card ${className}`}
      data-testid={testId}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-4 pt-3.5 pb-2">
          <div>
            {title && <h2 className="text-[13.5px] font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-[11.5px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title ? "px-4 pb-4" : "p-4"}>{children}</div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-3">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "good" | "warn" | "bad" | "info";
}) {
  const map = {
    default: "bg-muted text-foreground border-border",
    good: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warn: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    bad: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    info: "bg-primary/10 text-primary border-primary/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium border tabular ${map[tone]}`}>
      {children}
    </span>
  );
}
