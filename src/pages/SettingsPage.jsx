import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { changePassword, fetchMe, updateProfile } from '../features/auth/authSlice'

const SettingsPage = () => {
  const dispatch = useDispatch()
  const {
    user,
    status,
    error,
    updateStatus,
    updateError,
    changePasswordStatus,
    changePasswordError,
    changePasswordMessage,
  } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwdLocalError, setPwdLocalError] = useState(null)

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '' })
  }, [user])

  const loading = status === 'loading' || updateStatus === 'loading'
  const pwdLoading = changePasswordStatus === 'loading'

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(updateProfile(form))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdLocalError(null)
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirm) {
      setPwdLocalError('Заполните все поля')
      return
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdLocalError('Новый пароль должен быть не менее 6 символов')
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdLocalError('Пароли не совпадают')
      return
    }
    try {
      await dispatch(
        changePassword({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        })
      ).unwrap()
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch {
      // ошибки уже в стейте changePasswordError
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="muted">Редактирование профиля пользователя</p>
        </div>
      </header>

      <div className="card">
        <form className="grid" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Button type="submit" disabled={loading}>
            Save
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
            value={pwdForm.currentPassword}
            onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            label="Новый пароль"
            type="password"
            value={pwdForm.newPassword}
            onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            label="Повторите новый пароль"
            type="password"
            value={pwdForm.confirm}
            onChange={(e) => setPwdForm((f) => ({ ...f, confirm: e.target.value }))}
          />
          <Button type="submit" disabled={pwdLoading}>
            Сменить пароль
          </Button>
        </form>
        {pwdLoading && <Loader />}
        {(pwdLocalError || changePasswordError) && (
          <p className="error-text">{pwdLocalError || changePasswordError}</p>
        )}
        {changePasswordMessage && <p className="success-text">{changePasswordMessage}</p>}
      </div>
    </div>
  )
}

export default SettingsPage


