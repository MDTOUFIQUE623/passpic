import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
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

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log('MongoDB Connected');

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        return conn;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};

export default connectDB;