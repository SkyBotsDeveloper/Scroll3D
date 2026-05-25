interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="metricCard">
      <span>{value}</span>
      <small>{label}</small>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
