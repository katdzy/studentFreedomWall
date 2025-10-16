<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- Dashboard Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-white border border-dark border-2 rounded shadow">
        <h1 class="mb-0 fw-bold">
          <i class="bi bi-graph-up me-2 text-primary"></i>
          Admin Dashboard
        </h1>
        <button @click="logout" class="btn btn-danger fw-bold">
          <i class="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>
      
      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-lg-4">
          <div class="card border border-dark border-2 shadow h-100">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-chat-dots text-2xl"></i>
                </div>
              </div>
              <div>
                <h3 class="mb-0 fw-bold text-primary">{{ stats.totalPosts || 0 }}</h3>
                <p class="text-muted mb-0 fw-bold">Total Posts</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-4">
          <div class="card border border-dark border-2 shadow h-100">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-clock text-2xl"></i>
                </div>
              </div>
              <div>
                <h3 class="mb-0 fw-bold text-warning">{{ stats.pendingPosts || 0 }}</h3>
                <p class="text-muted mb-0 fw-bold">Pending Approval</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-4">
          <div class="card border border-dark border-2 shadow h-100">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-check-circle text-2xl"></i>
                </div>
              </div>
              <div>
                <h3 class="mb-0 fw-bold text-success">{{ stats.approvedPosts || 0 }}</h3>
                <p class="text-muted mb-0 fw-bold">Approved Posts</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-4">
          <div class="card border border-dark border-2 shadow h-100">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-x-circle text-2xl"></i>
                </div>
              </div>
              <div>
                <h3 class="mb-0 fw-bold text-danger">{{ stats.rejectedPosts || 0 }}</h3>
                <p class="text-muted mb-0 fw-bold">Rejected Posts</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-4">
          <div class="card border border-dark border-2 shadow h-100">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <div class="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-heart text-2xl"></i>
                </div>
              </div>
              <div>
                <h3 class="mb-0 fw-bold text-info">{{ stats.totalReactions || 0 }}</h3>
                <p class="text-muted mb-0 fw-bold">Total Reactions</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-4">
          <div class="card border border-dark border-2 shadow h-100">
            <div class="card-body d-flex align-items-center">
              <div class="me-3">
                <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-flag text-2xl"></i>
                </div>
              </div>
              <div>
                <h3 class="mb-0 fw-bold text-danger">{{ stats.totalReports || 0 }}</h3>
                <p class="text-muted mb-0 fw-bold">Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="card border border-dark border-3 shadow-lg mb-4 tab-container">
        <div class="card-body p-0">
          <ul class="nav nav-tabs nav-fill border-0" role="tablist">
            <li v-for="tab in tabs" :key="tab.key" class="nav-item" role="presentation">
              <button 
                class="nav-link fw-bold border-0 position-relative"
                :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key"
                type="button"
                role="tab"
                :aria-selected="activeTab === tab.key"
              >
                <i :class="tab.iconClass" class="me-2"></i>
                <span>{{ tab.label }}</span>
                <span v-if="tab.badge" class="badge bg-danger ms-2">{{ tab.badge }}</span>
                
                <!-- Tab notification -->
                <div v-if="tabNotifications[tab.key]" class="position-absolute top-0 end-0 translate-middle">
                  <span class="badge bg-success text-white" style="font-size: 0.7rem; animation: pulse 1s infinite;">
                    <i class="bi bi-check-circle me-1"></i>
                    {{ tabNotifications[tab.key] }}
                  </span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Content Area -->
      <div class="card border border-dark border-2 shadow">
        <div class="card-body">
          <!-- Error Message -->
          <div v-if="errorMessage" class="alert border border-dark border-2" :class="{ 'alert-danger': rateLimitWarning, 'alert-warning': !rateLimitWarning }" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>{{ errorMessage }}</strong>
          </div>
        
          <!-- Pending Posts Tab -->
          <div v-if="activeTab === 'pending'">
            <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-warning bg-opacity-10 border border-warning border-2 rounded-3">
              <h2 class="mb-0 fw-bold text-warning">
                <i class="bi bi-clock-fill me-2"></i>
                Pending Posts
                <span class="badge bg-warning text-dark ms-2">{{ pendingPosts.length }}</span>
              </h2>
              <div class="text-muted">
                <i class="bi bi-info-circle me-1"></i>
                Posts awaiting review
              </div>
            </div>
            
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3 fw-bold">Loading posts...</p>
            </div>
            
            <div v-else-if="pendingPosts.length === 0" class="text-center py-5">
              <div class="alert alert-info border border-dark border-2 d-inline-block">
                <i class="bi bi-inbox display-1 d-block mb-3"></i>
                <h3 class="fw-bold">No pending posts</h3>
                <p class="mb-0">All posts have been reviewed!</p>
              </div>
            </div>
            
            <div v-else>
              <div class="posts-grid">
                <AdminPostCard
                  v-for="(post, index) in pendingPosts"
                  :key="post._id"
                  :post="post"
                  :style="{ 'animation-delay': `${index * 0.1}s` }"
                  @post-approved="handlePostApproved"
                  @post-rejected="handlePostRejected"
                  @post-deleted="handlePostDeleted"
                />
              </div>
              
              <!-- Pagination for Pending Posts -->
              <PaginationControls
                v-if="pagination.pending.totalPages > 1"
                :current-page="pagination.pending.page"
                :total-pages="pagination.pending.totalPages"
                :total-items="pagination.pending.total"
                :items-per-page="pagination.pending.limit"
                :is-loading="loadingPending"
                @page-changed="(page) => loadPendingPosts(page)"
                @items-per-page-changed="(limit) => changeItemsPerPage('pending', limit)"
              />
            </div>
          </div>
          
          <!-- All Posts Tab -->
          <div v-if="activeTab === 'all'">
            <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-primary bg-opacity-10 border border-primary border-2 rounded-3">
              <h2 class="mb-0 fw-bold text-primary">
                <i class="bi bi-list-ul me-2"></i>
                All Posts
                <span class="badge bg-primary text-white ms-2">{{ allPosts.length }}</span>
              </h2>
              <div class="col-md-3">
                <select v-model="statusFilter" @change="loadAllPosts" class="form-select border border-dark border-2 fw-bold">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div>
              <div class="posts-grid">
                <AdminPostCard
                  v-for="(post, index) in allPosts"
                  :key="post._id"
                  :post="post"
                  :style="{ 'animation-delay': `${index * 0.1}s` }"
                  @post-approved="handlePostApproved"
                  @post-rejected="handlePostRejected"
                  @post-deleted="handlePostDeleted"
                />
              </div>
              
              <!-- Pagination for All Posts -->
              <PaginationControls
                v-if="pagination.all.totalPages > 1"
                :current-page="pagination.all.page"
                :total-pages="pagination.all.totalPages"
                :total-items="pagination.all.total"
                :items-per-page="pagination.all.limit"
                :is-loading="loading"
                @page-changed="(page) => loadAllPosts(page)"
                @items-per-page-changed="(limit) => changeItemsPerPage('all', limit)"
              />
            </div>
          </div>
          
          <!-- Reports Tab -->
          <div v-if="activeTab === 'reports'">
            <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-danger bg-opacity-10 border border-danger border-2 rounded-3">
              <h2 class="mb-0 fw-bold text-danger">
                <i class="bi bi-flag-fill me-2"></i>
                Reported Posts
                <span class="badge bg-danger text-white ms-2">{{ stats.totalReports || 0 }}</span>
              </h2>
              <div class="text-muted">
                <i class="bi bi-exclamation-triangle me-1"></i>
                Posts requiring attention
              </div>
            </div>
            
            <div v-if="reports.length === 0" class="text-center py-5">
              <div class="alert alert-success border border-dark border-2 d-inline-block">
                <i class="bi bi-shield-check display-1 d-block mb-3"></i>
                <h3 class="fw-bold">No reported posts</h3>
                <p class="mb-0">All clear! No reports to review.</p>
              </div>
            </div>
            
            <div v-else>
              <div class="reports-grid">
                <div v-for="(report, index) in reports" :key="report._id" class="report-item" :style="{ 'animation-delay': `${index * 0.1}s` }">
                  <div class="card border border-danger border-3 shadow-lg mb-4 report-card">
                    <div class="card-header bg-danger text-white border-bottom border-danger border-2">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                          <i class="bi bi-flag-fill me-2"></i>
                          <strong>{{ formatReportReason(report.reason) }}</strong>
                          <span class="badge bg-warning text-dark ms-2">Reported</span>
                        </div>
                        <small class="text-white-50">
                          <i class="bi bi-clock me-1"></i>
                          {{ formatDate(report.dateReported) }}
                        </small>
                      </div>
                    </div>
                    <div class="card-body p-0">
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
              
              <!-- Pagination for Reports -->
              <PaginationControls
                v-if="pagination.reports.totalPages > 1"
                :current-page="pagination.reports.page"
                :total-pages="pagination.reports.totalPages"
                :total-items="pagination.reports.total"
                :items-per-page="pagination.reports.limit"
                :is-loading="loading"
                @page-changed="(page) => loadReports(page)"
                @items-per-page-changed="(limit) => changeItemsPerPage('reports', limit)"
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
import PaginationControls from '../components/PaginationControls.vue'
import { adminAPI } from '../services/api'
import socketService from '../services/socket'
import moment from 'moment'

export default {
  name: 'AdminDashboard',
  components: {
    AdminPostCard,
    PaginationControls
  },
  data() {
    return {
      stats: {},
      activeTab: 'pending',
      loading: false,
      pendingPosts: [],
      allPosts: [],
      reports: [],
      statusFilter: '',
      errorMessage: null,
      rateLimitWarning: false,
      loadingStats: false,
      loadingPending: false,
      tabNotifications: {},
      // Pagination data
      pagination: {
        pending: { page: 1, limit: 10, total: 0, totalPages: 0 },
        all: { page: 1, limit: 10, total: 0, totalPages: 0 },
        reports: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    }
  },
  computed: {
    tabs() {
      return [
        {
          key: 'pending',
          label: 'Pending Posts',
          iconClass: 'bi bi-clock',
          badge: this.stats.pendingPosts || null
        },
        {
          key: 'all',
          label: 'All Posts',
          iconClass: 'bi bi-list-ul'
        },
        {
          key: 'reports',
          label: 'Reports',
          iconClass: 'bi bi-flag',
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
    socketService.off('postDeleted')
    socketService.off('postApproved')
    socketService.off('postRejected')
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
      if (this.loadingStats) return
      
      try {
        this.loadingStats = true
        const response = await adminAPI.getDashboard()
        this.stats = response.data
        this.errorMessage = null
      } catch (error) {
        console.error('Error loading stats:', error)
        this.handleError(error, 'Failed to load dashboard stats')
      } finally {
        this.loadingStats = false
      }
    },
    
    async loadPendingPosts(page = 1) {
      if (this.loadingPending) return
      
      try {
        this.loadingPending = true
        this.loading = true
        this.errorMessage = null
        
        const response = await adminAPI.getPosts({ 
          status: 'pending', 
          page, 
          limit: this.pagination.pending.limit 
        })
        
        // Handle both old and new API response formats
        const posts = response.data.posts || response.data
        const paginationData = response.data.pagination || response.data
        
        this.pendingPosts = posts
        this.pagination.pending = {
          page: paginationData.page || page,
          limit: paginationData.limit || this.pagination.pending.limit,
          total: paginationData.total || posts.length,
          totalPages: paginationData.totalPages || Math.ceil((paginationData.total || posts.length) / this.pagination.pending.limit)
        }
        
        // Scroll to top when changing pages
        this.scrollToTop()
      } catch (error) {
        console.error('Error loading pending posts:', error)
        this.handleError(error, 'Failed to load pending posts')
        // Reset pagination on error
        this.pagination.pending.page = 1
      } finally {
        this.loading = false
        this.loadingPending = false
      }
    },
    
    handleError(error, defaultMessage) {
      if (error.isRateLimit || error.response?.status === 429) {
        this.rateLimitWarning = true
        this.errorMessage = 'Too many requests. Retrying in 5 seconds...'
        
        // Auto-retry after delay
        setTimeout(() => {
          this.rateLimitWarning = false
          this.errorMessage = null
          if (this.activeTab === 'pending') {
            this.loadPendingPosts()
          }
          this.loadStats()
        }, 5000)
      } else if (error.isNetworkError) {
        this.errorMessage = 'Network error. Please check your connection.'
      } else {
        this.errorMessage = defaultMessage || 'An error occurred. Please try again.'
      }
    },
    
    async loadAllPosts(page = 1) {
      try {
        this.loading = true
        this.errorMessage = null
        
        const params = { page, limit: this.pagination.all.limit }
        if (this.statusFilter) {
          params.status = this.statusFilter
        }
        
        const response = await adminAPI.getPosts(params)
        
        // Handle both old and new API response formats
        const posts = response.data.posts || response.data
        const paginationData = response.data.pagination || response.data
        
        this.allPosts = posts
        this.pagination.all = {
          page: paginationData.page || page,
          limit: paginationData.limit || this.pagination.all.limit,
          total: paginationData.total || posts.length,
          totalPages: paginationData.totalPages || Math.ceil((paginationData.total || posts.length) / this.pagination.all.limit)
        }
        
        // Scroll to top when changing pages
        this.scrollToTop()
      } catch (error) {
        console.error('Error loading all posts:', error)
        this.handleError(error, 'Failed to load all posts')
        // Reset pagination on error
        this.pagination.all.page = 1
      } finally {
        this.loading = false
      }
    },
    
    async loadReports(page = 1) {
      try {
        this.loading = true
        this.errorMessage = null
        
        const response = await adminAPI.getReports({ page, limit: this.pagination.reports.limit })
        
        // Handle both old and new API response formats
        const reports = response.data.reports || response.data
        const paginationData = response.data.pagination || response.data
        
        this.reports = reports
        this.pagination.reports = {
          page: paginationData.page || page,
          limit: paginationData.limit || this.pagination.reports.limit,
          total: paginationData.total || reports.length,
          totalPages: paginationData.totalPages || Math.ceil((paginationData.total || reports.length) / this.pagination.reports.limit)
        }
        
        // Scroll to top when changing pages
        this.scrollToTop()
      } catch (error) {
        console.error('Error loading reports:', error)
        this.handleError(error, 'Failed to load reports')
        // Reset pagination on error
        this.pagination.reports.page = 1
      } finally {
        this.loading = false
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
      
      socket.on('postDeleted', (data) => {
        console.log('Admin Socket: postDeleted event received', data)
        const { postId } = data
        this.handlePostDeleted(postId)
      })
      
      socket.on('postApproved', (data) => {
        console.log('Admin Socket: postApproved event received', data)
        const { postId } = data
        this.handlePostApproved(postId)
      })
      
      socket.on('postRejected', (data) => {
        console.log('Admin Socket: postRejected event received', data)
        const { postId } = data
        this.handlePostRejected(postId)
      })
    },
    
    handlePostApproved(postId) {
      console.log('Handling post approval for:', postId)
      
      // Find the post in pending posts
      const approvedPost = this.pendingPosts.find(post => post._id === postId)
      
      // Remove from pending posts immediately
      this.pendingPosts = this.pendingPosts.filter(post => post._id !== postId)
      
      // Add to all posts immediately if we found the post
      if (approvedPost) {
        // Check if post already exists in allPosts to prevent duplicates
        const existingPost = this.allPosts.find(post => post._id === postId)
        if (!existingPost) {
          // Update the post status to approved
          const updatedPost = { ...approvedPost, status: 'approved' }
          this.allPosts.unshift(updatedPost)
          
          // Show notification that post was moved to "All Posts"
          this.showTabNotification('all', 'Post approved and moved to All Posts')
          console.log('Post added to all posts:', updatedPost)
        } else {
          console.log('Post already exists in all posts, updating status')
          existingPost.status = 'approved'
        }
      }
      
      // Update stats
      this.loadStats()
    },
    
    handlePostRejected(postId) {
      console.log('Handling post rejection for:', postId)
      
      // Find the post in pending posts
      const rejectedPost = this.pendingPosts.find(post => post._id === postId)
      
      // Remove from pending posts immediately
      this.pendingPosts = this.pendingPosts.filter(post => post._id !== postId)
      
      // Add to all posts immediately if we found the post
      if (rejectedPost) {
        // Check if post already exists in allPosts to prevent duplicates
        const existingPost = this.allPosts.find(post => post._id === postId)
        if (!existingPost) {
          // Update the post status to rejected
          const updatedPost = { ...rejectedPost, status: 'rejected' }
          this.allPosts.unshift(updatedPost)
          
          // Show notification that post was moved to "All Posts"
          this.showTabNotification('all', 'Post rejected and moved to All Posts')
          console.log('Post added to all posts:', updatedPost)
        } else {
          console.log('Post already exists in all posts, updating status')
          existingPost.status = 'rejected'
        }
      }
      
      // Update stats
      this.loadStats()
    },
    
    handlePostDeleted(postId) {
      console.log('Handling post deletion for:', postId)
      
      // Remove post from all lists immediately
      this.pendingPosts = this.pendingPosts.filter(post => post._id !== postId)
      this.allPosts = this.allPosts.filter(post => post._id !== postId)
      
      // Remove reports that reference the deleted post
      this.reports = this.reports.filter(report => report.postId?._id !== postId)
      
      // Reload current tab data to ensure consistency
      if (this.activeTab === 'all') {
        this.loadAllPosts()
      } else if (this.activeTab === 'reports') {
        this.loadReports()
      }
      
      // Update stats
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
    
    showTabNotification(tabKey, message) {
      // Show a visual notification on the tab
      this.tabNotifications[tabKey] = message
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        this.tabNotifications[tabKey] = null
      }, 3000)
    },
    
    changeItemsPerPage(tab, limit) {
      // Update the limit for the specified tab
      this.pagination[tab].limit = limit
      this.pagination[tab].page = 1 // Reset to first page
      
      // Reload the data with new limit
      if (tab === 'pending') {
        this.loadPendingPosts(1)
      } else if (tab === 'all') {
        this.loadAllPosts(1)
      } else if (tab === 'reports') {
        this.loadReports(1)
      }
    },
    
    scrollToTop() {
      // Smooth scroll to top of content area
      const contentArea = document.querySelector('.tab-content')
      if (contentArea) {
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
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
/* Bootstrap Brite handles most styling! */
.admin-dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
}

/* Card enhancements */
.card {
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* Statistics cards */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

/* Tab Container Styling */
.tab-container {
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.tab-container .card-body {
  padding: 0;
  background: transparent;
}

/* Enhanced Tab Styling - Bootstrap Brite Theme */
.nav-tabs {
  border-bottom: 2px solid #dee2e6 !important;
  background: #ffffff;
  margin: 0;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 0;
  font-weight: 600;
  font-size: var(--font-size-lg);
  padding: 1rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  color: #2c3e50 !important;
  background: transparent;
  border-bottom: 3px solid transparent;
}

/* First tab - left rounded corners */
.nav-tabs .nav-item:first-child .nav-link {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

/* Last tab - right rounded corners */
.nav-tabs .nav-item:last-child .nav-link {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.nav-tabs .nav-link:hover {
  background: #f8f9fa;
  color: #000 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom-color: #dee2e6;
  font-weight: 700;
}

.nav-tabs .nav-link.active {
  background: #000 !important;
  color: white !important;
  border-bottom: 3px solid #000;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  font-weight: 800;
}

.nav-tabs .nav-link.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 0;
  pointer-events: none;
}

.nav-tabs .nav-link.active:hover {
  background: #000;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Badge styling in tabs */
.nav-tabs .nav-link .badge {
  font-size: var(--font-size-xs);
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  font-weight: 600;
  background: #dc3545 !important;
  border: 1px solid #000;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.2rem;
}

.nav-tabs .nav-link.active .badge {
  background: #ffc107 !important;
  color: #000 !important;
  border: 1px solid #000;
}

/* Icon styling in tabs */
.nav-tabs .nav-link i {
  font-size: var(--font-size-lg);
  transition: transform 0.2s ease;
}

.nav-tabs .nav-link:hover i {
  transform: scale(1.1);
}

.nav-tabs .nav-link.active i {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Button enhancements */
.btn {
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Alert styling */
.alert {
  border-radius: 10px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form controls */
.form-select {
  font-weight: 600;
}

.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Loading spinner */
.spinner-border {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* Base Layout Styles */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.reports-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-item {
  animation: slideInUp 0.6s ease-out both;
}

.report-card {
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.2) !important;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.posts-grid > * {
  animation: slideInUp 0.6s ease-out both;
}

.alert {
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out;
}

.alert .display-1 {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

/* Mobile responsive styles */
@media (max-width: 576px) {
  .nav-tabs .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .nav-tabs .nav-link i {
    font-size: 1.2rem;
    margin: 0 !important;
    font-weight: 700;
  }
  
  .nav-tabs .nav-link .badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.35rem;
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 1rem;
  }
  
  /* Hide text labels on mobile, show only icons */
  .nav-tabs .nav-link span:not(.badge) {
    display: none;
  }
  
  /* Mobile section headers */
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 {
    flex-direction: column !important;
    gap: 1rem;
    text-align: center;
    padding: 1rem !important;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 h2 {
    font-size: 1.2rem;
    margin-bottom: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 h2 i {
    font-size: 1.1rem;
    margin-right: 0 !important;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 h2 .badge {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 .text-muted {
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 .col-md-3 {
    width: 100% !important;
    max-width: 250px;
    margin: 0 auto;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 .form-select {
    font-size: 0.85rem;
    width: 100%;
  }
  
  /* Mobile report cards */
  .report-card .card-header {
    padding: 0.75rem 1rem;
  }
  
  .report-card .card-header .d-flex {
    flex-direction: column !important;
    gap: 0.5rem !important;
    align-items: flex-start !important;
  }
  
  .report-card .card-header .d-flex .d-flex {
    flex-direction: row !important;
    align-items: center !important;
    width: 100%;
  }
  
  .report-card .card-header .d-flex .d-flex .badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
  
  .report-card .card-header .d-flex small {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .report-card .card-body {
    padding: 0 !important;
  }
}

@media (max-width: 375px) {
  .nav-tabs .nav-link {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.2rem;
  }
  
  .nav-tabs .nav-link i {
    font-size: 1.1rem;
    font-weight: 700;
  }
  
  .nav-tabs .nav-link .badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.3rem;
    top: 0.2rem;
    right: 0.2rem;
  }
  
  /* Very small mobile section headers */
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 {
    padding: 0.75rem !important;
    gap: 0.75rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 h2 {
    font-size: 1.1rem;
    gap: 0.4rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 h2 i {
    font-size: 1rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 h2 .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 .text-muted {
    font-size: 0.8rem;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 .col-md-3 {
    max-width: 200px;
  }
  
  .d-flex.justify-content-between.align-items-center.mb-4.p-3 .form-select {
    font-size: 0.8rem;
  }
  
  /* Very small mobile report cards */
  .report-card .card-header {
    padding: 0.5rem 0.75rem;
  }
  
  .report-card .card-header .d-flex {
    gap: 0.4rem !important;
  }
  
  .report-card .card-header .d-flex .d-flex .badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
  }
  
  .report-card .card-header .d-flex small {
    font-size: 0.7rem;
  }
}
</style>