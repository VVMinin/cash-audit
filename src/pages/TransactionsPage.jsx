import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
import AccountsSummary from '../components/accounts/AccountsSummary'
import { deleteTransaction, fetchTransactions } from '../features/transactions/transactionsSlice'
import { fetchAccounts } from '../features/accounts/accountsSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

const TransactionsPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { items, status, error, page, pages } = useSelector((s) => s.transactions)
  const { items: accounts } = useSelector((s) => s.accounts)
  const { items: categories } = useSelector((s) => s.categories)

  const [filters, setFilters] = useState({
    account: searchParams.get('account') || '',
    category: searchParams.get('category') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
  })

  useEffect(() => {
    dispatch(fetchAccounts())
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const params = { ...filters }
    setSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
    )
    dispatch(fetchTransactions(params))
  }, [filters, dispatch, setSearchParams])

  const handlePageChange = (newPage) => {
    setFilters((f) => ({ ...f, page: newPage }))
  }

  const loading = status === 'loading'

  return (
    <div className="page transactions-layout">
      <div className="transactions-sidebar">
        <AccountsSummary refreshTrigger={status} />
      </div>
      <div className="transactions-main">
        <header className="page-header">
          <div>
          <h2>Операции</h2>
          <p className="muted">История доходов и расходов с фильтрами и пагинацией</p>
          </div>
        <Button onClick={() => navigate('/transactions/new')}>+ Добавить</Button>
        </header>

        <div className="card">
          <div className="grid">
            <Select
              label="Счет"
              value={filters.account}
              onChange={(e) => setFilters((f) => ({ ...f, account: e.target.value, page: 1 }))}
              required={false}
              options={[{ value: '', label: 'Все счета' }, ...accounts.map((a) => ({ value: a._id, label: a.name }))]}
            />
            <Select
              label="Категория"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
              required={false}
              options={[{ value: '', label: 'Все категории' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
            />
            <Input
              label="Дата c"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, page: 1 }))}
              required={false}
            />
            <Input
              label="Дата по"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, page: 1 }))}
              required={false}
            />
            <Input
              label="Размер страницы"
              type="number"
              value={filters.limit}
              onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value) || 10, page: 1 }))}
              required={true}
            />
          </div>
          {loading && <Loader />}
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="card list">
          {items.length === 0 && <p className="muted">Нет операций</p>}
          {items.map((tx) => (
            <div key={tx._id} className="list-row">
              <div>
                <div className="list-title">{tx.category?.name || '—'}</div>
                <div className="muted small">
                  {tx.account?.name || '—'} • {tx.type} • {new Date(tx.date).toLocaleDateString()}
                </div>
                {tx.comment && <div className="small">{tx.comment}</div>}
                <div className="muted small">
                  Было: {tx.balanceBefore} → Стало: {tx.balanceAfter}
                </div>
              </div>
              <div className="list-actions">
                <div style={{ fontWeight: 700 }}>
                  {tx.type === 'expense' ? '-' : '+'}
                  {tx.amount}
                </div>
                <Button onClick={() => navigate(`/transactions/${tx._id}/edit`)}>Редактировать</Button>
                <Button
                  onClick={() =>
                    dispatch(deleteTransaction(tx._id)).then((res) => {
                      if (res.meta.requestStatus === 'fulfilled') {
                        dispatch(fetchTransactions(filters))
                        dispatch(fetchAccounts())
                      }
                    })
                  }
                  disabled={loading}
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>

        {pages > 1 && (
          <div className="card" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button disabled={filters.page <= 1} onClick={() => handlePageChange(filters.page - 1)}>
              Назад
            </Button>
            <span className="muted">
              Стр. {page} / {pages}
            </span>
            <Button
              disabled={filters.page >= pages}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Вперед
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage

