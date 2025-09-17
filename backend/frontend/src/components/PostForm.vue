<template>
  <div class="post-form-container">
    <form @submit.prevent="submitPost" class="post-form">
      <h3>
        <i class="fas fa-pen"></i>
        Create Anonymous Post
      </h3>
      
      <div class="form-group">
        <textarea
          v-model="messageContent"
          placeholder="What's on your mind? Share your thoughts anonymously..."
          rows="4"
          maxlength="1000"
          required
        ></textarea>
        <div class="char-count">
          {{ messageContent.length }}/1000
        </div>
      </div>
      
      <div class="form-group">
        <label class="file-input-label">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept="image/*"
            class="file-input"
          />
          <i class="fas fa-image"></i>
          Add Photo (Optional)
        </label>
        <div v-if="selectedFile" class="file-preview">
          <img :src="previewUrl" alt="Preview" class="preview-image" />
          <button type="button" @click="removeFile" class="remove-file">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="submitting || !messageContent.trim()" class="submit-btn">
          <i class="fas fa-paper-plane"></i>
          <span v-if="submitting">Posting...</span>
          <span v-else>Post Anonymously</span>
        </button>
      </div>
      
      <div class="disclaimer">
        <i class="fas fa-info-circle"></i>
        Your post will be reviewed before appearing on the wall. Please be respectful and follow community guidelines.
      </div>
    </form>
    
    <!-- Success Message -->
    <div v-if="showSuccess" class="success-message">
      <i class="fas fa-check-circle"></i>
      Post submitted successfully! It will appear after admin approval.
    </div>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ errorMessage }}
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
.post-form-container {
  margin-bottom: 2rem;
}

.post-form {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.post-form h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

textarea {
  width: 100%;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
  min-height: 100px;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
}

.char-count {
  position: absolute;
  bottom: -25px;
  right: 0;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.file-input-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  padding: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  color: #6c757d;
}

.file-input-label:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.file-input {
  display: none;
}

.file-preview {
  margin-top: 1rem;
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.remove-file {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.disclaimer {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  color: #0056b3;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>