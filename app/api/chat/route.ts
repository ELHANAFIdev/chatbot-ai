// app/api/chat/route.ts

import { streamText, type CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const maxDuration = 30;

async function searchDatabase(args: {
  item: string;
  brand?: string;
  color?: string;
  city?: string;
}) {
  console.log("Server: 🚀 searchDatabase START", args);
  try {
    let allKeywords: string[] = [];
    if (args.item) allKeywords.push(...args.item.toLowerCase().split(" "));
    if (args.brand) allKeywords.push(args.brand.toLowerCase());
    if (args.color) allKeywords.push(args.color.toLowerCase());
    allKeywords = [...new Set(allKeywords.filter((w) => w.length > 2))];

    const whereConditions: string[] = [];
    const params: string[] = [];
    allKeywords.forEach((keyword) => {
      whereConditions.push(`LOWER(f.discription) LIKE ?`);
      params.push(`%${keyword}%`);
    });
    if (args.city) {
      whereConditions.push(`LOWER(v.ville) LIKE ?`);
      params.push(`%${args.city.toLowerCase()}%`);
    }
    if (whereConditions.length === 0) return [];

    const sql = `
      SELECT
        f.id, f.discription as description, v.ville as city, c.cname as category_name,
        f.marque as model, f.postdate
      FROM fthings f
             LEFT JOIN catagoery c ON f.cat_ref = c.cid
             LEFT JOIN ville v ON f.ville = v.id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY f.postdate DESC LIMIT 5;
    `;
    const results = await query(sql, params) as any[];
    return Array.isArray(results)
      ? results.map((item: any) => ({
          ...item,
          id: String(item.id),
          contactUrl: `https://mafqoodat.ma/trouve.php?contact=${item.id}`,
        }))
      : [];
  } catch (error) {
    console.error("Server: ❌ Database search error:", error);
    return [];
  }
}

export async function POST(req: Request) {
  console.log("Server: --- New POST /api/chat request received ---");
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();
    const filteredMessages = messages.filter((m) => m.role !== "tool");
    const isFirstMessage = filteredMessages.length === 1 && filteredMessages[0].role === "user";

    const systemPrompt = `You are a smart, multilingual assistant for "Mafqoodat" in Morocco.
🌍 **Core Language Rule (NON-NEGOTIABLE)**:
1.  **Detect the language** of the user's last message (French, Arabic, Moroccan Darija, or English).
2.  You **MUST** reply **ONLY** in that detected language.
🔁 **Main Workflow: Direct Search & Response**
- If the user wants to find a lost item, use the \`searchDatabase\` tool.
- **Tool Parameters**: Always translate search terms to **French** before calling the tool.
📋 **How to Present Results (One Single Message)**:
- After the tool runs, generate **one single, complete message** in the user's language.
- **DO NOT** say "I am searching".
- **If items are found**: Start with an intro phrase (e.g., "J'ai trouvé...", "لقد وجدت..."), then list the results. Translate all labels.
- **If no items are found**: Respond politely that nothing was found and you **MUST** add a Markdown link to create a new ad: \`[Créer une nouvelle annonce](https://mafqoodat.ma/add.php)\` (translate the text "Créer une nouvelle annonce" to the user's language).
🚀 ${isFirstMessage ? `**First Message**: Start with a short friendly greeting in the user's detected language.` : ''}`;

    const result = await streamText({
      model: google('models/gemini-1.5-flash-latest'),
      system: systemPrompt,
      messages: filteredMessages,
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
      toolChoice: "auto",
      temperature: 0.1,
    });

    return result.response;

  } catch (error) {
    console.error("Server: ❌ POST error caught:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    console.log("Server: --- POST /api/chat request processing finished ---");
  }
}