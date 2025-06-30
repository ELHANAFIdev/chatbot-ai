import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    console.log("Fetching subcategories for category:", categoryId)

    const subcategories = await query("SELECT id, nom as name FROM souscatg WHERE id_mere = ? ORDER BY nom", [
      Number.parseInt(categoryId),
    ])

    console.log("Subcategories result:", subcategories)

    // Ensure we always return an array
    const result = Array.isArray(subcategories) ? subcategories : []

    return NextResponse.json(result)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Database error in subcategories:", error)
    return NextResponse.json({ error: "Failed to fetch subcategories", details: errMsg }, { status: 500 })
  }
}
