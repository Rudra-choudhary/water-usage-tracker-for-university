import db from '../db/database';

const BUILDING_NAMES: Record<string, string> = {
    hostel_a: 'Hostel A',
    hostel_b: 'Hostel B',
    academic_block: 'Academic Block',
    admin_block: 'Admin Block',
    canteen: 'Canteen',
};

/**
 * Calculate daily usage from sensor readings
 */
export function calculateDailyUsage(buildingId: string, date: string) {
    // Get all readings for the building on this date
    const readings: any[] = db.prepare(`
    SELECT sr.*, s.tank_diameter_cm
    FROM sensor_readings sr
    JOIN sensors s ON sr.sensor_id = s.id
    WHERE s.building_id = ?
      AND DATE(sr.timestamp) = ?
    ORDER BY sr.timestamp ASC
  `).all(buildingId, date);

    if (readings.length === 0) return null;

    // Calculate total consumption (sum of volume decreases)
    let totalUsage = 0;
    let hourlyUsage: Record<number, number> = {};

    for (let i = 1; i < readings.length; i++) {
        const prev = readings[i - 1];
        const curr = readings[i];

        if (prev.volume_liters && curr.volume_liters) {
            const usage = prev.volume_liters - curr.volume_liters;

            // Only count positive usage (consumption, not refills)
            if (usage > 0) {
                totalUsage += usage;

                // Track hourly usage
                const hour = new Date(curr.timestamp).getHours();
                hourlyUsage[hour] = (hourlyUsage[hour] || 0) + usage;
            }
        }
    }

    // Find peak usage hour
    const peakHour = Object.entries(hourlyUsage).reduce(
        (max, [hour, usage]) => (usage > max.usage ? { hour: parseInt(hour), usage } : max),
        { hour: 0, usage: 0 }
    ).hour;

    return {
        buildingId,
        date,
        totalLitres: Math.round(totalUsage),
        peakUsageHour: peakHour,
    };
}

/**
 * Get usage data for multiple days
 */
export function getUsageData(days: number = 7) {
    const results: any[] = [];
    const buildings = Object.keys(BUILDING_NAMES);

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        buildings.forEach((buildingId) => {
            const usage = calculateDailyUsage(buildingId, dateStr);
            if (usage) {
                results.push({
                    ...usage,
                    buildingName: BUILDING_NAMES[buildingId],
                });
            }
        });
    }

    return results;
}

/**
 * Get hourly usage for today
 */
export function getTodayHourlyUsage() {
    const today = new Date().toISOString().split('T')[0];
    const hourlyData: any[] = [];

    for (let hour = 0; hour < 24; hour++) {
        const dataPoint: any = { hour };

        Object.keys(BUILDING_NAMES).forEach((buildingId) => {
            // Get readings for this hour
            const readings: any[] = db.prepare(`
        SELECT sr.*, s.tank_diameter_cm
        FROM sensor_readings sr
        JOIN sensors s ON sr.sensor_id = s.id
        WHERE s.building_id = ?
          AND DATE(sr.timestamp) = ?
          AND CAST(strftime('%H', sr.timestamp) AS INTEGER) = ?
        ORDER BY sr.timestamp ASC
      `).all(buildingId, today, hour);

            let hourUsage = 0;
            for (let i = 1; i < readings.length; i++) {
                const prev = readings[i - 1];
                const curr = readings[i];

                if (prev.volume_liters && curr.volume_liters) {
                    const usage = prev.volume_liters - curr.volume_liters;
                    if (usage > 0) {
                        hourUsage += usage;
                    }
                }
            }

            dataPoint[buildingId] = Math.round(hourUsage);
        });

        hourlyData.push(dataPoint);
    }

    return hourlyData;
}

/**
 * Get active alerts
 */
export function getActiveAlerts() {
    return db.prepare(`
    SELECT 
      a.id,
      a.status,
      a.sensor_id as sensorId,
      a.issue,
      a.detected_at as detectedAt,
      s.location_label as buildingName
    FROM alerts a
    JOIN sensors s ON a.sensor_id = s.id
    WHERE a.status IN ('critical', 'warning')
    ORDER BY a.detected_at DESC
    LIMIT 50
  `).all();
}

/**
 * Resolve an alert
 */
export function resolveAlert(alertId: string) {
    return db.prepare(`
    UPDATE alerts
    SET status = 'resolved', resolved_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), alertId);
}
