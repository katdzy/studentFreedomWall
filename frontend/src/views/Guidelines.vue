<template>
  <div class="container my-5">
    <!-- Hero Section -->
    <div class="text-center mb-5">
      <h1 class="display-3 fw-bold">
        <i class="bi bi-shield-check text-primary me-3"></i>
        Community Guidelines
      </h1>
      <p class="lead text-muted">Help us maintain a safe and respectful space for everyone</p>
    </div>

    <div class="row g-4 mb-5">
      <!-- Do's Section -->
      <div class="col-lg-6">
        <div class="card border border-success border-3 shadow-lg h-100">
          <div class="card-header bg-success text-white border-bottom border-success border-2">
            <div class="text-center">
              <img src="/emojis/check.png" alt="Do" class="main-icon mb-3" />
              <h2 class="fw-bold mb-0">What You Can Do</h2>
            </div>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-success">
                      <i class="bi bi-chat-heart me-2"></i>
                      Express Yourself Freely
                    </h5>
                    <p class="mb-0">Share your thoughts, experiences, and opinions in a respectful manner</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-success">
                      <i class="bi bi-heart-fill me-2"></i>
                      Support Your Peers
                    </h5>
                    <p class="mb-0">React positively to posts and create an encouraging environment</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-success">
                      <i class="bi bi-flag-fill me-2"></i>
                      Report Inappropriate Content
                    </h5>
                    <p class="mb-0">Help moderators keep the platform safe by reporting violations</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-success">
                      <i class="bi bi-lightbulb-fill me-2"></i>
                      Be Constructive
                    </h5>
                    <p class="mb-0">Share helpful advice, experiences, and positive messages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Don'ts Section -->
      <div class="col-lg-6">
        <div class="card border border-danger border-3 shadow-lg h-100">
          <div class="card-header bg-danger text-white border-bottom border-danger border-2">
            <div class="text-center">
              <img src="/emojis/x.png" alt="Don't" class="main-icon mb-3" />
              <h2 class="fw-bold mb-0">What's Not Allowed</h2>
            </div>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-danger">
                      <i class="bi bi-x-octagon-fill me-2"></i>
                      Hate Speech or Discrimination
                    </h5>
                    <p class="mb-0">No content targeting individuals based on race, religion, gender, or identity</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-danger">
                      <i class="bi bi-exclamation-triangle-fill me-2"></i>
                      Bullying or Harassment
                    </h5>
                    <p class="mb-0">Do not post content intended to intimidate, threaten, or harm others</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-danger">
                      <i class="bi bi-eye-slash-fill me-2"></i>
                      Explicit or Inappropriate Content
                    </h5>
                    <p class="mb-0">No sexually explicit, violent, or disturbing images or text</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-danger">
                      <i class="bi bi-person-x-fill me-2"></i>
                      Personal Information
                    </h5>
                    <p class="mb-0">Don't share personal details that could identify you or others</p>
                  </div>
                </div>
              </div>
              
              <div class="col-12">
                <div class="card border border-dark border-2 shadow-sm guideline-card">
                  <div class="card-body">
                    <h5 class="fw-bold text-danger">
                      <i class="bi bi-megaphone-fill me-2"></i>
                      Spam or Advertising
                    </h5>
                    <p class="mb-0">No promotional content, repeated posts, or irrelevant material</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Moderation Notice -->
    <div class="card border border-warning border-3 shadow-lg">
      <div class="card-header bg-warning text-dark border-bottom border-warning border-2">
        <h3 class="fw-bold mb-0">
          <i class="bi bi-info-circle-fill me-2"></i>
          Content Moderation
        </h3>
      </div>
      <div class="card-body p-4">
        <p class="lead mb-0">
          All posts are subject to review by our moderation team. Content violating these guidelines will be removed, and repeated violations may result in restricted access to the platform.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactionsAPI } from '../services/api'
import moment from 'moment'

export default {
  name: 'Guidelines',
  data() {
    return {
      // Add any reactive data here if needed
    }
  },
  mounted() {
    // Initialize component
    console.log('Guidelines component mounted')
  }
}
</script>

<style scoped>
/* Bootstrap Brite handles most styling! */
.container {
  max-width: 1200px;
}

/* Main Icon Styling */
.main-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
}

.main-icon:hover {
  transform: scale(1.1);
}

/* Guideline Cards */
.guideline-card {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.guideline-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border-color: #000 !important;
}

.guideline-card h5 {
  font-size: var(--font-size-lg);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.guideline-card p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: #495057;
}

/* Card Headers */
.card-header {
  border-radius: 12px 12px 0 0 !important;
  padding: 1.5rem;
}

.card-header h2 {
  font-size: var(--font-size-2xl);
}

/* Main Cards */
.card {
  border-radius: 15px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

/* Success Section */
.border-success {
  border-color: #198754 !important;
}

.bg-success {
  background: linear-gradient(135deg, #198754 0%, #20c997 100%) !important;
}

/* Danger Section */
.border-danger {
  border-color: #dc3545 !important;
}

.bg-danger {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%) !important;
}

/* Warning Section */
.border-warning {
  border-color: #ffc107 !important;
}

.bg-warning {
  background: linear-gradient(135deg, #ffc107 0%, #ffed4e 100%) !important;
}

/* Moderation Notice */
.lead {
  font-size: var(--font-size-lg);
  font-weight: 500;
  line-height: var(--line-height-relaxed);
}

/* Animation for card entry */
.card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation for guideline cards */
.guideline-card:nth-child(1) { animation-delay: 0.1s; }
.guideline-card:nth-child(2) { animation-delay: 0.2s; }
.guideline-card:nth-child(3) { animation-delay: 0.3s; }
.guideline-card:nth-child(4) { animation-delay: 0.4s; }
.guideline-card:nth-child(5) { animation-delay: 0.5s; }

/* Responsive Design */
@media (max-width: 768px) {
  .main-icon {
    width: 60px;
    height: 60px;
  }
  
  .card-header h2 {
    font-size: var(--font-size-xl);
  }
  
  .guideline-card h5 {
    font-size: var(--font-size-base);
  }
  
  .guideline-card p {
    font-size: var(--font-size-sm);
  }
  
  .lead {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
  
  .card-body {
    padding: 1rem !important;
  }
  
  .card-header {
    padding: 1rem !important;
  }
}

/* Icon animations */
.bi {
  transition: transform 0.2s ease;
}

.guideline-card:hover .bi {
  transform: scale(1.1);
}

/* Enhanced shadows */
.shadow-lg {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
}

.shadow-sm {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
}
</style>
