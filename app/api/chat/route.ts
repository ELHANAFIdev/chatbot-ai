import { streamText, generateText, type CoreMessage } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
export const maxDuration = 30

// 🔎 Fonction de recherche directe (No changes needed)
async function searchDatabase(args: {
  item: string
  brand?: string
  color?: string
  city?: string
}) {
  console.log("Server: 🚀 searchDatabase START", args)
  try {
    let allKeywords: string[] = []
    if (args.item) allKeywords.push(...args.item.toLowerCase().split(" "))
    if (args.brand) allKeywords.push(args.brand.toLowerCase())
    if (args.color) allKeywords.push(args.color.toLowerCase())
    allKeywords = [...new Set(allKeywords.filter((w) => w.length > 2))]
    console.log(`Server: 🧐 Combined search keywords (French): [${allKeywords.join(", ")}]`)

    const whereConditions: string[] = []
    const params: string[] = []

    allKeywords.forEach((keyword) => {
      whereConditions.push(`LOWER(f.discription) LIKE ?`)
      params.push(`%${keyword}%`)
    })

    if (args.city) {
      whereConditions.push(`LOWER(v.ville) LIKE ?`)
      params.push(`%${args.city.toLowerCase()}%`)
    }

    if (whereConditions.length === 0) {
      console.log("Server: ⚠️ No search conditions, returning empty results.")
      return []
    }

    const sql = `
      SELECT
        f.id, f.discription as description, v.ville as city, c.cname as category_name,
        f.marque as model, f.postdate
      FROM fthings f
             LEFT JOIN catagoery c ON f.cat_ref = c.cid
             LEFT JOIN ville v ON f.ville = v.id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY f.postdate DESC LIMIT 5;
    `

    console.log("Server: Executing SQL:", sql.trim().replace(/\s+/g, " "))
    console.log("Server: With params:", params)

    const results = await query(sql, params) as any[]
    console.log("Server: ✅ searchDatabase END - Rows found:", Array.isArray(results) ? results.length : 0)

    return Array.isArray(results)
        ? results.map((item: any) => ({
          ...item,
          id: String(item.id),
          contactUrl: `https://mafqoodat.ma/trouve.php?contact=${item.id}`,
        }))
        : []
  } catch (error) {
    console.error("Server: ❌ Database search error:", error)
    return []
  }
}

// ✅ Le point d'entrée principal (CORRIGÉ POUR AJOUTER LE BOUTON)
export async function POST(req: Request) {
  console.log("Server: --- New POST /api/chat request received ---")

  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()
    const filteredMessages = messages.filter((m) => m.role !== "tool")
    
    const isFirstMessage = filteredMessages.length === 1 && filteredMessages[0].role === "user"

    // === SYSTEM PROMPT AVEC INSTRUCTIONS POUR LE BOUTON "CRÉER UNE ANNONCE" ===
    const systemPrompt = `You are a smart, multilingual assistant for "Mafqoodat" in Morocco.

🌍 **Core Language Rule (NON-NEGOTIABLE)**:
1.  **Detect the language** of the user's last message (French, Arabic, Moroccan Darija, or English).
2.  You **MUST** reply **ONLY** in that detected language. This is your most important instruction.
3.  This rule applies to everything: greetings, questions, and the labels for search results.

🔁 **Main Workflow: Direct Search & Response**
- If the user wants to find a lost item, use the \`searchDatabase\` tool.
- **Tool Parameters**: Always translate search terms (item, city, etc.) to **French** before calling the tool.

📋 **How to Present Results (One Single Message)**:
- After the tool runs, generate **one single, complete message** in the user's language.
- **DO NOT** say "I am searching" or "One moment".
- **If items are found**: Start your response directly with an intro phrase (e.g., "J'ai trouvé...", "لقد وجدت..."), then list the results.
- **If no items are found (CRITICAL INSTRUCTION)**:
  - First, respond politely in the user's language that nothing was found.
  - Then, on a new line, you **MUST** add a suggestion to create a new ad. This suggestion must be a Markdown link.
  - **IMPORTANT**: Use this exact URL for the link: \`https://mafqoodat.ma/add.php\`
  - The link text **MUST** be translated:
    *   French: \`[Créer une nouvelle annonce](https://mafqoodat.ma/add.php)\`
    *   Arabic: \`[إنشاء إعلان جديد](https://mafqoodat.ma/add.php)\`
    *   English: \`[Create a new ad](https://mafqoodat.ma/add.php)\`

🚀 ${isFirstMessage ? `**First Message**: Start with a short friendly greeting in the user's detected language.` : ''}
`

    const messagesForAI: CoreMessage[] = filteredMessages

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: messagesForAI,
      tools: {
        searchDatabase: {
          description: "Searches the database for lost items. Always translate search parameters to French.",
          parameters: z.object({
            item: z.string().describe("The item to search for, translated to French."),
            city: z.string().optional().describe("The city to search in, translated to French."),
            brand: z.string().optional().describe("The brand of the item, translated to French."),
            color: z.string().optional().describe("The color of the item, translated to French."),
          }),
          execute: async (args) => await searchDatabase(args),
        },
      },
      maxOutputTokens: 1000,
      temperature: 0.1,
      toolChoice: "auto",
    })

    console.log("Server: ✨ generateText END - Result object obtained from AI model.")
    console.log("Server: ➡️ Returning text response:", result.text)
    return NextResponse.json({ text: result.text })
  } catch (error) {
    console.error("Server: ❌ generateText error caught:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  } finally {
    console.log("Server: --- POST /api/chat request processing finished ---")
  }
}