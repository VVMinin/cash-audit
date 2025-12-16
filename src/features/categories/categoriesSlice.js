import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/categories')
      return res.data.categories
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to load categories'
      return rejectWithValue(message)
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ name, type, comment }, { rejectWithValue }) => {
    try {
      const res = await api.post('/categories', {
        name,
        // Значения type должны совпадать с enum в backend
        type: (type || '').toLowerCase(),
        comment,
      })
      return res.data.category
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create category'
      return rejectWithValue(message)
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, name, type, comment }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, {
        name,
        // Значения type должны совпадать с enum в backend
        type: (type || '').toLowerCase(),
        comment,
      })
      return res.data.category
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update category'
      return rejectWithValue(message)
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`)
      return id
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to delete category'
      return rejectWithValue(message)
    }
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.items = state.items.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        )
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((cat) => cat._id !== action.payload)
      })
  },
})

export default categoriesSlice.reducer

