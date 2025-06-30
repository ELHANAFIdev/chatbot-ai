import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

function createPool() {
  try {
    if (!pool) {
      // Only create pool if database credentials are provided
      if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
        console.log("Creating database pool with:", {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          database: process.env.DB_NAME,
        })

        pool = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD || "",
          database: process.env.DB_NAME,
          waitForConnections: true,
          connectionLimit: 5,
          queueLimit: 0,
          acquireTimeout: 30000,
          timeout: 30000,
          reconnect: true,
        })
        console.log("Database pool created successfully")
      } else {
        console.warn("Database credentials not provided. Using fallback data.")
        return null
      }
    }
    return pool
  } catch (error) {
    console.error("Failed to create database pool:", error)
    return null
  }
}

export async function query(sql: string, params: any[] = []) {
  try {
    const connection = createPool()
    if (!connection) {
      console.log("No database connection, using fallback")
      throw new Error("Database connection not available")
    }

    console.log("Executing query:", sql.substring(0, 100) + "...")
    console.log("With params:", params)

    const [rows] = await connection.execute(sql, params)
    console.log("Query successful, rows:", Array.isArray(rows) ? rows.length : "not array")

    return rows
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export default createPool()
