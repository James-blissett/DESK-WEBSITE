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
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Configuration Error</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Setup Required</h1>
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
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">No Products Available</h1>
            <p className="py-6">We're currently out of stock. Please check back later.</p>
            <p className="text-sm text-base-content opacity-60">Or add products to your Supabase database.</p>
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
    <main className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-[90vh] bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Premium Standing Desks.<br />
              <span className="text-primary">No Middleman Markup.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Dual motor, steel-framed standing desks shipped direct from the factory.
              Be more comfortable and productive, without paying an arm and a leg.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary">{formattedPrice}</div>
                <div className="text-sm opacity-60 line-through">$850 retail</div>
              </div>
              <div className="hidden sm:block text-2xl opacity-40">|</div>
              <div className="text-center">
                <div className="text-2xl font-semibold">Save $200</div>
                <div className="text-sm opacity-60">Factory Direct</div>
              </div>
            </div>
            <a href="#buy-now" className="btn btn-primary btn-lg">
              Get Yours Now
            </a>
          </div>
        </div>
      </div>

      {/* Product Features Section */}
      <div className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built to Last, Priced to Sell</h2>
            <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto">
              No compromises on quality. Just honest pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Dual Motor */}
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="card-title text-2xl">Dual Motor</h3>
                <p className="opacity-80">
                  Powerful dual-motor system for smooth, stable height adjustment. Lift up to 80kg with ease.
                </p>
              </div>
            </div>

            {/* Steel Frame */}
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="card-title text-2xl">Steel Frame</h3>
                <p className="opacity-80">
                  Commercial-grade steel construction ensures stability and durability for years of daily use.
                </p>
              </div>
            </div>

            {/* Height Adjustable */}
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <h3 className="card-title text-2xl">Height Adjustable</h3>
                <p className="opacity-80">
                  Adjusts up to 1.18m (46.5"). Perfect for standing or sitting, whatever keeps you comfortable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Buy From Me Section */}
      <div className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">Why Buy From Me?</h2>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="space-y-6 text-lg">
                  <div className="flex gap-4">
                    <div className="text-2xl">💰</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">No Office Rent</h3>
                      <p className="opacity-80">I'm just one guy running this from home. No expensive retail stores to pay for.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">👤</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">No Employees to Pay</h3>
                      <p className="opacity-80">No sales teams, no managers, no overhead. Just me, keeping costs down.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">🏭</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Factory Direct</h3>
                      <p className="opacity-80">I import directly from the manufacturer in Guangzhou. No distributors, no wholesalers, no markup.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Just Manufacturing + Shipping</h3>
                      <p className="opacity-80">The price you pay covers the cost to make it, ship it, and a small margin. That's it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Am I Doing This Section */}
      <div className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">Why Am I Doing This?</h2>
            <div className="prose prose-lg max-w-none">
              <div className="card bg-gradient-to-br from-error/10 to-warning/10 shadow-xl">
                <div className="card-body">
                  <p className="text-lg md:text-xl leading-relaxed mb-4">
                    I'm frustrated. Really frustrated.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-4">
                    Over the past 5 years, prices in Australia have been climbing for <strong>no good reason</strong>.
                    Standing desks that should cost $650 are being sold for $850, $950, even over $1000.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-4">
                    But here's the thing: <strong className="text-primary">the cost to buy these desks from factories in China
                    is almost the same as it was 5 years ago</strong>. The only difference? More middlemen taking bigger cuts.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-4">
                    Distributors. Wholesalers. Retailers. Marketing agencies. They're all adding their margin on top,
                    and you're the one paying for it.
                  </p>
                  <div className="bg-base-100 p-6 rounded-lg my-6">
                    <p className="text-xl md:text-2xl font-bold text-center mb-2">
                      This really pisses me off.
                    </p>
                    <p className="text-lg text-center opacity-80">
                      So I bought a shipment of desks straight from the factory in Guangzhou.
                    </p>
                  </div>
                  <p className="text-lg md:text-xl leading-relaxed">
                    I'm cutting out all the middleman BS. No inflated margins. No retail markup.
                    Just a quality product at a fair price. The way it should be.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details & Checkout Section */}
      <div id="buy-now" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Ready to Upgrade Your Workspace?</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image Placeholder */}
              <div className="card bg-base-100 shadow-xl">
                <figure className="aspect-square">
                  <div className="w-full h-full bg-base-300 flex items-center justify-center">
                    <svg
                      className="w-32 h-32 md:w-48 md:h-48 text-base-content opacity-20"
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

              {/* Checkout Card */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h3 className="text-3xl md:text-4xl font-bold">{product.name}</h3>
                    {isInStock ? (
                      <div className="badge badge-success badge-lg gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {product.stock_quantity} In Stock
                      </div>
                    ) : (
                      <div className="badge badge-error badge-lg">Sold Out</div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-3">
                      <p className="text-5xl md:text-6xl font-bold text-primary">
                        {formattedPrice}
                      </p>
                      <span className="text-2xl opacity-60 line-through">$850</span>
                    </div>
                    <p className="text-sm mt-2 opacity-70">Save $200 on retail price</p>
                  </div>

                  {product.description && (
                    <div className="mb-6 p-4 bg-base-200 rounded-lg">
                      <p className="text-base leading-relaxed opacity-90">
                        {product.description}
                      </p>
                    </div>
                  )}

                  <div className="divider">Secure Checkout</div>

                  <CheckoutForm product={product} />

                  <div className="mt-6 pt-6 border-t border-base-300">
                    <div className="flex items-center justify-center gap-4 text-sm opacity-60">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>
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
