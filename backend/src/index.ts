import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database';
import sensorsRouter from './routes/sensors';
import usageRouter from './routes/usage';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Initialize database
try {
    initDatabase();
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

// Routes
app.use('/api/sensors', sensorsRouter);
app.use('/api/usage', usageRouter);
app.use('/api', usageRouter); // Also mount usage routes at /api for alerts

// Mount /api/water endpoint for ESP32 (Vercel-compatible)
app.use('/api', sensorsRouter); // This makes /api/water available

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Campus Water Monitor API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            sensors: {
                postReading: 'POST /api/sensors/reading',
                getStatus: 'GET /api/sensors/status',
                getSensorStatus: 'GET /api/sensors/:sensorId/status',
            },
            usage: {
                getUsage: 'GET /api/usage?days=7',
                getHourly: 'GET /api/usage/hourly',
                getAlerts: 'GET /api/alerts',
            },
        },
    });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// Start server
app.listen(port, () => {
    console.log(`\n🚀 Campus Water Monitor API`);
    console.log(`📡 Server running on http://localhost:${port}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(`💾 Database: ${process.env.DATABASE_PATH || './data/water_monitor.db'}`);
    console.log(`\n✅ Ready to receive sensor data!\n`);
});

export default app;
