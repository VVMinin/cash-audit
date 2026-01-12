import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Loader from '../components/Loader'
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

  const params = useMemo(
    () => ({
      account: filters.account,
      category: filters.category,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page: filters.page,
      limit: filters.limit,
    }),
    [filters.account, filters.category, filters.dateFrom, filters.dateTo, filters.page, filters.limit]
  )

  useEffect(() => {
    dispatch(fetchAccounts())
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    setSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
    )
    dispatch(fetchTransactions(params))
  }, [params, dispatch])

  const handlePageChange = (newPage) => {
    setFilters((f) => ({ ...f, page: newPage }))
  }

  const loading = status === 'loading'

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Transactions</h2>
          <p className="muted">История доходов и расходов с фильтрами и пагинацией</p>
        </div>
        <Button onClick={() => navigate('/transactions/new')}>+ New</Button>
      </header>

      <div className="card">
        <div className="grid">
          <Select
            label="Account"
            value={filters.account}
            onChange={(e) => setFilters((f) => ({ ...f, account: e.target.value, page: 1 }))}
            required={false}
            options={[{ value: '', label: 'All accounts' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
          />
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}
            required={false}
            options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Input
            label="Date from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, page: 1 }))}
            required={false}
          />
          <Input
            label="Date to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, page: 1 }))}
            required={false}
          />
          <Input
            label="Page size"
            type="number"
            min="0"
            step="1"
            value={filters.limit}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === '') {
                setFilters((f) => ({ ...f, limit: '', page: 1 }))
                return
              }
              const value = Number(raw)
              if (value < 0) return
              setFilters((f) => ({ ...f, limit: value || 10, page: 1 }))
            }}
            required={true}
          />
        </div>
        {loading && <Loader />}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card list">
        {items.length === 0 && <p className="muted">Нет операций</p>}
        {items.map((tx) => (
          <div key={tx.id} className="list-row">
            <div>
              <div className="list-title">{tx.category?.name || '—'}</div>
              <div className="muted small">
                {tx.account?.name || '—'} • {tx.type} • {new Date(tx.date).toLocaleDateString()}
              </div>
              {tx.comment && <div className="small">{tx.comment}</div>}
            </div>
            <div className="list-actions">
              <div style={{ fontWeight: 700 }}>
                {tx.type === 'expense' ? '-' : '+'}
                {tx.amount}
              </div>
              <Button onClick={() => navigate(`/transactions/${tx.id}/edit`)}>Edit</Button>
              <Button onClick={() => dispatch(deleteTransaction(tx.id))} disabled={loading}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="card" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button disabled={filters.page <= 1} onClick={() => handlePageChange(filters.page - 1)}>
            Prev
          </Button>
          <span className="muted">
            Page {page} / {pages}
          </span>
          <Button
            disabled={filters.page >= pages}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default TransactionsPage

