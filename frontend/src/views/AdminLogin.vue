<template>
  <div class="admin-login">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border border-dark border-2 shadow">
            <div class="card-header bg-primary text-dark border-bottom border-dark border-2">
              <h2 class="mb-0 fw-bold text-center">
                <i class="bi bi-shield-lock-fill me-2"></i>
                Admin Login
              </h2>
              <p class="text-center text-muted mb-0 mt-2">Access the Freedom Wall administration panel</p>
            </div>
            
            <div class="card-body">
              <form @submit.prevent="login">
                <!-- Username Field -->
                <div class="mb-3">
                  <label for="username" class="form-label fw-bold">
                    <i class="bi bi-person-fill me-2"></i>Username
                  </label>
                  <div class="input-group">
                    <span class="input-group-text border border-dark border-2">
                      <i class="bi bi-person"></i>
                    </span>
                    <input
                      id="username"
                      type="text"
                      v-model="credentials.username"
                      class="form-control border border-dark border-2"
                      placeholder="Enter admin username"
                      required
                    />
                  </div>
                </div>
                
                <!-- Password Field -->
                <div class="mb-4">
                  <label for="password" class="form-label fw-bold">
                    <i class="bi bi-lock-fill me-2"></i>Password
                  </label>
                  <div class="input-group">
                    <span class="input-group-text border border-dark border-2">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      id="password"
                      type="password"
                      v-model="credentials.password"
                      class="form-control border border-dark border-2"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                </div>
                
                <!-- Login Button -->
                <div class="d-grid mb-3">
                  <button 
                    type="submit" 
                    :disabled="loading" 
                    class="btn btn-primary btn-lg fw-bold"
                  >
                    <span v-if="loading">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Logging in...
                    </span>
                    <span v-else>
                      <i class="bi bi-key-fill me-2"></i>
                      Login
                    </span>
                  </button>
                </div>
              </form>
              
              <!-- Error Message -->
              <div v-if="error" class="alert alert-danger border border-dark border-2">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>{{ error }}</strong>
              </div>
              
              <!-- Setup Section -->
              <div class="text-center mt-4 pt-3 border-top border-dark border-2">
                <h5 class="fw-bold mb-3">
                  <i class="bi bi-gear-fill me-2"></i>
                  First time setup?
                </h5>
                <p class="text-muted mb-3">Click below to create the default admin account:</p>
                <button 
                  @click="setupAdmin" 
                  :disabled="settingUp" 
                  class="btn btn-success fw-bold mb-3"
                >
                  <span v-if="settingUp">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Setting up...
                  </span>
                  <span v-else>
                    <i class="bi bi-tools me-2"></i>
                    Setup Admin
                  </span>
                </button>
                <div class="alert alert-info border border-dark border-2">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <small>
                    <strong>Default credentials:</strong><br>
                    Username: <code>admin</code><br>
                    Password: <code>admin123</code>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api'

export default {
  name: 'AdminLogin',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loading: false,
      settingUp: false,
      error: null
    }
  },
  mounted() {
    // Check if already logged in
    const token = localStorage.getItem('admin_token')
    if (token) {
      this.$router.push('/admin/dashboard')
    }
  },
  methods: {
    async login() {
      try {
        this.loading = true
        this.error = null
        
        const response = await authAPI.adminLogin(this.credentials)
        
        // Store token and admin info
        localStorage.setItem('admin_token', response.data.token)
        localStorage.setItem('admin_info', JSON.stringify(response.data.admin))
        
        // Redirect to dashboard
        this.$router.push('/admin/dashboard')
        
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.response?.data?.message || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    async setupAdmin() {
      try {
        this.settingUp = true
        this.error = null
        
        await authAPI.setupAdmin()
        alert('Admin account created successfully! You can now login with the default credentials.')
        
      } catch (error) {
        console.error('Setup error:', error)
        this.error = error.response?.data?.message || 'Setup failed. Admin might already exist.'
      } finally {
        this.settingUp = false
      }
    }
  }
}
</script>

<style scoped>
/* Bootstrap Brite handles most styling! */
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

/* Enhance card styling to match app theme */
.card {
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  padding: 2rem 1.5rem 1.5rem;
}

.card-body {
  padding: 2rem 1.5rem;
}

/* Input group styling */
.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Button enhancements */
.btn {
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn:disabled {
  transform: none;
  box-shadow: none;
}

/* Alert styling */
.alert {
  border-radius: 10px;
  font-weight: 500;
}

/* Code styling for credentials */
code {
  background-color: #f8f9fa;
  color: #e83e8c;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: var(--font-size-sm);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-login {
    padding: 1rem 0;
  }
  
  .card-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .card-body {
    padding: 1.5rem 1rem;
  }
}

/* Animation for smooth entry */
.card {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>