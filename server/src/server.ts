import 'express-async-errors';
import * as dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import apiRouter from '@/routes';
import { errorHandler } from '@/error';
import { connectDB } from '@/config';
import runBootstrap from './bootstrap';

const app: Application = express();

// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend with cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies from incoming requests
app.use(cookieParser());

// Mount versioned API router
app.use('/api', apiRouter);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await runBootstrap();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Server failed to start:', err.message);
    } else {
      console.error('❌ Unknown startup error:', err);
    }
    process.exit(1); // Force exit in case DB connect or port bind fails
  }
};

startServer();
