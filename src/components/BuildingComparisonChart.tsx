'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { BUILDINGS } from '@/lib/mockData';

interface BuildingComparisonChartProps {
    data: Array<{ building: string; usage: number; buildingId: string }>;
}

export default function BuildingComparisonChart({
    data,
}: BuildingComparisonChartProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Building Comparison
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="building"
                        stroke="#6b7280"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                        formatter={(value: any) => [
                            `${value.toLocaleString()} L`,
                            'Total Usage',
                        ]}
                    />
                    <Bar dataKey="usage" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => {
                            const building = BUILDINGS.find((b) => b.id === entry.buildingId);
                            return (
                                <Cell key={`cell-${index}`} fill={building?.color || '#0ea5e9'} />
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
