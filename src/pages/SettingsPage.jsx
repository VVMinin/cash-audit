import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { fetchMe, updateProfile } from '../features/auth/authSlice'

const SettingsPage = () => {
  const dispatch = useDispatch()
  const { user, status, error, updateStatus, updateError } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '' })

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
    </div>
  )
}

export default SettingsPage


