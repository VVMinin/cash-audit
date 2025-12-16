import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionFormPage from './pages/TransactionFormPage'
import SettingsPage from './pages/SettingsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ProtectedLayout from './components/layout/ProtectedLayout'
import { fetchMe } from './features/auth/authSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) {
      dispatch(fetchMe())
    }
  }, [token, dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/new" element={<TransactionFormPage />} />
          <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
