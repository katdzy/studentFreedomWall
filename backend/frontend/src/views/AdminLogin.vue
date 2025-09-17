<template>
  <div class="admin-login">
    <div class="container">
      <div class="login-card">
        <div class="login-header">
          <i class="fas fa-shield-alt"></i>
          <h2>Admin Login</h2>
          <p>Access the Freedom Wall administration panel</p>
        </div>
        
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <i class="fas fa-user"></i>
              <input
                id="username"
                type="text"
                v-model="credentials.username"
                required
                placeholder="Enter admin username"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                id="password"
                type="password"
                v-model="credentials.password"
                required
                placeholder="Enter admin password"
              />
            </div>
          </div>
          
          <button type="submit" :disabled="loading" class="login-btn">
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>
        
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error }}
        </div>
        
        <div class="setup-info">
          <h4>First time setup?</h4>
          <p>Click below to create the default admin account:</p>
          <button @click="setupAdmin" :disabled="settingUp" class="setup-btn">
            <i v-if="settingUp" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-wrench"></i>
            <span v-if="settingUp">Setting up...</span>
            <span v-else>Setup Admin</span>
          </button>
          <p class="setup-details">
            Default credentials:<br>
            Username: <strong>admin</strong><br>
            Password: <strong>admin123</strong>
          </p>
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
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 1rem;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header i {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.login-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #7f8c8d;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: #7f8c8d;
  z-index: 1;
}

.input-wrapper input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.setup-info {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.setup-info h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.setup-info p {
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.setup-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem auto;
}

.setup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.setup-details {
  font-size: 0.9rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>