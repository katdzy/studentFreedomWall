<template>
  <div class="sticky-note card border border-dark border-3 shadow-lg mb-4" :style="{ 
    backgroundColor: postColor.bg,
    '--tape-color': postColor.tape
  }">
    <!-- Tape Effect -->
    <div class="tape"></div>
    
    <!-- Header -->
    <div class="card-header border-bottom border-dark border-2 d-flex justify-content-between align-items-center" :style="{ backgroundColor: postColor.bg }">
      <div class="d-flex align-items-center">
        <i class="bi bi-person-circle text-xl me-2"></i>
        <strong>Anonymous Student</strong>
      </div>
      <small class="text-muted">
        <i class="bi bi-clock me-1"></i>
        {{ formatDate(post.dateCreated) }}
      </small>
    </div>

    <!-- Content -->
    <div class="card-body">
      <p class="card-text text-base">{{ post.messageContent }}</p>
      <div v-if="post.photoUrl" class="mt-3 post-image-container">
        <img
          :src="getImageUrl(post.photoUrl)"
          :alt="'Post image'"
          class="post-image img-fluid rounded border border-dark border-2"
          @click="openImageModal"
        />
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="card-footer border-top border-dark border-2 bg-white">
      <!-- Reactions -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="btn-group" role="group" @click.prevent>
          <button
            v-for="reaction in reactionTypes"
            :key="reaction.type"
            type="button"
            class="btn btn-sm btn-outline-dark reaction-button"
            :class="{ active: userReaction === reaction.type, 'animate-click': clickedReaction === reaction.type }"
            @click="toggleReaction(reaction.type, $event)"
            :title="reaction.label"
          >
            <img :src="reaction.image" :alt="reaction.label" class="reaction-emoji" />
            <span v-if="reactionCounts[reaction.type]" class="ms-1 text-sm fw-bold">
              {{ reactionCounts[reaction.type] }}
            </span>
          </button>
        </div>

        <div class="d-flex gap-2 align-items-center">
          <span class="badge bg-primary">
            <i class="bi bi-heart-fill me-1"></i>
            {{ totalReactions }}
          </span>
          <button type="button" class="btn btn-sm btn-outline-danger" @click.prevent="showReportModal = true" title="Report this post">
            <i class="bi bi-flag-fill"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal (Bootstrap) -->
    <teleport to="body">
      <div v-if="showImageModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.8);" @click.self="closeImageModal">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border border-dark border-3">
            <div class="modal-header border-bottom border-dark border-2">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-image me-2"></i>
                Post Image
              </h5>
              <button type="button" class="btn-close" @click="closeImageModal"></button>
            </div>
            <div class="modal-body p-0">
              <img :src="getImageUrl(post.photoUrl)" alt="Full size image" class="img-fluid w-100" />
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Report Modal (Bootstrap) -->
    <teleport to="body">
      <div v-if="showReportModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);" @click.self="closeReportModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border border-dark border-3 shadow">
            <div class="modal-header bg-danger text-white border-bottom border-dark border-2">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-flag-fill me-2"></i>
                Report Post
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="closeReportModal"></button>
            </div>
            <div class="modal-body">
              <p class="fw-bold mb-3">Why are you reporting this post?</p>
              <div class="list-group">
                <label 
                  v-for="reason in reportReasons" 
                  :key="reason.value"
                  class="list-group-item list-group-item-action border border-dark border-2 mb-2"
                  :class="{ 'active': selectedReportReason === reason.value }"
                >
                  <input 
                    type="radio" 
                    :value="reason.value" 
                    v-model="selectedReportReason"
                    class="form-check-input me-2"
                  >
                  <span>{{ reason.label }}</span>
                </label>
              </div>
            </div>
            <div class="modal-footer border-top border-dark border-2">
              <button 
                @click="submitReport" 
                :disabled="!selectedReportReason || reporting" 
                class="btn btn-danger fw-bold"
              >
                <i class="bi bi-flag-fill me-2"></i>
                <span v-if="reporting">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Reporting...
                </span>
                <span v-else>Submit Report</span>
              </button>
              <button @click="closeReportModal" class="btn btn-outline-dark">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { reactionsAPI } from '../services/api'
