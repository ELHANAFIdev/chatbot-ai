"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat, type Message } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  X,
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
  Search,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Interface pour les données d'un objet trouvé
interface MissingPerson {
  id: string
  description: string
  city: string
  category_name?: string
  marque?: string
  modele?: string
  color?: string
  type?: string
  etat?: string
  postdate?: string
  contactUrl: string
}

// MODIFIED: The contact button now only shows if a contactUrl exists.
const MissingPersonCard = ({ person }: { person: MissingPerson }) => {
  const handleContact = () => window.open(person.contactUrl, "_blank", "noopener,noreferrer")

  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-red-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2 text-red-600" />
          <span>Objet #{person.id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="font-medium">{person.city || "Inconnue"}</span>
        </div>
        <div className="text-sm">
          <p className="font-medium text-gray-800 mb-2">Description:</p>
          <p className="text-gray-600 line-clamp-3">{person.description || "Aucune description"}</p>
        </div>
        {(person.category_name || person.marque || person.modele || person.color) && (
          <div className="space-y-1">
            <p className="font-medium text-gray-800 text-sm">Détails:</p>
            <div className="flex flex-wrap gap-2">
              {person.category_name && <Badge variant="outline">Catégorie: {person.category_name}</Badge>}
              {person.marque && <Badge variant="outline">Marque: {person.marque}</Badge>}
              {person.modele && <Badge variant="outline">Modèle: {person.modele}</Badge>}
              {person.color && <Badge variant="outline">Couleur: {person.color}</Badge>}
            </div>
          </div>
        )}
        {person.postdate && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Posté le: {new Date(person.postdate).toLocaleDateString()}</span>
          </div>
        )}
        {/* MODIFIED: Conditionally render the contact button only if a URL is provided */}
        {person.contactUrl && (
          <div className="pt-3 border-t border-gray-200 mt-2">
            <Button
              onClick={handleContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 group"
            >
              <Phone className="h-4 w-4" />
              Contacter le Trouveur
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Chat component as a sidebar
const AIChatSidebar = ({
  isOpen,
  onClose,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  setInput,
}: {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  setInput: (value: string) => void
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handlePostNewAd = () => window.open("https://mafqoodat.ma/post.php", "_blank", "noopener,noreferrer")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    handleSubmit(e)
  }
  
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "bg-black bg-opacity-50" : "pointer-events-none bg-opacity-0"
      }`}
      onClick={onClose}
    >
      {/* MODIFIED: Changed height, position, and added rounded corners + overflow-hidden */}
      <div
        className={`fixed top-4 right-4 h-[calc(100vh-2rem)] w-full max-w-md transform bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out rounded-lg overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4 border-b text-white"
          style={{ backgroundColor: "#C2252E" }}
        >
          <h2 className="text-xl font-semibold flex items-center gap-3">
            <MessageCircle /> Assistant IA
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-800 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Bienvenue dans l'Assistant IA</p>
              <p>Décrivez votre objet perdu pour commencer la recherche...</p>
              <div className="mt-4 text-sm text-gray-400">
                <p>Exemples: "sac noir à Casablanca", "iPhone rouge", "portefeuille en cuir"</p>
              </div>
            </div>
          )}
          
          {messages.map((m) => (
            <div key={m.id} className="space-y-4">
              {m.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-red-600 text-white px-4 py-3 rounded-lg max-w-2xl">
                    {m.content}
                  </div>
                </div>
              )}
              
              {m.role === "assistant" && m.content && (
                <div className="flex justify-start">
                  <div className="w-full">
                    <div className="bg-gray-50 border text-gray-800 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-red-600 font-medium text-sm">
                        <Bot /> Assistant IA
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => {
                              if (props.href === "action:create_ad") {
                                return (
                                  <Button 
                                    onClick={handlePostNewAd} 
                                    className="bg-green-600 hover:bg-green-700 mt-2 inline-flex items-center"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {props.children}
                                  </Button>
                                )
                              }
                              return (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center"
                                >
                                  {props.children}
                                  <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              )
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border text-gray-800 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                  <Bot />
                  <span>Assistant IA</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Recherche en cours...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={onSubmit} className="flex space-x-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ex: sac d'ordinateur noir à Salé..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "..." : "Envoyer"}
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Tapez votre message et appuyez sur Entrée ou cliquez sur Envoyer
          </div>
        </div>
      </div>
    </div>
  )
}

// Composants de remplacement
const SearchForm = ({ onClose }: { onClose: () => void }) => (
  <div className="p-6 h-full flex items-center justify-center bg-gray-50">
    <p className="text-gray-500">Le formulaire de recherche avancée sera affiché ici.</p>
  </div>
)

const Dashboard = ({ onClose }: { onClose: () => void }) => (
  <div className="p-6 h-full flex items-center justify-center bg-gray-50">
    <p className="text-gray-500">Le tableau de bord avec les graphiques sera affiché ici.</p>
  </div>
)

// Composant principal de la page
export default function HomePage() {
  const [isChatOpen, setChatOpen] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Custom chat state management for non-streaming responses
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text
      }

      setMessages(prev => [...prev, assistantMessage])
      setInput("") // Clear input after successful response
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Veuillez réessayer."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        <button
          onClick={() => setChatOpen(true)}
          className="text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group"
          style={{ backgroundColor: "#C2252E" }}
          title="Chat avec l'Assistant IA"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden group-hover:inline-block whitespace-nowrap pr-2">Chat IA</span>
        </button>
      </div>

      <AIChatSidebar
        isOpen={isChatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        setInput={setInput}
      />
    </div>
  )
}