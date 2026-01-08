# ESP32 Configuration Guide

## Your ESP32 Firmware Setup

Your ESP32 is configured to send data to: `https://water-level-silk.vercel.app/api/water`

### To Use with Local Backend

Update your ESP32 code to point to your local backend:

```cpp
// Change this line in your ESP32 code:
const char* serverUrl = "http://YOUR_COMPUTER_IP:3001/api/water";

// Example:
const char* serverUrl = "http://192.168.1.100:3001/api/water";
```

### Find Your Computer's IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your local IP address (usually starts with 192.168.x.x or 10.0.x.x)

## Testing the Endpoint

### 1. Test with curl

```bash
curl -X POST http://localhost:3001/api/water \
  -H "Content-Type: application/json" \
  -d '{"distance": 45.5, "percentage": 77.25, "volume": 386.25}'
```

Expected response:
```json
{
  "success": true,
  "message": "Data received successfully",
  "data": {
    "sensorId": "S001",
    "waterLevelPercent": 77.25,
    "volumeLiters": 2730.5,
    "timestamp": "2026-01-06T19:50:00.000Z"
  }
}
```

### 2. Check Backend Logs

You should see in your backend terminal:
```
[ESP32] Received data: {"distance":45.5,"percentage":77.25,"volume":386.25}
[ESP32] ✓ Processed: { sensorId: 'S001', waterLevel: '77.3%', volume: '2730.5L' }
```

### 3. Verify in Dashboard

1. Open http://localhost:3000
2. Check the sensor status cards
3. You should see real-time water level updates

## Data Format

Your ESP32 sends:
```json
{
  "distance": 45.5,      // cm from sensor to water surface
  "percentage": 77.25,   // calculated by ESP32
  "volume": 386.25       // calculated by ESP32
}
```

Backend processes it and stores:
- Sensor ID: S001 (default)
- Building: hostel_a (default)
- Water level: Calculated from tank height - distance
- Volume: Recalculated based on tank dimensions in database

## Multiple Sensors

To use multiple sensors, add sensor ID to your ESP32 POST data:

```cpp
// In your ESP32 sendData() function, modify the payload:
String payload = "{";
payload += "\"sensorId\":\"S001\",";  // Add this line
payload += "\"buildingId\":\"hostel_a\",";  // Add this line
payload += "\"distance\":" + String(distance, 2) + ",";
payload += "\"percentage\":" + String(percentage, 2) + ",";
payload += "\"volume\":" + String(volume, 2);
payload += "}";
```

## Troubleshooting

### ESP32 Can't Connect

1. **Check WiFi credentials** in ESP32 code
2. **Verify backend is running**: `curl http://localhost:3001/health`
3. **Check firewall**: Allow port 3001
4. **Same network**: ESP32 and computer must be on same WiFi

### Data Not Appearing in Dashboard

1. **Check backend logs** for incoming data
2. **Verify sensor ID** matches database (default: S001)
3. **Refresh dashboard** (auto-refresh is every 30 seconds)
4. **Check browser console** for errors

### 405 Method Not Allowed

This usually means:
- Wrong URL (make sure it's `/api/water` not `/api/water/`)
- HTTP method mismatch (should be POST)
- CORS issue (already configured in backend)

## Current Status

✅ Backend endpoint `/api/water` is ready
✅ Accepts your ESP32 data format
✅ Processes and stores in database
✅ Dashboard will display real-time updates

**Next Step**: Update your ESP32 `serverUrl` to point to your local backend!
