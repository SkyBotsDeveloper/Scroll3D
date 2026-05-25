type StatusBadgeTone = "ok" | "warning" | "error" | "neutral" | "accent";

interface StatusBadgeProps {
  children: string;
  tone?: StatusBadgeTone;
}

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`statusPill ${tone}`}>{children}</span>;
}
