// FICHIER : app/page.tsx

"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useChat, type Message } from "ai/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  X, Loader2, Send, Bot, Phone, User, MapPin, Calendar, ExternalLink, Plus, 
  MessageCircle, Filter, Search, Heart, Clock, CheckCircle, BarChart3 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Interface pour les données d'un objet trouvé, utilisée par la carte
interface MissingPerson { 
    id: string; 
    description: string; 
    city: string; 
    category_name?: string; 
    marque?: string; 
    modele?: string; 
    color?: string; 
    type?: string; 
    etat?: string; 
    postdate?: string; 
    contactUrl: string; 
}

// -----------------------------------------------------------------------------
// COMPOSANT POUR AFFICHER LA CARTE D'UN OBJET TROUVÉ
// -----------------------------------------------------------------------------
const MissingPersonCard = ({ person }: { person: MissingPerson }) => {
  const handleContact = () => window.open(person.contactUrl, "_blank", "noopener,noreferrer");
  
  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-red-300">
      <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center"><User className="h-5 w-5 mr-2 text-red-600" /><span>Objet #{person.id}</span></CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600"><MapPin className="h-4 w-4 mr-2" /><span className="font-medium">{person.city || 'Inconnue'}</span></div>
        <div className="text-sm"><p className="font-medium text-gray-800 mb-2">Description:</p><p className="text-gray-600 line-clamp-3">{person.description || "Aucune description"}</p></div>
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
        {person.postdate && (<div className="flex items-center text-sm text-gray-500"><Calendar className="h-4 w-4 mr-2" /><span>Posté le: {new Date(person.postdate).toLocaleDateString()}</span></div>)}
        <div className="pt-3 border-t border-gray-200 mt-2">
          <Button onClick={handleContact} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 group"><Phone className="h-4 w-4" />Contacter le Trouveur<ExternalLink className="h-4 w-4 ml-1" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

// -----------------------------------------------------------------------------
// MODALE DE CHAT AVEC L'IA
// -----------------------------------------------------------------------------
const AIChatModal = ({ 
    isOpen, 
    onClose,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
}: { 
    isOpen: boolean; 
    onClose: () => void;
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  const handlePostNewAd = () => window.open("https://mafqoodat.ma/post.php", "_blank", "noopener,noreferrer");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b text-white" style={{ backgroundColor: "#C2252E" }}>
          <h2 className="text-xl font-semibold flex items-center gap-3"><MessageCircle /> Assistant IA</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-800 rounded-full"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {messages.length === 0 && <div className="text-center text-gray-500">Posez une question...</div>}
           {messages.map(m => (
            <div key={m.id} className="space-y-4">
              {m.role === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-red-600 text-white px-4 py-3 rounded-lg max-w-2xl">{m.content}</div>
                </div>
              )}
              {m.role === 'assistant' && m.content && (
                <div className="flex justify-start">
                  <div className="w-full">
                    <div className="bg-gray-50 border text-gray-800 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-red-600 font-medium text-sm"><Bot /> Assistant IA</div>
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({node, ...props}) => {
                              if (props.href === 'action:create_ad') { return <Button onClick={handlePostNewAd} className="bg-green-600 hover:bg-green-700 mt-2"><Plus className="mr-2 h-4 w-4"/>{props.children}</Button>; }
                              return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{props.children}</a>;
                            }
                          }}
                        >{m.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {m.role === 'tool' && m.result && Array.isArray(m.result) && m.result.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(m.result as MissingPerson[]).map(person => (<MissingPersonCard key={person.id} person={person} />))}
                </div>
              )}
            </div>
           ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4 bg-gray-50">
          {/* Le formulaire appelle maintenant notre propre fonction handleSubmit */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input value={input} onChange={handleInputChange} placeholder="Ex: sac d'ordinateur noir à Salé..." className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" disabled={isLoading} />
            <button type="submit" disabled={isLoading || !input.trim()} className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"><Send className="h-4 w-4" />Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// COMPOSANTS DE REMPLACEMENT POUR LES AUTRES MODALES
// -----------------------------------------------------------------------------
const SearchForm = ({ onClose }: { onClose: () => void }) => ( <div className="p-6 h-full flex items-center justify-center bg-gray-50"><p className="text-gray-500">Le formulaire de recherche avancée sera affiché ici.</p></div> );
const Dashboard = ({ onClose }: { onClose: () => void }) => ( <div className="p-6 h-full flex items-center justify-center bg-gray-50"><p className="text-gray-500">Le tableau de bord avec les graphiques sera affiché ici.</p></div> );

// -----------------------------------------------------------------------------
// COMPOSANT PRINCIPAL DE LA PAGE
// -----------------------------------------------------------------------------
export default function HomePage() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Le hook useChat est maintenant ici, dans le composant parent.
  // Cela garantit que l'état du chat persiste et est stable.
  const { messages, input, handleInputChange, isLoading, append } = useChat({
    api: "/api/chat",
  });

  // Notre propre fonction handleSubmit qui utilise `append` pour une soumission fiable.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await append({ role: 'user', content: input });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #C2252E 0%, #8B1A1A 100%)" }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 leading-tight">Retrouvez vos objets perdus au Maroc</h1>
            <p className="text-xl mb-8 opacity-90">La première plateforme marocaine d'objets perdus et trouvés avec intelligence artificielle</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setShowAIModal(true)} size="lg" className="bg-white hover:bg-gray-100 font-semibold px-8 py-3 text-red-600"><MessageCircle className="h-5 w-5 mr-2" />Rechercher avec l'IA</Button>
              <Button onClick={() => setShowSearchForm(true)} size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-3"><Filter className="h-5 w-5 mr-2" />Recherche avancée</Button>
              <Button onClick={() => setShowDashboard(true)} size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-3"><BarChart3 className="h-5 w-5 mr-2" />Tableau de Bord</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center"><div className="text-3xl font-bold mb-2 text-red-600">1,247</div><div className="text-gray-600">Objets signalés</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600 mb-2">892</div><div className="text-gray-600">Objets retrouvés</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-purple-600 mb-2">3,456</div><div className="text-gray-600">Utilisateurs actifs</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-orange-600 mb-2">72%</div><div className="text-gray-600">Taux de succès</div></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-800 mb-4">Comment ça marche ?</h2><p className="text-gray-600 max-w-2xl mx-auto">Notre plateforme utilise l'intelligence artificielle pour vous aider à retrouver vos objets perdus rapidement et efficacement.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300"><CardHeader><div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100"><MessageCircle className="h-8 w-8 text-red-600" /></div><CardTitle className="text-xl">Chat IA Intelligent</CardTitle></CardHeader><CardContent><p className="text-gray-600">Décrivez votre objet perdu en français, arabe ou anglais. Notre IA comprend et recherche automatiquement.</p></CardContent></Card>
            <Card className="text-center hover:shadow-lg transition-shadow duration-300"><CardHeader><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="h-8 w-8 text-green-600" /></div><CardTitle className="text-xl">Recherche Avancée</CardTitle></CardHeader><CardContent><p className="text-gray-600">Filtrez par ville, catégorie, marque et autres critères pour des résultats précis.</p></CardContent></Card>
            <Card className="text-center hover:shadow-lg transition-shadow duration-300"><CardHeader><div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><BarChart3 className="h-8 w-8 text-purple-600" /></div><CardTitle className="text-xl">Tableau de Bord</CardTitle></CardHeader><CardContent><p className="text-gray-600">Visualisez les statistiques en temps réel avec des graphiques interactifs.</p></CardContent></Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-white" style={{ background: "linear-gradient(135deg, #C2252E 0%, #8B1A1A 100%)" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à retrouver vos objets ?</h2>
          <p className="text-xl mb-8 opacity-90">Commencez dès maintenant votre recherche ou aidez quelqu'un d'autre</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setShowAIModal(true)} size="lg" className="bg-white hover:bg-gray-100 font-semibold px-8 py-3 text-red-600"><Search className="h-5 w-5 mr-2" />Commencer la recherche</Button>
            <Button onClick={() => window.open("https://mafqoodat.ma/post.php", "_blank")} size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-3"><Plus className="h-5 w-5 mr-2" />Publier une annonce</Button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3">
        <button onClick={() => setShowAIModal(true)} className="text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 group" style={{ backgroundColor: "#C2252E" }} title="Chat avec l'Assistant IA"><MessageCircle className="h-6 w-6" /><span className="hidden group-hover:inline-block whitespace-nowrap pr-2">Chat IA</span></button>
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
      />
      
      {showSearchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-auto flex flex-col">
            <div className="flex items-center justify-between p-4 border-b text-white rounded-t-lg" style={{ backgroundColor: "#C2252E" }}>
                <h2 className="text-xl font-semibold flex items-center gap-2"><Filter /> Recherche Avancée</h2>
                <button onClick={() => setShowSearchForm(false)} className="p-2 hover:bg-red-800 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            <SearchForm onClose={() => setShowSearchForm(false)} />
          </div>
        </div>
      )}

      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b text-white rounded-t-lg" style={{ backgroundColor: "#C2252E" }}>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 /> Tableau de Bord</h2>
                    <button onClick={() => setShowDashboard(false)} className="p-2 hover:bg-red-800 rounded-full"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto"><Dashboard onClose={() => setShowDashboard(false)} /></div>
            </div>
        </div>
      )}
    </div>
  );
}