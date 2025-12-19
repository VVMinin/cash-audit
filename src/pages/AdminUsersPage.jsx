import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import './AdminUsersPage.css'

const emptyUser = { name: '', email: '', role: 'user', password: '' }

const AdminUsersPage = () => {
  const { user } = useSelector((s) => s.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyUser)
  const [editId, setEditId] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ id: '', password: '' })

  // Доступ только для администратора
  const isAdmin = user?.role === 'admin'

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data.users || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editId) {
        const res = await api.put(`/admin/users/${editId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
        })
        setUsers((u) => u.map((item) => (item.id === editId ? res.data.user : item)))
      } else {
        const res = await api.post('/admin/users', form)
        setUsers((u) => [res.data.user, ...u])
      }
      setForm(emptyUser)
      setEditId(null)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (u) => {
    setEditId(u.id)
    setForm({ name: u.name, email: u.email, role: u.role, password: '' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return
    try {
      setLoading(true)
      await api.delete(`/admin/users/${id}`)
      setUsers((u) => u.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!passwordForm.id || !passwordForm.password) return
    try {
      setLoading(true)
      await api.put(`/admin/users/${passwordForm.id}/password`, {
        password: passwordForm.password,
      })
      setPasswordForm({ id: '', password: '' })
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return <p className="error-text" style={{ padding: 16 }}>Доступ запрещён</p>
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Пользователи (Admin)</h2>
          <p className="muted">Создание, редактирование, удаление и смена пароля</p>
        </div>
      </header>

      <div className="card">
        <h4>{editId ? 'Редактировать' : 'Добавить'} пользователя</h4>
        <form className="grid" onSubmit={handleSubmit}>
          <Input
            label="Имя"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          {!editId && (
            <Input
              label="Пароль"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          )}
          <Select
            label="Роль"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Button type="submit" disabled={loading}>
            {editId ? 'Сохранить' : 'Создать'}
          </Button>
        </form>
        {loading && <Loader />}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card list">
        <h4>Список пользователей</h4>
        {users.length === 0 && <p className="muted">Пользователей нет</p>}
        {users.map((u) => (
          <div key={u.id} className="list-row">
            <div>
              <div className="list-title">{u.name}</div>
              <div className="muted small">{u.email}</div>
              <div className="small">role: {u.role}</div>
            </div>
            <div className="list-actions">
              <Button onClick={() => handleEdit(u)}>Редактировать</Button>
              <Button onClick={() => handleDelete(u.id)} disabled={loading}>
                Удалить
              </Button>
              <Button
                onClick={() => setPasswordForm({ id: u.id, password: '' })}
                disabled={loading}
              >
                Сменить пароль
              </Button>
            </div>
          </div>
        ))}
      </div>

      {passwordForm.id && (
        <div className="card">
          <h4>Сменить пароль</h4>
          <form className="grid" onSubmit={handlePasswordChange}>
            <Input
              label="Новый пароль"
              type="password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
            />
            <Button type="submit" disabled={loading}>
              Обновить пароль
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage


