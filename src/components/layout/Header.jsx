import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import './layout.css'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    { to: '/', label: 'Аналитика' },
    { to: '/accounts', label: 'Счета' },
    { to: '/categories', label: 'Категории' },
    { to: '/transactions', label: 'Операции' },
    { to: '/settings', label: 'Настройки' },
    ...(user?.role === 'admin' ? [{ to: '/admin/users', label: 'Пользователи' }] : []),
  ]

  return (
    <header className="app-header">
      <div className="brand">Finance</div>
      <nav className="nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="nav-link">
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-right">
        <span className="user-name">
          {user?.name}
          {user?.role === 'admin' && <span className="badge">Admin</span>}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </header>
  )
}

export default Header

