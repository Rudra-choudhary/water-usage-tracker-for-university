import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = process.env.DATABASE_PATH || './data/water_monitor.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    db.exec(schema);

    console.log('✅ Database initialized successfully');
}

// Helper function to get sensor info
export function getSensor(sensorId: string) {
    const stmt = db.prepare('SELECT * FROM sensors WHERE id = ?');
    return stmt.get(sensorId);
}

// Helper function to get all sensors
export function getAllSensors() {
    const stmt = db.prepare('SELECT * FROM sensors');
    return stmt.all();
}

// Close database connection gracefully
process.on('SIGINT', () => {
    db.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
});

export default db;
