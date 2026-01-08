import { Router, Request, Response } from 'express';
import { getUsageData, getTodayHourlyUsage, getActiveAlerts } from '../services/usageService';

const router = Router();

/**
 * GET /api/usage?days=7
 * Get historical usage data
 */
router.get('/', (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;

        if (days < 1 || days > 365) {
            return res.status(400).json({
                error: 'days must be between 1 and 365',
            });
        }

        const usage = getUsageData(days);
        res.json(usage);
    } catch (error: any) {
        console.error('Error getting usage data:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

/**
 * GET /api/usage/hourly
 * Get today's hourly usage
 */
router.get('/hourly', (req: Request, res: Response) => {
    try {
        const hourlyUsage = getTodayHourlyUsage();
        res.json(hourlyUsage);
    } catch (error: any) {
        console.error('Error getting hourly usage:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

/**
 * GET /api/alerts
 * Get active alerts
 */
router.get('/alerts', (req: Request, res: Response) => {
    try {
        const alerts = getActiveAlerts();
        res.json(alerts);
    } catch (error: any) {
        console.error('Error getting alerts:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

export default router;
