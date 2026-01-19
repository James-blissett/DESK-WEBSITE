'use client'

import { useState, FormEvent } from 'react'
import type { Product } from '@/types/database'

interface CheckoutFormProps {
  product: Product
}

export default function CheckoutForm({ product }: CheckoutFormProps) {
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

    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
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

  const isInStock = product.stock_quantity > 0

  return (
    <div className="mt-6">
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
            disabled={!isInStock || isLoading}
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
            disabled={!isInStock || isLoading}
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
            disabled={!isInStock || isLoading}
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
            disabled={!isInStock || isLoading}
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
            disabled={!isInStock || isLoading}
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
            disabled={!isInStock || isLoading}
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
              disabled={!isInStock || isLoading}
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
              disabled={!isInStock || isLoading}
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
            disabled={!isInStock || isLoading}
            required
          />
        </div>

        <div className="form-control mt-8">
          <button
            type="submit"
            className={`btn btn-lg w-full rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-warm-honey hover:bg-warm-honey/90 border-warm-honey ${
              isLoading ? 'loading' : ''
            } ${!isInStock ? 'btn-disabled' : ''}`}
            disabled={!isInStock || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Processing...
              </>
            ) : isInStock ? (
              'Proceed to Checkout'
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
