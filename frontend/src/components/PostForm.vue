<template>
  <div class="post-form-container mb-4">
    <div class="card border border-dark border-2 shadow">
      <div class="card-header bg-primary text-dark border-bottom border-dark border-2">
        <h3 class="mb-0 fw-bold">
          <i class="bi bi-pencil-square me-2"></i>
          Create Anonymous Post
        </h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitPost">
          <!-- Textarea -->
          <div class="mb-3">
            <textarea
              v-model="messageContent"
              class="form-control border border-dark border-2"
              placeholder="What's on your mind? Share your thoughts anonymously..."
              rows="5"
              maxlength="1000"
              required
            ></textarea>
            <div class="text-end text-muted small mt-1">
              <i class="bi bi-chat-left-text me-1"></i>
              {{ messageContent.length }}/1000 characters
            </div>
          </div>
          
          <!-- File Upload -->
          <div class="mb-3">
            <label class="btn btn-outline-dark w-100">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                accept="image/*"
                class="d-none"
              />
              <i class="bi bi-image me-2"></i>
              Add Photo (Optional)
            </label>
            
            <div v-if="selectedFile" class="mt-3 position-relative">
              <img :src="previewUrl" alt="Preview" class="img-fluid rounded border border-dark border-2" />
              <button 
                type="button" 
                @click="removeFile" 
                class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          
          <!-- Submit Button -->
          <div class="d-grid">
            <button 
              type="submit" 
              :disabled="submitting || !messageContent.trim()" 
              class="btn btn-primary btn-lg fw-bold"
            >
              <span v-if="submitting">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Posting...
              </span>
              <span v-else>
                <i class="bi bi-send-fill me-2"></i>
                Post Anonymously
              </span>
            </button>
          </div>
          
          <!-- Disclaimer -->
          <div class="alert alert-info border border-dark border-2 mt-3 mb-0">
            <i class="bi bi-info-circle-fill me-2"></i>
            <small>Your post will be reviewed before appearing on the wall. Please be respectful and follow community guidelines.</small>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Success Message -->
    <div v-if="showSuccess" class="alert alert-success border border-dark border-2 shadow mt-3">
      <i class="bi bi-check-circle-fill me-2"></i>
      <strong>Post submitted successfully!</strong> It will appear after admin approval.
    </div>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger border border-dark border-2 shadow mt-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>{{ errorMessage }}</strong>
    </div>
  </div>
</template>

<script>
import { postsAPI } from '../services/api'

export default {
  name: 'PostForm',
  data() {
    return {
      messageContent: '',
      selectedFile: null,
      previewUrl: null,
      submitting: false,
      showSuccess: false,
      errorMessage: null
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = 'File size must be less than 5MB'
          return
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Please select an image file'
          return
        }
        
        this.selectedFile = file
        this.previewUrl = URL.createObjectURL(file)
        this.errorMessage = null
      }
    },
    
    removeFile() {
      this.selectedFile = null
      this.previewUrl = null
      this.$refs.fileInput.value = ''
    },
    
    async submitPost() {
      if (!this.messageContent.trim()) return
      
      try {
        this.submitting = true
        this.errorMessage = null
        
        const formData = new FormData()
        formData.append('messageContent', this.messageContent.trim())
        
        if (this.selectedFile) {
          formData.append('photo', this.selectedFile)
        }
        
        await postsAPI.createPost(formData)
        
        // Reset form
        this.messageContent = ''
        this.removeFile()
        
        // Show success message
        this.showSuccess = true
        setTimeout(() => {
          this.showSuccess = false
        }, 5000)
        
        this.$emit('post-created')
        
      } catch (error) {
        console.error('Error creating post:', error)
        this.errorMessage = error.response?.data?.message || 'Failed to create post. Please try again.'
      } finally {
        this.submitting = false
      }
    }
  },
  beforeUnmount() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
    }
  }
}
</script>

<style scoped>
/* Bootstrap Brite handles almost everything! */
.card-header {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}

.alert {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>