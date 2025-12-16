import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import './AdminUsersPage.css'

const AdminUsersPage = () => {
  const { user } = useSelector((s) => s.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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

  const handleEdit = (u) => {
    setEditId(u.id)
    setPasswordForm({ id: '', password: '' })
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
          <h2>Пользователи (Админ)</h2>
          <p className="muted">Редактирование, смена роли/пароля, удаление</p>
        </div>
      </header>

      <div className="card list">
        <h4>Список пользователей</h4>
        {users.length === 0 && <p className="muted">Пользователей нет</p>}
        {users.map((u) => (
          <div key={u.id} className="list-row">
            <div>
              <div className="list-title">{u.name}</div>
              <div className="muted small">{u.email}</div>
              <div className="small">Роль: {u.role}</div>
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


