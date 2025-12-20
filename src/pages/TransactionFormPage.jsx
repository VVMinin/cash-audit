import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import {
  createTransaction,
  fetchTransaction,
  updateTransaction,
  clearCurrent,
  fetchTransactions,
} from '../features/transactions/transactionsSlice'
import { fetchAccounts } from '../features/accounts/accountsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

const initialForm = {
  account: '',
  category: '',
  amount: '',
  comment: '',
  date: '',
}

const TransactionFormPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()

  const { current, status, error } = useSelector((s) => s.transactions)
  const { items: accounts } = useSelector((s) => s.accounts)
  const { items: categories } = useSelector((s) => s.categories)

  const [form, setForm] = useState(initialForm)

  const isEdit = Boolean(id)
  const loading = status === 'loading'

  useEffect(() => {
    dispatch(fetchAccounts())
    dispatch(fetchCategories())
    if (isEdit) {
      dispatch(fetchTransaction(id))
    } else {
      dispatch(clearCurrent())
    }
    return () => dispatch(clearCurrent())
  }, [dispatch, id, isEdit])

  useEffect(() => {
    if (current && isEdit) {
      setForm({
        account: current.account?._id || '',
        category: current.category?._id || '',
        amount: current.amount,
        comment: current.comment || '',
        date: current.date ? current.date.slice(0, 10) : '',
      })
    }
  }, [current, isEdit])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.account || !form.category || !form.amount || !form.date) return
    if (Number(form.amount) < 0) return
    if (isEdit) {
      dispatch(updateTransaction({ id, ...form })).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          dispatch(fetchTransactions({ limit: 20, page: 1 }))
          navigate('/transactions')
        }
      })
    } else {
      dispatch(createTransaction(form)).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          dispatch(fetchTransactions({ limit: 20, page: 1 }))
          navigate('/transactions')
        }
      })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>{isEdit ? 'Edit transaction' : 'New transaction'}</h2>
          <p className="muted">Доход или расход с выбором счета и категории</p>
        </div>
      </header>

      <div className="card">
        <form className="grid" onSubmit={handleSubmit}>
          <Select
            label="Account"
            value={form.account}
            onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
            options={[
              { value: '', label: 'Select account', disabled: true },
              ...accounts.map((a) => ({ value: a._id, label: a.name })),
            ]}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={[
              { value: '', label: 'Select category', disabled: true },
              ...categories.map((c) => ({ value: c._id, label: `${c.name} (${c.type})` })),
            ]}
          />
          <Input
            label="Amount"
            type="number"
            min="0"
            step="1"
            value={form.amount}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === '') {
                setForm((f) => ({ ...f, amount: '' }))
                return
              }
              const value = Number(raw)
              if (value < 0) return
              setForm((f) => ({ ...f, amount: value }))
            }}
            placeholder="0"
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="Comment (optional)"
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            required={false}
          />
          <Button type="submit" disabled={loading}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </form>
        {loading && <Loader />}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}

export default TransactionFormPage

