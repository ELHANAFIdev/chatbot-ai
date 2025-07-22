import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        console.log("🧪 Testing database connection...");
        
        // Simple test query
        const testSql = `
            SELECT 
                f.id, f.discription as description, v.ville as city, c.cname as category_name,
                f.marque, f.modele, f.color, f.type, f.etat, f.postdate
            FROM fthings f
            LEFT JOIN catagoery c ON f.cat_ref = c.cid
            LEFT JOIN ville v ON f.ville = v.id
            LIMIT 3;
        `;
        
        const results = await query(testSql, []);
        console.log("🧪 Test query results:", results);
        
        return NextResponse.json({
            success: true,
            message: "Database connection working",
            results: results
        });
    } catch (error) {
        console.error("🧪 Database test failed:", error);
        return NextResponse.json({
            success: false,
            message: "Database connection failed",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
} 