import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.eventQueue = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5 // Reduced from 10
    this.connectionPromise = null
    this.isConnecting = false
    this.lastConnectAttempt = 0
    this.minConnectInterval = 3000 // Increased from 2000ms to 3000ms
    this.isRateLimited = false
    this.rateLimitBackoff = 5000 // Initial backoff for rate limiting
  }

  connect(token) {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      console.log('Connection already in progress, waiting...')
      return this.connectionPromise
    }

    // Return resolved promise if already connected
    if (this.socket?.connected) {
      console.log('✅ Socket already connected, reusing connection')
      return Promise.resolve(this.socket)
    }

    // If rate limited, check if we should wait longer
    const now = Date.now()
    const timeSinceLastAttempt = now - this.lastConnectAttempt
    const requiredInterval = this.isRateLimited 
      ? Math.min(this.rateLimitBackoff, 30000) // Max 30 seconds
      : this.minConnectInterval

    if (this.lastConnectAttempt && timeSinceLastAttempt < requiredInterval) {
      const waitTime = requiredInterval - timeSinceLastAttempt
      console.warn(`⚠️ Throttling connection attempt. Wait ${Math.ceil(waitTime / 1000)}s more...`)
      return Promise.resolve(null)
    }
    
    this.lastConnectAttempt = now
    this.isConnecting = true
    
    this.connectionPromise = new Promise((resolve) => {
      const authToken = token || this.getStoredToken()
      if (!authToken) {
        console.error('❌ No JWT token available')
        this.connectionPromise = null
        this.isConnecting = false
        return resolve(null)
      }

      // Clean up existing socket before creating new one
      if (this.socket) {
        console.log('🧹 Cleaning up old socket connection')
        this.socket.removeAllListeners()
        this.socket.disconnect()
        this.socket = null
      }

      this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:10000', {
        auth: { token: authToken },
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        autoConnect: false,
        forceNew: false,
        timeout: 20000
      })

      this.setupEventHandlers()

      // Connect immediately
      this.socket.connect()
      
      // Resolve promise on successful connection
      const connectHandler = () => {
        console.log('✅ Socket connected successfully')
        this.connectionPromise = null
        this.isConnecting = false
        resolve(this.socket)
      }

      const errorHandler = (error) => {
        console.error('❌ Connection error:', error.message)
        this.connectionPromise = null
        this.isConnecting = false
        resolve(null)
      }

      this.socket.once('connect', connectHandler)
      this.socket.once('connect_error', errorHandler)
      
      // Timeout fallback
      setTimeout(() => {
        if (this.isConnecting) {
          console.warn('⏱️ Connection attempt timed out')
          this.socket.off('connect', connectHandler)
          this.socket.off('connect_error', errorHandler)
          this.connectionPromise = null
          this.isConnecting = false
          resolve(this.socket)
        }
      }, 10000)
    })

    return this.connectionPromise
  }

  setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
      this.isRateLimited = false
      this.rateLimitBackoff = 5000 // Reset backoff on successful connection
      this.processQueue()
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Disconnected from server:', reason)
      this.isConnected = false

      // Don't auto-reconnect on manual disconnect or page refresh
      if (reason === 'io client disconnect') {
        return
      }

      // Backend initiated disconnect - wait before reconnecting
      if (reason === 'io server disconnect') {
        const newToken = this.getStoredToken()
        if (newToken) {
          setTimeout(() => {
            console.log('🔄 Reconnecting after server disconnect...')
            this.socket.auth.token = newToken
            this.socket.connect()
          }, 1500)
        }
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message)
      this.reconnectAttempts++

      // Detect rate limiting
      if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('too many')) {
        this.isRateLimited = true
        this.rateLimitBackoff *= 2 // Exponential backoff
        console.warn(`⚠️ Rate limited! Backing off for ${this.rateLimitBackoff / 1000}s`)
      }

      if (error.message.includes('auth') || error.message.includes('token')) {
        const newToken = this.getStoredToken()
        if (newToken && this.socket) {
          this.socket.auth.token = newToken
        }
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached. Stopping reconnection.')
        this.disconnect()
      }
    })

    this.socket.on('token_expired', () => {
      console.warn('Token expired, attempting refresh...')
      this.handleTokenExpired()
    })
  }

  getStoredToken() {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token')
  }

  async handleTokenExpired() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:10000'}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        const newToken = data.token
        localStorage.setItem('jwt_token', newToken)
        this.updateToken(newToken)

        this.disconnect()
        setTimeout(() => this.connect(newToken), 1000)
      } else {
        this.disconnect()
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.disconnect()
      window.location.href = '/login'
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventQueue = []
      this.reconnectAttempts = 0
      this.connectionPromise = null
      this.isConnecting = false
    }
  }

  async waitForConnection(timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (this.isConnected) return resolve()
      if (!this.socket) return reject(new Error('Socket not initialized'))

      const timer = setTimeout(() => {
        this.socket.off('connect', connectHandler)
        reject(new Error('Connection timeout'))
      }, timeout)

      const connectHandler = () => {
        clearTimeout(timer)
        this.socket.off('connect', connectHandler)
        resolve()
      }

      this.socket.once('connect', connectHandler)
    })
  }

  processQueue() {
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift()
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    } else {
      console.warn('Tried to bind event before socket initialized:', event)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not initialized, queueing event:', event)
      this.eventQueue.push({ event, data })
      return
    }

    if (this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.log('Not connected, queueing event:', event)
      this.eventQueue.push({ event, data })
      if (this.socket.disconnected && !this.isConnecting) {
        console.log('Attempting reconnection...')
        this.socket.connect()
      }
    }
  }

  async emitWithAck(event, data, timeout = 5000) {
    await this.waitForConnection()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Timeout waiting for ${event} response`)),
        timeout
      )

      this.socket.emit(event, data, (response) => {
        clearTimeout(timer)
        resolve(response)
      })
    })
  }

  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected
  }

  updateToken(newToken) {
    if (this.socket) {
      this.socket.auth.token = newToken
      localStorage.setItem('jwt_token', newToken)
    }
  }
}

export default new SocketService()