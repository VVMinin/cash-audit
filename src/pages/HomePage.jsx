import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { logout } from '../features/auth/authSlice'
import { fetchTransactions } from '../features/transactions/transactionsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'
import FinanceChart from '../components/analytics/FinanceChart'
import SummaryCard from '../components/analytics/SummaryCard'

const HomePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items: transactions, status, error } = useSelector((state) => state.transactions)
  const { items: categories } = useSelector((state) => state.categories)

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    type: 'all',
  })

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      limit: 1000,
      page: 1,
    }
    if (filters.dateFrom) params.dateFrom = filters.dateFrom
    if (filters.dateTo) params.dateTo = filters.dateTo
    if (filters.category) params.category = filters.category
    if (filters.type !== 'all') params.type = filters.type
    dispatch(fetchTransactions(params))
  }, [dispatch, filters.dateFrom, filters.dateTo, filters.category, filters.type])

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filters.dateFrom && new Date(t.date) < new Date(filters.dateFrom)) return false
        if (filters.dateTo && new Date(t.date) > new Date(filters.dateTo)) return false
        if (filters.category && t.category?._id !== filters.category) return false
        if (filters.type !== 'all' && t.type !== filters.type) return false
        return true
      })
      .filter(Boolean)
  }, [transactions, filters])

  const income = useMemo(
    () => filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
    [filtered]
  )
  const expense = useMemo(
    () => filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
    [filtered]
  )

  const loading = status === 'loading'

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Добро пожаловать{user?.name ? `, ${user.name}` : ''}</h2>
        </div>
      </header>
      <div className="card">
        <p>Здесь аналитика и ссылки на разделы.</p>
        <div className="links">
          <Link to="/accounts">Перейти к счетам</Link> ·{' '}
          <Link to="/categories">Категории</Link> ·{' '}
          <Link to="/transactions">Операции</Link>
        </div>

        <div className="grid" style={{ marginTop: 16 }}>
          <div className="grid">
            <label className="input-label">Дата с</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            />
          </div>
          <div className="grid">
            <label className="input-label">Дата по</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            />
          </div>
          <div className="grid">
            <label className="input-label">Категория</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid">
            <label className="input-label">Тип</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="all">Все</option>
              <option value="income">Только доходы</option>
              <option value="expense">Только расходы</option>
            </select>
          </div>
        </div>

        <div className="summary-grid" style={{ marginTop: 16 }}>
          <SummaryCard title="Доходы" value={income} color="#22c55e" />
          <SummaryCard title="Расходы" value={expense} color="#ef4444" />
        </div>
        {loading && <Loader />}
        {error && <p className="error-text">{error}</p>}
        <div style={{ maxWidth: 420, marginTop: 16 }}>
          <FinanceChart income={income} expense={expense} />
        </div>
      </div>
    </div>
  )
}

export default HomePage


