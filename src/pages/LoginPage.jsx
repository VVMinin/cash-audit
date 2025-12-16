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
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Электронная почта"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </Button>
      </form>
      {loading && <Loader />}
      {error && <p className="error-text">{error}</p>}
      <p className="muted">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage


