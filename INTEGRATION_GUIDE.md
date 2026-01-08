# ESP32 Integration Complete! 🎉

## Quick Start Guide

### 1. Start the Backend Server

```bash
cd backend
npm install  # Already done
npm run dev
```

You should see:
```
✅ Database initialized successfully
🚀 Campus Water Monitor API
📡 Server running on http://localhost:3001
```

### 2. Configure ESP32

1. Open `esp32/water_sensor/water_sensor.ino` in Arduino IDE
2. Update these values:

```cpp
// Sensor Configuration
#define SENSOR_ID "S001"              // Unique for each sensor
#define BUILDING_ID "hostel_a"        // Building location
#define TANK_HEIGHT 200.0             // Your tank height in cm

// WiFi Configuration
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// API Configuration - Use your computer's IP address
const char* API_ENDPOINT = "http://192.168.1.100:3001/api/sensors/reading";
```

3. **Find your computer's IP address:**
   ```bash
   # Mac/Linux:
   ifconfig | grep "inet "
   
   # Windows:
   ipconfig
   ```

4. Upload to ESP32

### 3. Test the System

#### Test Backend API

```bash
# Check if backend is running
curl http://localhost:3001/health

# Simulate a sensor reading
curl -X POST http://localhost:3001/api/sensors/reading \
  -H "Content-Type: application/json" \
  -d '{"sensorId":"S001","buildingId":"hostel_a","distanceCm":45.5}'

# Check sensor status
curl http://localhost:3001/api/sensors/status
```

#### Test ESP32

1. Open Serial Monitor in Arduino IDE (115200 baud)
2. You should see:
   ```
   ✓ WiFi Connected!
   Distance: 45.23 cm
   Water Level: 154.77 cm (77.4%)
   ✓ API Response [201]: {"success":true,...}
   ```

### 4. View Dashboard

The frontend will automatically fetch data from the backend API:

```bash
# In the main project directory
npm run dev
```

Open http://localhost:3000

---

## System Architecture

```
┌─────────────┐
│   ESP32     │  Ultrasonic Sensor (HC-SR04)
│  + WiFi     │  Measures distance to water
└──────┬──────┘
       │ HTTP POST every 30s
       │ {"sensorId":"S001","distanceCm":45.5}
       ▼
┌─────────────────────────────────────┐
│   Backend API (Port 3001)           │
│  ┌──────────────────────────────┐   │
│  │  Express Server              │   │
│  │  - Receives sensor data      │   │
│  │  - Calculates water level    │   │
│  │  - Detects anomalies         │   │
│  │  - Stores in SQLite          │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │ REST API
               │ GET /api/sensors/status
               │ GET /api/usage?days=7
               ▼
┌─────────────────────────────────────┐
│   Frontend Dashboard (Port 3000)    │
│  - Real-time water levels           │
│  - Usage analytics                  │
│  - Leak detection alerts            │
│  - Sensor health monitoring         │
└─────────────────────────────────────┘
```

---

## API Endpoints

### Sensor Endpoints

**POST /api/sensors/reading**
- Receive sensor data from ESP32
- Request body:
  ```json
  {
    "sensorId": "S001",
    "buildingId": "hostel_a",
    "distanceCm": 45.5
  }
  ```

**GET /api/sensors/status**
- Get status of all sensors
- Returns: Array of sensor statuses with water levels

### Usage Endpoints

**GET /api/usage?days=7**
- Get historical usage data
- Query params: `days` (1-365)

**GET /api/usage/hourly**
- Get today's hourly usage breakdown

**GET /api/alerts**
- Get active leak/anomaly alerts

---

## Tank Configuration

Edit `backend/.env` to configure your tank dimensions:

```env
# Format: HEIGHT_CM:DIAMETER_CM
TANK_CONFIG_HOSTEL_A=200:150
TANK_CONFIG_HOSTEL_B=200:150
TANK_CONFIG_ACADEMIC_BLOCK=300:200
TANK_CONFIG_ADMIN_BLOCK=150:100
TANK_CONFIG_CANTEEN=180:120
```

