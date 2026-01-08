/**
 * Calculate water level from distance measurement
 * @param distanceCm - Distance from sensor to water surface (cm)
 * @param tankHeightCm - Total height of the tank (cm)
 * @returns Water level in cm
 */
export function calculateWaterLevel(distanceCm: number, tankHeightCm: number): number {
    return Math.max(0, tankHeightCm - distanceCm);
}

/**
 * Calculate water level percentage
 * @param waterLevelCm - Current water level (cm)
 * @param tankHeightCm - Total height of the tank (cm)
 * @returns Percentage (0-100)
 */
export function calculateWaterLevelPercent(waterLevelCm: number, tankHeightCm: number): number {
    return Math.min(100, Math.max(0, (waterLevelCm / tankHeightCm) * 100));
}

/**
 * Calculate volume for cylindrical tank
 * @param waterLevelCm - Current water level (cm)
 * @param diameterCm - Tank diameter (cm)
 * @returns Volume in liters
 */
export function calculateVolume(waterLevelCm: number, diameterCm: number): number {
    const radiusCm = diameterCm / 2;
    const volumeCm3 = Math.PI * radiusCm * radiusCm * waterLevelCm;
    const volumeLiters = volumeCm3 / 1000; // Convert cm³ to liters
    return Math.round(volumeLiters * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate usage from volume change
 * @param previousVolume - Previous volume reading (liters)
 * @param currentVolume - Current volume reading (liters)
 * @returns Usage in liters (positive = consumption, negative = refill)
 */
export function calculateUsage(previousVolume: number, currentVolume: number): number {
    return previousVolume - currentVolume;
}

/**
 * Detect anomalies in water level changes
 * @param previousLevel - Previous water level percent
 * @param currentLevel - Current water level percent
 * @param timeDiffMinutes - Time difference in minutes
 * @returns Alert type or null
 */
export function detectAnomaly(
    previousLevel: number,
    currentLevel: number,
    timeDiffMinutes: number
): 'critical' | 'warning' | null {
    const levelDrop = previousLevel - currentLevel;
    const dropRate = levelDrop / (timeDiffMinutes / 60); // % per hour

    // Critical: >20% drop per hour (likely leak)
    if (dropRate > 20) {
        return 'critical';
    }

    // Warning: >10% drop per hour (unusual usage)
    if (dropRate > 10) {
        return 'warning';
    }

    return null;
}
