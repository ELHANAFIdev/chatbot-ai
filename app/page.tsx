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

export default function MissingItemsChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<"initial" | "search" | "report">("initial")
  const [showSearchForm, setShowSearchForm] = useState(false)

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const assistantMessage: Message = {
        id: data.id || Date.now().toString(),
        role: "assistant",
        content: data.content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `❌ **I'm having trouble right now**\n\nError: ${error.message}\n\n• Try Advanced Search\n• Check internet connection\n• Post new ad on Mafqoodat.ma`,
      }
      setMessages((prev) => [...prev, errorMessage])
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactFinder = (itemId: string) => {
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
          '🤖 **Welcome! I\'ll help you search**\n\n• Tell me what you lost\n• Example: "black Samsung phone in Casablanca"\n\nMore details = better matches!',
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
          "📝 **Reporting Assistant**\n\n• What did you lose?\n• Where & when?\n• Details & features\n\nLet's describe your item together.",
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
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Smart AI Assistant</h1>
          </div>
          <p className="text-gray-600 mb-6">AI-powered search & report assistant</p>
          <div className="space-y-4">
            <button onClick={handleSearchMode} className="w-full h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center space-x-3 hover:bg-blue-700">
              <Search className="h-6 w-6" />
              <span>AI Search Assistant</span>
            </button>
            <button onClick={handleReportMode} className="w-full h-16 bg-red-600 text-white rounded-lg flex items-center justify-center space-x-3 hover:bg-red-700">
              <AlertCircle className="h-6 w-6" />
              <span>AI Report Assistant</span>
            </button>
            <button onClick={handlePostNewAd} className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50">
              Post New Ad on Mafqoodat.ma
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`flex-1 flex flex-col ${showSearchForm ? "mr-80" : ""}`}>
        <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
          <div className="flex space-x-3 items-center">
            <button onClick={resetToInitial} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
            <Bot className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold">
              {chatMode === "search" ? "🔍 AI Search Assistant" : "📝 AI Report Assistant"}
            </h1>
          </div>
          <div className="flex space-x-2">
            {chatMode === "search" && (
              <button onClick={() => setShowSearchForm(!showSearchForm)} className="flex items-center px-3 py-2 border rounded hover:bg-gray-50">
                <Search className="h-4 w-4 mr-1" />
                Advanced Search
                <ChevronRight className={`h-4 w-4 ml-1 ${showSearchForm ? "rotate-90" : ""}`} />
              </button>
            )}
            <button onClick={handlePostNewAd} className="px-3 py-2 border bg-green-50 hover:bg-green-100 rounded">
              Post New Ad
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl px-4 py-3 rounded-lg ${message.role === "user" ? "bg-blue-600 text-white" : "bg-white shadow-sm border text-gray-800"}`}>
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2">
                    <Bot className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap break-words">
                  {message.content.split("\n").map((line, index) => {
                    // Bold formatting
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <div key={index} className="font-bold text-lg mb-2 text-blue-700">
                          {line.slice(2, -2)}
                        </div>
                      )
                    }

                    // Bullet point formatting
                    if (line.startsWith("• ")) {
                      return (
                        <div key={index} className="ml-4 mb-1 text-sm">
                          {line}
                        </div>
                      )
                    }

                    // Contact Finder button
                    if (line.includes("[Contact Finder]$$")) {
                      const urlMatch = line.match(/\[Contact Finder\]\$\$(.*?)\$\$/)
                      const url = urlMatch?.[1]
                      const itemId = url?.split("contact=")[1] || "0"

                      return (
                        <div key={index} className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                          <button
                            onClick={() => handleContactFinder(itemId)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Finder
                          </button>
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

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border px-4 py-3 rounded-lg shadow-sm text-gray-800 flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>AI is analyzing and searching database...</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatMode === "search" ? "Example: black Samsung phone in Casablanca" : "Describe your lost item..."}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{isLoading ? "AI Searching..." : "Ask AI"}</span>
            </button>
          </form>
        </div>
      </div>

      {showSearchForm && (
        <div className="w-80 bg-white border-l shadow-lg">
          <SearchForm onClose={() => setShowSearchForm(false)} />
        </div>
      )}
    </div>
  )
}
