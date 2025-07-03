import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("Advanced search request received...")

    // Check if database is configured
    if (!process.env.DB_HOST) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const cityId = searchParams.get("cityId")
    const description = searchParams.get("description")
    const subcategoryId = searchParams.get("subcategoryId")

    console.log("Advanced search params:", { categoryId, cityId, description, subcategoryId })

    // Build dynamic SQL query
    let sql = `
      SELECT 
        f.id,
        f.discription as description,
        f.ville as city_id,
        f.cat_ref as category_ref,
        f.marque,
        f.modele,
        f.color,
        f.type,
        f.etat,
        f.postdate,
        c.cname as category_name,
        v.ville as city
      FROM fthings f
      LEFT JOIN catagoery c ON f.cat_ref = c.cid
      LEFT JOIN ville v ON f.ville = v.id
      WHERE 1=1
    `

    const params: any[] = []

    // Add category filter
    if (categoryId && categoryId.trim()) {
      sql += ` AND f.cat_ref = ?`
      params.push(Number.parseInt(categoryId))
    }

    // Add city filter
    if (cityId && cityId.trim()) {
      sql += ` AND f.ville = ?`
      params.push(Number.parseInt(cityId))
    }

    // Add subcategory filter
    if (subcategoryId && subcategoryId.trim()) {
      sql += ` AND f.souscatg_id = ?`
      params.push(Number.parseInt(subcategoryId))
    }

    // Add description/brand/model filter
    if (description && description.trim()) {
      sql += ` AND (
        LOWER(f.discription) LIKE LOWER(?) OR
        LOWER(f.marque) LIKE LOWER(?) OR
        LOWER(f.modele) LIKE LOWER(?) OR
        LOWER(f.type) LIKE LOWER(?) OR
        LOWER(f.color) LIKE LOWER(?)
      )`
      const searchTerm = `%${description.trim()}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    sql += ` ORDER BY f.postdate DESC LIMIT 50`

    console.log("Executing advanced search query with params:", params.length)
    const results = await query(sql, params)

    if (!Array.isArray(results)) {
      throw new Error("Invalid search results data format")
    }

    console.log(`✅ Advanced search found ${results.length} results`)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("❌ Advanced search API error:", error)
    return NextResponse.json({ error: "Search failed", details: error.message }, { status: 500 })
  }
}
