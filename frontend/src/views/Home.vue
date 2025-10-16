<template>
  <div class="home">
    <div class="container">
      <!-- Header Section with Bootstrap styling -->
      <div class="text-center mb-4">
        <h2 class="display-5 fw-bold">
          <i class="bi bi-chat-left-quote-fill text-primary me-2"></i>
          Share Your Thoughts
        </h2>
        <p class="lead text-muted">Express yourself anonymously and connect with fellow students</p>
      </div>

      <!-- Create Post Button -->
      <div class="text-center mb-4">
        <button 
          @click="togglePostForm" 
          class="btn btn-primary btn-lg fw-bold shadow-lg"
          :class="{ 'btn-outline-primary': showPostForm }"
        >
          <i class="bi bi-plus-circle-fill me-2"></i>
          {{ showPostForm ? 'Cancel' : 'Create Post' }}
        </button>
      </div>

      <!-- Post Creation Form (Hidden by default) -->
      <transition name="slide-down" appear>
        <div v-if="showPostForm" class="mb-4 post-form-container">
          <PostForm @post-created="handlePostCreated" />
        </div>
      </transition>

      <!-- Sorting Options with Bootstrap buttons -->
      <div class="d-flex justify-content-between align-items-center mb-4 p-3 bg-white border border-dark border-2 rounded shadow">
        <div class="btn-group" role="group">
          <button 
            class="btn btn-outline-dark"
            :class="{ active: sortBy === 'recent' }"
            @click="setSortBy('recent')"
            title="Most Recent"
          >
            <i class="bi bi-clock-fill me-2"></i> 
            <span>Most Recent</span>
          </button>
          <button 
            class="btn btn-outline-dark"
            :class="{ active: sortBy === 'liked' }"
            @click="setSortBy('liked')"
            title="Most Liked"
          >
            <i class="bi bi-heart-fill me-2"></i> 
            <span>Most Liked</span>
          </button>
        </div>
        <span class="badge bg-primary text-lg px-3 py-2">
          <i class="bi bi-file-earmark-text me-1"></i>
          {{ postsCount }} posts
        </span>
      </div>

      <!-- Error Message with Bootstrap alert -->
      <div v-if="hasError" class="alert alert-warning border border-dark border-2 shadow" :class="{ 'alert-danger': rateLimitWarning }" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>{{ errorMessage }}</strong>
      </div>

      <!-- Posts Feed -->
      <div class="posts-container">
        <!-- Loading Spinner -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 fw-bold">Loading posts...</p>
        </div>
        
        <!-- No Posts Message -->
        <div v-else-if="!hasPosts && !hasError" class="text-center py-5">
          <div class="alert alert-info border border-dark border-2 shadow d-inline-block">
            <i class="bi bi-chat-square-text display-1 d-block mb-3"></i>
            <h3 class="fw-bold">No posts yet</h3>
            <p class="mb-0">Be the first to share something!</p>
          </div>
        </div>

        <!-- Post Cards -->
        <PostCard 
          v-else-if="hasPosts"
          v-for="post in posts"
          :key="post._id"
          :post="{
            ...post,
            photoUrl: post.photoUrl
          }"
          @reaction-changed="handleReactionChanged"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PostForm from '../components/PostForm.vue'
import PostCard from '../components/PostCard.vue'
import { postsAPI } from '../services/api'
import socketService from '../services/socket'

