'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import CartIcon from '@/components/CartIcon'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const totalPrice = getTotalPrice()
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalPrice)

  if (items.length === 0) {
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

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="ghibli-card p-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mx-auto mb-6 text-deep-charcoal/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h1 className="text-4xl font-bold mb-4 text-deep-charcoal text-ghibli-shadow">
                Your Cart is Empty
              </h1>
              <p className="text-lg text-deep-charcoal/70 mb-8">
                Start adding some standing desks to your cart!
              </p>
              <Link
                href="/#buy-now"
                className="btn btn-lg btn-ghibli bg-warm-honey hover:bg-warm-honey/90 !text-white hover:!text-white border-warm-honey px-8"
              >
                Browse Desks
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
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
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
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
                  <div key={item.product.id} className="ghibli-card">
                    <div className="card-body p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-soft-cream-lighter flex-shrink-0">
                          <img
                            src="/sunfall image.png"
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-deep-charcoal mb-2">
                            {item.product.name}
                          </h3>
                          <p className="text-lg text-warm-honey font-semibold mb-4">
                            {formattedPrice} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4 mb-4">
                            <label className="text-deep-charcoal/80 font-medium">Quantity:</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="btn btn-sm btn-circle bg-soft-cream-lighter hover:bg-soft-cream border-charcoal-light"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="text-xl font-semibold text-deep-charcoal w-12 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="btn btn-sm btn-circle bg-soft-cream-lighter hover:bg-soft-cream border-charcoal-light"
                                disabled={item.quantity >= item.product.stock_quantity}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-deep-charcoal">
                              Total: {formattedItemTotal}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="btn btn-sm btn-ghost text-terracotta hover:text-terracotta hover:bg-terracotta/10"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="btn btn-ghost text-terracotta hover:text-terracotta hover:bg-terracotta/10"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="ghibli-card sticky top-24">
                <div className="card-body p-6">
                  <h2 className="text-2xl font-bold text-deep-charcoal mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-deep-charcoal/80">
                      <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>{formattedTotal}</span>
                    </div>
                    <div className="divider"></div>
                    <div className="flex justify-between text-xl font-bold text-deep-charcoal">
                      <span>Total</span>
                      <span className="text-warm-honey">{formattedTotal}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="btn btn-lg w-full rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-warm-honey hover:bg-warm-honey/90 border-warm-honey"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/#buy-now"
                    className="btn btn-ghost w-full mt-4"
                  >
                    Continue Shopping
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
