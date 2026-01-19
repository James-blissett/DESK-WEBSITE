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
import ProductImageCarousel from '@/components/ProductImageCarousel'
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
                <div className="alert bg-terracotta/20 border-2 border-terracotta/40 rounded-3xl mb-6 urgency-alert">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-terracotta" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-terracotta font-semibold">Configuration Error</span>
                </div>
            <h1 className="text-3xl font-bold mb-6 text-deep-charcoal text-ghibli-shadow">Setup Required</h1>
            <p className="py-4 text-left">
              {error.includes('Missing Supabase') || error.includes('placeholder') ? (
                <>
                  Please configure your Supabase environment variables in <code className="bg-charcoal-light px-2 py-1 rounded">.env.local</code>:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li><code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
                    <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon/public key</li>
                  </ul>
                  <div className="mt-4 p-3 bg-charcoal-light rounded text-sm">
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
            <h1 className="text-5xl font-bold text-deep-charcoal text-ghibli-shadow mb-6">No Products Available</h1>
            <p className="text-lg text-deep-charcoal/80 mb-4">We're currently out of stock. Please check back later.</p>
            <p className="text-sm text-deep-charcoal/60">Or add products to your Supabase database.</p>
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
    <main className="min-h-screen bg-soft-cream">
      {/* Top Banner - Sticky */}
      <div className="sticky top-0 z-50 w-full py-2 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-warm-honey rounded-full px-8 py-3 ghibli-shadow border border-warm-honey flex items-center justify-center relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              NOXCRAFT
            </h2>
            <a 
              href="#buy-now" 
              className="absolute right-4 btn btn-sm md:btn-md btn-ghibli text-white bg-deep-charcoal/80 hover:bg-deep-charcoal border-deep-charcoal/60 px-4 md:px-6"
            >
              Level Up
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section with Floating Image */}
      <div className="relative min-h-[85vh] bg-soft-cream pt-2 px-2 flex items-center">
        <div className="max-w-full mx-auto w-full">
          <div className="relative">
            {/* Floating Ghibli Image with Rounded Corners - Background */}
            <div className="relative mx-auto max-w-[95%]">
              <img
                src="/ghibli desk image.png"
                alt="Standing Desk"
                className="w-full h-[70vh] rounded-3xl shadow-2xl object-cover"
              />
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal-darker/70 via-deep-charcoal-darker/30 to-transparent rounded-3xl"></div>
            </div>

            {/* Content Overlaid on Image */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="max-w-4xl mx-auto text-center">
                {/* Main Headline */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6 drop-shadow-lg">
                  Get Yourself a New Standing Desk
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-10 drop-shadow-md">
                  without having to pay an arm and a leg
                </p>

                {/* Price and Save Badge */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
                  <div className="text-center p-6 bg-soft-cream/95 backdrop-blur-md rounded-3xl ghibli-shadow-lg">
                    <div className="text-4xl md:text-5xl font-bold text-warm-honey price-highlight">{formattedPrice}</div>
                    <div className="text-sm text-deep-charcoal/60 line-through">$850 retail</div>
                  </div>
                  <div className="hidden sm:block text-3xl text-white drop-shadow-lg">✦</div>
                  <div className="text-center p-6 bg-soft-cream/95 backdrop-blur-md rounded-3xl ghibli-shadow-lg">
                    <div className="text-2xl font-bold text-sage-green">Save $200</div>
                    <div className="text-sm text-deep-charcoal/70">With NOXCRAFT</div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <a href="#buy-now" className="btn btn-primary btn-ghibli text-lg md:text-xl px-10 md:px-14 py-3 md:py-4 !text-white hover:!text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-warm-honey hover:bg-warm-honey/90 border-warm-honey">
                  Get Yours Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Features Section */}
      <div className="py-16 md:py-24 bg-soft-cream relative">
        {/* Decorative leaf accent */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-warm-honey">
            <path d="M100 20 Q150 40 160 90 Q170 140 140 170 Q110 200 80 180 Q50 160 60 120 Q70 80 100 20" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-deep-charcoal text-ghibli-shadow">
              Built to Last, Priced to Sell
            </h2>
            <p className="text-lg md:text-xl text-deep-charcoal/70 max-w-2xl mx-auto">
              No compromises on quality. Just honest pricing. Be more comfortable and productive, without paying an arm and a leg.
            </p>
          </div>

          {/* Product Image Carousel */}
          <ProductImageCarousel 
            images={[
              '/IMG_8977.jpg',
              '/IMG_8972.jpg',
              '/IMG_8979.jpg',
              '/IMG_8981.jpg',
              '/IMG_8982.jpg',
              '/IMG_8983.jpg',
            ]}
          />

          {/* Text Field */}
          <div className="text-center -mt-8 mb-12">
            <p className="text-sm md:text-base text-deep-charcoal/70 max-w-2xl mx-auto">
              better product images coming soon :)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Dual Motor */}
            <div className="ghibli-card ghibli-hover">
              <div className="card-body items-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-warm-honey/30 to-sage-green/20 flex items-center justify-center ghibli-pulse">
                  <svg className="w-10 h-10 text-warm-honey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-warm-honey">Dual Motor</h3>
                <p className="text-deep-charcoal/80 leading-relaxed">
                  Powerful dual-motor system for smooth, stable height adjustment. Lift up to 120kg with ease.
                </p>
              </div>
            </div>

            {/* Steel Frame */}
            <div className="ghibli-card ghibli-hover">
              <div className="card-body items-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-deep-charcoal/30 to-warm-honey/20 flex items-center justify-center ghibli-pulse" style={{animationDelay: '1s'}}>
                  <svg className="w-10 h-10 text-deep-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-deep-charcoal">Steel Frame</h3>
                <p className="text-deep-charcoal/80 leading-relaxed">
                  Commercial-grade steel construction ensures stability and durability for years of daily use.
                </p>
              </div>
            </div>

            {/* Height Adjustable */}
            <div className="ghibli-card ghibli-hover">
              <div className="card-body items-center text-center p-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-sky-blue/30 to-terracotta/20 flex items-center justify-center ghibli-pulse" style={{animationDelay: '2s'}}>
                  <svg className="w-10 h-10 text-sky-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-sky-blue">Height Adjustable</h3>
                <p className="text-deep-charcoal/80 leading-relaxed">
                  Adjusts up to 1.18m (46.5"). Perfect for standing or sitting, whatever keeps you comfortable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Am I Doing This Section */}
      <div className="py-16 md:py-24 bg-soft-cream relative">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-48 h-48 opacity-5 ghibli-float">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-terracotta">
            <path d="M100 20 L120 80 L180 100 L120 120 L100 180 L80 120 L20 100 L80 80 Z" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-deep-charcoal text-ghibli-shadow">
              Why Am I Selling Desks?
            </h2>
            <div className="prose prose-lg max-w-none">
              <div className="ghibli-card overflow-hidden">
                <div className="bg-gradient-to-br from-terracotta/20 via-warm-honey/15 to-deep-charcoal/20 p-8 md:p-12">
                  <p className="text-xl md:text-2xl leading-relaxed mb-6 text-deep-charcoal font-medium">
                    I'm frustrated. Really frustrated.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-deep-charcoal/90">
                    Over the past 5 years, prices in Australia have been climbing for <strong className="text-terracotta">no good reason</strong>.
                    Standing desks that should cost $650 are being sold for $850, $950, even over $1000.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-deep-charcoal/90">
                    But here's the thing: <strong className="text-warm-honey">the cost to buy these desks from factories in China
                    is almost the same as it was 5 years ago</strong>. The only difference? More middlemen taking bigger cuts.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed mb-6 text-deep-charcoal/90">
                    Distributors. Wholesalers. Retailers. Marketing agencies. They're all adding their margin on top,
                    and you're the one paying for it.
                  </p>
                  <div className="bg-soft-cream p-8 rounded-3xl my-8 ghibli-shadow-lg">
                    <p className="text-2xl md:text-3xl font-bold text-center mb-4 text-terracotta">
                      This really pisses me off.
                    </p>
                    <p className="text-xl text-center text-deep-charcoal/80 leading-relaxed">
                      So I designed and sourced a pallet load of desks myself, to sell to you.
                    </p>
                  </div>
                  <p className="text-lg md:text-xl leading-relaxed text-deep-charcoal/90">
                    I'm cutting out all the middleman BS. No insane margins. No retail markup.
                    Just a quality product at a fair price. The way it should be.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details & Checkout Section */}
      <div id="buy-now" className="py-16 md:py-24 bg-soft-cream-lighter relative overflow-hidden">
        {/* Decorative grass/meadow at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sage-green/20 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-deep-charcoal text-ghibli-shadow">
              Ready to Upgrade Your Workspace?
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="ghibli-card overflow-hidden ghibli-hover">
                <figure className="aspect-square">
                  <img
                    src="/sunfall image.png"
                    alt="Sunfall standing desk"
                    className="w-full h-full object-cover"
                  />
                </figure>
              </div>

              {/* Checkout Card */}
              <div className="ghibli-card">
                <div className="card-body p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="text-3xl md:text-4xl font-bold text-deep-charcoal">{product.name}</h3>
                    {isInStock ? (
                      <div className="badge badge-lg gap-2 px-4 py-4 rounded-full bg-sage-green/20 text-sage-green border-sage-green/40 success-message">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {product.stock_quantity} In Stock
                      </div>
                    ) : (
                      <div className="badge badge-lg rounded-full px-4 py-4 bg-terracotta/20 text-terracotta border-terracotta/40 urgency-alert">Sold Out</div>
                    )}
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-4">
                      <p className="text-5xl md:text-6xl font-bold text-warm-honey price-highlight">
                        {formattedPrice}
                      </p>
                      <span className="text-2xl text-deep-charcoal/50 line-through">$850</span>
                    </div>
                    <p className="text-sm mt-3 text-sage-green font-medium">Save $200 on retail price</p>
                  </div>

                  {product.description && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-soft-cream-lighter to-soft-cream rounded-3xl ghibli-shadow">
                      <p className="text-base leading-relaxed text-deep-charcoal/90">
                        {product.description}
                      </p>
                    </div>
                  )}

                  <div className="divider text-deep-charcoal/60 section-divider">Secure Checkout</div>

                  <h3 className="text-xl md:text-2xl font-semibold text-deep-charcoal mb-6 text-center">
                    Enter your name and address
                  </h3>

                  <CheckoutForm product={product} />

                  {/* Bulk Discount Section */}
                  <div className="mt-8 pt-6 border-t border-charcoal-light">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-base md:text-lg text-deep-charcoal/80 text-center sm:text-left">
                        Want to buy 4 or more? Contact us to discuss bulk discount pricing
                      </p>
                      <a 
                        href="#contact-us" 
                        className="btn btn-ghibli bg-warm-honey hover:bg-warm-honey/90 !text-white hover:!text-white border-warm-honey px-8 py-3 text-base md:text-lg whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Contact Us
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-charcoal-light">
                    <div className="flex items-center justify-center gap-3 text-sm text-deep-charcoal/60">
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

      {/* How Can I Provide Such Good Value Section */}
      <div className="py-16 md:py-24 bg-soft-cream-lighter relative overflow-hidden">
        {/* Decorative organic shape */}
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5">
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-sage-green">
            <circle cx="100" cy="100" r="80" />
            <circle cx="60" cy="80" r="40" />
            <circle cx="140" cy="120" r="50" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-deep-charcoal text-ghibli-shadow">
              How Can I Provide Such Good Value?
            </h2>
            <div className="ghibli-card p-8">
              <div className="space-y-8 text-lg">
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-warm-honey/20 rounded-full flex-shrink-0">💰</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-warm-honey">No Office Rent</h3>
                    <p className="text-deep-charcoal/80 leading-relaxed">I'm just one guy running this from home. No expensive retail stores to pay for.</p>
                  </div>
                </div>
                <div className="divider section-divider"></div>
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-sky-blue/20 rounded-full flex-shrink-0">👤</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-deep-charcoal">No Employees to Pay</h3>
                    <p className="text-deep-charcoal/80 leading-relaxed">No sales teams, no managers, no overhead. Just me, keeping costs down.</p>
                  </div>
                </div>
                <div className="divider section-divider"></div>
                <div className="flex gap-6 items-start">
                  <div className="text-4xl w-16 h-16 flex items-center justify-center bg-warm-honey/20 rounded-full flex-shrink-0">✅</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-3 text-deep-charcoal">Just Manufacturing + Shipping</h3>
                    <p className="text-deep-charcoal/80 leading-relaxed">The price you pay covers the cost to make it, ship it, and a small margin. That's it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Meaning Of NOXCRAFT Section */}
      <div className="py-16 md:py-24 bg-soft-cream relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-deep-charcoal text-ghibli-shadow">
              The Meaning Of NOXCRAFT
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Text Field on Left */}
              <div className="ghibli-card p-8">
                <p className="text-base md:text-lg text-deep-charcoal/80 leading-relaxed">
                Noxcraft, literally meaning "night work" or "night craft," represents the act of working late into the night on that one thing that drives you, excites you, and brings you back to your desk day after day.
                The desk is a special place—a place of execution where all your aspirations and goals are laid bare and either brought to life or forgotten. With Noxcraft standing desks, we hope to give you the capacity and comfort to achieve the greatest things you can imagine.
                </p>
              </div>

              {/* NOXCRAFT Meaning Image on Right */}
              <div className="ghibli-card overflow-hidden ghibli-hover">
                <figure className="aspect-square">
                  <img
                    src="/noxcraft meaning pic.png"
                    alt="The meaning of NOXCRAFT - night work and craft"
                    className="w-full h-full object-cover"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div id="contact-us" className="py-16 md:py-24 bg-soft-cream-lighter">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-deep-charcoal text-ghibli-shadow whitespace-nowrap">
              Contact Us
            </h2>
            <div className="ghibli-card p-8">
              <p className="text-lg md:text-xl text-deep-charcoal/80 mb-4">
                For bulk orders (4 or more desks) or any questions, reach out to us:
              </p>
              <a 
                href="mailto:jamesdblissett@gmail.com" 
                className="text-xl md:text-2xl font-semibold text-warm-honey hover:text-warm-honey/80 transition-colors"
              >
                jamesdblissett@gmail.com
              </a>
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
