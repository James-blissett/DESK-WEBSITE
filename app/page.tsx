// export default function Home() {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <h1 className="text-4xl font-bold">Hello World</h1>
//       </div>
//     )
//   }
  
import { createPublicSupabase } from '@/lib/supabase'
import type { Product } from '@/types/database'
import LoadingSpinner from '@/components/LoadingSpinner'
import CheckoutForm from '@/components/CheckoutForm'
import { Suspense } from 'react'

async function getProduct(): Promise<{ product: Product | null; error?: string }> {
  try {
    // Create Supabase client - this can throw if env vars are missing
    let supabase
    try {
      supabase = createPublicSupabase()
      console.log('Supabase client created successfully')
    } catch (clientError) {
      const errorMsg = clientError instanceof Error ? clientError.message : 'Failed to initialize Supabase client'
      console.error('Supabase client initialization error:', errorMsg)
      return { product: null, error: errorMsg }
    }

    console.log('Attempting to fetch products...')
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('relation "products" does not exist')) {
        return { 
          product: null, 
          error: 'The "products" table does not exist in your Supabase database. Please run the SQL schema file (supabase-schema.sql) in your Supabase SQL Editor.' 
        }
      }
      
      // Check for RLS/policy errors
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        return { 
          product: null, 
          error: 'Row Level Security (RLS) is blocking the query. Please ensure the RLS policy allows public read access to the products table. Check the supabase-schema.sql file for the correct policies.' 
        }
      }
      
      if (error.code === 'PGRST116') {
        // No rows returned - this is fine
        console.log('No products found in database')
        return { product: null }
      }
      
      // Check for common network/connection errors
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('timeout')) {
        return { product: null, error: `Connection error: ${error.message}. Please verify your Supabase URL is correct.` }
      }
      
      return { product: null, error: `Database error (code: ${error.code}): ${error.message}` }
    }

    console.log('Product fetched successfully:', data)
    return { product: data }
  } catch (error) {
    console.error('Unexpected error fetching product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { product: null, error: errorMessage }
  }
}

function ProductDisplay({ product, error }: { product: Product | null; error?: string }) {
  if (error) {
    return (
      <div className="hero min-h-screen bg-ghibli-cream">
        <div className="hero-content text-center">
          <div className="max-w-md ghibli-card p-8">
            <div className="alert alert-error mb-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Configuration Error</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-ghibli-forest">Setup Required</h1>
            <p className="py-4 text-left">
              {error.includes('Missing Supabase') || error.includes('placeholder') ? (
                <>
                  Please configure your Supabase environment variables in <code className="bg-base-300 px-2 py-1 rounded">.env.local</code>:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li><code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
                    <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon/public key</li>
                  </ul>
                  <div className="mt-4 p-3 bg-base-300 rounded text-sm">
                    <p className="font-semibold mb-1">To get these values:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to your Supabase project dashboard</li>
                      <li>Navigate to Settings → API</li>
                      <li>Copy the "Project URL" and "anon public" key</li>
                      <li>Paste them into your <code>.env.local</code> file</li>
                      <li>Restart the dev server (Ctrl+C then npm run dev)</li>
                    </ol>
                  </div>
                </>
              ) : (
                error
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="hero min-h-screen bg-ghibli-cream">
        <div className="hero-content text-center">
          <div className="max-w-md ghibli-card p-8">
            <h1 className="text-5xl font-bold text-ghibli-forest mb-4">No Products Available</h1>
            <p className="py-6 text-ghibli-forest opacity-90 font-serif">We're currently out of stock. Please check back later.</p>
            <p className="text-sm text-ghibli-forest opacity-60 font-serif">Or add products to your Supabase database.</p>
          </div>
        </div>
      </div>
    )
  }

  const isInStock = product.stock_quantity > 0
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price)

  return (
    <main className="min-h-screen bg-ghibli-cream">
      {/* Hero Section */}
      <div className="ghibli-hero hero min-h-[60vh] py-20 md:py-32">
        <div className="hero-content text-center ghibli-hero-content">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-ghibli-forest ghibli-text-shadow leading-tight">
              Finally a premium standing desk that won't cost an arm and a leg
            </h1>
            <p className="text-xl md:text-2xl text-ghibli-forest opacity-90 font-serif">
              Discover the perfect blend of quality and affordability
            </p>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image Placeholder */}
          <div className="ghibli-card ghibli-floating">
            <figure className="aspect-square overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-ghibli-sky to-ghibli-cloud flex items-center justify-center">
                <svg
                  className="w-32 h-32 md:w-48 md:h-48 text-ghibli-forest opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </figure>
          </div>

          {/* Product Details Card */}
          <div className="ghibli-card">
            <div className="card-body p-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <h2 className="card-title text-3xl md:text-4xl text-ghibli-forest font-bold">{product.name}</h2>
                {isInStock ? (
                  <div className="ghibli-badge px-4 py-2 text-white font-semibold">
                    {product.stock_quantity} In Stock
                  </div>
                ) : (
                  <div className="badge badge-error badge-lg rounded-full">Sold Out</div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-4xl md:text-5xl font-bold text-ghibli-grass mb-2">
                  {formattedPrice}
                </p>
              </div>

              {product.description && (
                <div className="mb-6">
                  <p className="text-base md:text-lg text-ghibli-forest opacity-90 leading-relaxed font-serif">
                    {product.description}
                  </p>
                </div>
              )}

              <CheckoutForm product={product} />

              <div className="mt-6 pt-6 border-t-2 border-ghibli-grass border-opacity-20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ghibli-forest opacity-70 font-serif">Stock Quantity:</span>
                  <span className="font-bold text-ghibli-forest">{product.stock_quantity} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

async function ProductPageContent() {
  const { product, error } = await getProduct()
  return <ProductDisplay product={product} error={error} />
}

// Disable caching to always fetch fresh data from Supabase
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductPageContent />
    </Suspense>
  )
}
