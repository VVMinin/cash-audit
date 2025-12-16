import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../Loader'
import { fetchAccounts } from '../../features/accounts/accountsSlice'
import './AccountsSummary.css'

// Боковая панель с текущими балансами счетов
const AccountsSummary = ({ refreshTrigger }) => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((s) => s.accounts)

  useEffect(() => {
    dispatch(fetchAccounts())
  }, [dispatch, refreshTrigger])

  const total = items.reduce((sum, acc) => sum + (acc.balance || 0), 0)

  return (
    <div className="accounts-summary">
      <h4>Счета</h4>
      {status === 'loading' && <Loader />}
      {error && <p className="error-text">{error}</p>}
      <div className="accounts-summary-list">
        {items.map((acc) => (
          <div key={acc._id} className="accounts-summary-item">
            <div className="accounts-summary-name">{acc.name}</div>
            <div className="accounts-summary-balance">{acc.balance}</div>
          </div>
        ))}
        {items.length === 0 && <p className="muted">Нет счетов</p>}
      </div>
      <div className="accounts-summary-total">
        <span>Итого:</span>
        <strong>{total}</strong>
      </div>
    </div>
  )
}

export default AccountsSummary

