<template>
  <div id="app">
    <!-- Bootstrap Navbar with Brite theme -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-5 border-dark shadow-lg">
      <div class="container-fluid px-4">
        <router-link to="/" class="navbar-brand fw-bold text-xl">
          <i class="bi bi-chat-square-quote-fill text-primary me-2"></i>
          Student Freedom Wall
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">
                <i class="bi bi-house-door-fill me-1"></i> Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link">
                <i class="bi bi-people-fill me-1"></i> About
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/guidelines" class="nav-link">
                <i class="bi bi-journal-text me-1"></i> Guidelines
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin" class="nav-link">
                <i class="bi bi-gear-fill me-1"></i> Admin
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="main-content py-4" style="min-height: calc(100vh - 200px); background-color: #f8f9fa;">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Home', 'About', 'Guidelines']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
    
    <!-- Footer -->
    <footer class="bg-dark text-white py-4 border-top border-5 border-dark">
      <div class="container text-center">
        <p class="mb-0">
          <i class="bi bi-heart-fill text-danger me-2"></i>
          &copy; 2025 Student Freedom Wall. Express yourself freely and respectfully.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import socketService from './services/socket'

export default {
  name: 'App',
  
  mounted() {
    // Handle page visibility changes (tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    
    // Handle page unload/refresh
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },
  
  beforeUnmount() {
    // Cleanup event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    
    // Disconnect socket
    this.cleanupSocket()
  },
  
  methods: {
    handleVisibilityChange() {
      // Optional: Pause/resume socket events when tab is hidden/visible
      if (document.hidden) {
        console.log('Tab hidden - socket remains connected')
      } else {
        console.log('Tab visible - socket active')
        // Check connection health when user returns
        if (!socketService.isSocketConnected()) {
          const token = localStorage.getItem('jwt_token')
          if (token) {
            socketService.connect(token)
          }
        }
      }
    },
    
    handleBeforeUnload() {
      // Clean disconnect when page is closing/refreshing
      this.cleanupSocket()
    },
    
    cleanupSocket() {
      console.log('Cleaning up socket connection...')
      socketService.disconnect()
    }
  }
}
</script>

<style scoped>
/* Minimal custom styles - Bootstrap Brite does most of the work! */
.router-link-active {
  font-weight: bold !important;
  color: #a2e436 !important;
}

.navbar-brand:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}

.nav-link {
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  transform: translateY(-2px);
}
</style>