export default {
  name: 'Home',
  components: {
    PostForm,
    PostCard
  },
  data() {
    return {
      posts: [],
      loading: true,
      sortBy: 'recent',
      socketSetup: false, // Prevent duplicate listener setup
      loadingPosts: false, // Prevent concurrent API calls
      lastLoadTime: 0, // Throttle API calls
      errorMessage: null,
      rateLimitWarning: false,
      showPostForm: false // Control PostForm visibility
    }
  },
  computed: {
    // Computed property for better performance
    postsCount() {
      return this.posts.length
    },
    hasError() {
      return !!this.errorMessage
    },
    hasPosts() {
      return this.posts.length > 0
    }
  },
  async mounted() {
    try {
      await this.loadPosts()
      await this.setupSocketListeners()
    } catch (error) {
      console.error('Error during component mount:', error)
      this.handleMountError(error)
    }
  },
  beforeUnmount() {
    // Remove listeners
    socketService.off('postApproved', this.handleNewPost)
    socketService.off('postDeleted', this.handleDeletedPost)
    socketService.off('reactionUpdate', this.handleReactionUpdate)
    socketService.off('newPost', this.handleNewPostNotification)
    this.socketSetup = false
  },
  methods: {
    async loadPosts() {
      // Prevent concurrent loads
      if (this.loadingPosts) {
        console.log('Load already in progress, skipping...')
        return
      }

      try {
        this.loadingPosts = true
        this.loading = true
        this.errorMessage = null
        this.rateLimitWarning = false
        
        const response = await postsAPI.getPosts({ sort: this.sortBy })
        this.posts = response.data
        this.lastLoadTime = Date.now()
      } catch (error) {
        console.error('Error loading posts:', error)
        
        // Handle rate limiting
        if (error.isRateLimit || error.response?.status === 429) {
          this.rateLimitWarning = true
          this.errorMessage = 'Too many requests. Please wait a moment...'
          console.warn('⚠️ Rate limited. Waiting before retry...')
          
          // Auto-retry after delay
          setTimeout(() => {
            this.rateLimitWarning = false
            this.loadPosts()
          }, 5000)
        } else if (error.isNetworkError) {
          this.errorMessage = 'Network error. Please check your connection.'
        } else {
          this.errorMessage = 'Failed to load posts. Please refresh the page.'
        }
      } finally {
        this.loading = false
        this.loadingPosts = false
      }
    },
    
    handleMountError(error) {
      if (error.isRateLimit || error.response?.status === 429) {
        this.errorMessage = 'Server is busy. The page will reload automatically...'
        // Auto-retry after delay
        setTimeout(() => {
          window.location.reload()
        }, 5000)
      } else {
        this.errorMessage = 'Failed to load. Please refresh the page.'
      }
    },
    
    async setSortBy(sort) {
      this.sortBy = sort
      await this.loadPosts()
    },
    
    handlePostCreated() {
      this.$refs.successMessage?.show()
      this.showPostForm = false // Hide form after successful post creation
      
      // Reload posts after a short delay to show the new post
      // This ensures immediate feedback even if socket events are delayed
      setTimeout(() => {
        this.loadPosts()
      }, 500) // Small delay to let socket events work first
    },
    
    togglePostForm() {
      this.showPostForm = !this.showPostForm
    },
    
    handleReactionChanged(postId) {
      // No need to reload all posts - PostCard handles updates optimistically
      // This method is kept for potential future use but doesn't trigger reload
      console.log('Reaction changed for post:', postId)
    },

    // ✅ Safe socket setup with duplicate prevention
    async setupSocketListeners() {
      // Prevent duplicate setup on rapid refreshes
      if (this.socketSetup) {
        console.log('Socket listeners already set up')
        return
      }

      try {
        const token = localStorage.getItem('jwt_token')
        
        if (!token) {
          console.warn('No token found, skipping socket connection')
          return
        }

        // Ensure connected before attaching listeners
        if (!socketService.isSocketConnected()) {
          const socket = await socketService.connect(token)
          
          // If connection failed due to rate limiting, skip socket setup
          if (!socket) {
            console.warn('⚠️ Socket connection failed (possibly rate limited). Will retry later.')
            return
          }
          
          try {
            await socketService.waitForConnection(10000)
          } catch (waitError) {
            console.warn('⚠️ Socket connection timeout. Skipping socket features.')
            return
          }
        }

        // Attach event listeners
        socketService.on('postApproved', (data) => {
          console.log('Socket: postApproved event received', data)
          this.handleNewPost(data)
        })
        socketService.on('postDeleted', (data) => {
          console.log('Socket: postDeleted event received', data)
          this.handleDeletedPost(data)
        })
        socketService.on('reactionUpdate', (data) => {
          console.log('Socket: reactionUpdate event received', data)
          this.handleReactionUpdate(data)
        })
        socketService.on('newPost', (data) => {
          console.log('Socket: newPost event received', data)
          this.handleNewPostNotification(data)
        })
        
        this.socketSetup = true
        console.log('✅ Socket listeners attached')
      } catch (error) {
        console.error('Failed to setup socket listeners:', error)
        // Don't throw - socket is optional, app should still work
      }
    },
    
    handleNewPost(post) {
      console.log('Received new approved post:', post)
      
      // Check if post already exists to prevent duplicates
      const existingPost = this.posts.find(p => p._id === post._id)
      if (existingPost) {
        console.log('Post already exists, skipping duplicate')
        return
      }
      
      // Add the new approved post to the feed
      if (this.sortBy === 'recent') {
        // Ensure the post has the correct photo URL format
        const formattedPost = {
          ...post,
          photoUrl: post.photoUrl ? `http://localhost:3000${post.photoUrl}` : null
        }
        this.posts.unshift(formattedPost)
      } else {
        // For other sort orders, reload to maintain proper order
        this.loadPosts()
      }
    },
    
    handleNewPostNotification(data) {
      // Handle notification about new pending post
      console.log('New post notification:', data)
      // Reload posts to get the latest data
      this.loadPosts()
    },
    
    handleDeletedPost({ postId }) {
      this.posts = this.posts.filter(post => post._id !== postId)
    },
    
    handleReactionUpdate({ postId, reactionCount }) {
      const post = this.posts.find(p => p._id === postId)
      if (post) {
        post.reactionCount = reactionCount
      }
    }
  }
}
</script>

<style scoped>
/* Bootstrap Brite handles most styling! */
.container {
  max-width: 900px;
  margin: 0 auto;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Create Post Button Styling */
.btn-lg {
  padding: 0.75rem 2rem;
  font-size: var(--font-size-lg);
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

/* Responsive sorting buttons */
@media (max-width: 750px) {
  .btn-group .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
  
  .btn-group .btn i {
    font-size: 0.85rem;
  }
}

@media (max-width: 470px) {
  .btn-group .btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .btn-group .btn i {
    font-size: 0.8rem;
  }
  
  /* Hide text on very small screens, show only icons */
  .btn-group .btn span {
    display: none;
  }
  
  .btn-group .btn {
    padding: 0.5rem;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-group .btn i {
    margin: 0 !important;
    font-size: 1rem;
  }
}

@media (max-width: 375px) {
  .btn-group .btn {
    padding: 0.4rem;
    min-width: 36px;
  }
  
  .btn-group .btn i {
    font-size: 0.9rem;
  }
}

.btn-lg:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-lg:active {
  transform: translateY(-1px) scale(0.98);
  transition: all 0.1s ease;
}

/* Button ripple effect */
.btn-lg::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-lg:active::before {
  width: 300px;
  height: 300px;
}

/* Smooth Slide Down Animation for Post Form */
.slide-down-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Post Form Container Styling */
.post-form-container {
  transform-origin: top center;
  will-change: transform, opacity;
}

/* Add smooth entry animation for alerts */
.alert {
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

/* Enhance button group */
.btn-group .btn {
  transition: all 0.2s;
}

.btn-group .btn:hover {
  transform: translateY(-2px);
}
</style>