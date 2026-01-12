import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const normalizeCategory = (cat) => {
  if (!cat) return cat
  const id = cat.id || cat._id
  const { _id, ...rest } = cat
  return { ...rest, id }
}

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
      const res = await api.post('/categories', { name, type, comment })
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
      const res = await api.put(`/categories/${id}`, { name, type, comment })
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
        state.items = action.payload.map(normalizeCategory)
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.unshift(normalizeCategory(action.payload))
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updated = normalizeCategory(action.payload)
        state.items = state.items.map((cat) => (cat.id === updated.id ? updated : cat))
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((cat) => cat.id !== action.payload)
      })
  },
})

export default categoriesSlice.reducer

