import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import { logout } from '../features/auth/authSlice'
import { fetchTransactions } from '../features/transactions/transactionsSlice'
import FinanceChart from '../components/analytics/FinanceChart'
import SummaryCard from '../components/analytics/SummaryCard'

const HomePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { summary, status, error } = useSelector((state) => state.transactions)

  useEffect(() => {
    dispatch(fetchTransactions({ limit: 20, page: 1 }))
  }, [dispatch])

  const income = summary?.income || 0
  const expense = summary?.expense || 0
  const loading = status === 'loading'

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Добро пожаловать{user?.name ? `, ${user.name}` : ''}</h2>
          <p className="muted">Главная (доступна только авторизованным)</p>
        </div>
        <Button onClick={() => dispatch(logout())}>Выйти</Button>
      </header>
      <div className="card">
        <p>Аналитика и ссылки на разделы.</p>
        <div className="links">
          <Link to="/accounts">Счета</Link> · <Link to="/categories">Категории</Link> ·{' '}
          <Link to="/transactions">Операции</Link>
        </div>
        <div className="summary-grid">
          <SummaryCard title="Доходы" value={income} color="#22c55e" />
          <SummaryCard title="Расходы" value={expense} color="#ef4444" />
        </div>
        {loading && <Loader />}
        {error && <p className="error-text">{error}</p>}
        <div className="analytics-chart-wrapper">
          <div className="analytics-chart">
            <FinanceChart income={income} expense={expense} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage


