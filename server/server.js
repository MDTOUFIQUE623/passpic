import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import webhookRouter from './routes/webhookRoutes.js'
import imageRouter from './routes/imageRoutes.js'
import errorHandler from './middlewares/errorHandler.js'
import mlErrorHandler from './middlewares/mlErrorHandler.js'

const app = express()

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'https://passpic-omega.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-api-key'],
    credentials: true
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Special handling for webhook routes
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Initialize MongoDB connection immediately
console.log('Initializing server...');
connectDB().then(() => {
    console.log('Initial database connection established');
}).catch(err => {
    console.error('Failed to establish initial database connection:', err);
    process.exit(1);
});

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

app.use('/api/user', userRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/image', imageRouter);

// Error handling
app.use(mlErrorHandler);
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;