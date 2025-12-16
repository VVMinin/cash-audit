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
      navigate('/')
    }
  }, [token, dispatch, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(register({ name, email, password }))
  }

  const loading = status === 'loading'

  return (
    <AuthLayout>
      <div className="auth-card">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Наименование"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
        />
        <p className="helper-text">Имя должно содержать минимум 2 символа.</p>
        <Input
          label="Электронная почта"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <p className="helper-text">Введите корректный email в формате example@mail.ru.</p>
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <p className="helper-text">Пароль должен содержать минимум 6 символов.</p>
        <Button type="submit" disabled={loading}>
          {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </Button>
      </form>
      {loading && <Loader />}
      {error && <p className="error-text">{error}</p>}
      <p className="muted">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage


