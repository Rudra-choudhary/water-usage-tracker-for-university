// API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
    sensorStatus: `${API_BASE_URL}/api/sensors/status`,
    usage: (days: number) => `${API_BASE_URL}/api/usage?days=${days}`,
    usageHourly: `${API_BASE_URL}/api/usage/hourly`,
    alerts: `${API_BASE_URL}/api/alerts`,
};

// Fetcher function for SWR
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
