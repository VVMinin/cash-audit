import './ui.css'

const Button = ({ children, type = 'button', onClick, disabled }) => (
  <button className="ui-button" type={type} onClick={onClick} disabled={disabled}>
    {children}
  </button>
)

export default Button



