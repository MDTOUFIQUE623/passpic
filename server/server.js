import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoutes.js'
import webhookRouter from './routes/webhookRoutes.js'
import imageRouter from './routes/imageRoutes.js'
import errorHandler from './middlewares/errorHandler.js'

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// App Config
const app = express()

// Initialize Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://passpic-omega.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-api-key']
}));

app.use(express.json({ limit: '30mb' }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use('/api/webhooks', express.raw({ type: 'application/json' }))

// Connect to MongoDB
connectDB().catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});

// API routes
app.get('/', (req, res) => res.send("API Working"))
app.use('/api/user', userRouter)
app.use('/api/webhooks', webhookRouter)
app.use('/api/image', imageRouter)

// Error handling middleware
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`Server Running on port ${PORT}`))
}

export default app;