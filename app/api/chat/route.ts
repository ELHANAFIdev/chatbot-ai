import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export const maxDuration = 30

// Function to detect if user is asking about a specific item ID
function isAskingAboutItemId(text: string) {
  const lowerText = text.toLowerCase().trim()

  // ID-related patterns in multiple languages
  const idPatterns = [
    // English
    /\b(item|id|number|#)\s*(\d+)\b/,
    /\b(\d+)\s*(item|id|number)\b/,
    /\bitem\s*#?\s*(\d+)\b/,
    /\bid\s*:?\s*(\d+)\b/,
    /\bnumber\s*:?\s*(\d+)\b/,
    // French
    /\b(objet|article|numéro|id)\s*(\d+)\b/,
    /\b(\d+)\s*(objet|article|numéro|id)\b/,
    /\bobjet\s*#?\s*(\d+)\b/,
    /\bnuméro\s*:?\s*(\d+)\b/,
    // Arabic
    /\b(رقم|معرف|عنصر)\s*(\d+)\b/,
    /\b(\d+)\s*(رقم|معرف|عنصر)\b/,
    // General patterns
    /^#?\s*(\d+)$/, // Just a number
    /\bshow\s*me\s*(\d+)\b/,
    /\bfind\s*(\d+)\b/,
    /\bget\s*(\d+)\b/,
  ]

  for (const pattern of idPatterns) {
    const match = lowerText.match(pattern)
    if (match) {
      // Extract the number from the match
      const numberId = match.find((group) => /^\d+$/.test(group))
      if (numberId) {
        return Number.parseInt(numberId)
      }
    }
  }

  return null
}

function isSearchingForItems(text: string) {
  const lowerText = text.toLowerCase().trim()

  const hasCity = extractCity(text) !== null

  const itemIndicators = [
    "phone",
    "wallet",
    "key",
    "bag",
    "hat",
    "cap",
    "watch",
    "ring",
    "casquette",
    "téléphone",
    "portefeuille",
    "lunettes",
    "bague",
    "sac",
    "هاتف",
    "محفظة",
    "مفتاح",
    "نظارات",
    "قبعة",
    "ساعة",
    "خاتم",
  ]

  const foundKeyword = itemIndicators.some((word) => lowerText.includes(word))

  return hasCity && foundKeyword
}

// Function to get item by ID from database
async function getItemById(itemId: number) {
  try {
    if (!process.env.DB_HOST) {
      throw new Error("Database not configured")
    }

    console.log("Fetching item by ID:", itemId)

    const sql = `
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
      WHERE f.id = ?
      LIMIT 1
    `

    const results = await query(sql, [itemId])
    const resultArray = Array.isArray(results) ? results : []

    if (resultArray.length > 0) {
      console.log(`Item #${itemId} found:`, resultArray[0])
      return resultArray[0]
    } else {
      console.log(`Item #${itemId} not found`)
      return null
    }
  } catch (error) {
    console.error("Database error fetching item by ID:", error)
    throw error
  }
}

// Function to extract city from user input
function extractCity(text: string) {
  const lowerText = text.toLowerCase().trim()

  // Moroccan cities in multiple languages and variations
  const cities = [
    // Arabic names
    { name: "الرباط", variations: ["rabat", "الرباط"] },
    {
      name: "الدار البيضاء",
      variations: ["casablanca", "casa", "الدار البيضاء", "الدارالبيضاء"],
    },
    { name: "مراكش", variations: ["marrakech", "marrakesh", "مراكش"] },
    { name: "فاس", variations: ["fes", "fez", "فاس"] },
    { name: "طنجة", variations: ["tanger", "tangier", "طنجة"] },
    { name: "أغادير", variations: ["agadir", "أغادير"] },
    { name: "مكناس", variations: ["meknes", "مكناس"] },
    { name: "وجدة", variations: ["oujda", "وجدة"] },
    { name: "القنيطرة", variations: ["kenitra", "القنيطرة"] },
    { name: "تطوان", variations: ["tetouan", "تطوان"] },
    { name: "الجديدة", variations: ["el jadida", "الجديدة"] },
    { name: "بني ملال", variations: ["beni mellal", "بني ملال"] },
    { name: "الناظور", variations: ["nador", "الناظور"] },
    { name: "خريبكة", variations: ["khouribga", "خريبكة"] },
    { name: "وزان", variations: ["ouazzane", "وزان"] },
  ]

  for (const city of cities) {
    for (const variation of city.variations) {
      if (lowerText.includes(variation.toLowerCase())) {
        return variation
      }
    }
  }

  return null
}

// Function to extract search terms for database query
function extractSearchTerms(text: string) {
  const cleanText = text.toLowerCase().trim()

  // Extract city first
  const city = extractCity(text)

  // Remove common stop words but keep important descriptive words
  const stopWords = new Set([
    "i",
    "me",
    "my",
    "lost",
    "find",
    "search",
    "looking",
    "help",
    "where",
    "is",
    "the",
    "a",
    "an",
    "in",
    "at",
    "on",
    "je",
    "mon",
    "ma",
    "perdu",
    "cherche",
    "trouve",
    "où",
    "est",
    "le",
    "la",
    "les",
    "un",
    "une",
    "dans",
    "à",
    "sur",
    "أنا",
    "لي",
    "فقدت",
    "أبحث",
    "أين",
    "هو",
    "هي",
    "في",
    "على",
  ])

  const words = cleanText.split(/\s+/).filter((word) => {
    const cleanWord = word.replace(/[^\w\u0600-\u06FF]/g, "")
    return cleanWord.length > 2 && !stopWords.has(cleanWord)
  })

  // Remove city from keywords to avoid duplication
  const keywords = words.filter((word) => {
    if (city) {
      return !city.toLowerCase().includes(word.toLowerCase()) && !word.toLowerCase().includes(city.toLowerCase())
    }
    return true
  })

  return {
    originalText: text,
    keywords: keywords,
    city: city,
    cleanText: cleanText,
  }
}

// Enhanced database search function with correct table structure
async function searchDatabase(searchTerms: any) {
  try {
    if (!process.env.DB_HOST) {
      throw new Error("Database not configured")
    }

    console.log("Search terms:", searchTerms)

    if (!searchTerms.city) {
      console.log("No city provided - search cannot proceed")
      return { results: [], missingCity: true }
    }

    if (!searchTerms.keywords || searchTerms.keywords.length === 0) {
      console.log("No keywords provided")
      return { results: [], missingKeywords: true }
    }

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
        v.ville as city,
        (
          CASE WHEN LOWER(v.ville) LIKE LOWER(?) THEN 1 ELSE 0 END +
          CASE WHEN LOWER(f.discription) LIKE LOWER(?) THEN 1 ELSE 0 END +
          CASE WHEN LOWER(c.cname) LIKE LOWER(?) THEN 1 ELSE 0 END +
          CASE WHEN LOWER(f.marque) LIKE LOWER(?) THEN 1 ELSE 0 END +
          CASE WHEN LOWER(f.modele) LIKE LOWER(?) THEN 1 ELSE 0 END +
          CASE WHEN LOWER(f.color) LIKE LOWER(?) THEN 1 ELSE 0 END +
          CASE WHEN LOWER(f.type) LIKE LOWER(?) THEN 1 ELSE 0 END
        ) as match_count
      FROM fthings f
      LEFT JOIN catagoery c ON f.cat_ref = c.cid
      LEFT JOIN ville v ON f.ville = v.id
      WHERE 1=1
    `

    const params: any[] = []

    // Add city and pattern matches to match_count
    const searchPattern = searchTerms.keywords.join(" ")
    const patterns = [
      `%${searchTerms.city}%`, // ville
      `%${searchPattern}%`, // discription
      `%${searchPattern}%`, // category
      `%${searchPattern}%`, // marque
      `%${searchPattern}%`, // modele
      `%${searchPattern}%`, // color
      `%${searchPattern}%`, // type
    ]
    params.push(...patterns)

    // Add keyword conditions
    if (searchTerms.keywords.length > 0) {
      sql += ` AND (`
      const conditions = []

      searchTerms.keywords.forEach((keyword) => {
        const kw = `%${keyword}%`
        conditions.push(`(
          LOWER(f.discription) LIKE LOWER(?) OR
          LOWER(c.cname) LIKE LOWER(?) OR
          LOWER(f.marque) LIKE LOWER(?) OR
          LOWER(f.modele) LIKE LOWER(?) OR
          LOWER(f.color) LIKE LOWER(?) OR
          LOWER(f.type) LIKE LOWER(?)
        )`)
        params.push(kw, kw, kw, kw, kw, kw)
      })

      sql += conditions.join(" OR ")
      sql += `)`
    }

    sql += ` HAVING match_count >= 1 ORDER BY match_count DESC, f.postdate DESC LIMIT 20`
    console.log("🔍 Keywords used:", searchTerms.keywords)

    const results = await query(sql, params)
    const resultArray = Array.isArray(results) ? results : []

    console.log(`✅ Found ${resultArray.length} results`)
    return { results: resultArray, missingCity: false, missingKeywords: false }
  } catch (error) {
    console.error("❌ searchDatabase error:", error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const userInput = lastMessage?.content || ""

    console.log("Processing user input:", userInput)

    // First, check if user is asking about a specific item ID
    const itemId = isAskingAboutItemId(userInput)
    if (itemId) {
      console.log("User asking about item ID:", itemId)

      // Check if database is configured
      if (!process.env.DB_HOST) {
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: "❌ Database not connected. I can't look up item details right now.",
        })
      }

      try {
        const item = await getItemById(itemId)

        if (item) {
          const response = `🎯 **Found Item #${item.id}!**

📍 **City:** ${item.city || "Unknown"}
📝 **Description:** ${item.description || "No description available"}

**Details:**
${item.category_name ? `• **Category:** ${item.category_name}` : ""}
${item.marque ? `• **Brand:** ${item.marque}` : ""}
${item.modele ? `• **Model:** ${item.modele}` : ""}
${item.color ? `• **Color:** ${item.color}` : ""}
${item.type ? `• **Type:** ${item.type}` : ""}
${item.etat ? `• **Condition:** ${item.etat}` : ""}

${item.postdate ? `📅 **Posted:** ${new Date(item.postdate).toLocaleDateString()}` : ""}

🔗 **[Contact the Finder](https://mafqoodat.ma/trouve.php?contact=${item.id})**

💡 Click the link above to get in touch with the person who found this item!

---
*Is this your lost item? Click "Contact the Finder" to reach out to them directly.*`

          return NextResponse.json({
            id: Date.now().toString(),
            role: "assistant",
            content: response,
          })
        } else {
          const response = `❌ **Item #${itemId} not found**

I couldn't find an item with ID #${itemId} in our database.

**Possible reasons:**
• The item ID doesn't exist
• The item may have been removed
• There might be a typo in the ID number

🔍 **Try instead:**
• Search by description: "I lost my [item] in [city]"
• Browse recent items using Advanced Search
• Post a new missing item ad

💬 **Need help?** Tell me what you're looking for and I'll search our database!`

          return NextResponse.json({
            id: Date.now().toString(),
            role: "assistant",
            content: response,
          })
        }
      } catch (error) {
        console.error("Error fetching item by ID:", error)
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: `❌ **Error looking up Item #${itemId}**

There was a problem accessing the database. Please try again in a moment.

🔄 **You can also:**
• Refresh the page and try again
• Use the Advanced Search form
• Search by description instead of ID`,
        })
      }
    }

    // Check if user is searching for lost items
    const isSearchQuery = isSearchingForItems(userInput)
    console.log("Is search query:", isSearchQuery)

    if (isSearchQuery) {
      // Handle search for lost items
      console.log("Handling search query...")

      // Check if database is configured
      if (!process.env.DB_HOST) {
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content:
            "❌ Database not connected. I can help with general questions, but I can't search for lost items right now. Please configure the database settings.",
        })
      }

      // Extract search terms and search database
      const searchTerms = extractSearchTerms(userInput)
      console.log("Extracted search terms:", searchTerms)

      const searchResult = await searchDatabase(searchTerms)
      console.log("Search result:", searchResult)

      // Handle missing city
      if (searchResult.missingCity) {
        const response = `🏙️ **City is required for search!**

To find your lost item, I need to know which city you lost it in. Please tell me:

**Examples:**
• "I lost my black phone in Casablanca"
• "J'ai perdu mon téléphone noir à Rabat"  
• "فقدت هاتفي الأسود في الدار البيضاء"

**Supported cities:** Rabat, Casablanca, Marrakech, Fes, Tanger, Agadir, Meknes, Oujda, Kenitra, Tetouan, and more.

Please specify the city where you lost your item! 📍`

        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: response,
        })
      }

      // Handle missing keywords
      if (searchResult.missingKeywords) {
        const response = `📝 **More details needed!**

I found the city "${searchTerms.city}" but need more information about your lost item:

• **What item?** (phone, wallet, keys, bag, etc.)
• **Color?** (black, white, red, etc.)  
• **Brand?** (Samsung, Apple, Nike, etc.)
• **Type/Description?** (leather wallet, iPhone, etc.)

**Example:** "I lost my black Samsung phone in ${searchTerms.city}"

Please provide more details about your lost item! 🔍`

        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: response,
        })
      }

      // Handle search results - Return both text and structured data for cards
      if (searchResult.results.length > 0) {
        const response = `I found ${searchResult.results.length} matching items in ${searchTerms.city}! Check the cards below for details.`

        // Transform results into missing persons format for cards
        const missingPersons = searchResult.results.map((item) => ({
          id: item.id.toString(),
          description: item.description || "No description available",
          city: item.city || "Unknown",
          category_name: item.category_name,
          marque: item.marque,
          modele: item.modele,
          color: item.color,
          type: item.type,
          etat: item.etat,
          postdate: item.postdate,
          match_count: item.match_count,
          contactUrl: `https://mafqoodat.ma/trouve.php?contact=${item.id}`,
        }))

        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          missingPersons: missingPersons,
        })
      } else {
        const response = `❌ **No matches found in ${searchTerms.city}**

I searched for items matching your description in **${searchTerms.city}** but couldn't find any matches.

🆕 **Create a missing item post:**
[Post New Ad](https://mafqoodat.ma/post.php)

🔍 **Try different keywords:**
• Be more specific about color, brand, or type
• Check spelling of item description
• Try alternative names for your item

🆔 **Have an item ID?** You can ask me about a specific item: "show me item [ID number]"

💬 **Need help?** I can assist you with creating a detailed description for your post.

**Remember:** The city and at least 2 matching details are required to find items in our database.`

        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: response,
        })
      }
    } else {
      // Use ChatGPT API for general conversation
      console.log("Using ChatGPT API for general conversation...")

      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I need OpenAI API configuration to have natural conversations. For now, I can only help you search for lost items if you tell me specifically what you're looking for, or show you specific items by their ID number.",
        })
      }

      try {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          messages: [
            {
              role: "system",
              content: `You are an assistant for a Moroccan missing items platform called **Mafqoodat**. You only help users with the following tasks **related to lost and found items**:

1. Search for lost items based on city and details (color, brand, type...)
2. Retrieve a specific item using its ID (e.g., "show me item 123")
3. Help users **post a new missing item**
4. Explain the platform features related to lost and found only

⚠️ You **must NOT answer general questions** (weather, politics, news, unrelated advice, etc). If a user asks a question **outside the lost & found domain**, politely reply:

**"I'm here to help you search for or report lost items on Mafqoodat. Please tell me what item you lost or ask about a specific ID."**

🗣 You support Arabic, French, and English. Always reply in the same language the user uses.

🧠 Your only knowledge is about the Mafqoodat platform and lost & found items.

✅ When a user talks about an item:
- Make sure the **city** is provided (like Casablanca, Rabat, Tanger, etc.)
- Make sure there are at least **2 useful details**: color, brand, type...

📍 Supported cities: Rabat, Casablanca, Marrakech, Fes, Tanger, Agadir, Meknes, Oujda, Kenitra, Tetouan...

👀 Examples:
- "I lost my phone in Rabat" → Ask for brand/color
- "J'ai perdu mon sac noir à Casablanca" → Start a search
- "item #123" → Fetch specific item

⛔ Examples of invalid requests:
- "Who is the president?" → Refuse
- "What's the weather today?" → Refuse
- "Tell me a joke" → Refuse
- "How to study better?" → Refuse

Be helpful and empathetic — but stay 100% focused on lost and found services only.`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        })

        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content: text,
        })
      } catch (error) {
        console.error("OpenAI API error:", error)
        return NextResponse.json({
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting to my AI service right now. Please try again in a moment, or let me know if you're looking for a specific lost item and I can search our database. You can also ask me about specific items by their ID number.",
        })
      }
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: "Something went wrong. Please try again or refresh the page.",
    })
  }
}
