<template>
  <img
    ref="imgRef"
    :class="{ 'lazy-loading': !loaded, 'lazy-loaded': loaded }"
    :src="loaded ? src : placeholder"
    :alt="alt"
    @load="onLoad"
    @error="onError"
  />
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E'
    }
  },
  data() {
    return {
      loaded: false,
      observer: null
    }
  },
  mounted() {
    this.initIntersectionObserver()
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    initIntersectionObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage()
            this.observer.unobserve(this.$refs.imgRef)
          }
        })
      }, {
        rootMargin: '50px' // Start loading 50px before entering viewport
      })
      
      if (this.$refs.imgRef) {
        this.observer.observe(this.$refs.imgRef)
      }
    },
    loadImage() {
      const img = new Image()
      img.onload = () => {
        this.loaded = true
      }
      img.onerror = () => {
        this.$emit('error')
      }
      img.src = this.src
    },
    onLoad() {
      this.$emit('load')
    },
    onError() {
      this.$emit('error')
    }
  }
}
</script>

<style scoped>
img {
  max-width: 100%;
  height: auto;
  transition: opacity 0.3s ease-in-out;
}

.lazy-loading {
  opacity: 0.5;
  filter: blur(5px);
}

.lazy-loaded {
  opacity: 1;
  filter: none;
}
</style>