import moment from 'moment'

export default {
  name: 'PostCard',
  props: {
    post: { type: Object, required: true }
  },
  data() {
    return {
      // Initialize from props instead of API call
      reactionCounts: this.post.reactions || {
        like: 0,
        heart: 0,
        laugh: 0,
        wow: 0,
        sad: 0
      },
      userReaction: null,
      showImageModal: false,
      showReportModal: false,
      selectedReportReason: null,
      reporting: false,
      clickedReaction: null, // For animation
      reactionTypes: [
        { type: 'like', image: '/emojis/like.png', label: 'Like' },
        { type: 'heart', image: '/emojis/love.png', label: 'Love' },
        { type: 'laugh', image: '/emojis/haha.png', label: 'Funny' },
        { type: 'wow', image: '/emojis/wow.png', label: 'Wow' },
        { type: 'sad', image: '/emojis/sad.png', label: 'Sad' }
      ],
      reportReasons: [
        { value: 'inappropriate', label: 'Inappropriate content' },
        { value: 'spam', label: 'Spam or repetitive content' },
        { value: 'harassment', label: 'Harassment or bullying' },
        { value: 'fake_news', label: 'False information' },
        { value: 'other', label: 'Other' }
      ]
    }
  },
  computed: {
    totalReactions() {
      return Object.values(this.reactionCounts).reduce((sum, val) => sum + val, 0)
    },
    postColor() {
      // Generate consistent color based on post ID
      const colors = [
        { bg: '#fff9c4', border: '#f9a825', tape: 'linear-gradient(to bottom, #ffd700 0%, #ffed4e 100%)' }, // Sunny Yellow
        { bg: '#f8bbd0', border: '#c2185b', tape: 'linear-gradient(to bottom, #ff69b4 0%, #ffb6c1 100%)' }, // Bubble Pink
        { bg: '#c8e6c9', border: '#388e3c', tape: 'linear-gradient(to bottom, #66bb6a 0%, #81c784 100%)' }, // Mint Green
        { bg: '#b3e5fc', border: '#0277bd', tape: 'linear-gradient(to bottom, #29b6f6 0%, #4fc3f7 100%)' }, // Sky Blue
        { bg: '#e1bee7', border: '#7b1fa2', tape: 'linear-gradient(to bottom, #ab47bc 0%, #ba68c8 100%)' }, // Lavender
        { bg: '#ffccbc', border: '#d84315', tape: 'linear-gradient(to bottom, #ff7043 0%, #ff8a65 100%)' }, // Peach
        { bg: '#d1c4e9', border: '#512da8', tape: 'linear-gradient(to bottom, #7e57c2 0%, #9575cd 100%)' }, // Soft Purple
        { bg: '#ffe082', border: '#f57f17', tape: 'linear-gradient(to bottom, #ffd54f 0%, #ffe082 100%)' }  // Golden
      ]
      
      const hash = this.post._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return colors[hash % colors.length]
    }
  },
  async mounted() {
    // Only load user's specific reaction (lightweight call)
    await this.loadUserReaction()
  },
  watch: {
    // Update reaction counts if post prop changes
    'post.reactions': {
      handler(newReactions) {
        if (newReactions) {
          this.reactionCounts = { ...newReactions }
        }
      },
      deep: true
    }
  },
  methods: {
    async loadUserReaction() {
      // Only get user's reaction, not all reactions
      try {
        const response = await reactionsAPI.getReactions(this.post._id)
        this.userReaction = response.data.userReaction
      } catch (error) {
        // Silently fail if user hasn't reacted
        if (error.response?.status !== 404) {
          console.error('Error loading user reaction:', error)
        }
      }
    },
    async toggleReaction(type, event) {
      // Prevent default behavior and stop propagation
      if (event) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
      
      // Trigger animation
      this.clickedReaction = type
      setTimeout(() => {
        this.clickedReaction = null
      }, 600) // Animation duration
      
      try {
        if (this.userReaction === type) {
          await reactionsAPI.removeReaction(this.post._id)
          this.userReaction = null
          // Optimistically update UI
          if (this.reactionCounts[type] > 0) {
            this.reactionCounts[type]--
          }
        } else {
          await reactionsAPI.addReaction(this.post._id, type)
          // Remove old reaction count
          if (this.userReaction && this.reactionCounts[this.userReaction] > 0) {
            this.reactionCounts[this.userReaction]--
          }
          // Add new reaction count
          this.userReaction = type
          this.reactionCounts[type]++
        }
        
        // Emit event for potential future use, but no reload needed
        this.$emit('reaction-changed', this.post._id)
      } catch (error) {
        console.error('Error toggling reaction:', error)
        // Reload on error to get correct state
        await this.loadUserReaction()
      }
    },
    async submitReport() {
      if (!this.selectedReportReason) return
      try {
        this.reporting = true
        await reactionsAPI.reportPost(this.post._id, this.selectedReportReason)
        alert('Post reported successfully. Thank you for helping keep our community safe.')
        this.closeReportModal()
      } catch (error) {
        console.error('Error reporting post:', error)
        alert(error.response?.data?.message || 'Failed to report post. Please try again.')
      } finally {
        this.reporting = false
      }
    },
    formatDate(date) {
      return moment(date).fromNow()
    },
    getImageUrl(photoUrl) {
      if (!photoUrl) return ''
      if (photoUrl.startsWith('http') || photoUrl.startsWith('/')) return photoUrl
      return `/uploads/${photoUrl}`
    },
    openImageModal() {
      this.showImageModal = true
    },
    closeImageModal() {
      this.showImageModal = false
    },
    closeReportModal() {
      this.showReportModal = false
      this.selectedReportReason = null
    }
  }
}
</script>