**How to measure:**
1. **Height**: Measure from bottom to top of tank (cm)
2. **Diameter**: Measure across the widest part (cm)

These values are used to calculate water volume in liters.

---

## Adding More Sensors

### 1. Add to Database

The database already has 9 sensors configured. To add more:

```sql
INSERT INTO sensors (id, building_id, location_label, tank_height_cm, tank_diameter_cm)
VALUES ('S010', 'hostel_a', 'Hostel A - Backup Tank', 150, 100);
```

### 2. Configure ESP32

Flash a new ESP32 with unique `SENSOR_ID`:

```cpp
#define SENSOR_ID "S010"  // Must match database
#define BUILDING_ID "hostel_a"
#define TANK_HEIGHT 150.0
```

### 3. Deploy

Mount sensor on tank and power on. It will automatically start sending data.

---

## Troubleshooting

### Backend Issues

**Problem**: "Cannot find module 'better-sqlite3'"
```bash
cd backend
npm install
```

**Problem**: "Port 3001 already in use"
```bash
# Change port in backend/.env
PORT=3002
```

### ESP32 Issues

**Problem**: "WiFi Connection Failed"
- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Move closer to router

**Problem**: "API Error: connection refused"
- Verify backend is running
- Check API_ENDPOINT URL is correct
- Ensure ESP32 and backend are on same network

**Problem**: "Out of range" readings
- Check sensor wiring
- Ensure sensor faces straight down
- Clean sensor lens
- Verify tank is not empty

### Frontend Issues

**Problem**: "Failed to fetch"
- Check backend is running on port 3001
- Verify CORS is enabled
- Check browser console for errors

---

## Data Flow Example

1. **ESP32 reads sensor** (every 30 seconds)
   - Distance from top: 45.5 cm
   - Tank height: 200 cm

2. **Backend calculates**
   - Water level: 200 - 45.5 = 154.5 cm
   - Water level %: (154.5 / 200) × 100 = 77.25%
   - Volume: π × (75)² × 154.5 / 1000 = 2,730 liters

3. **Backend detects anomalies**
   - If level drops >20% per hour → Critical alert
   - If level drops >10% per hour → Warning

4. **Frontend displays**
   - Real-time water level gauge
   - Usage trends and analytics
   - Active alerts

---

## Production Deployment

### Backend

**Option 1: VPS (DigitalOcean, AWS, etc.)**
```bash
# Install Node.js
# Clone repository
# Install dependencies
npm install
npm run build
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name water-monitor
pm2 save
pm2 startup
```

**Option 2: Docker**
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Frontend

Deploy to Vercel (recommended for Next.js):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Database

For production, consider:
- **PostgreSQL** for better scalability
- **TimescaleDB** for time-series data
- **InfluxDB** for IoT metrics

---

## Monitoring & Maintenance

### Daily
- Check sensor online status
- Review active alerts
- Verify data is being received

### Weekly
- Review usage patterns
- Check for anomalies
- Clean sensor lenses

### Monthly
- Calibrate sensors
- Update firmware if needed
- Review database size
- Backup data

---

## Next Steps

1. ✅ Backend API running
2. ✅ ESP32 firmware ready
3. ⏳ Flash ESP32 with your WiFi credentials
4. ⏳ Mount sensors on tanks
5. ⏳ Verify data flow
6. ⏳ Configure tank dimensions
7. ⏳ Deploy to production

---

## Support & Resources

- **ESP32 Documentation**: https://docs.espressif.com/
- **Arduino IDE**: https://www.arduino.cc/
- **Next.js Docs**: https://nextjs.org/docs
- **Express.js**: https://expressjs.com/

For issues, check:
1. Serial Monitor output (ESP32)
2. Backend console logs
3. Browser console (Frontend)
4. Database contents

---

**Built with ❤️ for sustainable campus water management**
