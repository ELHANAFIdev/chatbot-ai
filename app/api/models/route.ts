import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID (id_mere) is required" }, { status: 400 })
    }

    const categoryIdNum = Number.parseInt(categoryId)
    if (isNaN(categoryIdNum)) {
      return NextResponse.json({ error: "Invalid Category ID" }, { status: 400 })
    }

    console.log("Fetching souscatg for category (id_mere):", categoryIdNum)

    const souscategories = await query(
      "SELECT id, nom FROM souscatg WHERE id_mere = ? ORDER BY nom",
      [categoryIdNum]
    )

    const result = Array.isArray(souscategories) ? souscategories : []

    return NextResponse.json(result)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error("Database error in souscatg fetch:", errMsg)
    return NextResponse.json({ error: "Failed to fetch souscatg", details: errMsg }, { status: 500 })
  }
}
