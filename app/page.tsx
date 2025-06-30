"use client"

import { useChat } from "@ai-sdk/react"
import { useState } from "react"
import { Search, AlertCircle, ChevronRight, X, Send } from "lucide-react"
import SearchForm from "./components/search-form"

export default function MissingItemsChatbot() {
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [],
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  const [chatMode, setChatMode] = useState<"initial" | "search" | "report">("initial")
  const [showSearchForm, setShowSearchForm] = useState(false)

  const handleSearchMode = () => {
    setChatMode("search")
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "I'm here to help you find your missing item! 🔍\n\nTo get started, please tell me:\n• What did you lose? (phone, wallet, keys, etc.)\n• What does it look like? (color, brand, model)\n• Where did you lose it?\n• When did you lose it?\n\nThe more details you provide, the better I can help you search our database. You can also use the Advanced Search form on the side for more specific filtering.",
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
          "I'll help you report your missing item so others can help find it! 📝\n\nPlease provide me with detailed information:\n• Complete description of the item\n• Exact location where you lost it\n• Date and time when you lost it\n• Your contact information\n• Any unique identifying features\n• Photos if you have them\n\nOnce we gather all the details, I'll guide you to post your missing item ad.",
      },
    ])
  }

  const resetToInitial = () => {
    setChatMode("initial")
    setShowSearchForm(false)
    setMessages([])
  }

  const handlePostNewAd = () => {
    const url = "https://mafqoodat.ma/draft/post.php"
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (chatMode === "initial") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Mafqoodat Assistant</h1>
            <p className="text-gray-600 mb-6">How can I help you today?</p>

            <div className="space-y-4">
              <button
                onClick={handleSearchMode}
                className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <Search className="h-6 w-6" />
                <span>Search for Missing Item</span>
              </button>

              <button
                onClick={handleReportMode}
                className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <AlertCircle className="h-6 w-6" />
                <span>Report Missing Item</span>
              </button>

              <button
                onClick={handlePostNewAd}
                className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg transition-colors"
              >
                Post New Ad on Mafqoodat.ma
              </button>
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
            <h1 className="text-xl font-semibold">
              {chatMode === "search" ? "Search Missing Items" : "Report Missing Item"}
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg whitespace-pre-wrap ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow-sm border"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                I'm having trouble connecting right now. Please try using the Advanced Search form.
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm border px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Thinking...</span>
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
              onChange={handleInputChange}
              placeholder={`Describe your ${chatMode === "search" ? "missing" : "lost"} item in detail...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
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
