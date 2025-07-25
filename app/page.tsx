"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat, type Message } from "ai/react"
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

// Interface pour les données d'un objet trouvé, utilisée par la carte
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

// Composant pour afficher la carte d'un objet trouvé
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
      </CardContent>
    </Card>
  )
}

// Modale de Chat IA (composant de présentation)
const AIChatModal = ({
  isOpen,
  onClose,
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  append, // Pass append from useChat
}: {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  append: (message: Message) => Promise<void> // Add append to props
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handlePostNewAd = () => window.open("https://mafqoodat.ma/post.php", "_blank", "noopener,noreferrer")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
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
            <div className="text-center text-gray-500">
              Posez une question pour commencer la conversation avec l'Assistant IA...
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className="space-y-4">
              {m.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-red-600 text-white px-4 py-3 rounded-lg max-w-2xl">{m.content}</div>
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
                                  <Button onClick={handlePostNewAd} className="bg-green-600 hover:bg-green-700 mt-2">
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
                                  className="text-blue-600 hover:underline"
                                >
                                  {props.children}
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
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="flex space-x-2">
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
              className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Envoyer
            </button>
          </form>
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
  const [showAIModal, setShowAIModal] = useState(false)
  const [showSearchForm, setShowSearchForm] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Le hook useChat est ici, dans le composant parent, pour un état stable et persistant.
  const { messages, input, handleInputChange, isLoading, append } = useChat({
    api: "/api/chat",
  })

  // Notre propre fonction handleSubmit qui utilise `append` pour une soumission fiable.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await append({ role: "user", content: input })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        <button
          onClick={() => setShowAIModal(true)}
          className="text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group"
          style={{ backgroundColor: "#C2252E" }}
          title="Chat avec l'Assistant IA"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden group-hover:inline-block whitespace-nowrap pr-2">Chat IA</span>
        </button>
      </div>

      {/* On passe l'état et les fonctions du hook en props à la modale */}
      <AIChatModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        append={append}
      />
    </div>
  )
}