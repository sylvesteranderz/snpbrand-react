import { useState, useEffect } from 'react'
import { MedusaProductService, MedusaCategoryService } from '../services/medusaService'

/**
 * Test component to verify Medusa integration
 * This can be temporarily added to your app to test the connection
 */
const MedusaTest = () => {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch products
        const productsResponse = await MedusaProductService.getProducts({ limit: 10 })
        setProducts(productsResponse.products)

        // Fetch categories
        const categoriesResponse = await MedusaCategoryService.getCategories()
        setCategories(categoriesResponse.categories)

        setLoading(false)
      } catch (err: any) {
        console.error('Medusa test error:', err)
        setError(err.message || 'Failed to fetch data from Medusa')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">🔄 Testing Medusa Connection...</h2>
        <p>Loading data from Medusa backend...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <h2 className="text-xl font-bold mb-4 text-red-600">❌ Medusa Connection Error</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="bg-white p-4 rounded border border-red-200">
          <p className="text-sm text-gray-600 mb-2">Possible issues:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Medusa backend is not running (run: <code className="bg-gray-100 px-1">npm run dev</code> in medusa-backend/)</li>
            <li>Missing <code className="bg-gray-100 px-1">.env</code> file with VITE_MEDUSA_URL and VITE_MEDUSA_PUBLISHABLE_KEY</li>
            <li>Docker Desktop is not running (PostgreSQL database)</li>
            <li>Incorrect publishable API key in .env file</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-green-50 rounded-lg border-2 border-green-200">
      <h2 className="text-2xl font-bold mb-4 text-green-700">✅ Medusa Connected Successfully!</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">📦 Products ({products.length})</h3>
        <div className="bg-white p-4 rounded border border-green-200 max-h-60 overflow-y-auto">
          {products.length > 0 ? (
            <ul className="space-y-2">
              {products.map((product: any) => (
                <li key={product.id} className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-gray-600">ID: {product.id}</p>
                    {product.variants && (
                      <p className="text-xs text-gray-500">
                        {product.variants.length} variant(s)
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No products found. Run <code className="bg-gray-100 px-1">npm run seed</code> in medusa-backend/</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">🏷️ Categories ({categories.length})</h3>
        <div className="bg-white p-4 rounded border border-green-200">
          {categories.length > 0 ? (
            <ul className="space-y-1">
              {categories.map((category: any) => (
                <li key={category.id} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>{category.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No categories found</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded border border-green-200">
        <p className="text-sm text-gray-700">
          <strong>Next Steps:</strong> You can now integrate Medusa products into your Shop page and product listings.
          Remove this test component when ready.
        </p>
      </div>
    </div>
  )
}

export default MedusaTest
