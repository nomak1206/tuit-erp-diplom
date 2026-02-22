import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
})

// JWT request interceptor
api.interceptors.request.use((config) => {
    // We strictly use HttpOnly cookies now, so no Authorization header is needed.
    return config
})

// Global response error handler
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status
        const detail = error.response?.data?.detail
        const originalRequest = error.config

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                await axios.post('/api/auth/refresh', {}, { withCredentials: true })
                return api(originalRequest)
            } catch {
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }
        } else if (status === 401) {
            if (window.location.pathname !== '/login') {
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
