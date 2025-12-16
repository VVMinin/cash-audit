import './ui.css'

const Input = ({ label, type = 'text', value, onChange, placeholder, required = true }) => (
  <label className="ui-field">
    <span className="ui-label">{label}</span>
    <input
      className="ui-input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </label>
)

export default Input


