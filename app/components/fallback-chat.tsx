// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Send } from "lucide-react"

// interface FallbackChatProps {
//   mode: "search" | "report"
// }

// export default function FallbackChat({ mode }: FallbackChatProps) {
//   const [messages, setMessages] = useState([
//     {
//       id: "1",
//       role: "assistant" as const,
//       content:
//         mode === "search"
//           ? "I'm here to help you search for your missing item! Since the AI chat is temporarily unavailable, please use the Advanced Search form to filter items by category, city, and description. You can also browse all recent missing items."
//           : "I'm here to help you report your missing item! Since the AI chat is temporarily unavailable, please click 'Post New Ad' to go directly to the reporting form where you can provide all the details about your lost item.",
//     },
//   ])
//   const [input, setInput] = useState("")

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!input.trim()) return

//     // Add user message
//     const userMessage = {
//       id: Date.now().toString(),
//       role: "user" as const,
//       content: input,
//     }

//     // Add helpful response
//     const assistantMessage = {
//       id: (Date.now() + 1).toString(),
//       role: "assistant" as const,
//       content:
//         mode === "search"
//           ? `I understand you're looking for: "${input}"\n\nSince the AI chat is temporarily unavailable, I recommend:\n• Use the Advanced Search form to filter by category and location\n• Try different keywords in the search\n• Check the recent items list\n• If you don't find it, consider posting a new ad`
//           : `Thank you for providing those details: "${input}"\n\nTo complete your missing item report:\n• Click "Post New Ad" to access the full form\n• Include all the details you mentioned\n• Add photos if available\n• Provide your contact information\n\nThis will help others find and return your item!`,
//     }

//     setMessages((prev) => [...prev, userMessage, assistantMessage])
//     setInput("")
//   }

//   return (
//     <div className="flex flex-col h-full">
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
//             <div
//               className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap ${
//                 message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm border"
//               }`}
//             >
//               {message.content}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="bg-white border-t p-4">
//         <form onSubmit={handleSubmit} className="flex space-x-2">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder={`Describe your ${mode === "search" ? "missing" : "lost"} item...`}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <Button type="submit" className="px-6" disabled={!input.trim()}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }
