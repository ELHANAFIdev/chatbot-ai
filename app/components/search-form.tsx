"use client"

import { useState, useEffect } from "react"
import { X, Search, Loader2, Plus, AlertTriangle } from "lucide-react"
import SubcategorySelector from "./subcategory-selector"

interface SearchFormProps {
  onClose: () => void
}

interface Option {
  id: number
  name: string
}

export default function SearchForm({ onClose }: SearchFormProps) {
  const [categories, setCategories] = useState<Option[]>([])
  const [cities, setCities] = useState<Option[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await Promise.all([fetchCategories(), fetchCities()])
    setIsLoading(false)
  }

  const fetchCategories = async () => {
    try {
      setError("")
      const response = await fetch("/api/categories")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      console.log("Categories loaded:", data.length)
      setCategories(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      setError(`Failed to load categories: ${error.message}`)
      setCategories([])
    }
  }

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      console.log("Cities loaded:", data.length)
      setCities(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error fetching cities:", error)
      setError(`Failed to load cities: ${error.message}`)
      setCities([])
    }
  }

  const handleSearch = async () => {
    if (!selectedCategory && !selectedCity && !description.trim() && !selectedSubcategory) {
      setError("Please select at least one search criteria")
      return
    }

    setIsSearching(true)
    setError("")

    try {
      const searchParams = new URLSearchParams()

      if (selectedCategory) searchParams.append("categoryId", selectedCategory)
      if (selectedSubcategory) searchParams.append("subcategoryId", selectedSubcategory)
      if (selectedCity) searchParams.append("cityId", selectedCity)
      if (description.trim()) searchParams.append("description", description.trim())

      const response = await fetch(`/api/search?${searchParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      console.log("Search results:", data.length)
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error searching items:", error)
      setError(`Search failed: ${error.message}`)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""

    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const handlePostNewAd = () => {
    const url = "https://mafqoodat.ma/user/publier.php"
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const clearSearch = () => {
    setSelectedCategory("")
    setSelectedSubcategory("")
    setSelectedCity("")
    setDescription("")
    setSearchResults([])
    setError("")
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Advanced Search</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading search options...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Advanced Search</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedSubcategory("") // Reset subcategory when category changes
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={categories.length === 0}
          >
            <option value="">Select category ({categories.length} available)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium mb-2">Subcategory</label>
            <SubcategorySelector
              categoryId={selectedCategory}
              value={selectedSubcategory}
              onChange={setSelectedSubcategory}
              disabled={categories.length === 0}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={cities.length === 0}
          >
            <option value="">Select city ({cities.length} available)</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id.toString()}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description / Brand / Model</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Search by description, brand, model, or type..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            disabled={isSearching || (categories.length === 0 && cities.length === 0)}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>

          <button
            onClick={clearSearch}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isSearching}
          >
            Clear
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Database Results ({searchResults.length})</h3>
              <button onClick={clearSearch} className="text-sm text-gray-500 hover:text-gray-700">
                Clear results
              </button>
            </div>
            {searchResults.map((item, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="text-sm">
                  <div className="font-medium text-blue-600">Item #{item.id}</div>
                  <div className="text-gray-600 mt-1">{item.description || "No description"}</div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {item.marque && (
                      <div>
                        <span className="font-medium">Brand:</span> {item.marque}
                      </div>
                    )}
                    {item.modele && (
                      <div>
                        <span className="font-medium">Model:</span> {item.modele}
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <span className="font-medium">Color:</span> {item.color}
                      </div>
                    )}
                    {item.type && (
                      <div>
                        <span className="font-medium">Type:</span> {item.type}
                      </div>
                    )}
                    {item.etat && (
                      <div>
                        <span className="font-medium">Condition:</span> {item.etat}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                    <span>{item.city || "Unknown city"}</span>
                    <span>{item.category_name || "Unknown category"}</span>
                  </div>

                  {item.postdate && (
                    <div className="text-xs text-gray-400 mt-1">Posted: {formatDate(item.postdate)}</div>
                  )}

                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center space-x-2 transition-colors group"
                      onClick={() => {
                        const url = `https://mafqoodat.ma/trouve.php?contact=${item.id}`
                        window.open(url, "_blank", "noopener,noreferrer")
                      }}
                    >
                      <Search className="h-3 w-3" />
                      <span>Contact Finder</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (selectedCategory || selectedCity || description.trim()) && (
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-gray-600 mb-3">No matching items found in database.</p>
            <button
              onClick={handlePostNewAd}
              className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded flex items-center justify-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Ad</span>
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handlePostNewAd}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Post New Missing Item</span>
          </button>
        </div>

        {/* Database Status */}
        <div className="text-xs text-gray-500 text-center">
          Database: {categories.length + cities.length > 0 ? "✅ Connected" : "❌ Not Connected"}
          {categories.length > 0 && (
            <span className="ml-2">
              ({categories.length} categories, {cities.length} cities)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
