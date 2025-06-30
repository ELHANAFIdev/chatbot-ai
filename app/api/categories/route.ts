import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching categories...")

    // Check if database is available
    if (!process.env.DB_HOST) {
      console.log("Using fallback categories")
      return NextResponse.json([
        { id: 1, name: "Electronics" },
        { id: 2, name: "Clothing" },
        { id: 3, name: "Accessories" },
        { id: 4, name: "Documents" },
        { id: 5, name: "Jewelry" },
        { id: 6, name: "Bags" },
        { id: 7, name: "Keys" },
        { id: 8, name: "Other" },
      ])
    }

    const categories = await query("SELECT cid as id, cname as name FROM catagoery ORDER BY cname")

    console.log("Categories result:", categories)

    // Ensure we always return an array
    const result = Array.isArray(categories) ? categories : []

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database error in categories:", error)

    // Return fallback data instead of error
    return NextResponse.json([
      { id: 1, name: "Electronics" },
      { id: 2, name: "Clothing" },
      { id: 3, name: "Accessories" },
      { id: 4, name: "Documents" },
      { id: 5, name: "Jewelry" },
      { id: 6, name: "Bags" },
      { id: 7, name: "Keys" },
      { id: 8, name: "Other" },
    ])
  }
}
