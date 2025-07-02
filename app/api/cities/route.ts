import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching cities from database...")

    // Check if database is configured
    if (!process.env.DB_HOST) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const cities = await query("SELECT id, ville as name FROM ville ORDER BY ville")

    console.log("Cities fetched:", Array.isArray(cities) ? cities.length : 0)

    if (!Array.isArray(cities)) {
      throw new Error("Invalid cities data format")
    }

    return NextResponse.json(cities)
  } catch (error) {
    console.error("Database error in cities:", error)
    return NextResponse.json({ error: "Failed to fetch cities", details: error.message }, { status: 500 })
  }
}
