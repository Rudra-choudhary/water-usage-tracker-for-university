import { Router, Request, Response } from 'express';
import { processSensorReading, getAllSensorStatus, getSensorStatus } from '../services/sensorService';

const router = Router();

/**
 * POST /api/sensors/reading
 * Receive sensor reading from ESP32
 */
router.post('/reading', (req: Request, res: Response) => {
    try {
        const { sensorId, buildingId, distanceCm, timestamp } = req.body;

        // Validate input
        if (!sensorId || distanceCm === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: sensorId, distanceCm',
            });
        }

        if (typeof distanceCm !== 'number' || distanceCm < 0) {
            return res.status(400).json({
                error: 'distanceCm must be a positive number',
            });
        }

        // Process reading
        const result = processSensorReading({
            sensorId,
            buildingId,
            distanceCm,
            timestamp,
        });

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Error processing sensor reading:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

/**
 * GET /api/sensors/status
 * Get status of all sensors
 */
router.get('/status', (req: Request, res: Response) => {
    try {
        const sensors = getAllSensorStatus();
        res.json(sensors);
    } catch (error: any) {
        console.error('Error getting sensor status:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

/**
 * GET /api/sensors/:sensorId/status
 * Get status of a specific sensor
 */
router.get('/:sensorId/status', (req: Request, res: Response) => {
    try {
        const { sensorId } = req.params;
        const sensor = getSensorStatus(sensorId);

        if (!sensor) {
            return res.status(404).json({
                error: 'Sensor not found',
            });
        }

        res.json(sensor);
    } catch (error: any) {
        console.error('Error getting sensor status:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

/**
 * POST /api/water
 * Receive sensor reading from ESP32 (Vercel-compatible format)
 * Expects: { distance: number, percentage: number, volume: number }
 */
router.post('/water', (req: Request, res: Response) => {
    try {
        const { distance, percentage, volume } = req.body;

        console.log('[ESP32] Received data:', JSON.stringify(req.body));

        // Validate input
        if (distance === undefined || percentage === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: distance, percentage',
            });
        }

        // Use default sensor ID if not provided (for single-sensor setups)
        const sensorId = req.body.sensorId || 'S001';
        const buildingId = req.body.buildingId || 'hostel_a';

        // Process reading using the existing service
        const result = processSensorReading({
            sensorId,
            buildingId,
            distanceCm: distance,
            timestamp: new Date().toISOString(),
        });

        console.log('[ESP32] ✓ Processed:', {
            sensorId,
            waterLevel: result.waterLevelPercent.toFixed(1) + '%',
            volume: result.volumeLiters + 'L',
        });

        res.status(200).json({
            success: true,
            message: 'Data received successfully',
            data: {
                sensorId,
                waterLevelPercent: result.waterLevelPercent,
                volumeLiters: result.volumeLiters,
                timestamp: result.timestamp,
            },
        });
    } catch (error: any) {
        console.error('[ESP32] ✗ Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});

export default router;
