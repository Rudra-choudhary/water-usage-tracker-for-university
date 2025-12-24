'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { BuildingId } from '@/types';
import { BUILDINGS } from '@/lib/mockData';

interface BuildingDetailPanelProps {
    buildingId: BuildingId;
    todayUsage: number;
    sevenDayAverage: number;
    peakHour: number;
    last7DaysData: Array<{ date: string; usage: number }>;
}

export default function BuildingDetailPanel({
    buildingId,
    todayUsage,
    sevenDayAverage,
    peakHour,
    last7DaysData,
}: BuildingDetailPanelProps) {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    const percentChange = ((todayUsage - sevenDayAverage) / sevenDayAverage) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Building Details
                </h2>
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: building?.color }}
                />
            </div>

            <div className="space-y-6">
                {/* Building Name */}
                <div>
                    <p className="text-sm text-gray-500">Building</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {building?.name}
                    </p>
                </div>

                {/* Today's Usage */}
                <div>
                    <p className="text-sm text-gray-500">Today&apos;s Usage</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {todayUsage.toLocaleString()} L
                    </p>
                </div>

                {/* 7-Day Comparison */}
                <div>
                    <p className="text-sm text-gray-500">vs 7-Day Average</p>
                    <div className="flex items-center mt-1">
                        <p className="text-lg font-medium text-gray-700">
                            {sevenDayAverage.toLocaleString()} L
                        </p>
                        <span
                            className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${percentChange > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}
                        >
                            {percentChange > 0 ? '+' : ''}
                            {percentChange.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Peak Usage Hour */}
                <div>
                    <p className="text-sm text-gray-500">Peak Usage Hour</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                        {peakHour}:00 - {peakHour + 1}:00
                    </p>
                </div>

                {/* Sparkline */}
                <div>
                    <p className="text-sm text-gray-500 mb-2">Last 7 Days Trend</p>
                    <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={last7DaysData}>
                            <Line
                                type="monotone"
                                dataKey="usage"
                                stroke={building?.color || '#0ea5e9'}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
