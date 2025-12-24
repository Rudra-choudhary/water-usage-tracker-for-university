'use client';

import { DateRange } from '@/types';

interface NavbarProps {
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
}

export default function Navbar({ dateRange, onDateRangeChange }: NavbarProps) {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-water-500 to-water-600 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-white"
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
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Campus Water Monitor
                            </h1>
                            <p className="text-xs text-gray-500">Real-time Usage Tracking</p>
                        </div>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => onDateRangeChange('today')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateRange === 'today'
                                        ? 'bg-white text-water-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => onDateRangeChange('last7days')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateRange === 'last7days'
                                        ? 'bg-white text-water-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Last 7 Days
                            </button>
                            <button
                                onClick={() => onDateRangeChange('last30days')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateRange === 'last30days'
                                        ? 'bg-white text-water-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Last 30 Days
                            </button>
                        </div>

                        {/* User Avatar */}
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            AD
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
