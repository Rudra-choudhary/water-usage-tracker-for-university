'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SummaryCard from '@/components/SummaryCard';
import UsageTrendChart from '@/components/UsageTrendChart';
import BuildingComparisonChart from '@/components/BuildingComparisonChart';
import AlertsTable from '@/components/AlertsTable';
import BuildingDetailPanel from '@/components/BuildingDetailPanel';
import {
    CardSkeleton,
    ChartSkeleton,
    TableSkeleton,
    DetailPanelSkeleton,
} from '@/components/LoadingSkeleton';
import {
    mockUsageData,
    mockTodayHourlyData,
    mockSensors,
    mockAlerts,
    BUILDINGS,
} from '@/lib/mockData';
import { DateRange, BuildingId } from '@/types';

export default function Home() {
    const [dateRange, setDateRange] = useState<DateRange>('today');
    const [selectedBuilding, setSelectedBuilding] = useState<
        BuildingId | 'total'
    >('total');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [dateRange, selectedBuilding]);

    // Calculate date range
    const getDaysAgo = () => {
        switch (dateRange) {
            case 'today':
                return 0;
            case 'last7days':
                return 7;
            case 'last30days':
                return 30;
            default:
                return 0;
        }
    };

    const daysAgo = getDaysAgo();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Filter data by date range
    const filteredData = mockUsageData.filter((item) => {
        const itemDate = new Date(item.date);
        return dateRange === 'today'
            ? item.date === new Date().toISOString().split('T')[0]
            : itemDate >= cutoffDate;
    });

    // Calculate summary metrics
    const todayData = mockUsageData.filter(
        (item) => item.date === new Date().toISOString().split('T')[0]
    );
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayData = mockUsageData.filter(
        (item) => item.date === yesterdayDate.toISOString().split('T')[0]
    );

    const totalUsageToday = todayData.reduce(
        (sum, item) => sum + item.totalLitres,
        0
    );
    const totalUsageYesterday = yesterdayData.reduce(
        (sum, item) => sum + item.totalLitres,
        0
    );
    const usageTrend =
        totalUsageYesterday > 0
            ? ((totalUsageToday - totalUsageYesterday) / totalUsageYesterday) * 100
            : 0;

    // Most consuming building
    const buildingTotals = BUILDINGS.map((building) => {
        const total = todayData
            .filter((item) => item.buildingId === building.id)
            .reduce((sum, item) => sum + item.totalLitres, 0);
        return { ...building, total };
    });
    const mostConsuming = buildingTotals.reduce((max, b) =>
        b.total > max.total ? b : max
    );

    // Sensor status
    const onlineSensors = mockSensors.filter((s) => s.isOnline).length;
    const totalSensors = mockSensors.length;

    // Leak risk assessment
    const criticalAlerts = mockAlerts.filter((a) => a.status === 'critical')
        .length;
    const warningAlerts = mockAlerts.filter((a) => a.status === 'warning').length;
    const leakRisk =
        criticalAlerts > 0 ? 'High' : warningAlerts > 1 ? 'Medium' : 'Low';
    const leakRiskColor =
        leakRisk === 'High'
            ? 'text-red-600'
            : leakRisk === 'Medium'
                ? 'text-amber-600'
                : 'text-green-600';

    // Prepare chart data
    const trendChartData =
        dateRange === 'today'
            ? mockTodayHourlyData.map((item) => ({
                hour: item.hour,
                date: `${item.hour}:00`,
                usage:
                    selectedBuilding === 'total'
                        ? BUILDINGS.reduce((sum, b) => sum + (item[b.id] || 0), 0)
                        : item[selectedBuilding] || 0,
            }))
            : filteredData
                .filter((item) =>
                    selectedBuilding === 'total'
                        ? true
                        : item.buildingId === selectedBuilding
                )
                .reduce(
                    (acc, item) => {
                        const existing = acc.find((d) => d.date === item.date);
                        if (existing) {
                            existing.usage += item.totalLitres;
                        } else {
                            acc.push({ date: item.date, usage: item.totalLitres });
                        }
                        return acc;
                    },
                    [] as Array<{ date: string; usage: number }>
                )
                .sort((a, b) => a.date.localeCompare(b.date));

    // Building comparison data
    const comparisonData = BUILDINGS.map((building) => {
        const total = filteredData
            .filter((item) => item.buildingId === building.id)
            .reduce((sum, item) => sum + item.totalLitres, 0);
        return {
            building: building.name,
            buildingId: building.id,
            usage: total,
        };
    });

    // Building detail data
    const selectedBuildingData =
        selectedBuilding !== 'total'
            ? (() => {
                const todayUsage =
                    todayData.find((item) => item.buildingId === selectedBuilding)
                        ?.totalLitres || 0;
                const last7Days = mockUsageData
                    .filter((item) => item.buildingId === selectedBuilding)
                    .slice(-7);
                const sevenDayAverage =
                    last7Days.reduce((sum, item) => sum + item.totalLitres, 0) / 7;
                const peakHour =
                    todayData.find((item) => item.buildingId === selectedBuilding)
                        ?.peakUsageHour || 0;
                const last7DaysData = last7Days.map((item) => ({
                    date: item.date,
                    usage: item.totalLitres,
                }));

                return {
                    buildingId: selectedBuilding,
                    todayUsage,
                    sevenDayAverage,
                    peakHour,
                    last7DaysData,
                };
            })()
            : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar dateRange={dateRange} onDateRangeChange={setDateRange} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isLoading ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : (
                        <>
                            <SummaryCard
                                title="Total Water Used Today"
                                value={`${(totalUsageToday / 1000).toFixed(1)}K L`}
                                subtitle="vs yesterday"
                                trend={{
                                    value: Math.abs(usageTrend),
                                    isPositive: usageTrend > 0,
                                }}
                                icon={
                                    <svg
                                        className="w-6 h-6 text-water-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                        />
                                    </svg>
                                }
                            />
                            <SummaryCard
                                title="Most Consuming Building"
                                value={mostConsuming.name}
                                subtitle={`${(mostConsuming.total / 1000).toFixed(1)}K litres today`}
                                icon={
                                    <svg
                                        className="w-6 h-6 text-water-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                }
                            />
                            <SummaryCard
                                title="Leak Risk Assessment"
                                value={leakRisk}
                                subtitle={`${criticalAlerts} critical, ${warningAlerts} warnings`}
                                icon={
                                    <svg
                                        className={`w-6 h-6 ${leakRiskColor}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                }
                            />
                            <SummaryCard
                                title="Active Sensors Online"
                                value={`${onlineSensors} / ${totalSensors}`}
                                subtitle={`${((onlineSensors / totalSensors) * 100).toFixed(0)}% operational`}
                                icon={
                                    <svg
                                        className="w-6 h-6 text-water-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                        />
                                    </svg>
                                }
                            />
                        </>
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {isLoading ? (
                        <>
                            <ChartSkeleton />
                            <ChartSkeleton />
                        </>
                    ) : (
                        <>
                            <UsageTrendChart
                                data={trendChartData}
                                selectedBuilding={selectedBuilding}
                                onBuildingChange={setSelectedBuilding}
                                dateRange={dateRange}
                            />
                            <BuildingComparisonChart data={comparisonData} />
                        </>
                    )}
                </div>

                {/* Alerts and Building Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {isLoading ? <TableSkeleton /> : <AlertsTable alerts={mockAlerts} />}
                    </div>
                    <div>
                        {isLoading ? (
                            <DetailPanelSkeleton />
                        ) : selectedBuildingData ? (
                            <BuildingDetailPanel {...selectedBuildingData} />
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Building Details
                                </h2>
                                <p className="text-gray-500 text-center py-12">
                                    Select a building from the chart to view details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
