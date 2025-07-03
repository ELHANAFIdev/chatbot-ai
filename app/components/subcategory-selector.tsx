"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface SubcategoryOption {
  id: number
  nom: string
}

interface SubcategorySelectorProps {
  categoryId: string
  onChange: (subcategoryId: string) => void
  value?: string
  className?: string
  disabled?: boolean
}

export default function SubcategorySelector({
  categoryId,
  onChange,
  value = "",
  className = "",
  disabled = false,
}: SubcategorySelectorProps) {
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([])
      return
    }

    const fetchSubcategories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/souscatg?categoryId=${categoryId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        setSubcategories(Array.isArray(data) ? data : [])
      } catch (error: any) {
        console.error("Error fetching subcategories:", error)
        setError(error.message)
        setSubcategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubcategories()
  }, [categoryId])

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading || subcategories.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
      >
        <option value="">
          {isLoading
            ? "Loading subcategories..."
            : error
              ? "Error loading subcategories"
              : subcategories.length === 0
                ? "No subcategories available"
                : `Select subcategory (${subcategories.length})`}
        </option>
        {subcategories.map((subcategory) => (
          <option key={subcategory.id} value={subcategory.id.toString()}>
            {subcategory.nom}
          </option>
        ))}
      </select>
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
