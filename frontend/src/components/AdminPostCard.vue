<template>
  <div class="admin-post-card card border border-dark border-3 shadow-lg" :class="'status-' + post.status">
    <!-- Header -->
    <div class="card-header border-bottom border-dark border-2" :class="getHeaderClass()">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="status-badge" :class="post.status">
            <i :class="getStatusIconClass(post.status)" class="me-1"></i>
            {{ post.status.toUpperCase() }}
          </div>
          <div class="post-date text-muted">
            <i class="bi bi-clock me-1"></i>
            {{ formatRelativeDate(post.dateCreated) }}
          </div>
        </div>

        <div class="post-actions">
          <button 
            v-if="post.status === 'pending'"
            @click="approvePost" 
            :disabled="processing"
            class="btn btn-success btn-sm fw-bold me-2"
            title="Approve Post"
          >
            <i class="bi bi-check-circle me-1"></i>
            Approve
          </button>

          <button 
            v-if="post.status === 'pending'"
            @click="rejectPost" 
            :disabled="processing"
            class="btn btn-warning btn-sm fw-bold me-2"
            title="Reject Post"
          >
            <i class="bi bi-x-circle me-1"></i>
            Reject
          </button>

          <button 
            @click="deletePost" 
            :disabled="processing"
            class="btn btn-danger btn-sm fw-bold"
            title="Delete Post"
          >
            <i class="bi bi-trash me-1"></i>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="card-body">
      <div class="post-content">
        <p class="post-message lead mb-3">{{ post.messageContent }}</p>
        <div v-if="post.photoUrl" class="post-image text-center">
          <img :src="getImageUrl(post.photoUrl)" alt="Post image" class="img-fluid rounded border border-dark border-2" @click="openImageModal" />
        </div>
      </div>
    </div>

    <!-- Meta Footer -->
    <div class="card-footer border-top border-dark border-2 bg-light">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex gap-3">
          <div class="meta-item">
            <i class="bi bi-heart-fill text-danger me-1"></i>
            <span class="fw-bold">{{ post.reactionCount || 0 }} reactions</span>
          </div>
          <div v-if="showReportInfo" class="meta-item report-info">
            <i class="bi bi-flag-fill text-danger me-1"></i>
            <span class="fw-bold text-danger">Reported</span>
          </div>
        </div>
        <div class="text-muted small">
          <i class="bi bi-calendar me-1"></i>
          {{ formatFullDate(post.dateCreated) }}
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="modal-content">
        <img :src="getImageUrl(post.photoUrl)" alt="Full size image" />
        <button class="close-modal" @click="closeImageModal">
          <span class="icon">✖</span>
        </button>
      </div>
    </div>

    <!-- Confirmation Modal (Bootstrap) -->
    <teleport to="body">
      <div v-if="showConfirmModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);" @click.self="closeConfirmModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border border-dark border-3 shadow-lg">
            <div class="modal-header border-bottom border-dark border-2" :class="getModalHeaderClass()">
              <h5 class="modal-title fw-bold">
                <i :class="getModalIcon()" class="me-2"></i>
                {{ confirmAction.title }}
              </h5>
              <button type="button" class="btn-close" @click="closeConfirmModal"></button>
            </div>
            <div class="modal-body p-4">
              <p class="lead mb-3">{{ confirmAction.message }}</p>
              <div class="alert alert-warning border border-dark border-2" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Warning:</strong> This action cannot be undone.
              </div>
            </div>
            <div class="modal-footer border-top border-dark border-2">
              <button 
                @click="closeConfirmModal" 
                class="btn btn-outline-dark fw-bold"
                :disabled="processing"
              >
                <i class="bi bi-x-circle me-2"></i>
                Cancel
              </button>
              <button 
                @click="confirmAction.handler" 
                :disabled="processing" 
                class="btn fw-bold"
                :class="getConfirmButtonClass()"
              >
                <span v-if="processing">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </span>
                <span v-else>
                  <i :class="getConfirmIcon()" class="me-2"></i>
                  {{ confirmAction.confirmText }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { adminAPI } from '../services/api'
import moment from 'moment'

export default {
  name: 'AdminPostCard',
  props: {
    post: { type: Object, required: true },
    showReportInfo: { type: Boolean, default: false }
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
        pending: '🕒',
        approved: '✅',
        rejected: '❌'
      }
      return icons[status] || '❓'
    },
    
    getStatusIconClass(status) {
      const icons = {
        pending: 'bi bi-clock-fill',
        approved: 'bi bi-check-circle-fill',
        rejected: 'bi bi-x-circle-fill'
      }
      return icons[status] || 'bi bi-question-circle-fill'
    },
    
    getHeaderClass() {
      if (this.post.status === 'pending') {
        return 'bg-warning text-dark'
      } else if (this.post.status === 'approved') {
        return 'bg-success text-white'
      } else if (this.post.status === 'rejected') {
        return 'bg-danger text-white'
      }
      return 'bg-primary text-white'
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
        
        // Show success message
        this.$emit('show-success', 'Post approved successfully')
      } catch (error) {
        console.error('Error approving post:', error)
        this.$emit('show-error', error.response?.data?.message || 'Failed to approve post. Please try again.')
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
        
        // Show success message
        this.$emit('show-success', 'Post rejected successfully')
      } catch (error) {
        console.error('Error rejecting post:', error)
        this.$emit('show-error', error.response?.data?.message || 'Failed to reject post. Please try again.')
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
        
        // Show success message
        this.$emit('show-success', 'Post deleted successfully')
      } catch (error) {
        console.error('Error deleting post:', error)
        this.$emit('show-error', error.response?.data?.message || 'Failed to delete post. Please try again.')
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
    formatRelativeDate(date) {
      return moment(date).fromNow()
    },
    formatFullDate(date) {
      return moment(date).format('MMM DD, YYYY HH:mm')
    },
    getImageUrl(photoUrl) {
      if (!photoUrl) return ''
      if (photoUrl.startsWith('http')) return photoUrl
      return `http://localhost:3000${photoUrl}`
    },
    
    getModalHeaderClass() {
      if (this.confirmAction.title?.includes('Delete')) {
        return 'bg-danger text-white'
      } else if (this.confirmAction.title?.includes('Approve')) {
        return 'bg-success text-white'
      } else if (this.confirmAction.title?.includes('Reject')) {
        return 'bg-warning text-dark'
      }
      return 'bg-primary text-white'
    },
    
    getModalIcon() {
      if (this.confirmAction.title?.includes('Delete')) {
        return 'bi bi-trash-fill'
      } else if (this.confirmAction.title?.includes('Approve')) {
        return 'bi bi-check-circle-fill'
      } else if (this.confirmAction.title?.includes('Reject')) {
        return 'bi bi-x-circle-fill'
      }
      return 'bi bi-question-circle-fill'
    },
    
    getConfirmButtonClass() {
      if (this.confirmAction.title?.includes('Delete')) {
        return 'btn-danger'
      } else if (this.confirmAction.title?.includes('Approve')) {
        return 'btn-success'
      } else if (this.confirmAction.title?.includes('Reject')) {
        return 'btn-warning'
      }
      return 'btn-primary'
    },
    
    getConfirmIcon() {
      if (this.confirmAction.title?.includes('Delete')) {
        return 'bi bi-trash-fill'
      } else if (this.confirmAction.title?.includes('Approve')) {
        return 'bi bi-check-circle-fill'
      } else if (this.confirmAction.title?.includes('Reject')) {
        return 'bi bi-x-circle-fill'
      }
      return 'bi bi-check-circle-fill'
    }
  }
}
</script>

