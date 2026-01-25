'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/types/database'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isInStock = product.stock_quantity > 0

  const handleAddToCart = () => {
    if (!isInStock) return

    setIsAdding(true)
    addToCart(product, 1)
    
    // Show success message
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setIsAdding(false)
    }, 2000)
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddToCart}
        disabled={!isInStock || isAdding}
        className={`btn btn-lg w-full rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
          showSuccess
            ? 'bg-sage-green hover:bg-sage-green/90 border-sage-green'
            : 'bg-warm-honey hover:bg-warm-honey/90 border-warm-honey'
        } ${!isInStock ? 'btn-disabled' : ''} ${isAdding ? 'loading' : ''}`}
      >
        {isAdding ? (
          <>
            <span className="loading loading-spinner"></span>
            Adding...
          </>
        ) : showSuccess ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Added to Cart!
          </>
        ) : isInStock ? (
          'Add to Cart'
        ) : (
          'Out of Stock'
        )}
      </button>
      {showSuccess && (
        <p className="text-sm text-center text-sage-green font-medium">
          Item added! <a href="/cart" className="underline">View cart</a>
        </p>
      )}
    </div>
  )
}
