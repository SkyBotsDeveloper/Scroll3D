import type { ReactNode } from "react";

type AlertTone = "info" | "success" | "warning" | "error";

interface AlertBoxProps {
  title: string;
  tone?: AlertTone;
  children: ReactNode;
}

export function AlertBox({ title, tone = "info", children }: AlertBoxProps) {
  return (
    <section className={`alertBox ${tone}`} aria-label={title}>
      <strong>{title}</strong>
      <div>{children}</div>
    </section>
  );
}
