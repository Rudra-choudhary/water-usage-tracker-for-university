/*
 * Campus Water Monitor - ESP32 Ultrasonic Sensor
 * 
 * This code reads water level using HC-SR04 ultrasonic sensor
 * and sends data to the backend API via WiFi.
 * 
 * Hardware:
 * - ESP32 Dev Board
 * - HC-SR04 Ultrasonic Sensor
 *   - TRIG -> D25
 *   - ECHO -> D26
 *   - VCC -> 5V
 *   - GND -> GND
 * 
 * Setup:
 * 1. Install ESP32 board support in Arduino IDE
 * 2. Install required libraries (WiFi, HTTPClient)
 * 3. Update configuration below with your settings
 * 4. Upload to ESP32
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ===== CONFIGURATION - UPDATE THESE VALUES =====

// Sensor Configuration
#define SENSOR_ID "S001"              // Unique sensor ID (S001, S002, etc.)
#define BUILDING_ID "hostel_a"        // Building location
#define TANK_HEIGHT 200.0             // Total tank height in cm

// WiFi Configuration
const char* WIFI_SSID = "Your_WiFi_SSID";         // Your WiFi network name
const char* WIFI_PASSWORD = "Your_WiFi_Password"; // Your WiFi password

// API Configuration
const char* API_ENDPOINT = "http://192.168.1.100:3001/api/sensors/reading";  // Backend API URL

// Sensor Pins
#define TRIG_PIN 25
#define ECHO_PIN 26

// Timing Configuration
#define READING_INTERVAL 30000        // Send reading every 30 seconds (30000 ms)
#define WIFI_RETRY_DELAY 5000         // Retry WiFi connection after 5 seconds

// ===== END CONFIGURATION =====

long duration;
float distance;
unsigned long lastReadingTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=================================");
  Serial.println("Campus Water Monitor - ESP32");
  Serial.println("=================================");
  Serial.printf("Sensor ID: %s\n", SENSOR_ID);
  Serial.printf("Building: %s\n", BUILDING_ID);
  Serial.printf("Tank Height: %.1f cm\n", TANK_HEIGHT);
  Serial.println("=================================\n");

  // Initialize sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Connect to WiFi
  connectWiFi();
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected! Reconnecting...");
    connectWiFi();
  }

  // Read sensor and send data at specified interval
  if (millis() - lastReadingTime >= READING_INTERVAL) {
    lastReadingTime = millis();
    
    float dist = readDistance();
    
    if (dist > 0) {
      sendDataToAPI(dist);
    }
  }

  delay(100);  // Small delay to prevent watchdog issues
}

/**
 * Connect to WiFi network
 */
void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s\n", WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
    Serial.printf("Retrying in %d seconds...\n", WIFI_RETRY_DELAY / 1000);
    delay(WIFI_RETRY_DELAY);
  }
}

/**
 * Read distance from ultrasonic sensor
 * Returns distance in cm, or -1 if out of range
 */
float readDistance() {
  // Ensure trigger is LOW
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  // Send trigger pulse (10µs)
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read echo pulse width (timeout after 30ms)
  duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    Serial.println("⚠ Sensor: Out of range");
    return -1;
  }

  // Calculate distance (speed of sound = 0.034 cm/µs)
  distance = duration * 0.034 / 2;

  // Validate reading
  if (distance < 2 || distance > 400) {
    Serial.printf("⚠ Invalid reading: %.2f cm\n", distance);
    return -1;
  }

  // Calculate water level
  float waterLevel = TANK_HEIGHT - distance;
  float waterPercent = (waterLevel / TANK_HEIGHT) * 100;

  Serial.println("─────────────────────────────");
  Serial.printf("Distance: %.2f cm\n", distance);
  Serial.printf("Water Level: %.2f cm (%.1f%%)\n", waterLevel, waterPercent);
  
  return distance;
}

/**
 * Send sensor data to backend API
 */
void sendDataToAPI(float distanceCm) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ Cannot send data - WiFi not connected");
    return;
  }

  HTTPClient http;
  
  // Prepare JSON payload
  String jsonPayload = "{";
  jsonPayload += "\"sensorId\":\"" + String(SENSOR_ID) + "\",";
  jsonPayload += "\"buildingId\":\"" + String(BUILDING_ID) + "\",";
  jsonPayload += "\"distanceCm\":" + String(distanceCm, 2);
  jsonPayload += "}";

  Serial.println("Sending to API...");
  Serial.println("Payload: " + jsonPayload);

  // Send HTTP POST request
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✓ API Response [%d]: %s\n", httpResponseCode, response.c_str());
  } else {
    Serial.printf("✗ API Error: %s\n", http.errorToString(httpResponseCode).c_str());
    Serial.println("  Check:");
    Serial.println("  - Backend server is running");
    Serial.println("  - API_ENDPOINT URL is correct");
    Serial.println("  - ESP32 can reach the server");
  }

  http.end();
  Serial.println("─────────────────────────────\n");
}
