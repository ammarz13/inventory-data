import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'
import toast from 'react-hot-toast'

const TOKEN_KEY = 'invenpro_token'
const USER_KEY = 'invenpro_user'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem(TOKEN_KEY, data.data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user))
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout')
  } catch {
    // fail silently
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
})

export const forgotPassword = createAsyncThunk('auth/forgot', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data.message
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Request failed')
  }
})

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: localStorage.getItem(TOKEN_KEY) || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null },
    setUser(state, action) { state.user = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        toast.success(`Welcome back, ${action.payload.user.name}!`)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        toast.success('Logged out successfully')
      })
      .addCase(forgotPassword.pending, (state) => { state.loading = true })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false
        toast.success(action.payload)
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        toast.error(action.payload)
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export const selectIsAuthenticated = (state) => !!state.auth.token
export const selectUser = (state) => state.auth.user
export const selectAuthLoading = (state) => state.auth.loading
export default authSlice.reducer
