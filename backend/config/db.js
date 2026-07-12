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
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
