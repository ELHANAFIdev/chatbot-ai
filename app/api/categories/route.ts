import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching categories from database...")

    // Check if database is configured
    if (!process.env.DB_HOST) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const categories = await query("SELECT cid as id, cname as name FROM catagoery ORDER BY cname")

    console.log("Categories fetched:", Array.isArray(categories) ? categories.length : 0)

    if (!Array.isArray(categories)) {
      throw new Error("Invalid categories data format")
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Database error in categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories", details: error.message }, { status: 500 })
  }
}
