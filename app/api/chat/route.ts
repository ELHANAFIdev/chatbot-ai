import { streamText, type CoreMessage } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export const maxDuration = 30

// 🔍 Fonction de recherche directe
async function searchDatabase(args: { 
  item: string
  brand?: string
  color?: string
  city?: string
}) {
  console.log("Server: 🔵 searchDatabase START", args)
  try {
    // Construction des mots-clés (l'IA est maintenant chargée de les fournir en français)
    let allKeywords: string[] = []
    if (args.item) allKeywords.push(...args.item.toLowerCase().split(" "))
    if (args.brand) allKeywords.push(args.brand.toLowerCase())
    if (args.color) allKeywords.push(args.color.toLowerCase())
    allKeywords = [...new Set(allKeywords.filter((w) => w.length > 2))]
    console.log(`Server: 🧠 Combined search keywords (French): [${allKeywords.join(", ")}]`)

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
            f.marque, f.modele, f.color, f.type, f.etat, f.postdate
          FROM fthings f
          LEFT JOIN catagoery c ON f.cat_ref = c.cid
          LEFT JOIN ville v ON f.ville = v.id
          WHERE ${whereConditions.join(" AND ")}
            ORDER BY f.postdate DESC LIMIT 5;
        `

    console.log("Server: 🔍 Executing SQL:", sql.trim().replace(/\s+/g, " "))
    console.log("Server: 📦 With params:", params)

    const results = await query(sql, params)
    console.log("Server: 🟢 searchDatabase END - Rows found:", Array.isArray(results) ? results.length : 0)

    return Array.isArray(results)
      ? results.map((item) => ({
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

// ✅ Le point d'entrée principal
export async function POST(req: Request) {
  console.log("Server: --- New POST /api/chat request received ---")
  const { messages }: { messages: CoreMessage[] } = await req.json()
  const filteredMessages = messages.filter((m) => m.role !== "tool")
  const lastMessageContent = filteredMessages[filteredMessages.length - 1]?.content || ""

  // Detect language based on the last message
  let lang = "fr" // Default to French
  if (/[a-zA-Z]/.test(lastMessageContent) && !/[\u0600-\u06FF]/.test(lastMessageContent)) {
    lang = "en" // Contains Latin characters but no Arabic, assume English
  } else if (/[\u0600-\u06FF]/.test(lastMessageContent)) {
    lang = "ar" // Contains Arabic characters
  }
  console.log(`Server: Detected language: ${lang}`)

  // Unified System Prompt for all languages
  const systemPrompt = `You are an expert assistant for the "Mafqoodat" platform, specializing in lost and found items in Morocco.
**VERY IMPORTANT: ALL YOUR RESPONSES, WITHOUT EXCEPTION (including greetings, questions, tool results, and no-results messages), MUST BE ENTIRELY IN THE LANGUAGE OF THE USER'S LAST MESSAGE (Arabic, French, or English).**

Here's how you should operate:

🟢 **1. General Conversation:** If the user's message is a general greeting, thank you, a question about your capabilities, an empty message, or unrelated, respond naturally and politely in their detected language, **without using any tool**.

🔎 **2. Search Intent:** If the user's message clearly mentions an object (even a single word like "phone", "wallet", "dog", "هاتف", "محفظة", "كلب", "téléphone", "sac", "chien"), assume it's a search query.
  - **Immediately use the 'searchDatabase' tool.**
  - **Extract ALL relevant information** (item, city, brand, color) from the user's message and pass it to the tool. **Translate these parameters to French before sending them to the tool**, as the database expects French terms.
  - Do **NOT** ask for additional details if the item is already clear from the user's input.
  - **ALWAYS follow a tool call with a text response, even if it's just to acknowledge the search.**

📄 **3. Processing Search Results (after tool execution):** Once you receive the results from 'searchDatabase':
  - **Analyze the results in relation to the user's original query.**
  - **If items are found:**
      - Start your response with a phrase like "I found several items that might match. Please review them:" (or its equivalent in French/Arabic, depending on the detected language).
      - Present the found items clearly in Markdown format. **Translate all item details (description, city, category, brand, model, color, type, state, postdate) from French (as returned by the tool) to the user's detected language.**
      - If the search results don't perfectly match all details the user provided (e.g., user asked for "red phone", but results only show "phone"), acknowledge this discrepancy in your response. For example, "I found phones, but none specifically red. Would you like to broaden the search or post an ad?" (or its equivalent in French/Arabic).
  - **If no items are found:**
      - Clearly state that no matching items were found (in the detected language).
      - Suggest that the user can create a new ad for their lost item. Provide the link: [Create a new ad](action:create_ad) (or its equivalent in French/Arabic).

❓ **4. Unclear Search Intent:** If the user seems to be searching but doesn't clearly mention an item, politely ask: "What kind of item did you lose?" (or its equivalent in French/Arabic).

🚫 **5. Avoid Unnecessary Actions:** Never trigger a search or use tools if the message is empty, meaningless, or completely unrelated to lost and found items. Just reply as a normal assistant.
`

  // Prepare messages for the AI model
  let messagesForAI: CoreMessage[] = [...filteredMessages]

  // If this is the very first user message (i.e., only one message in history, and it's from the user)
  // We prepend an assistant greeting to guide the conversation.
  if (filteredMessages.length === 1 && filteredMessages[0].role === "user") {
    const greeting = {
      fr: "Bonjour ! Comment puis-je vous aider à retrouver votre objet perdu ?",
      ar: "مرحباً! كيف يمكنني مساعدتك في العثور على غرضك المفقود؟",
      en: "Hello! How can I assist you in finding your lost item?",
    }
    messagesForAI = [{ role: "assistant", content: greeting[lang] }, ...filteredMessages]
    console.log("Server: Prepended initial greeting.")
  }

  console.log("Server: Messages sent to AI:", JSON.stringify(messagesForAI, null, 2)) // Detailed log

  try {
    console.log("Server: 🟤 streamText START - Calling AI model...")
    const result = await streamText({
        model: openai("gpt-4o"),
      system: systemPrompt, // Use the unified system prompt
      messages: messagesForAI, // Use the potentially modified messages array
        tools: {
          searchDatabase: {
          description:
            "Recherche les objets perdus. Utiliser dès que l'utilisateur exprime une intention de recherche.",
            parameters: z.object({
            item: z.string().describe("The item to search for, translated to French."),
            city: z.string().optional().describe("The city to search in, translated to French."),
            brand: z.string().optional().describe("The brand of the item, translated to French."),
            color: z.string().optional().describe("The color of the item, translated to French."),
          }),
          execute: async (args) => {
            console.log("Server: 🟣 Tool execute START - Calling searchDatabase...")
            const toolResult = await searchDatabase(args)
            console.log(
              "Server: 🟠 Tool execute END - Result from searchDatabase:",
              JSON.stringify(toolResult).substring(0, 100) + "...",
            ) // Log tool result
            return toolResult
          },
        },
      },
    })
    console.log("Server: ⚫ streamText END - Result object obtained from AI model.")
    // This log will show if `result` is a valid stream object before conversion
    console.log("Server: Stream result object structure:", {
      type: typeof result,
      hasToDataStreamResponse: typeof result.toDataStreamResponse === "function",
      // Add other properties if needed for debugging
    })

    const response = result.toDataStreamResponse()
    console.log("Server: 🔵 After toDataStreamResponse() - Stream initiated for client. Returning response.")
    return response
  } catch (error) {
    console.error("Server: ❌ streamText error caught:", error)
    // It's crucial to return a proper error response if streaming fails
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  } finally {
    console.log("Server: --- POST /api/chat request processing finished ---")
  }
}
