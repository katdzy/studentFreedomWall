<template>
  <div class="post-card">
    <div class="post-header">
      <div class="anonymous-info">
        <i class="fas fa-user-secret"></i>
        <span>Anonymous Student</span>
      </div>
      <div class="post-date">
        {{ formatDate(post.dateCreated) }}
      </div>
    </div>
    
    <div class="post-content">
      <p class="post-message">{{ post.messageContent }}</p>
      <div v-if="post.photoUrl" class="post-image">
        <img :src="getImageUrl(post.photoUrl)" :alt="'Post image'" @click="openImageModal" />
      </div>
    </div>
    
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
          <i :class="reaction.icon"></i>
          <span v-if="reactionCounts[reaction.type]">{{ reactionCounts[reaction.type] }}</span>
        </button>
      </div>
      
      <div class="post-meta">
        <span class="total-reactions">
          <i class="fas fa-heart"></i>
          {{ post.reactionCount || 0 }}
        </span>
        <button class="report-btn" @click="showReportModal = true" title="Report this post">
          <i class="fas fa-flag"></i>
        </button>
      </div>
    </div>
    
    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="modal-content">
        <img :src="getImageUrl(post.photoUrl)" alt="Full size image" />
        <button class="close-modal" @click="closeImageModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- Report Modal -->
    <div v-if="showReportModal" class="report-modal" @click="closeReportModal">
      <div class="modal-content" @click.stop>
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
  </div>
</template>

<script>
import { reactionsAPI } from '../services/api'
import moment from 'moment'

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
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
        { type: 'like', icon: 'fas fa-thumbs-up', label: 'Like' },
        { type: 'heart', icon: 'fas fa-heart', label: 'Love' },
        { type: 'thumbs_up', icon: 'fas fa-thumbs-up', label: 'Approve' },
        { type: 'laugh', icon: 'fas fa-laugh', label: 'Funny' },
        { type: 'wow', icon: 'fas fa-surprise', label: 'Wow' },
        { type: 'sad', icon: 'fas fa-sad-tear', label: 'Sad' }
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
          // Remove reaction
          await reactionsAPI.removeReaction(this.post._id)
          this.userReaction = null
        } else {
          // Add/change reaction
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
      return `http://localhost:3000${photoUrl}`
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
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px rgba(0,0,0,0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.anonymous-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-weight: 500;
}

.post-date {
  color: #adb5bd;
  font-size: 0.9rem;
}

.post-content {
  margin-bottom: 1.5rem;
}

.post-message {
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.post-image {
  margin-top: 1rem;
}

.post-image img {
  max-width: 100%;
  height: auto;
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
  border-top: 1px solid #e9ecef;
}

.reactions {
  display: flex;
  gap: 0.5rem;
}

.reaction-btn {
  background: transparent;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.reaction-btn:hover {
  background: #f8f9fa;
}

.reaction-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.total-reactions {
  color: #6c757d;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.report-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: color 0.3s;
}

.report-btn:hover {
  color: #dc3545;
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
  max-width: 90%;
  max-height: 90%;
}

.image-modal img {
  max-width: 100%;
  max-height: 100%;
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