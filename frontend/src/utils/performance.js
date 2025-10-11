// Performance monitoring utilities

const isDevelopment = import.meta.env.DEV;

/**
 * Measure and log component render time
 * @param {string} componentName - Name of the component
 * @param {Function} callback - Function to measure
 */
export const measurePerformance = (componentName, callback) => {
  if (!isDevelopment) return callback();
  
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  
  console.log(`[Perf] ${componentName}: ${(end - start).toFixed(2)}ms`);
  return result;
};

/**
 * Debounce function for optimizing frequent operations
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for rate-limiting operations
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load images with intersection observer
 * @param {HTMLElement} img - Image element
 */
export const lazyLoadImage = (img) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.classList.remove('lazy');
        observer.unobserve(lazyImage);
      }
    });
  });
  
  observer.observe(img);
};

/**
 * Preload critical resources
 * @param {string} url - Resource URL
 * @param {string} as - Resource type (script, style, image, etc.)
 */
export const preloadResource = (url, as = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Simple memory cache with TTL
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 60000) { // Default 1 minute
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const memoryCache = new MemoryCache();

/**
 * Log performance metrics in development
 */
export const logWebVitals = () => {
  if (!isDevelopment) return;

  // Log paint timing
  if (window.performance && window.performance.getEntriesByType) {
    const paintEntries = window.performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      console.log(`[WebVitals] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    });
  }

  // Log navigation timing
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    console.log('[WebVitals] Page Load Time:', pageLoadTime + 'ms');
    console.log('[WebVitals] Connect Time:', connectTime + 'ms');
    console.log('[WebVitals] Render Time:', renderTime + 'ms');
  });
};

// Initialize web vitals logging in development
if (isDevelopment) {
  logWebVitals();
}

