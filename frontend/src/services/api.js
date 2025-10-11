import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// Request queue for rate limiting
const requestQueue = new Map()
const MAX_RETRIES = 3
const BASE_DELAY = 1000 // 1 second

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

// Helper function for exponential backoff
const getRetryDelay = (retryCount) => {
  return Math.min(BASE_DELAY * Math.pow(2, retryCount), 10000) // Max 10 seconds
}

// Helper to generate request key for deduplication
const getRequestKey = (config) => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`
}

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Initialize retry count
  config._retryCount = config._retryCount || 0
  
  return config
})

// Handle errors with retry logic for 429
api.interceptors.response.use(
  (response) => {
    // Clear successful request from queue
    const requestKey = getRequestKey(response.config)
    requestQueue.delete(requestKey)
    return response
  },
  async (error) => {
    const config = error.config
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      if (!window.location.pathname.includes('/admin')) {
        window.location.href = '/admin'
      }
      return Promise.reject(error)
    }
    
    // Handle 429 Too Many Requests with exponential backoff
    if (error.response?.status === 429) {
      const retryCount = config._retryCount || 0
      
      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1
        const delay = getRetryDelay(retryCount)
        
        console.warn(`⚠️ Rate limited (429). Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Retry the request
        return api(config)
      } else {
        console.error('❌ Max retries reached for rate-limited request')
        // Create a user-friendly error
        const rateLimitError = new Error('Server is busy. Please wait a moment and try again.')
        rateLimitError.isRateLimit = true
        return Promise.reject(rateLimitError)
      }
    }
    
    // Handle network errors gracefully
    if (!error.response) {
      console.error('❌ Network error:', error.message)
      const networkError = new Error('Network error. Please check your connection.')
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    }
    
    return Promise.reject(error)
  }
)

// Wrapper to prevent duplicate simultaneous requests
const createThrottledAPI = (apiMethod) => {
  return async (...args) => {
    // Generate unique key for this request
    const requestKey = `${apiMethod.name}-${JSON.stringify(args)}`
    
    // If same request is already in flight, return existing promise
    if (requestQueue.has(requestKey)) {
      console.log('⏳ Request already in progress, reusing...')
      return requestQueue.get(requestKey)
    }
    
    // Create new request promise
    const requestPromise = apiMethod(...args)
      .finally(() => {
        // Remove from queue after completion
        requestQueue.delete(requestKey)
      })
    
    // Store in queue
    requestQueue.set(requestKey, requestPromise)
    
    return requestPromise
  }
}

// Raw API methods
const _postsAPI = {
  getPosts: (params = {}) => api.get('/posts', { params }),
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPost: (id) => api.get(`/posts/${id}`)
}

const _adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPosts: (params = {}) => api.get('/admin/posts', { params }),
  approvePost: (id) => api.patch(`/admin/posts/${id}/approve`),
  rejectPost: (id) => api.patch(`/admin/posts/${id}/reject`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  getReports: () => api.get('/admin/reports')
}

// Exported APIs (with throttling for GET requests)
export const authAPI = {
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  setupAdmin: () => api.post('/auth/admin/setup')
}

export const postsAPI = {
  getPosts: createThrottledAPI(_postsAPI.getPosts),
  createPost: _postsAPI.createPost, // Don't throttle POST requests
  getPost: createThrottledAPI(_postsAPI.getPost)
}

export const reactionsAPI = {
  addReaction: (postId, type) => api.post(`/reactions/${postId}`, { type }),
  removeReaction: (postId) => api.delete(`/reactions/${postId}`),
  getReactions: createThrottledAPI((postId) => api.get(`/reactions/${postId}`)),
  reportPost: (postId, reason) => api.post(`/reactions/${postId}/report`, { reason })
}

export const adminAPI = {
  getDashboard: createThrottledAPI(_adminAPI.getDashboard),
  getPosts: createThrottledAPI(_adminAPI.getPosts),
  approvePost: _adminAPI.approvePost, // Don't throttle mutations
  rejectPost: _adminAPI.rejectPost,
  deletePost: _adminAPI.deletePost,
  getReports: createThrottledAPI(_adminAPI.getReports)
}

export default api