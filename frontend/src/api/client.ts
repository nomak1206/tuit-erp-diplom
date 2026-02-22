import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// JWT request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Global response error handler
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status
        const detail = error.response?.data?.detail

        if (status === 401) {
            // Token expired — try to refresh automatically
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken && !error.config._retry) {
                error.config._retry = true
                try {
                    const res = await axios.post('/api/auth/refresh', { refresh_token: refreshToken })
                    const { access_token } = res.data
                    localStorage.setItem('access_token', access_token)
                    error.config.headers.Authorization = `Bearer ${access_token}`
                    return api(error.config)
                } catch {
                    // Refresh failed — clear tokens and redirect to login
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/login'
                }
            } else {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
            }
        } else if (status === 403) {
            message.error('Недостаточно прав для этого действия')
        } else if (status === 404) {
            // Silently ignored — component handles empty state
        } else if (status === 422) {
            const msg = detail?.[0]?.msg || 'Ошибка валидации данных'
            message.error(msg)
        } else if (status >= 500) {
            message.error('Ошибка сервера. Попробуйте позже.')
        }

        return Promise.reject(error)
    }
)

export default api
