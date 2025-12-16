import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

// Token хранится в localStorage ради простоты дипломного проекта.
// В продакшене предпочтительнее httpOnly cookie.
const tokenFromStorage = localStorage.getItem('token')
const userFromStorage = localStorage.getItem('user')

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage || null,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null,
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', { name, email, password })
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No token')
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || 'Fetch user failed'
      return rejectWithValue(message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No token')
    try {
      const res = await api.put(
        '/users/me',
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || 'Update failed'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    setCredentials(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
        state.user = null
        state.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .addCase(updateProfile.pending, (state) => {
        state.updateStatus = 'loading'
        state.updateError = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        state.user = action.payload.user
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.updateError = action.payload
      })
  },
})

export const { logout, setCredentials } = authSlice.actions
export default authSlice.reducer


