import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("Database connected"));
    mongoose.connection.on('error', (err) => console.error("Database error:", err.message));

    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error("MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.")
    }

    // MongoDB database names cannot contain spaces or quotes, so we use a safe name.
    const dbName = process.env.MONGODB_DB_NAME || 'st-theresas-hospital'
    await mongoose.connect(uri, { dbName });
}

export default connectDB;
