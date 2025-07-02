"use client"

import type React from "react"

import { useState } from "react"
import { Search, AlertCircle, ChevronRight, X, Loader2, Send, Bot, Phone } from "lucide-react"
import SearchForm from "./components/search-form"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface FoundItem {
  id: number
  description: string
  marque?: string
  color?: string
  city?: string
  category_name?: string
  postdate?: string
}

export default function MissingItemsChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [chatMode, setChatMode] = useState<"initial" | "search" | "report">("initial")
  const [showSearchForm, setShowSearchForm] = useState(false)

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: data.id || Date.now().toString(),
        role: "assistant",
        content: data.content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      setError(error.message)

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `❌ **I'm having trouble right now**\n\nError: ${error.message}\n\nLet me suggest some alternatives:\n• Try the Advanced Search form\n• Check your internet connection\n• Refresh the page and try again\n• Post a new ad directly on Mafqoodat.ma\n\nI'll be back to help you soon!`,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactFinder = (itemId: string, itemData: string) => {
    // Open external link directly
    const url = `https://mafqoodat.ma/trouve.php?contact=${itemId}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleSearchMode = () => {
    setChatMode("search")
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          '🤖 **Hi! I\'m your AI search assistant**\n\nI can help you find missing items by searching our database intelligently. I need specific details to provide accurate results.\n\n**For best results, tell me:**\n• **What** you lost (phone, wallet, keys, etc.)\n• **Brand/Model** if applicable (Samsung, iPhone, etc.)\n• **Color** or appearance\n• **Where** you lost it (Casablanca, Rabat, etc.)\n\n**Good examples:**\n• "I lost my black Samsung phone in Casablanca"\n• "Looking for brown leather wallet in Rabat"\n• "Missing blue Nike backpack in Marrakech"\n• "Lost silver car keys with BMW keychain in Fes"\n\n**I search across:**\n• Item descriptions and details\n• Brand names and models\n• Colors and types\n• Cities and locations\n• Categories\n\n**Note:** I only show results when I find actual matches in our database. The more specific you are, the better results you\'ll get!\n\nWhat did you lose? Please be as specific as possible! 🔍',
      },
    ])
  }

  const handleReportMode = () => {
    setChatMode("report")
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "🤖 **I'll help you report your missing item effectively!**\n\nTo create the best missing item report, I need detailed information. The more specific you are, the higher the chances someone will recognize and return your item.\n\n**Please provide:**\n• **Exact item description** (what is it?)\n• **Brand and model** (if applicable)\n• **Color and size**\n• **Unique features** (scratches, stickers, engravings)\n• **Where you lost it** (specific location)\n• **When you lost it** (date and time)\n• **Circumstances** (how did you lose it?)\n\n**I'll help you:**\n• Organize all the important details\n• Choose the right category\n• Write an effective description\n• Guide you through posting the ad\n• Provide tips to increase recovery chances\n\nStart by telling me exactly what you lost and I'll ask follow-up questions to gather all the important details! 📝",
      },
    ])
  }

  const resetToInitial = () => {
    setChatMode("initial")
    setShowSearchForm(false)
    setMessages([])
    setError(null)
  }

  const handlePostNewAd = () => {
    const url = "https://mafqoodat.ma/post.php"
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (chatMode === "initial") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Smart AI Assistant</h1>
            </div>
            <p className="text-gray-600 mb-6">Intelligent database search with AI guidance</p>

            <div className="space-y-4">
              <button
                onClick={handleSearchMode}
                className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <Search className="h-6 w-6" />
                <span>AI Search Assistant</span>
              </button>

              <button
                onClick={handleReportMode}
                className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <AlertCircle className="h-6 w-6" />
                <span>AI Report Assistant</span>
              </button>

              <button
                onClick={handlePostNewAd}
                className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg transition-colors"
              >
                Post New Ad on Mafqoodat.ma
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Powered by AI + Database Integration
              <br />
              Results only shown when matches are found
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showSearchForm ? "mr-80" : ""} transition-all duration-300`}>
        <div className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={resetToInitial} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
            <Bot className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold">
              {chatMode === "search" ? "🔍 AI Search Assistant" : "📝 AI Report Assistant"}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {chatMode === "search" && (
              <button
                onClick={() => setShowSearchForm(!showSearchForm)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Search className="h-4 w-4" />
                <span>Advanced Search</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${showSearchForm ? "rotate-90" : ""}`} />
              </button>
            )}
            <button
              onClick={handlePostNewAd}
              className="px-3 py-2 border border-gray-300 rounded bg-green-50 hover:bg-green-100"
            >
              Post New Ad
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm border"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <Bot className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {message.content.split("\n").map((line, index) => {
                    // Handle markdown-style formatting
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <div key={index} className="font-bold text-lg mb-2 text-blue-700">
                          {line.slice(2, -2)}
                        </div>
                      )
                    }
                    if (line.startsWith("• ")) {
                      return (
                        <div key={index} className="ml-4 mb-1 text-sm">
                          {line}
                        </div>
                      )
                    }
                    if (line.includes("[View Details]")) {
                      const parts = line.split(/(\[View Details\]$$[^)]+$$)/)
                      return (
                        <div key={index} className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          {parts.map((part, partIndex) => {
                            if (part.startsWith("[View Details]")) {
                              const url = part.match(/$$([^)]+)$$/)?.[1]
                              return (
                                <button
                                  key={partIndex}
                                  onClick={() => url && window.open(url, "_blank")}
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium mt-2 transition-colors"
                                >
                                  <Search className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                              )
                            }
                            return (
                              <div key={partIndex} className="text-gray-800">
                                {part}
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    if (line.includes("[Contact Finder]")) {
                      const parts = line.split(/(\[Contact Finder\]$$[^)]+$$)/)
                      return (
                        <div key={index} className="mb-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                          {parts.map((part, partIndex) => {
                            if (part.startsWith("[Contact Finder]")) {
                              const url = part.match(/$$([^)]+)$$/)?.[1]
                              const itemId = url?.split("contact=")[1] || "0"
                              return (
                                <button
                                  key={partIndex}
                                  onClick={() => handleContactFinder(itemId, line)}
                                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium mt-2 transition-colors"
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Contact Finder
                                </button>
                              )
                            }
                            return (
                              <div key={partIndex} className="text-gray-800">
                                {part}
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    if (line.includes("[Post New Ad]")) {
                      const parts = line.split(/(\[Post New Ad\]$$[^)]+$$)/)
                      return (
                        <div key={index} className="mb-2">
                          {parts.map((part, partIndex) => {
                            if (part.startsWith("[Post New Ad]")) {
                              return (
                                <button
                                  key={partIndex}
                                  onClick={handlePostNewAd}
                                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                                >
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Post New Ad
                                </button>
                              )
                            }
                            return <span key={partIndex}>{part}</span>
                          })}
                        </div>
                      )
                    }
                    return (
                      <div key={index} className="mb-1">
                        {line}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm border px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>AI is analyzing and searching database...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chatMode === "search"
                  ? "Be specific: 'black Samsung phone in Casablanca' or 'brown leather wallet in Rabat'"
                  : "Describe your lost item in detail..."
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{isLoading ? "AI Searching..." : "Ask AI"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Search Form Sidebar */}
      {showSearchForm && (
        <div className="w-80 bg-white border-l shadow-lg">
          <SearchForm onClose={() => setShowSearchForm(false)} />
        </div>
      )}
    </div>
  )
}
