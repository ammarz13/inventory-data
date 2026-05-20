import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    sidebarOpen: true,
    sidebarMobileOpen: false,
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
      document.documentElement.classList.toggle('dark', state.theme === 'dark')
    },
    setTheme(state, action) {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
      document.documentElement.classList.toggle('dark', action.payload === 'dark')
    },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebarMobile(state, action) { state.sidebarMobileOpen = action.payload },
  },
})

export const { toggleTheme, setTheme, toggleSidebar, setSidebarMobile } = uiSlice.actions
export const selectTheme = (state) => state.ui.theme
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectSidebarMobileOpen = (state) => state.ui.sidebarMobileOpen
export default uiSlice.reducer
