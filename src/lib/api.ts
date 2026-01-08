// API base URL - automatically uses production URL in production
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? 'https://water-monitor-backend.onrender.com' // Update this with your actual Render URL
        : 'http://localhost:3001');

console.log('🔗 API Base URL:', API_BASE_URL);

// API endpoints
export const API_ENDPOINTS = {
    sensorStatus: `${API_BASE_URL}/api/sensors/status`,
    usage: (days: number) => `${API_BASE_URL}/api/usage?days=${days}`,
    usageHourly: `${API_BASE_URL}/api/usage/hourly`,
    alerts: `${API_BASE_URL}/api/alerts`,
};

// Fetcher function for SWR with error handling
export const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        const error = new Error('An error occurred while fetching the data.');
        throw error;
    }

    return response.json();
};
