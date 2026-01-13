'use client'

import { useState, FormEvent } from 'react'
import type { Product } from '@/types/database'

interface CheckoutFormProps {
  product: Product
}

export default function CheckoutForm({ product }: CheckoutFormProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validate all fields are filled
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      setError('Please fill in all fields')
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
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          shipping_address: { address: shippingAddress.trim() },
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
        <div className="alert bg-error/20 border-2 border-error/40 rounded-3xl mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6 text-error"
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
          <span className="text-error font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="form-control">
          <label className="label" htmlFor="customer_name">
            <span className="label-text text-neutral font-medium">Name</span>
          </label>
          <input
            type="text"
            id="customer_name"
            className="input input-bordered rounded-2xl border-2 focus:border-primary focus:outline-none transition-all"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={!isInStock || isLoading}
            required
          />
        </div>

        <div className="form-control">
          <label className="label" htmlFor="customer_email">
            <span className="label-text text-neutral font-medium">Email</span>
          </label>
          <input
            type="email"
            id="customer_email"
            className="input input-bordered rounded-2xl border-2 focus:border-primary focus:outline-none transition-all"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            disabled={!isInStock || isLoading}
            required
          />
        </div>

        <div className="form-control">
          <label className="label" htmlFor="shipping_address">
            <span className="label-text text-neutral font-medium">Shipping Address</span>
          </label>
          <textarea
            id="shipping_address"
            className="textarea textarea-bordered h-24 rounded-2xl border-2 focus:border-primary focus:outline-none transition-all"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            disabled={!isInStock || isLoading}
            required
          />
        </div>

        <div className="form-control mt-8">
          <button
            type="submit"
            className={`btn btn-primary btn-lg w-full rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
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
