import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        if (mongoose.connections[0].readyState) {
            console.log("Using existing MongoDB connection");
            return;
        }

        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in environment variables');
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const options = {
            dbName: 'passpic',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        };

        console.log('Connecting with options:', {
            ...options,
            uri: process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Hide credentials in logs
        });

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('\x1b[32m%s\x1b[0m', `MongoDB Connected Successfully!`);
        console.log(`Connected to database: ${conn.connection.name}`);
        console.log(`Host: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('\x1b[31m%s\x1b[0m', 'MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('\x1b[33m%s\x1b[0m', 'MongoDB disconnected');
        });

        mongoose.connection.on('connected', () => {
            console.log('\x1b[32m%s\x1b[0m', 'MongoDB connected');
        });

        return conn;

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', "MongoDB connection error:", error);
        console.error('Full error details:', error);
        throw error;
    }
};

export default connectDB;