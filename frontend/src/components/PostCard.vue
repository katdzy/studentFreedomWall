<template>
  <div class="post-card" :style="{ 
    background: postColor.bg, 
    borderColor: postColor.border,
    '--tape-color': postColor.tape
  }">
    <!-- Header -->
    <div class="post-header">
      <div class="anonymous-info">
        <i class="fas fa-user-secret"></i>
        <span>Anonymous Student</span>
      </div>
      <div class="post-date">
        {{ formatDate(post.dateCreated) }}
      </div>
    </div>

    <!-- Content -->
    <div class="post-content">
      <p class="post-message">{{ post.messageContent }}</p>
      <div v-if="post.photoUrl" class="post-image">
        <img
          :src="getImageUrl(post.photoUrl)"
          :alt="'Post image'"
          @click="openImageModal"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="post-actions">
      <div class="reactions">
        <button
          v-for="reaction in reactionTypes"
          :key="reaction.type"
          class="reaction-btn"
          :class="{ active: userReaction === reaction.type }"
          @click="toggleReaction(reaction.type)"
          :title="reaction.label"
        >
          <img :src="reaction.image" :alt="reaction.label" class="reaction-icon" />
          <span v-if="reactionCounts[reaction.type]">
            {{ reactionCounts[reaction.type] }}
          </span>
        </button>
      </div>

      <div class="post-meta">
        <span class="total-reactions">
          <img src="emojis/reactions.png" alt="Reactions" class="meta-icon" style="width:30px; height:30px"/>
          {{ totalReactions }}
        </span>
        <button class="report-btn" @click="showReportModal = true" title="Report this post">
          <img src="emojis/report.png" alt="Report" class="meta-icon" />
        </button>
      </div>
    </div>

    <teleport to="body">
    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click.self="closeImageModal">
      <div class="modal-content">
        <img :src="getImageUrl(post.photoUrl)" alt="Full size image" />
        <button class="close-modal" @click="closeImageModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <!-- Report Modal -->
    <div v-if="showReportModal" class="report-modal" @click.self="closeReportModal">
      <div class="modal-content">
        <h3>Report Post</h3>
        <p>Why are you reporting this post?</p>
        <div class="report-options">
          <label v-for="reason in reportReasons" :key="reason.value">
            <input type="radio" :value="reason.value" v-model="selectedReportReason">
            <span>{{ reason.label }}</span>
          </label>
        </div>
        <div class="modal-actions">
          <button @click="submitReport" :disabled="!selectedReportReason || reporting" class="report-submit">
            <span v-if="reporting">Reporting...</span>
            <span v-else>Submit Report</span>
          </button>
          <button @click="closeReportModal" class="cancel-btn">Cancel</button>
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
      reactionCounts: {},
      userReaction: null,
      showImageModal: false,
      showReportModal: false,
      selectedReportReason: null,
      reporting: false,
      reactionTypes: [
        { type: 'like', image: 'emojis/like.png', label: 'Like' },
        { type: 'heart', image: 'emojis/love.png', label: 'Love' },
        { type: 'laugh', image: 'emojis/haha.png', label: 'Funny' },
        { type: 'wow', image: 'emojis/wow.png', label: 'Wow' },
        { type: 'sad', image: 'emojis/sad.png', label: 'Sad' }
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
        { bg: 'linear-gradient(to bottom, #fef3e2 0%, #fce8c8 100%)', border: '#e8d5b7', tape: 'linear-gradient(to bottom, #f4d4a0 0%, #e8c68c 100%)' }, // Cream
        { bg: 'linear-gradient(to bottom, #ffe4e9 0%, #ffd4df 100%)', border: '#e8b7c7', tape: 'linear-gradient(to bottom, #ffb8c8 0%, #ffa4b8 100%)' }, // Pink
        { bg: 'linear-gradient(to bottom, #e0f2ff 0%, #cce7ff 100%)', border: '#b8d8f0', tape: 'linear-gradient(to bottom, #a8d0f0 0%, #94c4e8 100%)' }, // Blue
        { bg: 'linear-gradient(to bottom, #e8f5e9 0%, #d4ead5 100%)', border: '#b8d8b8', tape: 'linear-gradient(to bottom, #a8d0a8 0%, #94c494 100%)' }, // Green
        { bg: 'linear-gradient(to bottom, #f3e5f5 0%, #e8d5ea 100%)', border: '#d5b8d8', tape: 'linear-gradient(to bottom, #d0a8d0 0%, #c494c4 100%)' }, // Lavender
        { bg: 'linear-gradient(to bottom, #fff9e6 0%, #ffeecc 100%)', border: '#e8d8b7', tape: 'linear-gradient(to bottom, #f4e4a0 0%, #e8d88c 100%)' }, // Light Yellow
        { bg: 'linear-gradient(to bottom, #e1f5fe 0%, #d0ebf7 100%)', border: '#b8d8e8', tape: 'linear-gradient(to bottom, #a8d0e0 0%, #94c4d4 100%)' }, // Light Cyan
        { bg: 'linear-gradient(to bottom, #fce4ec 0%, #f8d4e0 100%)', border: '#e8b8c8', tape: 'linear-gradient(to bottom, #f0a8bc 0%, #e894ac 100%)' }  // Rose
      ]
      
      // Use post ID to consistently assign the same color to the same post
      const hash = this.post._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return colors[hash % colors.length]
    }
  },
  async mounted() {
    await this.loadReactions()
  },
  methods: {
    async loadReactions() {
      try {
        const response = await reactionsAPI.getReactions(this.post._id)
        this.reactionCounts = response.data.reactions
        this.userReaction = response.data.userReaction
      } catch (error) {
        console.error('Error loading reactions:', error)
      }
    },
    async toggleReaction(type) {
      try {
        if (this.userReaction === type) {
          await reactionsAPI.removeReaction(this.post._id)
          this.userReaction = null
        } else {
          await reactionsAPI.addReaction(this.post._id, type)
          this.userReaction = type
        }
        await this.loadReactions()
        this.$emit('reaction-changed', this.post._id)
      } catch (error) {
        console.error('Error toggling reaction:', error)
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
      // Handles both local file paths and hosted URLs
      if (!photoUrl) return ''
      if (photoUrl.startsWith('http') || photoUrl.startsWith('/')) return photoUrl
      return `/uploads/${photoUrl}` // adjust to your local uploads folder
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
.post-card {
  position: relative;
  /* background set by inline style */
  border-radius: 3px;
  padding: 2.5rem 1.5rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 
    0 1px 3px rgba(0,0,0,0.12),
    0 3px 8px rgba(0,0,0,0.08);
  border: 1px solid;
  transition: transform 0.2s, box-shadow 0.2s;
}

/* Tape effect at the top */
.post-card::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 80px;
  height: 25px;
  background: var(--tape-color, linear-gradient(to bottom, #f4d4a0 0%, #e8c68c 100%));
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 2px;
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}



.post-card:hover {
  transform: translateY(-4px) rotate(0.5deg);
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.15),
    0 8px 16px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
}

.anonymous-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-weight: 600;
}

.post-date {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.post-content {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.post-message {
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

.post-image {
  margin-top: 1rem;
  display: flex;
  justify-content: center;    
  align-items: center; 
}

.post-image img {
  max-width: 100%;
  max-height: 650px;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.post-image img:hover {
  transform: scale(1.02);
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
}

.reactions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reaction-btn {
  background: transparent;
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.reaction-btn:hover {
  background: rgba(255,255,255,0.9);
  transform: translateY(-2px);
}

.reaction-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.reaction-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.total-reactions {
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.meta-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.report-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: all 0.3s;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-btn:hover {
  opacity: 0.7;
}

.report-btn .meta-icon {
  filter: grayscale(20%);
  transition: filter 0.3s;
}

.report-btn:hover .meta-icon {
  filter: grayscale(0%);
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.image-modal .modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-modal img {
  max-width: 100%;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
}

.close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.report-modal .modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
}

.report-modal h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.report-options {
  margin: 1.5rem 0;
}

.report-options label {
  display: block;
  margin-bottom: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.report-options input[type="radio"] {
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.report-submit {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.report-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
</style>
