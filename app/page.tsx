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
      <div className="hero min-h-screen ghibli-sunset">
        <div className="hero-content text-center">
          <div className="max-w-md ghibli-card p-8">
            <div className="alert bg-error/20 border-2 border-error/40 rounded-3xl mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-error" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-error font-semibold">Configuration Error</span>
            </div>
            <h1 className="text-3xl font-bold mb-6 text-neutral text-ghibli-shadow">Setup Required</h1>
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
      <div className="hero min-h-screen ghibli-sky relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-20 bg-white/30 rounded-full blur-xl ghibli-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-24 bg-white/25 rounded-full blur-xl ghibli-float" style={{animationDelay: '2s'}}></div>
        <div className="hero-content text-center">
          <div className="max-w-md ghibli-card p-10">
            <h1 className="text-5xl font-bold text-neutral text-ghibli-shadow mb-6">No Products Available</h1>
            <p className="text-lg text-neutral/80 mb-4">We're currently out of stock. Please check back later.</p>
            <p className="text-sm text-neutral/60">Or add products to your Supabase database.</p>
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
      {/* Hero Section - Ghibli Sky Inspired */}
      <div className="hero min-h-[90vh] ghibli-sky relative overflow-hidden">
        {/* Decorative clouds */}
        <div className="absolute top-10 left-10 w-32 h-20 bg-white/30 rounded-full blur-xl ghibli-float"></div>
        <div className="absolute top-32 right-20 w-40 h-24 bg-white/25 rounded-full blur-xl ghibli-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-22 bg-white/20 rounded-full blur-xl ghibli-float" style={{animationDelay: '4s'}}></div>

        <div className="hero-content text-center relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-ghibli-shadow text-neutral">
              Finally, a premium standing desk that won't cost an arm and a leg.<br />
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-neutral/90 max-w-2xl mx-auto leading-relaxed">
              Dual motor, steel-framed standing desks.
              Be more comfortable and productive, without paying an arm and a leg.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
              <div className="text-center p-6 bg-white/70 rounded-3xl ghibli-shadow backdrop-blur-sm">
                <div className="text-4xl md:text-5xl font-bold text-primary">{formattedPrice}</div>
                <div className="text-sm text-neutral/60 line-through">$850 retail</div>
              </div>
              <div className="hidden sm:block text-3xl text-white/60">✦</div>
              <div className="text-center p-6 bg-white/70 rounded-3xl ghibli-shadow backdrop-blur-sm">
                <div className="text-2xl font-bold text-success">Save $200</div>
                <div className="text-sm text-neutral/70">Factory Direct</div>
              </div>
            </div>
            <a href="#buy-now" className="btn btn-primary btn-ghibli btn-lg px-10 text-white">
              Get Yours Now
            </a>
          </div>
        </div>
      </div>

      {/* Product Features Section */}
      <div className="py-16 md:py-24 bg-base-100 relative">
        {/* Decorative leaf accent */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-primary">
            <path d="M100 20 Q150 40 160 90 Q170 140 140 170 Q110 200 80 180 Q50 160 60 120 Q70 80 100 20" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neutral text-ghibli-shadow">
              Built to Last, Priced to Sell
            </h2>
            <p className="text-lg md:text-xl text-neutral/70 max-w-2xl mx-auto">
              No compromises on quality. Just honest pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Dual Motor */}
            <div className="ghibli-card ghibli-hover">
              <div className="card-body items-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary/30 to-success/20 flex items-center justify-center ghibli-pulse">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary">Dual Motor</h3>
                <p className="text-neutral/80 leading-relaxed">
                  Powerful dual-motor system for smooth, stable height adjustment. Lift up to 30kg with ease.
                </p>
              </div>
            </div>

            {/* Steel Frame */}
            <div className="ghibli-card ghibli-hover">
              <div className="card-body items-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-secondary/30 to-warning/20 flex items-center justify-center ghibli-pulse" style={{animationDelay: '1s'}}>
                  <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-secondary">Steel Frame</h3>
                <p className="text-neutral/80 leading-relaxed">
                  Commercial-grade steel construction ensures stability and durability for years of daily use.
                </p>
              </div>
            </div>

            {/* Height Adjustable */}
            <div className="ghibli-card ghibli-hover">
              <div className="card-body items-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-info/30 to-accent/20 flex items-center justify-center ghibli-pulse" style={{animationDelay: '2s'}}>
                  <svg className="w-10 h-10 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-info">Height Adjustable</h3>
                <p className="text-neutral/80 leading-relaxed">
                  Adjusts up to 1.18m (46.5"). Perfect for standing or sitting, whatever keeps you comfortable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Buy From Me Section */}
      <div className="py-16 md:py-24 bg-base-200 relative overflow-hidden">
        {/* Decorative organic shape */}
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-success">
            <circle cx="100" cy="100" r="80" />
            <circle cx="60" cy="80" r="40" />
            <circle cx="140" cy="120" r="50" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-neutral text-ghibli-shadow">
              Why Buy From Me?
            </h2>
            <div className="ghibli-card p-8">
              <div className="space-y-8 text-lg">
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-warning/20 rounded-full flex-shrink-0">💰</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-primary">No Office Rent</h3>
                    <p className="text-neutral/80 leading-relaxed">I'm just one guy running this from home. No expensive retail stores to pay for.</p>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-info/20 rounded-full flex-shrink-0">👤</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-secondary">No Employees to Pay</h3>
                    <p className="text-neutral/80 leading-relaxed">No sales teams, no managers, no overhead. Just me, keeping costs down.</p>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-success/20 rounded-full flex-shrink-0">🏭</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-success">Factory Direct</h3>
                    <p className="text-neutral/80 leading-relaxed">I import directly from the manufacturer in Guangzhou. No distributors, no wholesalers, no markup.</p>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-accent/20 rounded-full flex-shrink-0">✅</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-neutral">Just Manufacturing + Shipping</h3>
                    <p className="text-neutral/80 leading-relaxed">The price you pay covers the cost to make it, ship it, and a small margin. That's it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Am I Doing This Section */}
      <div className="py-16 md:py-24 bg-base-100 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-48 h-48 opacity-5 ghibli-float">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-error">
            <path d="M100 20 L120 80 L180 100 L120 120 L100 180 L80 120 L20 100 L80 80 Z" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-neutral text-ghibli-shadow">
              Why Am I Doing This?
            </h2>
            <div className="prose prose-lg max-w-none">
              <div className="ghibli-card overflow-hidden">
                <div className="bg-gradient-to-br from-error/20 via-warning/15 to-secondary/20 p-8 md:p-12">
                  <p className="text-xl md:text-2xl leading-relaxed mb-6 text-neutral font-medium">
                    I'm frustrated. Really frustrated.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-neutral/90">
                    Over the past 5 years, prices in Australia have been climbing for <strong className="text-error">no good reason</strong>.
                    Standing desks that should cost $650 are being sold for $850, $950, even over $1000.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-neutral/90">
                    But here's the thing: <strong className="text-primary">the cost to buy these desks from factories in China
                    is almost the same as it was 5 years ago</strong>. The only difference? More middlemen taking bigger cuts.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-neutral/90">
                    Distributors. Wholesalers. Retailers. Marketing agencies. They're all adding their margin on top,
                    and you're the one paying for it.
                  </p>
                  <div className="bg-base-100 p-8 rounded-3xl my-8 ghibli-shadow-lg">
                    <p className="text-2xl md:text-3xl font-bold text-center mb-4 text-error">
                      This really pisses me off.
                    </p>
                    <p className="text-xl text-center text-neutral/80 leading-relaxed">
                      So I bought a shipment of desks straight from the factory in Guangzhou.
                    </p>
                  </div>
                  <p className="text-lg md:text-xl leading-relaxed text-neutral/90">
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
      <div id="buy-now" className="py-16 md:py-24 bg-base-200 relative overflow-hidden">
        {/* Decorative grass/meadow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-success/20 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-neutral text-ghibli-shadow">
              Ready to Upgrade Your Workspace?
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image Placeholder */}
              <div className="ghibli-card overflow-hidden ghibli-hover">
                <figure className="aspect-square">
                  <div className="w-full h-full bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
                    <svg
                      className="w-32 h-32 md:w-48 md:h-48 text-primary/30"
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
              <div className="ghibli-card">
                <div className="card-body p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="text-3xl md:text-4xl font-bold text-neutral">{product.name}</h3>
                    {isInStock ? (
                      <div className="badge badge-success badge-lg gap-2 px-4 py-4 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {product.stock_quantity} In Stock
                      </div>
                    ) : (
                      <div className="badge badge-error badge-lg rounded-full px-4 py-4">Sold Out</div>
                    )}
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-4">
                      <p className="text-5xl md:text-6xl font-bold text-primary">
                        {formattedPrice}
                      </p>
                      <span className="text-2xl text-neutral/50 line-through">$850</span>
                    </div>
                    <p className="text-sm mt-3 text-success font-medium">Save $200 on retail price</p>
                  </div>

                  {product.description && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-base-200 to-base-100 rounded-3xl ghibli-shadow">
                      <p className="text-base leading-relaxed text-neutral/90">
                        {product.description}
                      </p>
                    </div>
                  )}

                  <div className="divider text-neutral/60">Secure Checkout</div>

                  <CheckoutForm product={product} />

                  <div className="mt-8 pt-6 border-t border-base-300">
                    <div className="flex items-center justify-center gap-3 text-sm text-neutral/60">
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
