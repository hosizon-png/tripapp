import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "dev.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Auto-create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    phoneVerified INTEGER DEFAULT 0,
    email TEXT UNIQUE,
    emailVerified TEXT,
    passwordHash TEXT,
    name TEXT,
    avatarUrl TEXT,
    wechatOpenId TEXT UNIQUE,
    wechatUnionId TEXT,
    appleId TEXT UNIQUE,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS RefreshToken (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    device TEXT,
    expiresAt TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS SmsCode (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    expiresAt TEXT NOT NULL,
    ip TEXT,
    userId TEXT REFERENCES User(id),
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sms_phone ON SmsCode(phone, createdAt);
  CREATE INDEX IF NOT EXISTS idx_sms_ip ON SmsCode(ip, createdAt);

  CREATE TABLE IF NOT EXISTS Subscription (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'free',
    startDate TEXT DEFAULT (datetime('now')),
    endDate TEXT,
    autoRenew INTEGER DEFAULT 0,
    orderId TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS PaymentOrder (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    tier TEXT NOT NULL,
    period TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    provider TEXT,
    tradeNo TEXT,
    paidAt TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Trip (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT,
    coverImage TEXT,
    startDate TEXT,
    endDate TEXT,
    lat REAL,
    lng REAL,
    cityId TEXT,
    shareToken TEXT UNIQUE,
    isPublic INTEGER DEFAULT 0,
    templateId TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS TripTemplate (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    coverImage TEXT,
    days INTEGER NOT NULL,
    tags TEXT DEFAULT '[]',
    items TEXT DEFAULT '[]',
    isPublic INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ItineraryItem (
    id TEXT PRIMARY KEY,
    tripId TEXT NOT NULL REFERENCES Trip(id) ON DELETE CASCADE,
    dayNumber INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    startTime TEXT,
    endTime TEXT,
    locationName TEXT,
    address TEXT,
    lat REAL,
    lng REAL,
    bookingRef TEXT,
    notes TEXT,
    orderIndex INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Document (
    id TEXT PRIMARY KEY,
    tripId TEXT NOT NULL REFERENCES Trip(id) ON DELETE CASCADE,
    itineraryItemId TEXT REFERENCES ItineraryItem(id),
    name TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    fileType TEXT NOT NULL,
    fileSize INTEGER DEFAULT 0,
    category TEXT DEFAULT 'other',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Checklist (
    id TEXT PRIMARY KEY,
    tripId TEXT NOT NULL REFERENCES Trip(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ChecklistItem (
    id TEXT PRIMARY KEY,
    checklistId TEXT NOT NULL REFERENCES Checklist(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    isCompleted INTEGER DEFAULT 0,
    orderIndex INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS Expense (
    id TEXT PRIMARY KEY,
    tripId TEXT NOT NULL REFERENCES Trip(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'CNY',
    description TEXT,
    date TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS WeatherCache (
    id TEXT PRIMARY KEY,
    cityId TEXT NOT NULL,
    date TEXT NOT NULL,
    data TEXT NOT NULL,
    updatedAt TEXT DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_weather ON WeatherCache(cityId, date);

  CREATE TABLE IF NOT EXISTS ExchangeRate (
    id TEXT PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    rate REAL NOT NULL,
    updatedAt TEXT DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_rate ON ExchangeRate("from", "to");
`);

export const db = sqlite;
