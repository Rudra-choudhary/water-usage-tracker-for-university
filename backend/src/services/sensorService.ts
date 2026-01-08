import db from '../db/database';
import {
    calculateWaterLevel,
    calculateWaterLevelPercent,
    calculateVolume,
    detectAnomaly,
} from '../utils/calculations';

interface SensorReading {
    sensorId: string;
    buildingId: string;
    distanceCm: number;
    timestamp?: string;
}

interface ProcessedReading {
    sensorId: string;
    distanceCm: number;
    waterLevelCm: number;
    waterLevelPercent: number;
    volumeLiters: number | null;
    timestamp: string;
}

/**
 * Process and store a sensor reading
 */
export function processSensorReading(reading: SensorReading): ProcessedReading {
    const { sensorId, distanceCm, timestamp = new Date().toISOString() } = reading;

    // Get sensor configuration
    const sensor: any = db.prepare('SELECT * FROM sensors WHERE id = ?').get(sensorId);

    if (!sensor) {
        throw new Error(`Sensor ${sensorId} not found`);
    }

    // Calculate water metrics
    const waterLevelCm = calculateWaterLevel(distanceCm, sensor.tank_height_cm);
    const waterLevelPercent = calculateWaterLevelPercent(waterLevelCm, sensor.tank_height_cm);
    const volumeLiters = sensor.tank_diameter_cm
        ? calculateVolume(waterLevelCm, sensor.tank_diameter_cm)
        : null;

    // Store reading in database
    const stmt = db.prepare(`
    INSERT INTO sensor_readings (sensor_id, distance_cm, water_level_cm, water_level_percent, volume_liters, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    stmt.run(sensorId, distanceCm, waterLevelCm, waterLevelPercent, volumeLiters, timestamp);

    // Check for anomalies
    checkForAnomalies(sensorId, waterLevelPercent);

    return {
        sensorId,
        distanceCm,
        waterLevelCm,
        waterLevelPercent,
        volumeLiters,
        timestamp,
    };
}

/**
 * Get current status of all sensors
 */
export function getAllSensorStatus() {
    const query = `
    SELECT 
      s.id as sensorId,
      s.building_id as buildingId,
      s.location_label as locationLabel,
      sr.water_level_percent as waterLevelPercent,
      sr.volume_liters as volumeLiters,
      sr.timestamp as lastReadingAt,
      CASE 
        WHEN (julianday('now') - julianday(sr.timestamp)) * 24 * 60 < 5 THEN 1
        ELSE 0
      END as isOnline
    FROM sensors s
    LEFT JOIN (
      SELECT sensor_id, water_level_percent, volume_liters, timestamp
      FROM sensor_readings
      WHERE id IN (
        SELECT MAX(id) FROM sensor_readings GROUP BY sensor_id
      )
    ) sr ON s.id = sr.sensor_id
  `;

    return db.prepare(query).all();
}

/**
 * Get sensor status by ID
 */
export function getSensorStatus(sensorId: string) {
    const query = `
    SELECT 
      s.id as sensorId,
      s.building_id as buildingId,
      s.location_label as locationLabel,
      sr.water_level_percent as waterLevelPercent,
      sr.volume_liters as volumeLiters,
      sr.timestamp as lastReadingAt,
      CASE 
        WHEN (julianday('now') - julianday(sr.timestamp)) * 24 * 60 < 5 THEN 1
        ELSE 0
      END as isOnline
    FROM sensors s
    LEFT JOIN (
      SELECT sensor_id, water_level_percent, volume_liters, timestamp
      FROM sensor_readings
      WHERE sensor_id = ? AND id = (
        SELECT MAX(id) FROM sensor_readings WHERE sensor_id = ?
      )
    ) sr ON s.id = sr.sensor_id
    WHERE s.id = ?
  `;

    return db.prepare(query).get(sensorId, sensorId, sensorId);
}

/**
 * Check for anomalies and create alerts
 */
function checkForAnomalies(sensorId: string, currentLevelPercent: number) {
    // Get previous reading
    const prevReading: any = db.prepare(`
    SELECT water_level_percent, timestamp
    FROM sensor_readings
    WHERE sensor_id = ?
    ORDER BY id DESC
    LIMIT 1 OFFSET 1
  `).get(sensorId);

    if (!prevReading) return;

    // Calculate time difference in minutes
    const timeDiff = (new Date().getTime() - new Date(prevReading.timestamp).getTime()) / 1000 / 60;

    // Detect anomaly
    const anomalyType = detectAnomaly(prevReading.water_level_percent, currentLevelPercent, timeDiff);

    if (anomalyType) {
        const sensor: any = db.prepare('SELECT * FROM sensors WHERE id = ?').get(sensorId);
        const levelDrop = prevReading.water_level_percent - currentLevelPercent;

        const alertId = `A${Date.now()}`;
        const issue = anomalyType === 'critical'
            ? `Critical: Water level dropped ${levelDrop.toFixed(1)}% in ${Math.round(timeDiff)} minutes - possible leak`
            : `Warning: Unusual water level drop of ${levelDrop.toFixed(1)}% detected`;

        db.prepare(`
      INSERT INTO alerts (id, status, building_id, sensor_id, issue, detected_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(alertId, anomalyType, sensor.building_id, sensorId, issue, new Date().toISOString());
    }
}

/**
 * Get historical readings for a sensor
 */
export function getSensorReadings(sensorId: string, limit: number = 100) {
    return db.prepare(`
    SELECT * FROM sensor_readings
    WHERE sensor_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(sensorId, limit);
}
