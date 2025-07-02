import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subcategoryId = searchParams.get("subcategoryId")

    if (!subcategoryId) {
      return NextResponse.json({ error: "Subcategory ID is required" }, { status: 400 })
    }

    console.log("Fetching models for subcategory:", subcategoryId)

    const models = await query("SELECT id, nom FROM souscatg WHERE subcategory_id = ? ORDER BY nom", [
      Number.parseInt(subcategoryId),
    ])

    console.log("Models result:", models)

    // Ensure we always return an array
    const result = Array.isArray(models) ? models : []

    return NextResponse.json(result)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Database error in models:", error)
    return NextResponse.json({ error: "Failed to fetch models", details: errMsg }, { status: 500 })
  }
}
