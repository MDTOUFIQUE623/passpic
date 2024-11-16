import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import webhookRouter from './routes/webhookRoutes.js'
import imageRouter from './routes/imageRoutes.js'

// App Config
const app = express()

// Configure CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'https://passpic-omega.vercel.app',
        'https://passpic.vercel.app'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, x-api-key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Initialize Middleware with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Connect to MongoDB
connectDB().catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal Server Error'
    });
});

// API routes
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/user', userRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/image', imageRouter);

// Handle 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server Running on port ${PORT}`));
}

export default app;