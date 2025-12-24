import {
    BuildingId,
    BuildingUsage,
    SensorStatus,
    Alert,
    BuildingInfo,
} from '@/types';

export const BUILDINGS: BuildingInfo[] = [
    { id: 'hostel_a', name: 'Hostel A', color: '#0ea5e9' },
    { id: 'hostel_b', name: 'Hostel B', color: '#06b6d4' },
    { id: 'academic_block', name: 'Academic Block', color: '#8b5cf6' },
    { id: 'admin_block', name: 'Admin Block', color: '#ec4899' },
    { id: 'canteen', name: 'Canteen', color: '#f59e0b' },
];

// Generate realistic usage data for the last 14 days
export function generateMockUsageData(): BuildingUsage[] {
    const data: BuildingUsage[] = [];
    const now = new Date();

    for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        BUILDINGS.forEach((building) => {
            let totalLitres = 0;
            let peakUsageHour = 0;

            switch (building.id) {
                case 'hostel_a':
                case 'hostel_b':
                    // Hostels: high usage morning (6-9) and evening (18-22)
                    totalLitres = isWeekend ? 8000 + Math.random() * 2000 : 12000 + Math.random() * 3000;
                    peakUsageHour = Math.random() > 0.5 ? 7 : 19;
                    break;
                case 'academic_block':
                    // Academic: high on weekdays (9-17), low on weekends
                    totalLitres = isWeekend ? 2000 + Math.random() * 1000 : 15000 + Math.random() * 5000;
                    peakUsageHour = 11;
                    break;
                case 'admin_block':
                    // Admin: moderate weekday usage
                    totalLitres = isWeekend ? 1000 + Math.random() * 500 : 5000 + Math.random() * 2000;
                    peakUsageHour = 10;
                    break;
                case 'canteen':
                    // Canteen: peaks at lunch (12-14)
                    totalLitres = isWeekend ? 3000 + Math.random() * 1000 : 8000 + Math.random() * 2000;
                    peakUsageHour = 13;
                    break;
            }

            data.push({
                buildingId: building.id,
                buildingName: building.name,
                date: dateStr,
                totalLitres: Math.round(totalLitres),
                peakUsageHour,
            });
        });
    }

    return data;
}

// Generate hourly data for today
export function generateTodayHourlyData(): Array<{
    hour: number;
    [key: string]: number;
}> {
    const hourlyData = [];

    for (let hour = 0; hour < 24; hour++) {
        const dataPoint: any = { hour };

        BUILDINGS.forEach((building) => {
            let usage = 0;

            switch (building.id) {
                case 'hostel_a':
                case 'hostel_b':
                    // Peak at 7am and 7pm
                    if (hour >= 6 && hour <= 9) {
                        usage = 800 + Math.random() * 400;
                    } else if (hour >= 18 && hour <= 22) {
                        usage = 900 + Math.random() * 500;
                    } else {
                        usage = 200 + Math.random() * 200;
                    }
                    break;
                case 'academic_block':
                    // Peak during class hours
                    if (hour >= 9 && hour <= 17) {
                        usage = 600 + Math.random() * 400;
                    } else {
                        usage = 50 + Math.random() * 100;
                    }
                    break;
                case 'admin_block':
                    // Office hours
                    if (hour >= 9 && hour <= 17) {
                        usage = 200 + Math.random() * 150;
                    } else {
                        usage = 20 + Math.random() * 50;
                    }
                    break;
                case 'canteen':
                    // Meal times
                    if (hour >= 7 && hour <= 9) {
                        usage = 300 + Math.random() * 200;
                    } else if (hour >= 12 && hour <= 14) {
                        usage = 500 + Math.random() * 300;
                    } else if (hour >= 19 && hour <= 21) {
                        usage = 400 + Math.random() * 200;
                    } else {
                        usage = 50 + Math.random() * 100;
                    }
                    break;
            }

            dataPoint[building.id] = Math.round(usage);
        });

        hourlyData.push(dataPoint);
    }

    return hourlyData;
}

// Generate sensor status data
export function generateSensorData(): SensorStatus[] {
    const sensors: SensorStatus[] = [];
    let sensorId = 1;

    BUILDINGS.forEach((building) => {
        const sensorCount = building.id.includes('hostel') ? 5 : 4;

        for (let i = 0; i < sensorCount; i++) {
            const isOnline = Math.random() > 0.1; // 90% online rate
            const lastReading = new Date();
            if (!isOnline) {
                lastReading.setHours(lastReading.getHours() - Math.floor(Math.random() * 12));
            }

            sensors.push({
                sensorId: `S${sensorId.toString().padStart(3, '0')}`,
                buildingId: building.id,
                locationLabel: `${building.name} - Floor ${i + 1}`,
                isOnline,
                lastReadingAt: lastReading.toISOString(),
            });

            sensorId++;
        }
    });

    return sensors;
}

// Generate alert data
export function generateAlerts(): Alert[] {
    const alerts: Alert[] = [
        {
            id: 'A001',
            status: 'critical',
            buildingName: 'Hostel A',
            sensorId: 'S003',
            issue: 'Possible leak detected - usage 300% above normal',
            detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'A002',
            status: 'warning',
            buildingName: 'Academic Block',
            sensorId: 'S011',
            issue: 'Sensor reading fluctuation detected',
            detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'A003',
            status: 'resolved',
            buildingName: 'Canteen',
            sensorId: 'S019',
            issue: 'High usage during off-hours',
            detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'A004',
            status: 'warning',
            buildingName: 'Admin Block',
            sensorId: 'S015',
            issue: 'Continuous flow detected for 3+ hours',
            detectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
    ];

    return alerts;
}

// Mock data instances
export const mockUsageData = generateMockUsageData();
export const mockTodayHourlyData = generateTodayHourlyData();
export const mockSensors = generateSensorData();
export const mockAlerts = generateAlerts();