<style scoped>
/* Admin Post Card - Bootstrap Brite Theme */
.admin-post-card {
  border-radius: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.admin-post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

/* Status-based styling */
.status-pending { 
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.status-approved { 
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

.status-rejected { 
  background: linear-gradient(135deg, #ffeaea 0%, #ffffff 100%);
}

/* Card Header */
.card-header {
  border-radius: 15px 15px 0 0 !important;
  padding: 1rem 1.5rem;
  font-weight: 700;
}

/* Status Badge */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: var(--font-size-sm);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  border: 2px solid #000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge.pending { 
  background: #fff3cd; 
  color: #856404; 
  border-color: #ffc107;
}

.status-badge.approved { 
  background: #d4edda; 
  color: #155724; 
  border-color: #28a745;
}

.status-badge.rejected { 
  background: #f8d7da; 
  color: #721c24; 
  border-color: #dc3545;
}

/* Post Date */
.post-date {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* Action Buttons */
.post-actions .btn {
  border-radius: 8px;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 2px solid #000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-actions .btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.post-actions .btn:active {
  transform: translateY(0);
}

/* Card Body */
.card-body {
  padding: 1.5rem;
  background: transparent;
}

/* Post Message */
.post-message {
  color: #2c3e50;
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
  font-size: var(--font-size-lg);
  font-weight: 500;
}

/* Post Image */
.post-image {
  margin-top: 1rem;
}

.post-image img {
  width: 100%;
  height: 468px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: contain;
}

.post-image img:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Card Footer */
.card-footer {
  border-radius: 0 0 15px 15px !important;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
}

/* Meta Items */
.meta-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.report-info {
  color: #dc3545 !important;
  font-weight: 700;
}

/* Image Modal */
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
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.image-modal img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 15px;
}

.close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  border: 2px solid #000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.close-modal:hover {
  background: #000;
  color: white;
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-post-card {
    margin-bottom: 1rem;
  }
  
  .card-header {
    padding: 0.75rem 1rem;
  }
  
  .card-header .d-flex {
    flex-direction: column !important;
    gap: 0.75rem !important;
    align-items: flex-start !important;
  }
  
  .card-header .d-flex .d-flex {
    flex-direction: row !important;
    align-items: center !important;
    width: 100%;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-footer {
    padding: 0.75rem 1rem;
  }
  
  .card-footer .d-flex {
    flex-direction: column !important;
    gap: 0.5rem !important;
    align-items: flex-start !important;
  }
  
  .card-footer .d-flex .d-flex {
    flex-direction: row !important;
    align-items: center !important;
  }
  
  .post-actions {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
  }
  
  .post-actions .btn {
    flex: 1 1 auto;
    min-width: 100px;
  }
  
  .status-badge {
    font-size: var(--font-size-xs);
    padding: 0.4rem 0.8rem;
  }
}

/* Animation for card entry */
.admin-post-card {
  animation: slideInUp 0.6s ease-out;
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

/* Modal Styles */
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

/* Enhanced Modal Styling */
.modal.show {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideInUp 0.3s ease-out;
}

.modal-header {
  border-radius: 15px 15px 0 0;
  padding: 1.5rem;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem;
  border-radius: 0 0 15px 15px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
}

/* Modal Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

/* Button Enhancements */
.btn {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 600;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

/* Alert Styling */
.alert {
  border-radius: 10px;
  font-weight: 500;
}

/* Spinner Animation */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
