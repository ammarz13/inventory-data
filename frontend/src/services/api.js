import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('invenpro_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('invenpro_token')
      localStorage.removeItem('invenpro_user')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export default api

// Resource factories
export const makeResource = (endpoint) => ({
  list:   (params) => api.get(endpoint, { params }),
  show:   (id)     => api.get(`${endpoint}/${id}`),
  create: (data)   => api.post(endpoint, data),
  update: (id, data) => api.put(`${endpoint}/${id}`, data),
  remove: (id)     => api.delete(`${endpoint}/${id}`),
})

export const resources = {
  machines:     makeResource('/machines'),
  machineParts: makeResource('/machine-parts'),
  categories:   makeResource('/categories'),
  suppliers:    makeResource('/suppliers'),
  parties:      makeResource('/parties'),
  cashflows:    makeResource('/cashflows'),
  products:     makeResource('/products'),
  retailSales:  makeResource('/retail-sales'),
  purchases:    makeResource('/purchases'),
  employees:    makeResource('/employees'),
  salaries:     makeResource('/salaries'),
  attendance:   makeResource('/attendance'),
  invoices:     makeResource('/invoices'),
  expenses:     makeResource('/expenses'),
  users:        makeResource('/users'),
}
