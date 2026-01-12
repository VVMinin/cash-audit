import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { fetchMe, register } from '../features/auth/authSlice'
import AuthLayout from '../components/layout/AuthLayout'

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error, token } = useSelector((state) => state.auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (token) {
      dispatch(fetchMe())
    }
  }, [token, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(register({ name, email, password }))
    if (register.fulfilled.match(result)) {
      navigate('/')
    }
  }

  const loading = status === 'loading'

  return (
    <AuthLayout>
      <div className="auth-card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
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
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      {loading && <Loader />}
      {error && <p className="error-text">{error}</p>}
      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage


