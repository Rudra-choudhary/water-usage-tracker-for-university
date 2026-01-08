# ESP32 Water Sensor Setup Guide

## Hardware Requirements

- **ESP32 Development Board** (any variant)
- **HC-SR04 Ultrasonic Sensor**
- **Jumper Wires**
- **USB Cable** (for programming)
- **Power Supply** (5V, 1A minimum)

## Wiring Diagram

```
HC-SR04          ESP32
─────────────────────────
VCC      ───────  5V
TRIG     ───────  GPIO 5
ECHO     ───────  GPIO 18
GND      ───────  GND
```

**Important Notes:**
- HC-SR04 requires 5V power
- ECHO pin outputs 5V, but ESP32 GPIO is 3.3V tolerant (safe for most ESP32 boards)
- If concerned, use a voltage divider (1kΩ + 2kΩ resistors) on ECHO pin

## Software Setup

### 1. Install Arduino IDE

Download from: https://www.arduino.cc/en/software

### 2. Add ESP32 Board Support

1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add this URL to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for "esp32"
6. Install "esp32 by Espressif Systems"

### 3. Install Required Libraries

The following libraries are included with ESP32 board support:
- WiFi
- HTTPClient

No additional libraries needed!

### 4. Configure the Code

Open `water_sensor.ino` and update these values:

```cpp
// Sensor Configuration
#define SENSOR_ID "S001"              // Change for each sensor
#define BUILDING_ID "hostel_a"        // Building location
#define TANK_HEIGHT 200.0             // Your tank height in cm

// WiFi Configuration
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// API Configuration
const char* API_ENDPOINT = "http://192.168.1.100:3001/api/sensors/reading";
```

**Finding Your Backend IP:**
```bash
# On the computer running the backend:
# Mac/Linux:
ifconfig | grep "inet "

# Windows:
ipconfig
```

### 5. Upload to ESP32

1. Connect ESP32 to computer via USB
2. In Arduino IDE:
   - **Tools → Board** → Select your ESP32 board (e.g., "ESP32 Dev Module")
   - **Tools → Port** → Select the COM port
   - **Tools → Upload Speed** → 115200
3. Click **Upload** button (→)
4. Wait for "Done uploading" message

### 6. Monitor Serial Output

1. Open **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   =================================
   Campus Water Monitor - ESP32
   =================================
   Sensor ID: S001
   Building: hostel_a
   Tank Height: 200.0 cm
   =================================

   Connecting to WiFi: Your_WiFi_SSID
   ....
   ✓ WiFi Connected!
   IP Address: 192.168.1.150
   Signal Strength: -45 dBm

   ─────────────────────────────
   Distance: 45.23 cm
   Water Level: 154.77 cm (77.4%)
   Sending to API...
   Payload: {"sensorId":"S001","buildingId":"hostel_a","distanceCm":45.23}
   ✓ API Response [201]: {"success":true,"data":{...}}
   ─────────────────────────────
   ```

## Mounting the Sensor

### Tank Installation

1. **Position**: Mount sensor at the top center of the tank
2. **Height**: Sensor should face straight down
3. **Distance**: Keep at least 2cm from tank top
4. **Alignment**: Ensure sensor is perpendicular to water surface
5. **Protection**: Use waterproof enclosure if needed

### Calibration

1. Measure actual tank height with a ruler
2. Update `TANK_HEIGHT` in code
3. Fill tank completely
4. Check sensor reading matches tank height
5. Adjust if needed

## Troubleshooting

### WiFi Connection Issues

**Problem**: "WiFi Connection Failed!"

**Solutions**:
- Check SSID and password are correct
- Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Move ESP32 closer to router
- Check router allows new devices

### API Connection Issues

**Problem**: "API Error: connection refused"

**Solutions**:
- Verify backend server is running (`npm run dev`)
- Check API_ENDPOINT URL is correct
- Ensure ESP32 and backend are on same network
- Test API with curl:
  ```bash
  curl http://192.168.1.100:3001/health
  ```

### Sensor Reading Issues

**Problem**: "Out of range" or invalid readings

**Solutions**:
- Check wiring connections
- Ensure sensor faces straight down
- Clean sensor (dust can affect readings)
- Check tank is not empty (sensor range: 2-400cm)
- Verify 5V power supply is stable

### Upload Issues

**Problem**: "Failed to connect to ESP32"

**Solutions**:
- Hold BOOT button while uploading
- Try different USB cable
- Install CP210x or CH340 drivers
- Check correct COM port is selected

## Multiple Sensors Setup

For multiple sensors in the same building:

1. **Flash each ESP32** with unique configuration:
   ```cpp
   // Sensor 1
   #define SENSOR_ID "S001"
   
   // Sensor 2
   #define SENSOR_ID "S002"
   ```

2. **Label each ESP32** physically to avoid confusion

3. **Update database** to add new sensors:
   ```sql
   INSERT INTO sensors (id, building_id, location_label, tank_height_cm, tank_diameter_cm)
   VALUES ('S002', 'hostel_a', 'Hostel A - Reserve Tank', 200, 150);
   ```

## Power Options

### USB Power (Development)
- Connect to computer or USB power adapter
- Simple but requires nearby power outlet

### Battery Power (Optional)
- Use 18650 Li-ion battery with holder
- Add deep sleep mode to extend battery life
- Typical runtime: 2-3 days per charge

### Solar Power (Advanced)
- 5V solar panel + battery
- Ideal for outdoor tanks
- Requires charge controller

## Maintenance

### Weekly
- Check WiFi connection status
- Verify sensor readings are reasonable
- Clean sensor lens if dusty

### Monthly
- Check physical mounting
- Verify wiring connections
- Update firmware if needed

### Quarterly
- Calibrate sensor readings
- Replace batteries (if battery powered)
- Check for corrosion on connections

## Advanced Configuration

### Change Reading Interval

```cpp
#define READING_INTERVAL 30000  // 30 seconds (default)
// Change to:
#define READING_INTERVAL 60000  // 1 minute
#define READING_INTERVAL 300000 // 5 minutes
```

### Enable Deep Sleep (Battery Saving)

Add this to reduce power consumption:

```cpp
#include <esp_sleep.h>

// In loop(), after sending data:
esp_sleep_enable_timer_wakeup(30 * 1000000); // 30 seconds
esp_deep_sleep_start();
```

## Support

For issues or questions:
1. Check Serial Monitor output for error messages
2. Verify all configuration values
3. Test each component separately (WiFi, sensor, API)
4. Consult ESP32 documentation: https://docs.espressif.com/
