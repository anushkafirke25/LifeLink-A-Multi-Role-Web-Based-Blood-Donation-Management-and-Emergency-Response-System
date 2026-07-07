// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();
console.log('Has MONGO_URI?', !!process.env.MONGO_URI);


// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const hospitalRoutes = require('./routes/hospital');
const bloodbankRoutes = require('./routes/bloodbank');
const eventRoutes = require('./routes/events');

// Initialize express app
const app = express();

// Middleware (increase JSON limit so blood bank signature base64 can be sent)
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/bloodbank', bloodbankRoutes);
app.use('/api/events', eventRoutes);

console.log('Mounting /api/health');
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'LifeLink API is running',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'LifeLink API is running', status: 'healthy' });
});

// Error handling middleware
// Error handler (defensive)
app.use((err, req, res, next) => {
  if (!err) return next(); // don't run if no error was provided

  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';

  // Only log stack in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  } else {
    console.error(message);
  }

  return res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

app.get('/__routes', (req, res) => {
  const list = [];
  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      // Top-level routes
      const methods = Object.keys(m.route.methods).join(',').toUpperCase();
      list.push({ method: methods, path: m.route.path });
    } else if (m.name === 'router' && m.handle.stack) {
      // Mounted routers (/api/auth, /api/donor, etc.)
      m.handle.stack.forEach((h) => {
        const route = h.route;
        if (route) {
          const methods = Object.keys(route.methods).join(',').toUpperCase();
          // m.regexp is like /^\/api\/auth\/?(?=\/|$)/i — extract the mount path
          const mount = m.regexp?.toString().match(/\\\/api\\\/[^\\]+/i)?.[0]?.replace(/\\\//g,'/').replace(/\\\?/g,'?').replace(/^\//,'') || '(unknown mount)';
          list.push({ method: methods, path: `/${mount}${route.path}` });
        }
      });
    }
  });
  res.json(list);
});
