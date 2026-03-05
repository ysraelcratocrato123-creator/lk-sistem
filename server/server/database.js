import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./server/database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      password TEXT
    )
  `);
});

export default db;