import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
export const db = async () => {
    try{
        const dbUrl = process.env.database_link || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/EMTrainingDB';
        console.log('Connecting to database:', dbUrl);
        await mongoose.connect(dbUrl);
        console.log("Connected to the database successfully");
        
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });
        
        mongoose.connection.on('error', (err) => {
            console.log('Mongoose connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
        });
        
    }
    catch(err){
        console.log("Error connecting to the database:", err);
        process.exit(1);
    }
}

export const isDbConnected = () => {
    return mongoose.connection.readyState === 1;
};

export const getDbStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected', 
        2: 'connecting',
        3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
};