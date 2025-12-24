'use client';

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { BuildingId } from '@/types';
import { BUILDINGS } from '@/lib/mockData';

interface UsageTrendChartProps {
    data: any[];
    selectedBuilding: BuildingId | 'total';
    onBuildingChange: (building: BuildingId | 'total') => void;
    dateRange: string;
}

export default function UsageTrendChart({
    data,
    selectedBuilding,
    onBuildingChange,
    dateRange,
}: UsageTrendChartProps) {
    const isToday = dateRange === 'today';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Usage Trend</h2>
                <select
                    value={selectedBuilding}
                    onChange={(e) =>
                        onBuildingChange(e.target.value as BuildingId | 'total')
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-water-500"
                >
                    <option value="total">Total Campus</option>
                    {BUILDINGS.map((building) => (
                        <option key={building.id} value={building.id}>
                            {building.name}
                        </option>
                    ))}
                </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey={isToday ? 'hour' : 'date'}
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => {
                            if (isToday) {
                                return `${value}:00`;
                            }
                            return new Date(value).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            });
                        }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: any) => [`${value.toLocaleString()} L`, 'Usage']}
                        labelFormatter={(label) => {
                            if (isToday) {
                                return `${label}:00`;
                            }
                            return new Date(label).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                            });
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="usage"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        fill="url(#colorUsage)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
