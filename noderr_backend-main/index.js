import app from "./app.js";
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import connectDB from './db/index.js';

dotenv.config({ path: './.env' });

//const app = express();

// Apply CORS middleware
// Allow all origins
// For production, restrict to specific origins for security:
// app.use(cors({ origin: ['http://example.com', 'http://anotherdomain.com'] }));

const allowedOrigins = ['http://localhost:3000', 'https://api.noderr.xyz', 'https://9506-103-57-224-62.ngrok-free.app'];

app.use(cors({
  credentials: true,
  origin: allowedOrigins,
}));



const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// Connect to the database with proper error handling
connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on ${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit to prevent running without a DB connection
  });
