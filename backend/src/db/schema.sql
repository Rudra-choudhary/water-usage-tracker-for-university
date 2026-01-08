-- Sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL,
  location_label TEXT NOT NULL,
  tank_height_cm REAL NOT NULL,
  tank_diameter_cm REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_id TEXT NOT NULL,
  distance_cm REAL NOT NULL,
  water_level_cm REAL NOT NULL,
  water_level_percent REAL NOT NULL,
  volume_liters REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

-- Daily usage aggregation table
CREATE TABLE IF NOT EXISTS daily_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id TEXT NOT NULL,
  date DATE NOT NULL,
  total_litres REAL NOT NULL,
  peak_usage_hour INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, date)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('critical', 'warning', 'resolved')),
  building_id TEXT NOT NULL,
  sensor_id TEXT NOT NULL,
  issue TEXT NOT NULL,
  detected_at DATETIME NOT NULL,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_usage_building_date ON daily_usage(building_id, date);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);

-- Insert default sensors (adjust based on your setup)
INSERT OR IGNORE INTO sensors (id, building_id, location_label, tank_height_cm, tank_diameter_cm) VALUES
  ('S001', 'hostel_a', 'Hostel A - Main Tank', 200, 150),
  ('S002', 'hostel_a', 'Hostel A - Reserve Tank', 200, 150),
  ('S003', 'hostel_b', 'Hostel B - Main Tank', 200, 150),
  ('S004', 'hostel_b', 'Hostel B - Reserve Tank', 200, 150),
  ('S005', 'academic_block', 'Academic Block - Main Tank', 300, 200),
  ('S006', 'academic_block', 'Academic Block - Floor 1', 150, 100),
  ('S007', 'admin_block', 'Admin Block - Main Tank', 150, 100),
  ('S008', 'canteen', 'Canteen - Main Tank', 180, 120),
  ('S009', 'canteen', 'Canteen - Kitchen Tank', 150, 100);
