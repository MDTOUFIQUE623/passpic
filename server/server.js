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
app.use(cors());

app.use(express.json({ limit: '10mb' }))
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

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`Server Running on port ${PORT}`))
}

export default app;