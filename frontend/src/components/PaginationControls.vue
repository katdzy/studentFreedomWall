<template>
  <div class="pagination-container mt-4">
    <nav aria-label="Pagination Navigation">
      <div class="d-flex justify-content-between align-items-center">
        <!-- Page Info -->
        <div class="pagination-info">
          <span class="text-muted">
            <i class="bi bi-info-circle me-1"></i>
            Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
            <span v-if="totalPages > 1" class="ms-2">
              (Page {{ currentPage }} of {{ totalPages }})
            </span>
          </span>
        </div>
        
        <!-- Pagination Controls -->
        <ul class="pagination pagination-lg mb-0">
          <!-- First Page -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button 
              class="page-link border border-dark border-2 fw-bold"
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              title="First page"
            >
              <i class="bi bi-chevron-double-left"></i>
            </button>
          </li>
          
          <!-- Previous Page -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button 
              class="page-link border border-dark border-2 fw-bold"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              title="Previous page"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <!-- Page Numbers -->
          <li 
            v-for="page in visiblePages" 
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button 
              class="page-link border border-dark border-2 fw-bold"
              :class="{ 'bg-primary text-white': page === currentPage }"
              @click="goToPage(page)"
              :disabled="isLoading"
              :title="`Go to page ${page}`"
            >
              {{ page }}
            </button>
          </li>
          
          <!-- Next Page -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button 
              class="page-link border border-dark border-2 fw-bold"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              title="Next page"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
          
          <!-- Last Page -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button 
              class="page-link border border-dark border-2 fw-bold"
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              title="Last page"
            >
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
        
        <!-- Items per page selector -->
        <div class="pagination-size">
          <label class="form-label small fw-bold text-muted mb-1">Items per page:</label>
          <select 
            v-model="localItemsPerPage" 
            @change="changeItemsPerPage"
            class="form-select form-select-sm border border-dark border-2 fw-bold"
            style="width: auto;"
            :disabled="isLoading"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'PaginationControls',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localItemsPerPage: this.itemsPerPage
    }
  },
  computed: {
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage && !this.isLoading) {
        this.$emit('page-changed', page)
      }
    },
    changeItemsPerPage() {
      if (!this.isLoading) {
        this.$emit('items-per-page-changed', parseInt(this.localItemsPerPage))
      }
    }
  },
  watch: {
    itemsPerPage(newVal) {
      this.localItemsPerPage = newVal
    }
  }
}
</script>

<style scoped>
.pagination-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #000;
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.pagination .page-link {
  color: #000;
  background: #fff;
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
  min-width: 45px;
  text-align: center;
}

.pagination .page-link:hover:not(:disabled) {
  background: #0d6efd;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.pagination .page-item.active .page-link {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.pagination .page-item.disabled .page-link {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-info {
  font-weight: 600;
  color: #495057;
}

.pagination-size select {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pagination-size select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.pagination .page-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-size {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.pagination-size .form-label {
  margin-bottom: 0;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pagination-container .d-flex {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .pagination .page-link {
    min-width: 40px;
    padding: 0.5rem 0.75rem;
  }
}
</style>
