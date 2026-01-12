import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import {
  createAccount,
  deleteAccount,
  fetchAccounts,
  updateAccount,
} from '../features/accounts/accountsSlice'

const initialForm = { name: '', type: '', balance: 0, comment: '' }

const AccountsPage = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.accounts)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    dispatch(fetchAccounts())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.type) return
    // Баланс счета не может быть отрицательным
    if (Number(form.balance) < 0) {
      alert('Баланс не может быть отрицательным')
      return
    }
    try {
      if (editingId) {
        await dispatch(updateAccount({ id: editingId, ...form, balance: Number(form.balance) })).unwrap()
      } else {
        await dispatch(createAccount({ ...form, balance: Number(form.balance) })).unwrap()
      }
      setForm(initialForm)
      setEditingId(null)
    } catch (err) {
      console.error('Failed to submit account form:', err)
    }
  }

  const handleEdit = (acc) => {
    setEditingId(acc.id)
    setForm({
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      comment: acc.comment || '',
    })
  }

  const loading = status === 'loading'

  const totalBalance = useMemo(
    () => items.reduce((sum, acc) => sum + (acc.balance || 0), 0),
    [items]
  )

  const accountTypeOptions = useMemo(
    () => [
      { value: 'debit', label: 'Debit / Card' },
      { value: 'cash', label: 'Cash' },
      { value: 'deposit', label: 'Deposit' },
      { value: 'other', label: 'Other' },
    ],
    []
  )

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Accounts</h2>
          <p className="muted">Добавление, редактирование, удаление счетов</p>
        </div>
      </header>

      <div className="card">
        <form className="grid" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Напр. Основная карта"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={accountTypeOptions}
          />
          <Input
            label="Начальный баланс"
            type="number"
            min="0"
            step="1"
            value={form.balance}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === '') {
                setForm((f) => ({ ...f, balance: '' }))
                return
              }
              const value = Number(raw)
              if (value < 0) return
              setForm((f) => ({ ...f, balance: value }))
            }}
            placeholder="0"
          />
          <Input
            label="Комментарий"
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            required={false}
            placeholder="Опционально"
          />
          <Button type="submit" disabled={loading}>
            {editingId ? 'Save' : 'Add'}
          </Button>
        </form>
        {loading && <Loader />}
        {error && <p className="error-text">{error}</p>}
        <p className="muted">Итого по всем счетам: {totalBalance}</p>
      </div>

      <div className="card list">
        {items.length === 0 && <p className="muted">Пока нет счетов</p>}
        {items.map((acc) => (
          <div key={acc.id} className="list-row">
            <div>
              <div className="list-title">{acc.name}</div>
              <div className="muted small">Type: {acc.type}</div>
              <div className="small">Balance: {acc.balance}</div>
              {acc.comment && <div className="small">{acc.comment}</div>}
            </div>
            <div className="list-actions">
              <Button onClick={() => handleEdit(acc)}>Edit</Button>
              <Button onClick={() => dispatch(deleteAccount(acc.id))} disabled={loading}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AccountsPage

