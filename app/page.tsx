// app/page.tsx

"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { useChat, type Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  X,
  Send,
  Bot,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

// Le composant principal de la page
export default function HomePage() {
  const [isChatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Le hook useChat gère tout pour nous !
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("Chat error:", error);
      // Optionnel: afficher un message d'erreur dans le chat
    },
  });

  // Fait défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatOpen(true)}
          className="text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group"
          style={{ backgroundColor: "#C2252E" }}
          title="Chat avec l'Assistant IA"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar du Chat */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isChatOpen ? "bg-black bg-opacity-50" : "pointer-events-none bg-opacity-0"
        }`}
        onClick={() => setChatOpen(false)}
      >
        <div
          className={`fixed top-4 right-4 h-[calc(100vh-2rem)] w-full max-w-md transform bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out rounded-lg overflow-hidden ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
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
            <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-red-800 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Bienvenue !</p>
                <p>Décrivez votre objet perdu pour commencer la recherche...</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-3 rounded-lg max-w-sm ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {m.role === 'assistant' && (
                     <div className="flex items-center gap-2 mb-2 text-red-600 font-medium text-sm">
                        <Bot /> Assistant IA
                      </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" /> }}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                    <Bot />
                    <span>Assistant IA</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ex: sac d'ordinateur noir..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}