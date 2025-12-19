import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const tokenFromStorage = (() => {
  const raw = localStorage.getItem('token')
  return raw && raw !== 'undefined' ? raw : null
})()
const userFromStorage = getStoredUser()

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null,
  changePasswordStatus: 'idle',
  changePasswordError: null,
  changePasswordMessage: null,
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', { name, email, password })
      
      if (!res.data || !res.data.token || !res.data.user) {
        console.error('Некорректный ответ сервера:', res.data)
        return rejectWithValue('Некорректный ответ сервера при регистрации')
      }
      
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Ошибка регистрации'
      console.error('Ошибка регистрации:', err)
      return rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      
      if (!res.data || !res.data.token || !res.data.user) {
        console.error('Некорректный ответ сервера:', res.data)
        return rejectWithValue('Некорректный ответ сервера при входе')
      }
      
      return res.data
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Ошибка входа'
      console.error('Ошибка входа:', err)
      return rejectWithValue(message)
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.patch('/users/change-password', { currentPassword, newPassword })
      if (!res.data || !res.data.message) {
        console.error('Некорректный ответ сервера при смене пароля:', res.data)
        return rejectWithValue('Некорректный ответ сервера при смене пароля')
      }
      return res.data.message
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Ошибка смены пароля'
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
        if (action.payload && action.payload.token && action.payload.user) {
          state.status = 'succeeded'
          state.user = action.payload.user
          state.token = action.payload.token
          state.error = null
          localStorage.setItem('token', action.payload.token)
          localStorage.setItem('user', JSON.stringify(action.payload.user))
        } else {
          state.status = 'failed'
          state.error = 'Некорректный ответ сервера'
        }
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
        if (action.payload && action.payload.token && action.payload.user) {
          state.status = 'succeeded'
          state.user = action.payload.user
          state.token = action.payload.token
          state.error = null
          localStorage.setItem('token', action.payload.token)
          localStorage.setItem('user', JSON.stringify(action.payload.user))
        } else {
          state.status = 'failed'
          state.error = 'Некорректный ответ сервера'
        }
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
      .addCase(changePassword.pending, (state) => {
        state.changePasswordStatus = 'loading'
        state.changePasswordError = null
        state.changePasswordMessage = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changePasswordStatus = 'succeeded'
        state.changePasswordMessage = action.payload || 'Пароль успешно изменён'
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordStatus = 'failed'
        state.changePasswordError = action.payload
      })
  },
})

export const { logout, setCredentials } = authSlice.actions
export default authSlice.reducer


