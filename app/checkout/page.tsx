'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CartIcon from '@/components/CartIcon'
import { trackInitiateCheckout } from '@/lib/meta-pixel'

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [additionalAddress, setAdditionalAddress] = useState('')
  const [suburb, setSuburb] = useState('')
  const [state, setState] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('Australia')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPrice = getTotalPrice()
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalPrice)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate all required fields are filled
    if (!firstName.trim() || !lastName.trim() || !customerEmail.trim() || 
        !streetAddress.trim() || !suburb.trim() || !state.trim() || !postcode.trim()) {
      setError('Please fill in all required fields')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError('Please enter a valid email address')
      return
    }

    // Track InitiateCheckout event for Meta Pixel
    const totalValue = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    trackInitiateCheckout({
      content_ids: items.map(item => item.product.id.toString()),
      value: totalValue,
      currency: 'AUD',
    })

    setIsLoading(true)

    try {
      // Prepare cart items for API
      const cartItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customer_name: `${firstName.trim()} ${lastName.trim()}`,
          customer_email: customerEmail.trim(),
          shipping_address: {
            street_address: streetAddress.trim(),
            additional_address: additionalAddress.trim(),
            suburb: suburb.trim(),
            state: state.trim(),
            postcode: postcode.trim(),
            country: country.trim() || 'Australia',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session')
        setIsLoading(false)
        return
      }

      // Redirect to Stripe checkout URL
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('No checkout URL received')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An error occurred while processing your request')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-soft-cream">
      {/* Top Banner */}
      <div className="sticky top-0 z-50 w-full py-2 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-warm-honey rounded-full px-8 py-3 ghibli-shadow border border-warm-honey flex items-center justify-center relative">
            <Link href="/" className="text-2xl md:text-3xl font-bold text-white hover:text-white/90">
              NOXCRAFT
            </Link>
            <div className="absolute right-4">
              <CartIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-deep-charcoal text-ghibli-shadow">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="ghibli-card">
                <div className="card-body p-8">
                  <h2 className="text-2xl font-bold text-deep-charcoal mb-6">
                    Shipping Information
                  </h2>

                  {error && (
                    <div className="alert bg-terracotta/20 border-2 border-terracotta/40 rounded-3xl mb-6 urgency-alert">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6 text-terracotta"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-terracotta font-medium">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="form-control">
                      <input
                        type="text"
                        id="first_name"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <input
                        type="text"
                        id="last_name"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <input
                        type="email"
                        id="customer_email"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Email"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <input
                        type="text"
                        id="street_address"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Street Address"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <input
                        type="text"
                        id="additional_address"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={additionalAddress}
                        onChange={(e) => setAdditionalAddress(e.target.value)}
                        placeholder="Additional Address Info (optional)"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="form-control">
                      <input
                        type="text"
                        id="suburb"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        placeholder="Suburb"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <select
                          id="state"
                          className="select select-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          disabled={isLoading}
                          required
                        >
                          <option value="">State</option>
                          <option value="NSW">NSW</option>
                          <option value="VIC">VIC</option>
                          <option value="QLD">QLD</option>
                          <option value="WA">WA</option>
                          <option value="SA">SA</option>
                          <option value="TAS">TAS</option>
                          <option value="ACT">ACT</option>
                          <option value="NT">NT</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <input
                          type="text"
                          id="postcode"
                          className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          placeholder="Postcode"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <input
                        type="text"
                        id="country"
                        className="input input-bordered rounded-2xl border-2 bg-soft-cream focus:border-warm-honey focus:outline-none transition-all ml-4 pl-4"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country/Region"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-control mt-8">
                      <button
                        type="submit"
                        className={`btn btn-lg w-full rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-warm-honey hover:bg-warm-honey/90 border-warm-honey ${
                          isLoading ? 'loading' : ''
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="loading loading-spinner"></span>
                            Processing...
                          </>
                        ) : (
                          `Pay ${formattedTotal}`
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="ghibli-card sticky top-24">
                <div className="card-body p-6">
                  <h2 className="text-2xl font-bold text-deep-charcoal mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    {items.map((item) => {
                      const itemTotal = item.product.price * item.quantity
                      const formattedPrice = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(item.product.price)
                      const formattedItemTotal = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(itemTotal)

                      return (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-semibold text-deep-charcoal">{item.product.name}</p>
                            <p className="text-deep-charcoal/60">
                              {formattedPrice} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-deep-charcoal font-semibold">{formattedItemTotal}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="divider"></div>

                  <div className="flex justify-between text-xl font-bold text-deep-charcoal mb-6">
                    <span>Total</span>
                    <span className="text-warm-honey">{formattedTotal}</span>
                  </div>

                  <Link
                    href="/cart"
                    className="btn btn-ghost w-full"
                  >
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
