import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import accountsReducer from '../features/accounts/accountsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import transactionsReducer from '../features/transactions/transactionsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    categories: categoriesReducer,
    transactions: transactionsReducer,
  },
})

export default store


