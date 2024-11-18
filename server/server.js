import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import webhookRouter from './routes/webhookRoutes.js'
import imageRouter from './routes/imageRoutes.js'
import errorHandler from './middlewares/errorHandler.js'
import mlErrorHandler from './middlewares/mlErrorHandler.js'

const app = express()

// Initialize server
console.log('Initializing server...');

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'https://passpic-omega.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-api-key'],
    credentials: true
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Body parser middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Special handling for webhook routes
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Database connection state
let isConnected = false;

// Connect to MongoDB (with connection reuse for serverless)
const connectToDb = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        await connectDB();
        isConnected = true;
        console.log('Database connection established');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

// Initial database connection
connectToDb().catch(err => {
    console.error('Initial database connection failed:', err);
});

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectToDb();
        next();
    } catch (error) {
        console.error('Database connection middleware error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed' 
        });
    }
});

// Base API route
app.get('/api', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is running',
        version: '1.0.0'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true,
        status: 'ok', 
        environment: process.env.NODE_ENV,
        dbConnected: isConnected,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/user', userRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/image', imageRouter);

// Error handling
app.use(mlErrorHandler);
app.use(errorHandler);

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        success: false, 
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
} else {
    app.listen(PORT, () => {
        console.log('Server started in production mode');
    });
}

export default app;