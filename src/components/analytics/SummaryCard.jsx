const SummaryCard = ({ title, value, color }) => (
  <div className="summary-card" style={{ borderColor: color }}>
    <div className="summary-title">{title}</div>
    <div className="summary-value" style={{ color }}>
      {value}
    </div>
  </div>
)

export default SummaryCard


