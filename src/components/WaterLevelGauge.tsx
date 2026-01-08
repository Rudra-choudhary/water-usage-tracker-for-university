'use client';

import { useEffect, useState } from 'react';

interface WaterLevelGaugeProps {
    buildingName: string;
    waterLevelPercent: number;
    volumeLiters: number | null;
    color?: string;
}

export default function WaterLevelGauge({
    buildingName,
    waterLevelPercent,
    volumeLiters,
    color = '#0ea5e9',
}: WaterLevelGaugeProps) {
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        // Animate fill on mount
        const timer = setTimeout(() => {
            setAnimatedPercent(waterLevelPercent);
        }, 100);
        return () => clearTimeout(timer);
    }, [waterLevelPercent]);

    // Determine color based on level
    const getColor = () => {
        if (waterLevelPercent > 60) return '#10b981'; // Green
        if (waterLevelPercent > 30) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const fillColor = getColor();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">{buildingName}</h3>

            <div className="flex items-center space-x-4">
                {/* Tank Visualization */}
                <div className="relative w-20 h-32 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden">
                    {/* Water fill */}
                    <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                        style={{
                            height: `${animatedPercent}%`,
                            backgroundColor: fillColor,
                            opacity: 0.7,
                        }}
                    >
                        {/* Wave effect */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-white opacity-20 animate-pulse" />
                    </div>

                    {/* Level markers */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gray-400" />
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-300" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />
                    <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-300" />
                </div>

                {/* Stats */}
                <div className="flex-1">
                    <div className="text-3xl font-bold" style={{ color: fillColor }}>
                        {waterLevelPercent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Water Level</div>
                    {volumeLiters !== null && (
                        <div className="text-lg font-semibold text-gray-700 mt-2">
                            {volumeLiters.toLocaleString()} L
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
