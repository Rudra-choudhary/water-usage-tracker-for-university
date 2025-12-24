# Campus Water Monitor

A production-ready Next.js 14 dashboard for tracking water usage across university campus buildings in real-time.

![Dashboard Preview](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## 📋 Project Purpose

Campus Water Monitor is a comprehensive dashboard designed to help university facilities management track, analyze, and optimize water usage across different campus buildings. The system provides:

- **Real-time monitoring** of water consumption across 5 campus buildings
- **Visual analytics** with interactive charts and graphs
- **Leak detection** and anomaly alerts
- **Sensor status monitoring** for maintenance teams
- **Historical data analysis** with flexible date range selection

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard.

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## 🏗️ Project Structure

```
water-usage-tracker/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx             # Main dashboard page
│   │   └── globals.css          # Global styles and Tailwind
│   ├── components/
│   │   ├── Navbar.tsx           # Top navigation with date selector
│   │   ├── SummaryCard.tsx      # Reusable metric card
│   │   ├── UsageTrendChart.tsx  # Line/area chart for usage trends
│   │   ├── BuildingComparisonChart.tsx  # Bar chart comparing buildings
│   │   ├── AlertsTable.tsx      # Alerts and anomalies table
│   │   ├── BuildingDetailPanel.tsx  # Selected building details
│   │   └── LoadingSkeleton.tsx  # Loading state components
│   ├── lib/
│   │   └── mockData.ts          # Mock data generators
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 📊 Data Model

### TypeScript Types

```typescript
type BuildingId = 'hostel_a' | 'hostel_b' | 'academic_block' | 'admin_block' | 'canteen';

interface BuildingUsage {
  buildingId: BuildingId;
  buildingName: string;
  date: string;              // ISO date
  totalLitres: number;
  peakUsageHour: number;     // 0–23
}

interface SensorStatus {
  sensorId: string;
  buildingId: BuildingId;
  locationLabel: string;
  isOnline: boolean;
  lastReadingAt: string;     // ISO datetime
}

interface Alert {
  id: string;
  status: 'critical' | 'warning' | 'resolved';
  buildingName: string;
  sensorId: string;
  issue: string;
  detectedAt: string;
}
```

### Mock Data

Currently, the dashboard uses **frontend mock data** with realistic patterns:

- **14 days** of historical usage data per building
- **Varied usage patterns** (hostels peak morning/evening, academic blocks peak during class hours, canteen peaks at meal times)
- **20+ sensor statuses** across all buildings
- **Sample alerts** (critical leaks, warnings, resolved issues)

## 🔌 Backend Integration Guide

### Where to Replace Mock Data with Real APIs

The dashboard is designed for easy backend integration. Replace mock data in the following locations:

#### 1. **Usage Data** (`src/app/page.tsx`)

Replace this:
```typescript
import { mockUsageData, mockTodayHourlyData } from '@/lib/mockData';
```

With API calls:
```typescript
// Fetch historical usage data
const usageData = await fetch('/api/usage?days=14').then(r => r.json());

// Fetch today's hourly data
const hourlyData = await fetch('/api/usage/hourly').then(r => r.json());
```

#### 2. **Sensor Status** (`src/app/page.tsx`)

Replace:
```typescript
import { mockSensors } from '@/lib/mockData';
```

With:
```typescript
const sensors = await fetch('/api/sensors/status').then(r => r.json());
```

#### 3. **Alerts** (`src/app/page.tsx`)

Replace:
```typescript
import { mockAlerts } from '@/lib/mockData';
```

With:
```typescript
const alerts = await fetch('/api/alerts').then(r => r.json());
```

### Recommended API Endpoints

Create these API routes in `src/app/api/`:

- `GET /api/usage?days=14` - Historical usage data
- `GET /api/usage/hourly` - Today's hourly breakdown
- `GET /api/sensors/status` - Current sensor statuses
- `GET /api/alerts` - Active and recent alerts
- `GET /api/buildings/:id` - Specific building details

### Data Fetching Strategy

For production, consider:

1. **Server Components** - Fetch data on the server for initial page load
2. **SWR or React Query** - For client-side data fetching with caching
3. **WebSockets** - For real-time sensor updates
4. **Polling** - Refresh data every 30-60 seconds for near-real-time updates

Example with SWR:
```typescript
import useSWR from 'swr';

const { data: usageData } = useSWR('/api/usage?days=14', fetcher, {
  refreshInterval: 60000, // Refresh every minute
});
```

## 🎨 Design System

### Color Palette

The dashboard uses a water-themed color palette:

- **Primary (Water Blue)**: `#0ea5e9` - Main accent color
- **Background**: `#f8fafc` - Light gray background
- **Cards**: `#ffffff` - White with soft shadows
- **Text**: `#0f172a` (primary), `#64748b` (secondary)

### Component Library

All components are built with:
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **TypeScript** for type safety
- **Responsive design** (mobile-first approach)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.10
- **Fonts**: Inter (Google Fonts)
- **Code Quality**: ESLint + Prettier

## 📱 Features

### Dashboard Components

1. **Summary Cards** (4 cards)
   - Total water used today with trend
   - Most consuming building
   - Leak risk assessment
   - Active sensors online

2. **Usage Trend Chart**
   - Toggle between total campus and individual buildings
   - Hourly view for "Today"
   - Daily view for "Last 7/30 Days"
   - Interactive tooltips

3. **Building Comparison Chart**
   - Bar chart comparing all buildings
   - Color-coded by building
   - Value labels on bars

4. **Alerts Table**
   - Status badges (critical/warning/resolved)
   - Sensor information
   - Relative timestamps
   - Empty state when no alerts

5. **Building Detail Panel**
   - Selected building statistics
   - 7-day average comparison
   - Peak usage hour
   - Sparkline trend chart

### Interactivity

- **Date Range Selector**: Today / Last 7 Days / Last 30 Days
- **Building Selection**: Filter charts by building
- **Loading States**: Smooth skeleton animations
- **Responsive Design**: Mobile, tablet, and desktop layouts

## 🔧 Configuration

### Environment Variables

For backend integration, create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-api-endpoint.com
API_SECRET_KEY=your-secret-key
```

### Tailwind Customization

Modify `tailwind.config.ts` to customize colors, spacing, or add new utilities.

## 📄 License

This project is created for university use. Modify as needed for your institution.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues or questions, please contact the facilities management IT team.

---

**Built with ❤️ for sustainable campus water management**
