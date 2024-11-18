import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import webhookRouter from './routes/webhookRoutes.js'
import imageRouter from './routes/imageRoutes.js'

// App Config
const app = express()

// Initialize Middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'https://passpic-omega.vercel.app', 'https://passpic-omega.vercel.app/result'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-api-key', 'Access-Control-Allow-Origin'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    credentials: true
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token, x-api-key');
    next();
});

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use('/api/webhooks', express.raw({ type: 'application/json' }))

// Connect to MongoDB
connectDB().catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// API routes
app.get('/', (req, res) => res.send("API Working"))
app.use('/api/user', userRouter)
app.use('/api/webhooks', webhookRouter)
app.use('/api/image', imageRouter)

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`Server Running on port ${PORT}`))
}

export default app;