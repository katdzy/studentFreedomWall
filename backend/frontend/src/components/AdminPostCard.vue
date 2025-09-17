<template>
  <div class="admin-post-card" :class="'status-' + post.status">
    <div class="post-header">
      <div class="post-info">
        <div class="status-badge" :class="post.status">
          <i :class="getStatusIcon(post.status)"></i>
          {{ post.status.toUpperCase() }}
        </div>
        <div class="post-date">
          {{ formatDate(post.dateCreated) }}
        </div>
      </div>
      
      <div class="post-actions">
        <button 
          v-if="post.status === 'pending'"
          @click="approvePost" 
          :disabled="processing"
          class="action-btn approve"
          title="Approve Post"
        >
          <i class="fas fa-check"></i>
        </button>
        
        <button 
          v-if="post.status === 'pending'"
          @click="rejectPost" 
          :disabled="processing"
          class="action-btn reject"
          title="Reject Post"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <button 
          @click="deletePost" 
          :disabled="processing"
          class="action-btn delete"
          title="Delete Post"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="post-content">
      <p class="post-message">{{ post.messageContent }}</p>
      <div v-if="post.photoUrl" class="post-image">
        <img :src="getImageUrl(post.photoUrl)" alt="Post image" @click="openImageModal" />
      </div>
    </div>
    
    <div class="post-meta">
      <div class="meta-item">
        <i class="fas fa-heart"></i>
        <span>{{ post.reactionCount || 0 }} reactions</span>
      </div>
      <div class="meta-item">
        <i class="fas fa-calendar"></i>
        <span>{{ formatDate(post.dateCreated) }}</span>
      </div>
      <div v-if="showReportInfo" class="meta-item report-info">
        <i class="fas fa-flag"></i>
        <span>This post has been reported</span>
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
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="confirm-modal" @click="closeConfirmModal">
      <div class="modal-content" @click.stop>
        <h3>{{ confirmAction.title }}</h3>
        <p>{{ confirmAction.message }}</p>
        <div class="modal-actions">
          <button @click="confirmAction.handler" :disabled="processing" class="confirm-btn">
            <span v-if="processing">Processing...</span>
            <span v-else>{{ confirmAction.confirmText }}</span>
          </button>
          <button @click="closeConfirmModal" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { adminAPI } from '../services/api'
import moment from 'moment'

export default {
  name: 'AdminPostCard',
  props: {
    post: {
      type: Object,
      required: true
    },
    showReportInfo: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      processing: false,
      showImageModal: false,
      showConfirmModal: false,
      confirmAction: {}
    }
  },
  methods: {
    getStatusIcon(status) {
      const icons = {
        pending: 'fas fa-clock',
        approved: 'fas fa-check-circle',
        rejected: 'fas fa-times-circle'
      }
      return icons[status] || 'fas fa-question-circle'
    },
    
    approvePost() {
      this.showConfirmation({
        title: 'Approve Post',
        message: 'Are you sure you want to approve this post? It will be visible to all users.',
        confirmText: 'Approve',
        handler: this.handleApprove
      })
    },
    
    rejectPost() {
      this.showConfirmation({
        title: 'Reject Post',
        message: 'Are you sure you want to reject this post? It will not be visible to users.',
        confirmText: 'Reject',
        handler: this.handleReject
      })
    },
    
    deletePost() {
      this.showConfirmation({
        title: 'Delete Post',
        message: 'Are you sure you want to permanently delete this post? This action cannot be undone.',
        confirmText: 'Delete',
        handler: this.handleDelete
      })
    },
    
    async handleApprove() {
      try {
        this.processing = true
        await adminAPI.approvePost(this.post._id)
        this.$emit('post-approved', this.post._id)
        this.closeConfirmModal()
      } catch (error) {
        console.error('Error approving post:', error)
        alert('Failed to approve post. Please try again.')
      } finally {
        this.processing = false
      }
    },
    
    async handleReject() {
      try {
        this.processing = true
        await adminAPI.rejectPost(this.post._id)
        this.$emit('post-rejected', this.post._id)
        this.closeConfirmModal()
      } catch (error) {
        console.error('Error rejecting post:', error)
        alert('Failed to reject post. Please try again.')
      } finally {
        this.processing = false
      }
    },
    
    async handleDelete() {
      try {
        this.processing = true
        await adminAPI.deletePost(this.post._id)
        this.$emit('post-deleted', this.post._id)
        this.closeConfirmModal()
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post. Please try again.')
      } finally {
        this.processing = false
      }
    },
    
    showConfirmation(action) {
      this.confirmAction = action
      this.showConfirmModal = true
    },
    
    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmAction = {}
    },
    
    openImageModal() {
      this.showImageModal = true
    },
    
    closeImageModal() {
      this.showImageModal = false
    },
    
    formatDate(date) {
      return moment(date).format('MMM DD, YYYY HH:mm')
    },
    
    getImageUrl(photoUrl) {
      return `http://localhost:3000${photoUrl}`
    }
  }
}
</script>

<style scoped>
.admin-post-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.admin-post-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.status-pending {
  border-left: 4px solid #ffc107;
}

.status-approved {
  border-left: 4px solid #28a745;
}

.status-rejected {
  border-left: 4px solid #dc3545;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f8f9fa;
}

.post-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.post-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.approve {
  background: #28a745;
  color: white;
}

.action-btn.approve:hover:not(:disabled) {
  background: #218838;
}

.action-btn.reject {
  background: #ffc107;
  color: #212529;
}

.action-btn.reject:hover:not(:disabled) {
  background: #e0a800;
}

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover:not(:disabled) {
  background: #c82333;
}

.post-content {
  margin-bottom: 1rem;
}

.post-message {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.post-image {
  margin-top: 1rem;
}

.post-image img {
  max-width: 300px;
  height: auto;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.post-image img:hover {
  transform: scale(1.02);
}

.post-meta {
  display: flex;
  gap: 1.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  padding-top: 1rem;
  border-top: 1px solid #f8f9fa;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.report-info {
  color: #dc3545;
  font-weight: 500;
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

.confirm-modal {
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

.confirm-modal .modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
}

.confirm-modal h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.confirm-modal p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.confirm-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-btn:disabled {
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