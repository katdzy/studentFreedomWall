# 🎓 Student Freedom Wall

> A safe digital space for students to express their thoughts, emotions, and beliefs without fear of repercussions.

## About

In today's internet era, students want a safe area to express their thoughts, emotions, and beliefs without fear of repercussions. The Online Student Freedom Wall project was created to meet this need by providing a safe, inclusive, and interactive online platform for students. It enables students to contribute their tales, experiences, and ideas anonymously, fostering open communication and self-expression within their community.

Traditional physical freedom walls have long been a feature of college life, providing a creative opportunity for students to express their thoughts. However, these physical limits frequently encounter constraints such as harassment, limited size, and a lack of adequate regulation. The Online Student Freedom Wall tries to overcome these issues by bringing the concept into the digital realm. This allows students to continually publish messages, respond to others' thoughts, and communicate meaningfully without the limits of physical space.

## Features

### Core Functionality
- **Anonymous Posting**: Share thoughts, experiences, and ideas without revealing identity
- **Real-time Interactions**: Live reactions and comments using WebSocket technology
- **Content Moderation**: AI-powered content filtering and admin moderation system
- **Mobile-First Design**: Fully responsive interface optimized for all devices
- **Image Sharing**: Upload and share images with posts using Cloudinary integration

### Safety & Moderation
- **Content Filtering**: Automatic detection and filtering of inappropriate content
- **Report System**: Users can report posts for review
- **Admin Dashboard**: Comprehensive moderation tools for administrators
- **Rate Limiting**: Prevents spam and abuse
- **Secure Authentication**: JWT-based authentication system

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern UI with easy navigation
- **Real-time Updates**: Live notifications and updates
- **Accessibility**: Built with accessibility best practices
- **Performance Optimized**: Fast loading and smooth interactions

## 🛠️ Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and development server
- **Bootstrap 5** - CSS framework for responsive design
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **Moment.js** - Date manipulation and formatting

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Cloud-based image and video management
- **Helmet** - Security middleware
- **CORS** - Cross-Origin Resource Sharing

### Deployment
- **Render** - Backend hosting and deployment
- **Vercel** - Frontend hosting and deployment
- **MongoDB Atlas** - Cloud database service
- **Cloudinary** - Cloud media management

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/student-freedom-wall.git
   cd student-freedom-wall/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-freedom-wall
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   PORT=10000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:8080
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:10000
   VITE_SOCKET_URL=http://localhost:10000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

### Backend (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy on Render**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

### Frontend (Vercel)

1. **Deploy on Vercel**
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Configure environment variables
   - Deploy automatically

### Environment Variables for Production

**Backend (Render):**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-render-app.onrender.com
VITE_SOCKET_URL=https://your-render-app.onrender.com
```

## Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted interface for touch interaction
- **Mobile**: Icon-only navigation and touch-friendly controls
- **Breakpoints**: 750px, 470px, 375px for smooth scaling

## Security Features

- **Content Filtering**: AI-powered inappropriate content detection
- **Rate Limiting**: Prevents spam and abuse
- **CORS Protection**: Secure cross-origin requests
- **Helmet Security**: Security headers and protection
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs

## Admin Features

- **Dashboard**: Comprehensive admin control panel
- **Post Management**: Approve, reject, or delete posts
- **User Reports**: Review and manage user reports
- **Analytics**: View statistics and insights
- **Content Moderation**: Bulk actions and filtering

## Team

| Full Name | Role | Email |
|-----------|------|-------|
| **Karl Andrei T. Dungca** | Project Manager/Web Developer | andreidungca6@gmail.com |
| **Aaron Daniel L. Lozano** | Web Developer | l0zd4n3.aa@gmail.com |
| **Antoinette Joyze M. Magat** | Application Tester | joyzemagat@gmail.com |
| **Micko Adrielle S. de Dios** | Web Design | dediosmicko@gmail.com |
| **Dainiel Timothy S. Trivino** | Web Design | trivinodainieltimothy@gmail.com |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at [andreidungca6@gmail.com](mailto:andreidungca6@gmail.com)
- Check the documentation in the `/docs` folder

---

**Made with ❤️ for students, by students**


