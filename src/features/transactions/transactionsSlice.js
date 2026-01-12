import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const normalizeEntity = (obj) => {
  if (!obj) return obj
  const id = obj.id || obj._id
  const { _id, ...rest } = obj
  return { ...rest, id }
}

const normalizeTransaction = (tx) => {
  if (!tx) return tx
  const id = tx.id || tx._id
  const { _id, ...rest } = tx
  return {
    ...rest,
    id,
    account: normalizeEntity(tx.account),
    category: normalizeEntity(tx.category),
  }
}

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  summary: { income: 0, expense: 0, byCategory: [] },
  status: 'idle',
  error: null,
  current: null,
}

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/transactions', { params })
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to load transactions'
      return rejectWithValue(message)
    }
  }
)

export const fetchTransaction = createAsyncThunk(
  'transactions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/transactions/${id}`)
      return res.data.transaction
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to load transaction'
      return rejectWithValue(message)
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/transactions', payload)
      return res.data.transaction
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create transaction'
      return rejectWithValue(message)
    }
  }
)

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/transactions/${id}`, payload)
      return res.data.transaction
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update transaction'
      return rejectWithValue(message)
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transactions/${id}`)
      return id
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to delete transaction'
      return rejectWithValue(message)
    }
  }
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = (action.payload.transactions || []).map(normalizeTransaction)
        state.total = action.payload.total
        state.page = action.payload.page
        state.pages = action.payload.pages
        state.summary = action.payload.summary || initialState.summary
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.current = normalizeTransaction(action.payload)
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        const tx = normalizeTransaction(action.payload)
        state.items.unshift(tx)
        state.total += 1
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const tx = normalizeTransaction(action.payload)
        state.items = state.items.map((item) => (item.id === tx.id ? tx : item))
        state.current = tx
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((tx) => tx.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})

export const { clearCurrent } = transactionsSlice.actions
export default transactionsSlice.reducer


