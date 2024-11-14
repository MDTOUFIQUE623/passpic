import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log("Already connected to MongoDB");
            return;
        }

        await mongoose.connect(`${process.env.MONGODB_URI}/passpic`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log("Database Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

export default connectDB;