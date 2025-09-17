<template>
  <div class="home">
    <div class="container">
      <!-- Header Section -->
      <div class="header-section">
        <h2>Share Your Thoughts</h2>
        <p>Express yourself anonymously and connect with fellow students</p>
      </div>

      <!-- Post Creation Form -->
      <PostForm @post-created="handlePostCreated" />

      <!-- Sorting Options -->
      <div class="sorting-section">
        <div class="sort-buttons">
          <button 
            class="sort-btn"
            :class="{ active: sortBy === 'recent' }"
            @click="setSortBy('recent')"
          >
            <i class="fas fa-clock"></i> Most Recent
          </button>
          <button 
            class="sort-btn"
            :class="{ active: sortBy === 'liked' }"
            @click="setSortBy('liked')"
          >
            <i class="fas fa-heart"></i> Most Liked
          </button>
        </div>
        <div class="post-count">
          {{ posts.length }} posts
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="posts-container">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Loading posts...
        </div>
        
        <div v-else-if="posts.length === 0" class="no-posts">
          <i class="fas fa-comments"></i>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
        
        <PostCard 
          v-else
          v-for="post in posts" 
          :key="post._id" 
          :post="post"
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
      sortBy: 'recent'
    }
  },
  async mounted() {
    await this.loadPosts()
    this.setupSocketListeners()
  },
  beforeUnmount() {
    socketService.off('postApproved', this.handleNewPost)
    socketService.off('postDeleted', this.handleDeletedPost)
    socketService.off('reactionUpdate', this.handleReactionUpdate)
  },
  methods: {
    async loadPosts() {
      try {
        this.loading = true
        const response = await postsAPI.getPosts({ sort: this.sortBy })
        this.posts = response.data
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        this.loading = false
      }
    },
    
    async setSortBy(sort) {
      this.sortBy = sort
      await this.loadPosts()
    },
    
    handlePostCreated() {
      // Show success message - post is pending approval
      this.$refs.successMessage?.show()
    },
    
    handleReactionChanged(postId) {
      // Reload posts to get updated reaction counts
      this.loadPosts()
    },
    
    setupSocketListeners() {
      const socket = socketService.connect()
      
      socket.on('postApproved', this.handleNewPost)
      socket.on('postDeleted', this.handleDeletedPost)
      socket.on('reactionUpdate', this.handleReactionUpdate)
    },
    
    handleNewPost(post) {
      // Add new approved post to the feed
      if (this.sortBy === 'recent') {
        this.posts.unshift(post)
      } else {
        this.loadPosts() // Reload for proper sorting
      }
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
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-section h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.header-section p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.sorting-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.sort-buttons {
  display: flex;
  gap: 1rem;
}

.sort-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.sort-btn:hover {
  background: #e9ecef;
}

.sort-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.post-count {
  color: #7f8c8d;
  font-weight: 500;
}

.posts-container {
  space-y: 1rem;
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

.no-posts h3 {
  margin-bottom: 0.5rem;
}
</style>