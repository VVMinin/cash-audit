import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import Header from './Header'
import './layout.css'

const ProtectedLayout = () => {
  const { token } = useSelector((state) => state.auth)
  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="protected-shell">
      <Header />
      <main className="protected-main">
        <Outlet />
      </main>
    </div>
  )
}

export default ProtectedLayout


