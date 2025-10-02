import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.eventQueue = []
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling']
      })
      
      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket.id)
        this.isConnected = true
        
        // Process any queued events
        this.processQueue()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason)
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventQueue = []
    }
  }

  // Wait for connection before emitting
  waitForConnection() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve()
      } else {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 5000)

        this.socket.once('connect', () => {
          clearTimeout(timeout)
          resolve()
        })
      }
    })
  }

  // Process queued events after reconnection
  processQueue() {
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift()
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Enhanced emit with connection check
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not initialized')
      return
    }

    if (this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.log('Not connected, queueing event:', event)
      this.eventQueue.push({ event, data })
      
      // Try to reconnect if disconnected
      if (this.socket.disconnected) {
        this.socket.connect()
      }
    }
  }

  // Promise-based emit with response
  async emitWithAck(event, data, timeout = 5000) {
    await this.waitForConnection()
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${event} response`))
      }, timeout)

      this.socket.emit(event, data, (response) => {
        clearTimeout(timer)
        resolve(response)
      })
    })
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected
  }
}

export default new SocketService()