import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { searchTerm } = await req.json();
        console.log("🧪 Testing search with term:", searchTerm);
        
        const lowerTerm = searchTerm.toLowerCase();
        const keywords = lowerTerm.split(' ').filter(w => w.length > 2);
        
        if (keywords.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No valid search terms found"
            });
        }
        
        const keywordConditions = keywords.map(keyword => {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return `(LOWER(f.discription) REGEXP ? OR LOWER(f.type) REGEXP ?)`;
        }).join(' OR ');
        
        const params = keywords.flatMap(keyword => {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return [`\\b${escapedKeyword}\\b`, `\\b${escapedKeyword}\\b`];
        });
        
        const sql = `
            SELECT 
                f.id, f.discription as description, v.ville as city, c.cname as category_name,
                f.marque, f.modele, f.color, f.type, f.etat, f.postdate
            FROM fthings f
            LEFT JOIN catagoery c ON f.cat_ref = c.cid
            LEFT JOIN ville v ON f.ville = v.id
            WHERE (${keywordConditions})
            ORDER BY f.postdate DESC LIMIT 5;
        `;
        
        console.log("🧪 Search SQL:", sql);
        console.log("🧪 Search params:", params);
        
        const results = await query(sql, params);
        console.log("🧪 Search results:", results);
        
        return NextResponse.json({
            success: true,
            message: `Found ${results.length} results`,
            results: results.map(item => ({
                ...item, 
                id: String(item.id), 
                contactUrl: `https://mafqoodat.ma/trouve.php?contact=${item.id}`
            }))
        });
    } catch (error) {
        console.error("🧪 Search test failed:", error);
        return NextResponse.json({
            success: false,
            message: "Search failed",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
} 