const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const isDevelopment = process.env.NODE_ENV !== 'production';

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const reactionRoutes = require('./routes/reactions');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Connection settings to prevent rapid reconnections
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  transports: ['websocket', 'polling']
});

app.set('trust proxy', 1);

// Compression middleware - compress all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress if response is larger than 1KB
}));

// Static files with caching (for any remaining local assets)
// Note: File uploads now use Cloudinary, so this is only for other static assets

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true
}));

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// After creating `server`
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// More lenient general rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Don't rate limit socket.io
  skip: (req) => {
    if (req.path.startsWith('/socket.io')) return true;
    // Allow feed loads freely
    if (req.method === 'GET' && req.path.startsWith('/api/posts')) return true;
    // Allow reaction GETs for per-card lightweight fetches
    if (req.method === 'GET' && req.path.startsWith('/api/reactions')) return true;
    return false;
  }
});

// Specific rate limiter for posts endpoint
const postsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests to posts endpoint, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  // Do not rate limit GET requests (listing posts)
  skip: (req) => req.method === 'GET'
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/posts', postsLimiter);
// More granular limiter for reactions: only throttle writes
const reactionsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET'
});

// Track user socket connections to prevent duplicates
const userSockets = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      if (isDevelopment) console.log('❌ No token provided');
      return next(new Error('Authentication error: No token'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userData = decoded;
    
    // Clean up old connection if exists
    const existingSocket = userSockets.get(decoded.id);
    if (existingSocket && existingSocket.id !== socket.id) {
      if (isDevelopment) console.log(`🧹 Disconnecting old socket for user ${decoded.id}`);
      existingSocket.disconnect(true);
      userSockets.delete(decoded.id);
    }
    
    if (isDevelopment) console.log(`✅ User authenticated: ${decoded.id}`);
    next();
  } catch (error) {
    console.error('❌ Socket authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    }
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  if (isDevelopment) console.log(`✅ User connected: ${socket.userId} (${socket.id})`);
  
  // Store this connection
  userSockets.set(socket.userId, socket);
  
  socket.on('disconnect', (reason) => {
    if (isDevelopment) console.log(`❌ User disconnected: ${socket.userId} - ${reason}`);
    
    // Only remove if this is the current socket for this user
    if (userSockets.get(socket.userId)?.id === socket.id) {
      userSockets.delete(socket.userId);
    }
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.userId}:`, error);
  });
});

// Log low-level engine.io connection errors only in development
if (isDevelopment) {
  io.engine.on('connection_error', (err) => {
    console.error('engine.io connection_error:', err);
  });
}

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB with optimized settings
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freedomwall', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Connection pool size
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
});

// Set mongoose options for better performance
mongoose.set('strictQuery', true);

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

db.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

db.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
// expose reactionsLimiter to router via app settings
app.set('reactionsLimiter', reactionsLimiter);
app.use('/api/reactions', reactionRoutes);

// Error handling middleware (using centralized handler)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Compression: enabled`);
  console.log(`🔒 Security: helmet enabled`);
});

// Only track connections in development mode
if (isDevelopment) {
  let activeConnections = 0;
  server.on('connection', (socket) => {
    activeConnections++;
    socket.on('close', () => {
      activeConnections--;
    });
  });

  // Log connection count every 30 seconds (less frequent)
  setInterval(() => {
    console.log(`[dev] active HTTP connections: ${activeConnections}`);
  }, 30000);
}

server.on('error', (err) => {
  console.error('❌ HTTP server error:', err);
});

// Add near the bottom of backend/server.js, before graceful shutdown
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED_REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION:', err);
});
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});