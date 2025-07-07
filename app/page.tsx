"use client"

import type React from "react"
import { useState } from "react"
import {
  X,
  Loader2,
  Send,
  Bot,
  Phone,
  User,
  MapPin,
  Calendar,
  ExternalLink,
  Plus,
  MessageCircle,
  Filter,
} from "lucide-react"
import SearchForm from "./components/search-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  missingPersons?: MissingPerson[]
}

interface MissingPerson {
  id: string
  name?: string
  description: string
  city: string
  category_name?: string
  marque?: string
  modele?: string
  color?: string
  type?: string
  etat?: string
  postdate?: string
  match_count?: number
  contactUrl: string
}

// Component for displaying missing person cards
const MissingPersonCard = ({ person }: { person: MissingPerson }) => {
  const handleContact = () => {
    window.open(person.contactUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-shadow border-2 border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Objet #{person.id}
          </CardTitle>
          {person.match_count && <Badge variant="secondary">{person.match_count} correspondances</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="font-medium">{person.city}</span>
        </div>

        <div className="text-sm">
          <p className="font-medium text-gray-800 mb-2">Description:</p>
          <p className="text-gray-600">{person.description || "Aucune description disponible"}</p>
        </div>

        {(person.category_name || person.marque || person.modele || person.color || person.type || person.etat) && (
          <div className="space-y-1">
            <p className="font-medium text-gray-800 text-sm">Détails:</p>
            <div className="flex flex-wrap gap-2">
              {person.category_name && <Badge variant="outline">Catégorie: {person.category_name}</Badge>}
              {person.marque && <Badge variant="outline">Marque: {person.marque}</Badge>}
              {person.modele && <Badge variant="outline">Modèle: {person.modele}</Badge>}
              {person.color && <Badge variant="outline">Couleur: {person.color}</Badge>}
              {person.type && <Badge variant="outline">Type: {person.type}</Badge>}
              {person.etat && <Badge variant="outline">État: {person.etat}</Badge>}
            </div>
          </div>
        )}

        {person.postdate && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Posté le: {new Date(person.postdate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 mt-2">
          <Button
            onClick={handleContact}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 group"
          >
            <Phone className="h-4 w-4" />
            Contacter le Trouveur
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// AI Chat Modal Component
const AIChatModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        '🤖 **Bienvenue ! Je vais vous aider à rechercher**\n\n• Dites-moi ce que vous avez perdu\n• Exemple: "téléphone Samsung noir à Casablanca"\n• أو بالعربية: "فقدت هاتفي في الدار البيضاء"\n• Or in English: "I lost my phone in Rabat"\n\nPlus de détails = meilleurs résultats !',
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
        missingPersons: data.missingPersons || undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `❌ **Problème technique**\n\nErreur: ${error.message}\n\n• Réessayez dans quelques instants\n• Vérifiez votre connexion internet`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostNewAd = () => {
    const url = "https://mafqoodat.ma/post.php"
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">🤖 Assistant IA - Chat Intelligent</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-4xl ${message.role === "user" ? "bg-blue-600 text-white px-4 py-3 rounded-lg" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="mb-4">
                    <div className="bg-gray-50 border text-gray-800 px-4 py-3 rounded-lg mb-4">
                      <div className="flex items-center mb-2">
                        <Bot className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-600">Assistant IA</span>
                      </div>
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

                          // Check for "Create Ad" button
                          if (line.includes("[CRÉER_ANNONCE]")) {
                            return (
                              <div key={index} className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                <button
                                  onClick={handlePostNewAd}
                                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Créer une annonce
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

                    {/* Display missing persons cards */}
                    {message.missingPersons && message.missingPersons.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-lg font-semibold text-gray-800 mb-4">
                          🎯 Objets trouvés ({message.missingPersons.length} résultats)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {message.missingPersons.map((person) => (
                            <MissingPersonCard key={person.id} person={person} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {message.role === "user" && <div className="whitespace-pre-wrap break-words">{message.content}</div>}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border px-4 py-3 rounded-lg text-gray-800 flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>L'IA analyse et recherche dans la base de données...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Exemple: téléphone Samsung noir à Casablanca | فقدت هاتفي في الرباط | I lost my phone in Fes"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{isLoading ? "Recherche..." : "Envoyer"}</span>
            </button>
          </form>
          <div className="mt-2 text-center">
            <button
              onClick={handlePostNewAd}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une nouvelle annonce</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [showAIModal, setShowAIModal] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple page content - will integrate with existing Mafqoodat layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenue sur Mafqoodat</h1>
          <p className="text-gray-600 mb-8">Plateforme marocaine d'objets perdus et trouvés</p>
        </div>

        {/* Existing Mafqoodat content would go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Objets Perdus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Recherchez parmi les objets perdus signalés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objets Trouvés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Consultez les objets trouvés par la communauté</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publier une Annonce</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Signalez un objet perdu ou trouvé</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant Buttons - Fixed position for easy access */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        {/* Chat AI Button */}
        <button
          onClick={() => setShowAIModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group"
          title="Chat avec l'Assistant IA"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden group-hover:inline-block whitespace-nowrap">Chat IA</span>
        </button>

        {/* Advanced Search/Filter Button */}
        <button
          onClick={() => setShowSearchForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group"
          title="Recherche Avancée avec Filtres"
        >
          <Filter className="h-6 w-6" />
          <span className="hidden group-hover:inline-block whitespace-nowrap">Filtres</span>
        </button>
      </div>

      {/* AI Chat Modal */}
      <AIChatModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

      {/* Advanced Search Modal */}
      {showSearchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <Filter className="h-6 w-6" />
                <h2 className="text-xl font-semibold">🔍 Recherche Avancée avec Filtres</h2>
              </div>
              <button
                onClick={() => setShowSearchForm(false)}
                className="p-2 hover:bg-green-700 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SearchForm onClose={() => setShowSearchForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
