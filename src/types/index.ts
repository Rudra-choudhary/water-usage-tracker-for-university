export type BuildingId =
    | 'hostel_a'
    | 'hostel_b'
    | 'academic_block'
    | 'admin_block'
    | 'canteen';

export interface BuildingUsage {
    buildingId: BuildingId;
    buildingName: string;
    date: string; // ISO date
    totalLitres: number;
    peakUsageHour: number; // 0–23
}

export interface SensorStatus {
    sensorId: string;
    buildingId: BuildingId;
    locationLabel: string;
    isOnline: boolean;
    lastReadingAt: string; // ISO datetime
}

export interface Alert {
    id: string;
    status: 'critical' | 'warning' | 'resolved';
    buildingName: string;
    sensorId: string;
    issue: string;
    detectedAt: string;
}

export type DateRange = 'today' | 'last7days' | 'last30days';

export interface BuildingInfo {
    id: BuildingId;
    name: string;
    color: string;
}
