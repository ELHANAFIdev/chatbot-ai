export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, using fallback response")

      const lastMessage = messages[messages.length - 1]
      const userInput = lastMessage?.content || ""

      let response = ""

      if (
        userInput.toLowerCase().includes("phone") ||
        userInput.toLowerCase().includes("mobile") ||
        userInput.toLowerCase().includes("iphone") ||
        userInput.toLowerCase().includes("samsung")
      ) {
        response = `I understand you're looking for a phone. Here are some suggestions:

• Use the Advanced Search form to filter by Electronics category
• Include the brand and model in your search (${userInput.includes("iphone") ? "iPhone" : userInput.includes("samsung") ? "Samsung" : "phone brand"})
• Check the color and any unique features
• Try searching by the location where you lost it

If you don't find it in our database, consider posting a new ad to help others find it for you!`
      } else if (
        userInput.toLowerCase().includes("wallet") ||
        userInput.toLowerCase().includes("purse") ||
        userInput.toLowerCase().includes("portefeuille")
      ) {
        response = `I see you're looking for a wallet or purse. Here's how I can help:

• Use the Advanced Search to filter by Accessories category
• Search by color (black, brown, leather, etc.)
• Include the location where you lost it
• Mention any distinctive features

If no matches are found, posting a new ad will help others contact you if they find it!`
      } else if (
        userInput.toLowerCase().includes("key") ||
        userInput.toLowerCase().includes("keys") ||
        userInput.toLowerCase().includes("clé")
      ) {
        response = `Looking for keys can be stressful! Here's what I recommend:

• Use Advanced Search and select Keys category
• Describe the keychain or distinctive features
• Include the area where you lost them
• Mention how many keys were on the ring

Don't forget to post a new ad if you don't find them in our current listings!`
      } else {
        response = `I understand you're looking for: "${userInput}"

Here's how I can help you find your missing item:

• Use the Advanced Search form to filter by category and location
• Try different keywords related to your item
• Include brand, color, or unique features in your search
• Check the recent missing items

If you don't find your item, please post a new ad so others can help you find it!`
      }

      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: "assistant",
          content: response,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Try to use OpenAI if configured
    try {
      const { openai } = await import("@ai-sdk/openai")
      const { streamText } = await import("ai")

      console.log("Using OpenAI with", messages.length, "messages")

      const result = streamText({
        model: openai("gpt-3.5-turbo"),
        messages,
        system: `You are a helpful virtual assistant for Mafqoodat.ma, a missing items platform in Morocco. 

Your role is to:
1. Help users search for their missing items by asking detailed questions
2. Assist users in reporting missing items with comprehensive details
3. Provide empathetic support as users may be distressed about their lost items
4. Guide users through the search and reporting process
5. Suggest using the advanced search form when appropriate

When helping with SEARCHES, ask specific questions about:
- What type of item was lost (phone, wallet, keys, jewelry, etc.)
- Brand and model if applicable (iPhone 14, Samsung Galaxy, etc.)
- Color and physical description
- Where it was lost (specific location, city, neighborhood)
- When it was lost (date and time)
- Any unique identifying features (scratches, stickers, engravings, etc.)

When helping with REPORTS, gather detailed information:
- Complete description of the item
- Exact location and circumstances of loss
- Date and time when it was lost
- Contact information
- Any reward being offered

IMPORTANT GUIDELINES:
- Always be empathetic and understanding
- Ask follow-up questions to get more specific details
- Suggest checking the advanced search form for filtering
- If no matches are found, encourage posting a new ad
- Help users think of alternative search terms
- Provide tips on where to look or what to do next

Always end your responses with helpful next steps or suggestions.`,
        maxTokens: 400,
        temperature: 0.7,
      })

      return result.toDataStreamResponse()
    } catch (openaiError) {
      console.error("OpenAI error:", openaiError)

      // Fallback to simple response if OpenAI fails
      const lastMessage = messages[messages.length - 1]
      const userInput = lastMessage?.content || ""

      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: "assistant",
          content: `I understand you're looking for: "${userInput}"

I'm here to help you find your missing item! Here's what I recommend:

• Use the Advanced Search form to filter by category and location
• Try different keywords related to your item
• Include brand, color, or unique features in your search
• If you don't find your item, please post a new ad

Would you like me to help you think of specific search terms or categories for your item?`,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("Chat API error:", error)

    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I'm here to help you find your missing item! Please use the Advanced Search form to filter items by category, city, and description. If you don't find what you're looking for, consider posting a new ad.",
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
