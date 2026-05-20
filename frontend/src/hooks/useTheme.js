import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme, selectTheme } from '../store/uiSlice'

export function useTheme() {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme, toggleTheme: () => dispatch(toggleTheme()), isDark: theme === 'dark' }
}
