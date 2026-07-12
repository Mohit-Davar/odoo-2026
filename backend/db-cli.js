import pg from "pg";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "neondb=# "
});

console.log("Connecting to Neon PostgreSQL database...");
try {
  const res = await pool.query("SELECT NOW()");
  console.log("Connected successfully! Server time:", res.rows[0].now);
  console.log("Type your SQL query and press Enter. Type 'exit' to quit.\n");
  rl.prompt();
} catch (err) {
  console.error("Connection failed:", err.message);
  pool.end();
  process.exit(1);
}

rl.on("line", async (line) => {
  const query = line.trim();
  if (query.toLowerCase() === "exit" || query.toLowerCase() === "quit") {
    rl.close();
    return;
  }
  
  if (!query) {
    rl.prompt();
    return;
  }

  let sqlToRun = query;
  const lowerQuery = query.toLowerCase().replace(/;/g, "").trim();
  if (lowerQuery === "\\dt" || lowerQuery === "show tables") {
    sqlToRun = "SELECT table_name AS \"Tables\" FROM information_schema.tables WHERE table_schema = 'public';";
  }
  
  try {
    const res = await pool.query(sqlToRun);
    if (Array.isArray(res)) {
      // Multiple queries executed
      res.forEach((r, idx) => {
        console.log(`\n--- Result ${idx + 1} ---`);
        if (r.rows && r.rows.length > 0) {
          console.table(r.rows);
        } else {
          console.log(`Query OK. Command: ${r.command}. Rows affected: ${r.rowCount}`);
        }
      });
    } else {
      if (res.rows && res.rows.length > 0) {
        console.table(res.rows);
      } else {
        console.log(`Query OK. Command: ${res.command}. Rows affected: ${res.rowCount}`);
      }
    }
  } catch (err) {
    console.error("Error executing query:", err.message);
  }
  
  console.log();
  rl.prompt();
}).on("close", () => {
  console.log("Closing connection. Goodbye!");
  pool.end();
  process.exit(0);
});
