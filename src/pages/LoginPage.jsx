import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { fetchMe, login } from '../features/auth/authSlice'
import AuthLayout from '../components/layout/AuthLayout'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error, token } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (token) {
      dispatch(fetchMe())
      navigate('/')
    }
  }, [token, dispatch, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  const loading = status === 'loading'

  return (
    <AuthLayout>
      <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      {loading && <Loader />}
      {error && <p className="error-text">{error}</p>}
      <p className="muted">
        No account? <Link to="/register">Register</Link>
      </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage


