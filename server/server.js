import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './configs/mongodb.js'

// App Config
const app = express()

// Initialize Middleware
app.use(express.json())
app.use(cors())

// Connect to MongoDB
connectDB().catch(console.error);

// API routes
app.get('/', (req, res) => res.status(200).json("API Working"))

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log("Server Running on port " + PORT))
}

export default app;