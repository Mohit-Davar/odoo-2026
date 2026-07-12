import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isLocal = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1"));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : (process.env.DATABASE_URL ? { rejectUnauthorized: false } : false)
});

const connectDB = async () => {
    try {
        await pool.query("SELECT NOW()");
        console.log("PostgreSQL DB connected successfully.");

        // Migration query
        const migrationQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                refresh_token VARCHAR(255),
                verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(migrationQuery);
        console.log("Database migrations applied.");
    } catch (error) {
        console.error("Database connection/migration error:", error);
        process.exit(1);
    }
};

export default connectDB;