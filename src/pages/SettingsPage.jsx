import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { fetchMe, updateProfile } from '../features/auth/authSlice'
import api from '../services/api'

const SettingsPage = () => {
  const dispatch = useDispatch()
  const { user, status, error, updateStatus, updateError } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', repeatPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '' })
  }, [user])

  const loading = status === 'loading' || updateStatus === 'loading'

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(updateProfile(form))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwSuccess(false)
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setPwError('Новый пароль должен быть не менее 6 символов')
      return
    }
    if (pwForm.newPassword !== pwForm.repeatPassword) {
      setPwError('Пароли не совпадают')
      return
    }
    try {
      setPwLoading(true)
      setPwError(null)
      await api.put('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', repeatPassword: '' })
    } catch (err) {
      setPwError(err.response?.data?.error || 'Не удалось сменить пароль')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Настройки</h2>
          <p className="muted">Редактирование профиля пользователя</p>
        </div>
      </header>

      <div className="card">
        <form className="grid" onSubmit={handleSubmit}>
          <Input
            label="Наименование"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Электронная почта"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Button type="submit" disabled={loading}>
            Сохранить
          </Button>
        </form>
        {loading && <Loader />}
        {(error || updateError) && <p className="error-text">{error || updateError}</p>}
      </div>

      <div className="card">
        <h3>Смена пароля</h3>
        <form className="grid" onSubmit={handlePasswordSubmit}>
          <Input
            label="Текущий пароль"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            label="Новый пароль"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            label="Повтор нового пароля"
            type="password"
            value={pwForm.repeatPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, repeatPassword: e.target.value }))}
          />
          <Button type="submit" disabled={pwLoading}>
            Сменить пароль
          </Button>
        </form>
        {pwLoading && <Loader />}
        {pwError && <p className="error-text">{pwError}</p>}
        {pwSuccess && <p className="muted">Пароль успешно изменён</p>}
      </div>
    </div>
  )
}

export default SettingsPage