<style scoped>
/* Sticky Note with Tape - Brite Style! */
.sticky-note {
  position: relative;
  transition: all 0.3s ease;
  /* Brite-style bold shadow */
  box-shadow: 5px 5px 0 0 rgba(0, 0, 0, 0.3) !important;
}

.sticky-note:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 8px 8px 0 0 rgba(0, 0, 0, 0.4) !important;
}

/* Post Image Styling */
.post-image-container {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.post-image {
  cursor: pointer;
  height: 546px;
  width: 100%;
  object-fit: contain;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.post-image:hover {
  transform: scale(1.02);
  opacity: 0.95;
}

/* Tape Effect - Bold Brite Style */
.tape {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 100px;
  height: 30px;
  background: var(--tape-color, linear-gradient(to bottom, #ffd700 0%, #ffed4e 100%));
  border: 2px solid #000;
  border-radius: 3px;
  opacity: 0.9;
  box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.tape::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-50%);
}

.tape::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(50%);
}

/* Add some padding to account for tape */
.sticky-note .card-header {
  margin-top: 8px;
}

/* Enhance card body for sticky note feel */
.sticky-note .card-body {
  background: inherit;
  padding: 1.5rem;
  font-family: 'Comic Sans MS', 'Marker Felt', cursive;
  line-height: 1.8;
}

.sticky-note .card-text {
  color: #000 !important;
  text-shadow: none;
  font-weight: 500;
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

/* Make footer match the note */
.sticky-note .card-footer {
  background: inherit;
  border-top: 2px solid #000;
}

/* Reaction Button Styling */
.reaction-button {
  transition: all 0.2s ease;
  position: relative;
}

.reaction-button:hover {
  transform: translateY(-2px);
}

/* Emoji Sizing - Prevent Stretching */
.reaction-emoji {
  width: 24px !important;
  height: 24px !important;
  object-fit: contain;
  display: inline-block;
  vertical-align: middle;
}

/* Click Animation for Reactions */
@keyframes reactionPop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.animate-click .reaction-emoji {
  animation: reactionPop 0.6s ease;
}

/* Active reaction button styling */
.reaction-button.active {
  background-color: #a2e436 !important;
  border-color: #000 !important;
  transform: scale(1.05);
}

.reaction-button.active .reaction-emoji {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.95;
}

/* Modal animations */
.modal.fade.show {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>