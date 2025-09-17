<template>
  <div id="app">
    <nav class="navbar">
      <div class="container">
        <div class="nav-brand">
          <i class="fas fa-comments"></i>
          <h1>Student Freedom Wall</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <i class="fas fa-home"></i> Home
          </router-link>
          <router-link to="/admin" class="nav-link">
            <i class="fas fa-cog"></i> Admin
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 Student Freedom Wall. Express yourself freely and respectfully.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255,255,255,0.2);
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

.footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem 0;
  margin-top: auto;
}
</style>