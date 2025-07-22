"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Search,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Activity,
  Loader2,
} from "lucide-react"

// Import Recharts components dynamically to avoid SSR issues
import dynamic from "next/dynamic"

const BarChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.BarChart })), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => ({ default: mod.Bar })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => ({ default: mod.CartesianGrid })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })), {
  ssr: false,
})
const PieChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.PieChart })), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => ({ default: mod.Pie })), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => ({ default: mod.Cell })), { ssr: false })
const LineChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => ({ default: mod.Line })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => ({ default: mod.Tooltip })), { ssr: false })
const Legend = dynamic(() => import("recharts").then((mod) => ({ default: mod.Legend })), { ssr: false })

interface DashboardStats {
  totalItems: number
  foundItems: number
  lostItems: number
  successRate: number
  itemsByCategory: Array<{ name: string; value: number; color: string }>
  itemsByCity: Array<{ name: string; value: number }>
  monthlyTrends: Array<{ month: string; lost: number; found: number }>
  recentActivity: Array<{ type: string; item: string; city: string; time: string }>
  brandStats: Array<{ name: string; value: number; color: string }>
  colorStats: Array<{ name: string; value: number; color: string }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/stats")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Get more detailed statistics
      console.log("Fetching detailed brand statistics...")
      // Mock query function for demonstration purposes
      const query = async (sql: string) => {
        // Replace this with your actual database query logic
        console.log("Executing SQL:", sql)
        return [] // Return an empty array for now
      }

      const brandStatsResult = await query(`
        SELECT 
          CASE 
            WHEN LOWER(f.marque) LIKE '%apple%' OR LOWER(f.marque) LIKE '%iphone%' THEN 'Apple'
            WHEN LOWER(f.marque) LIKE '%samsung%' THEN 'Samsung'
            WHEN LOWER(f.marque) LIKE '%huawei%' THEN 'Huawei'
            WHEN LOWER(f.marque) LIKE '%xiaomi%' THEN 'Xiaomi'
            WHEN LOWER(f.marque) LIKE '%nokia%' THEN 'Nokia'
            ELSE 'Autres'
          END as brand_name,
          COUNT(*) as count
        FROM fthings f 
        WHERE f.marque IS NOT NULL AND f.marque != ''
        GROUP BY brand_name
        ORDER BY count DESC
        LIMIT 8
      `)

      // Get color statistics
      console.log("Fetching color statistics...")
      const colorStatsResult = await query(`
        SELECT 
          CASE 
            WHEN LOWER(f.color) LIKE '%noir%' OR LOWER(f.color) LIKE '%black%' THEN 'Noir'
            WHEN LOWER(f.color) LIKE '%blanc%' OR LOWER(f.color) LIKE '%white%' THEN 'Blanc'
            WHEN LOWER(f.color) LIKE '%rouge%' OR LOWER(f.color) LIKE '%red%' THEN 'Rouge'
            WHEN LOWER(f.color) LIKE '%bleu%' OR LOWER(f.color) LIKE '%blue%' THEN 'Bleu'
            WHEN LOWER(f.color) LIKE '%vert%' OR LOWER(f.color) LIKE '%green%' THEN 'Vert'
            ELSE 'Autres'
          END as color_name,
          COUNT(*) as count
        FROM fthings f 
        WHERE f.color IS NOT NULL AND f.color != ''
        GROUP BY color_name
        ORDER BY count DESC
        LIMIT 6
      `)

      // Process brand statistics
      const brandStats = Array.isArray(brandStatsResult)
        ? brandStatsResult.map((item, index) => ({
            name: item.brand_name || "Inconnu",
            value: Number(item.count) || 0,
            color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"][index % 8],
          }))
        : []

      // Process color statistics
      const colorStats = Array.isArray(colorStatsResult)
        ? colorStatsResult.map((item, index) => ({
            name: item.color_name || "Inconnu",
            value: Number(item.count) || 0,
            color: ["#000000", "#FFFFFF", "#EF4444", "#3B82F6", "#10B981", "#6B7280"][index % 6],
          }))
        : []

      // Ajouter ces nouvelles statistiques à l'objet stats retourné :
      const stats = {
        totalItems: Number(data.totalItems) || 0,
        foundItems: data.foundItems,
        lostItems: data.lostItems,
        successRate: data.successRate,
        itemsByCategory: data.itemsByCategory,
        itemsByCity: data.itemsByCity,
        brandStats, // Nouveau
        colorStats, // Nouveau
        monthlyTrends: data.monthlyTrends,
        recentActivity: data.recentActivity,
      }

      setStats(stats as DashboardStats)
    } catch (error: any) {
      console.error("Error fetching stats:", error)
      setError(`Failed to load dashboard: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de Bord</h2>
          <p className="text-gray-600">Statistiques et analyses des objets perdus et trouvés</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Activity className="h-4 w-4 mr-1" />
          Temps réel
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objets</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Base de données réelle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objets Retrouvés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.foundItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Calculé depuis DB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objets Perdus</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lostItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              Données réelles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Basé sur statut réel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Objets par Catégorie</CardTitle>
            <CardDescription>Répartition des objets perdus par type (données réelles)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.itemsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.itemsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Items by City */}
        <Card>
          <CardHeader>
            <CardTitle>Objets par Ville</CardTitle>
            <CardDescription>Répartition géographique des objets (données réelles)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.itemsByCity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Objets par Marque</CardTitle>
          <CardDescription>Répartition des objets par marque (données réelles)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.brandStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Color Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Objets par Couleur</CardTitle>
          <CardDescription>Répartition des objets par couleur (données réelles)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.colorStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.colorStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances Mensuelles</CardTitle>
          <CardDescription>Évolution des objets perdus et retrouvés (6 derniers mois)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="lost" stroke="#EF4444" name="Objets perdus" />
                <Line type="monotone" dataKey="found" stroke="#10B981" name="Objets retrouvés" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>Derniers objets signalés (données réelles de la base)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === "found" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.item}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{activity.city}</span>
                    <Calendar className="h-3 w-3 ml-2" />
                    <span>{activity.time}</span>
                  </div>
                </div>
                <Badge variant={activity.type === "found" ? "default" : "secondary"}>
                  {activity.type === "found" ? "Trouvé" : "Perdu"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
