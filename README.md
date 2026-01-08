# Campus Water Monitor 💧

A production-ready IoT water monitoring system for university campuses using ESP32 sensors and a real-time dashboard.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat-square&logo=node.js)
![ESP32](https://img.shields.io/badge/ESP32-IoT-red?style=flat-square&logo=espressif)

## 📋 Overview

Real-time water usage monitoring system that tracks consumption across multiple campus buildings using ultrasonic sensors (HC-SR04) connected to ESP32 microcontrollers. Features include:

- 📊 **Real-time Dashboard** - Live water level monitoring and usage analytics
- 🚨 **Leak Detection** - Automatic anomaly detection and alerts
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔌 **IoT Integration** - ESP32 sensors with WiFi connectivity
- 💾 **Data Storage** - SQLite database with historical tracking
- 📈 **Analytics** - Usage trends, peak hours, and building comparisons

## 🏗️ Architecture

```
ESP32 Sensors → WiFi → Backend API → SQLite Database → Next.js Dashboard
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Arduino IDE (for ESP32)
- ESP32 development board
- HC-SR04 ultrasonic sensor

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/water-usage-tracker.git
   cd water-usage-tracker
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment**
   ```bash
   # Frontend
   cp .env.example .env.local
   
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your tank dimensions
   ```

5. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:3001

6. **Start the frontend**
   ```bash
   npm run dev
   ```
   Dashboard opens at http://localhost:3000

## 🔧 ESP32 Setup

### Hardware Wiring

```
HC-SR04          ESP32
─────────────────────────
VCC      ───────  5V
TRIG     ───────  GPIO 25
ECHO     ───────  GPIO 26
GND      ───────  GND
```

### Firmware Configuration

1. Open `esp32/water_sensor/water_sensor.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "Your_WiFi_SSID";
   const char* password = "Your_WiFi_Password";
   ```
3. Update server URL with your computer's IP:
   ```cpp
   const char* serverUrl = "http://192.168.1.XXX:3001/api/water";
   ```
4. Configure tank dimensions:
   ```cpp
   const float TANK_HEIGHT_CM = 200.0;
   const float TANK_CAPACITY_L = 500.0;
   ```
5. Upload to ESP32

See [ESP32_SETUP.md](ESP32_SETUP.md) for detailed instructions.

## 📊 Features

### Dashboard

- **Summary Cards** - Total usage, most consuming building, leak risk, sensor status
- **Usage Trend Chart** - Hourly/daily water consumption with building filter
- **Building Comparison** - Bar chart comparing all buildings
- **Alerts Table** - Real-time leak and anomaly notifications
- **Building Details** - Individual building statistics with sparkline
- **Water Level Gauges** - Visual tank fill indicators

### Backend API

- `POST /api/water` - Receive ESP32 sensor data
- `GET /api/sensors/status` - Get all sensor statuses
- `GET /api/usage?days=7` - Historical usage data
- `GET /api/usage/hourly` - Today's hourly breakdown
- `GET /api/alerts` - Active alerts

### ESP32 Features

- WiFi connectivity
- Ultrasonic distance measurement
- Automatic water level calculation
- 30-second reading interval
- Auto-reconnect on WiFi drop
- Serial debugging output

## 📁 Project Structure

```
water-usage-tracker/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── db/                # Database & schema
│   │   └── utils/             # Helper functions
│   └── data/                  # SQLite database
├── esp32/                     # ESP32 firmware
│   └── water_sensor/
│       └── water_sensor.ino   # Arduino code
├── src/                       # Next.js frontend
│   ├── app/                   # Pages & layouts
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API
│   └── types/                 # TypeScript types
└── docs/                      # Documentation
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- SWR (data fetching)

**Backend:**
- Node.js
- Express.js
- SQLite (better-sqlite3)
- TypeScript

**Hardware:**
- ESP32 (WiFi microcontroller)
- HC-SR04 (Ultrasonic sensor)

## 📖 Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Complete setup guide
- [ESP32 Setup](ESP32_SETUP.md) - Hardware configuration
- [API Documentation](backend/README.md) - Backend API reference

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Simulate sensor data
curl -X POST http://localhost:3001/api/water \
  -H "Content-Type: application/json" \
  -d '{"distance": 45.5, "percentage": 77.25, "volume": 386.25}'

# Get sensor status
curl http://localhost:3001/api/sensors/status
```

### Build for Production

```bash
# Frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

## 🔐 Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)

```env
PORT=3001
DATABASE_PATH=./data/water_monitor.db
CORS_ORIGIN=http://localhost:3000

# Tank configurations (HEIGHT_CM:DIAMETER_CM)
TANK_CONFIG_HOSTEL_A=200:150
TANK_CONFIG_HOSTEL_B=200:150
TANK_CONFIG_ACADEMIC_BLOCK=300:200
```

## 🚨 Troubleshooting

### ESP32 Can't Connect

- Verify WiFi credentials
- Check ESP32 and computer are on same network
- Ensure backend is running
- Check firewall allows port 3001

### Data Not Showing

- Check backend logs for incoming data
- Verify sensor ID matches database
- Refresh dashboard (auto-refresh every 30s)
- Check browser console for errors

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email/SMS alerts
- [ ] Predictive analytics with ML
- [ ] Multi-campus support
- [ ] Water quality sensors (pH, TDS)
- [ ] Automated valve control

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Recharts for beautiful charts
- ESP32 community for hardware support

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [documentation](INTEGRATION_GUIDE.md)
- Review [troubleshooting guide](ESP32_SETUP.md#troubleshooting)

---

**Built with ❤️ for sustainable campus water management**

## 📸 Screenshots

### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)

### Real-time Monitoring
![Monitoring](docs/screenshots/monitoring.png)

### ESP32 Setup
![ESP32](docs/screenshots/esp32.png)

---

**Star ⭐ this repo if you find it useful!**
