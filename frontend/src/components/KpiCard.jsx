export default function KpiCard({ title, value }) {
  return (
    <div className="card kpi-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  )
}
