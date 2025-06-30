import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching cities...")

    // Check if database is available
    if (!process.env.DB_HOST) {
      console.log("Using fallback cities")
      return NextResponse.json([
        { id: 1, name: "Casablanca" },
        { id: 2, name: "Rabat" },
        { id: 3, name: "Marrakech" },
        { id: 4, name: "Fes" },
        { id: 5, name: "Tangier" },
        { id: 6, name: "Agadir" },
        { id: 7, name: "Meknes" },
        { id: 8, name: "Oujda" },
      ])
    }

    const cities = await query("SELECT id, ville as name FROM ville ORDER BY ville")

    console.log("Cities result:", cities)

    // Ensure we always return an array
    const result = Array.isArray(cities) ? cities : []

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database error in cities:", error)

    // Return fallback data instead of error
    return NextResponse.json([
      { id: 1, name: "Casablanca" },
      { id: 2, name: "Rabat" },
      { id: 3, name: "Marrakech" },
      { id: 4, name: "Fes" },
      { id: 5, name: "Tangier" },
      { id: 6, name: "Agadir" },
      { id: 7, name: "Meknes" },
      { id: 8, name: "Oujda" },
    ])
  }
}
