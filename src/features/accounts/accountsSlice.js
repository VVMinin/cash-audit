import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const normalizeAccount = (acc) => {
  if (!acc) return acc
  const id = acc.id || acc._id
  const { _id, ...rest } = acc
  return { ...rest, id }
}

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/accounts')
    return res.data.accounts
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to load accounts'
    return rejectWithValue(message)
  }
})

export const createAccount = createAsyncThunk(
  'accounts/create',
  async ({ name, type, balance, comment }, { rejectWithValue }) => {
    try {
      const res = await api.post('/accounts', { name, type, balance, comment })
      return res.data.account
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create account'
      return rejectWithValue(message)
    }
  }
)

export const updateAccount = createAsyncThunk(
  'accounts/update',
  async ({ id, name, type, balance, comment }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/accounts/${id}`, { name, type, balance, comment })
      return res.data.account
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update account'
      return rejectWithValue(message)
    }
  }
)

export const deleteAccount = createAsyncThunk('accounts/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/accounts/${id}`)
    return id
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to delete account'
    return rejectWithValue(message)
  }
})

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.map(normalizeAccount)
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createAccount.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(normalizeAccount(action.payload))
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateAccount.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updated = normalizeAccount(action.payload)
        state.items = state.items.map((acc) => (acc.id === updated.id ? updated : acc))
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.items = state.items.filter((acc) => acc.id !== action.payload)
      })
  },
})

export default accountsSlice.reducer

