<template>
  <div class="admin-dashboard">
    <div class="container">
      <div class="dashboard-header">
        <h1>
          <i class="fas fa-tachometer-alt"></i>
          Admin Dashboard
        </h1>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalPosts || 0 }}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.pendingPosts || 0 }}</h3>
            <p>Pending Approval</p>
          </div>
        </div>
        
        <div class="stat-card approved">
          <div class="stat-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.approvedPosts || 0 }}</h3>
            <p>Approved Posts</p>
          </div>
        </div>
        
        <div class="stat-card rejected">
          <div class="stat-icon">
            <i class="fas fa-times"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.rejectedPosts || 0 }}</h3>
            <p>Rejected Posts</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-heart"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalReactions || 0 }}</h3>
            <p>Total Reactions</p>
          </div>
        </div>
        
        <div class="stat-card reports">
          <div class="stat-icon">
            <i class="fas fa-flag"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalReports || 0 }}</h3>
            <p>Reports</p>
          </div>
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="tab-navigation">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>
      
      <!-- Content Area -->
      <div class="content-area">
        <!-- Pending Posts Tab -->
        <div v-if="activeTab === 'pending'" class="tab-content">
          <h2>Pending Posts</h2>
          <div v-if="loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading posts...
          </div>
          <div v-else-if="pendingPosts.length === 0" class="no-posts">
            <i class="fas fa-inbox"></i>
            <p>No pending posts to review</p>
          </div>
          <AdminPostCard
            v-else
            v-for="post in pendingPosts"
            :key="post._id"
            :post="post"
            @post-approved="handlePostApproved"
            @post-rejected="handlePostRejected"
            @post-deleted="handlePostDeleted"
          />
        </div>
        
        <!-- All Posts Tab -->
        <div v-if="activeTab === 'all'" class="tab-content">
          <h2>All Posts</h2>
          <div class="filters">
            <select v-model="statusFilter" @change="loadAllPosts">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <AdminPostCard
            v-for="post in allPosts"
            :key="post._id"
            :post="post"
            @post-approved="handlePostApproved"
            @post-rejected="handlePostRejected"
            @post-deleted="handlePostDeleted"
          />
        </div>
        
        <!-- Reports Tab -->
        <div v-if="activeTab === 'reports'" class="tab-content">
          <h2>Reported Posts</h2>
          <div v-if="reports.length === 0" class="no-posts">
            <i class="fas fa-shield-check"></i>
            <p>No reported posts</p>
          </div>
          <div v-else class="reports-list">
            <div v-for="report in reports" :key="report._id" class="report-item">
              <div class="report-info">
                <div class="report-reason">
                  <i class="fas fa-flag"></i>
                  <strong>{{ formatReportReason(report.reason) }}</strong>
                </div>
                <div class="report-date">
                  {{ formatDate(report.dateReported) }}
                </div>
              </div>
              <AdminPostCard
                v-if="report.postId"
                :post="report.postId"
                :show-report-info="true"
                @post-approved="handlePostApproved"
                @post-rejected="handlePostRejected"
                @post-deleted="handlePostDeleted"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminPostCard from '../components/AdminPostCard.vue'
import { adminAPI } from '../services/api'
import socketService from '../services/socket'
import moment from 'moment'

export default {
  name: 'AdminDashboard',
  components: {
    AdminPostCard
  },
  data() {
    return {
      stats: {},
      activeTab: 'pending',
      loading: false,
      pendingPosts: [],
      allPosts: [],
      reports: [],
      statusFilter: ''
    }
  },
  computed: {
    tabs() {
      return [
        {
          key: 'pending',
          label: 'Pending Posts',
          icon: 'fas fa-clock',
          badge: this.stats.pendingPosts || null
        },
        {
          key: 'all',
          label: 'All Posts',
          icon: 'fas fa-list'
        },
        {
          key: 'reports',
          label: 'Reports',
          icon: 'fas fa-flag',
          badge: this.stats.totalReports || null
        }
      ]
    }
  },
  async mounted() {
    await this.loadStats()
    await this.loadPendingPosts()
    this.setupSocketListeners()
  },
  beforeUnmount() {
    socketService.off('newPost')
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'pending') {
        this.loadPendingPosts()
      } else if (newTab === 'all') {
        this.loadAllPosts()
      } else if (newTab === 'reports') {
        this.loadReports()
      }
    }
  },
  methods: {
    async loadStats() {
      try {
        const response = await adminAPI.getDashboard()
        this.stats = response.data
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },
    
    async loadPendingPosts() {
      try {
        this.loading = true
        const response = await adminAPI.getPosts({ status: 'pending' })
        this.pendingPosts = response.data.posts
      } catch (error) {
        console.error('Error loading pending posts:', error)
      } finally {
        this.loading = false
      }
    },
    
    async loadAllPosts() {
      try {
        const params = this.statusFilter ? { status: this.statusFilter } : {}
        const response = await adminAPI.getPosts(params)
        this.allPosts = response.data.posts
      } catch (error) {
        console.error('Error loading all posts:', error)
      }
    },
    
    async loadReports() {
      try {
        const response = await adminAPI.getReports()
        this.reports = response.data
      } catch (error) {
        console.error('Error loading reports:', error)
      }
    },
    
    setupSocketListeners() {
      const socket = socketService.connect()
      
      socket.on('newPost', () => {
        this.loadStats()
        if (this.activeTab === 'pending') {
          this.loadPendingPosts()
        }
      })
    },
    
    handlePostApproved(postId) {
      this.pendingPosts = this.pendingPosts.filter(post => post._id !== postId)
      this.loadStats()
    },
    
    handlePostRejected(postId) {
      this.pendingPosts = this.pendingPosts.filter(post => post._id !== postId)
      this.loadStats()
    },
    
    handlePostDeleted(postId) {
      this.pendingPosts = this.pendingPosts.filter(post => post._id !== postId)
      this.allPosts = this.allPosts.filter(post => post._id !== postId)
      this.loadStats()
    },
    
    formatDate(date) {
      return moment(date).format('MMM DD, YYYY HH:mm')
    },
    
    formatReportReason(reason) {
      const reasons = {
        inappropriate: 'Inappropriate Content',
        spam: 'Spam/Repetitive',
        harassment: 'Harassment/Bullying',
        fake_news: 'False Information',
        other: 'Other'
      }
      return reasons[reason] || reason
    },
    
    logout() {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c82333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #667eea;
}

.stat-card.pending {
  border-left-color: #ffc107;
}

.stat-card.approved {
  border-left-color: #28a745;
}

.stat-card.rejected {
  border-left-color: #dc3545;
}

.stat-card.reports {
  border-left-color: #fd7e14;
}

.stat-icon {
  background: #f8f9fa;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
}

.pending .stat-icon {
  color: #ffc107;
}

.approved .stat-icon {
  color: #28a745;
}

.rejected .stat-icon {
  color: #dc3545;
}

.reports .stat-icon {
  color: #fd7e14;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #7f8c8d;
  font-weight: 500;
}

.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #6c757d;
  position: relative;
}

.tab-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-badge {
  background: #dc3545;
  color: white;
  border-radius: 12px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.content-area {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
}

.tab-content h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.filters {
  margin-bottom: 2rem;
}

.filters select {
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.no-posts {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.no-posts i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.reports-list {
  space-y: 2rem;
}

.report-item {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.report-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f8f9fa;
}

.report-reason {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc3545;
}

.report-date {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>