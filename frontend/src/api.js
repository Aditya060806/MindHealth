import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

// Auto-attach JWT token if it exists (harmless when absent)
API.interceptors.request.use(config => {
    const token = localStorage.getItem('mindcare_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Graceful error handling — no forced login redirect
API.interceptors.response.use(
    res => res,
    err => {
        // Silently handle auth errors — don't redirect to login
        if (err.response?.status === 401) {
            console.warn('API returned 401 — operating without authentication.')
        }
        return Promise.reject(err)
    }
)

export default API
