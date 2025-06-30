"use client"

import { useState, useEffect } from "react"
import { X, Search, Loader2, Plus } from "lucide-react"

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
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchCategories()
    fetchCities()
  }, [])

  const fetchCategories = async () => {
    try {
      setError("")
      const response = await fetch("/api/categories")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Categories data:", data)

      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories")
      setCategories([])
    }
  }

  const fetchCities = async () => {
    try {
      setError("")
      const response = await fetch("/api/cities")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Cities data:", data)

      setCities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching cities:", error)
      setError("Failed to load cities")
      setCities([])
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setError("")
    try {
      const searchParams = new URLSearchParams({
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedCity && { cityId: selectedCity }),
        ...(description && { description }),
      })

      const response = await fetch(`/api/search?${searchParams}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      setSearchResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error searching items:", error)
      setError("Failed to search items")
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
    const url = "https://mafqoodat.ma/draft/post.php"
    window.open(url, "_blank", "noopener,noreferrer")
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select city</option>
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

        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Search Items</span>
            </>
          )}
        </button>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Search Results ({searchResults.length}):</h3>
            {searchResults.map((item, index) => (
              <div key={index} className="bg-white border rounded-lg p-3">
                <div className="text-sm">
                  <div className="font-medium">Item #{item.id}</div>
                  <div className="text-gray-600 mt-1">{item.description}</div>

                  <div className="mt-2 space-y-1">
                    {item.marque && (
                      <div className="text-xs">
                        <span className="font-medium">Brand:</span> {item.marque}
                      </div>
                    )}
                    {item.modele && (
                      <div className="text-xs">
                        <span className="font-medium">Model:</span> {item.modele}
                      </div>
                    )}
                    {item.color && (
                      <div className="text-xs">
                        <span className="font-medium">Color:</span> {item.color}
                      </div>
                    )}
                    {item.type && (
                      <div className="text-xs">
                        <span className="font-medium">Type:</span> {item.type}
                      </div>
                    )}
                    {item.etat && (
                      <div className="text-xs">
                        <span className="font-medium">Condition:</span> {item.etat}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>{item.city}</span>
                    <span>{item.category_name}</span>
                  </div>
                  {item.postdate && <div className="text-xs text-gray-400">Posted: {formatDate(item.postdate)}</div>}

                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <button
                      className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-3 rounded text-sm flex items-center justify-center space-x-2"
                      onClick={() => {
                        const url = `https://mafqoodat.ma/trouve.php?contact=${item.id}`
                        window.open(url, "_blank", "noopener,noreferrer")
                      }}
                    >
                      <Search className="h-3 w-3" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (selectedCategory || description) && (
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-gray-600 mb-3">No matching items found.</p>
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
      </div>
    </div>
  )
}
