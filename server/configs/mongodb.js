import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log('Attempting MongoDB connection...');

        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing from environment variables');
            throw new Error('MONGODB_URI is not defined');
        }

        const options = {
            dbName: 'passpic',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 10000,
            compressors: "zlib"
        };

        if (mongoose.connections[0].readyState) {
            console.log("Using existing MongoDB connection");
            return mongoose.connections[0];
        }

        console.log('Creating new MongoDB connection...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log(`MongoDB Connected to: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected');
        });

        return conn;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        console.error('Error details:', error.message);
        throw error;
    }
};

export default connectDB;