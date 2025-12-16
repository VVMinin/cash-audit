import './ui.css'

const Select = ({ label, value, onChange, options, required = true }) => (
  <label className="ui-field">
    <span className="ui-label">{label}</span>
    <select className="ui-input" value={value} onChange={onChange} required={required}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
)

export default Select

