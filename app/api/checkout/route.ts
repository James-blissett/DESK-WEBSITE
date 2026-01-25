import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer_email, customer_name, shipping_address } = body

    // Support both new cart items format and legacy single product format
    let cartItems: Array<{ product_id: string; quantity: number }> = []
    
    if (items && Array.isArray(items)) {
      // New format: array of items with product_id and quantity
      cartItems = items
    } else if (body.product_id) {
      // Legacy format: single product_id
      cartItems = [{ product_id: body.product_id, quantity: 1 }]
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: items (array of {product_id, quantity}) or product_id' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!customer_email || !customer_name || !shipping_address) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_email, customer_name, shipping_address' },
        { status: 400 }
      )
    }

    // Validate shipping_address is an object
    if (typeof shipping_address !== 'object' || Array.isArray(shipping_address)) {
      return NextResponse.json(
        { error: 'shipping_address must be an object' },
        { status: 400 }
      )
    }

    // Validate cart items
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client
    const supabase = createServerSupabase()

    // Fetch all products from database
    const productIds = cartItems.map(item => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .in('id', productIds)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json(
        { error: 'Error fetching products' },
        { status: 500 }
      )
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No products found' },
        { status: 404 }
      )
    }

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]))

    // Validate stock and build line items
    const lineItems = []
    const metadataItems = []

    for (const cartItem of cartItems) {
      const product = productMap.get(cartItem.product_id)
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${cartItem.product_id} not found` },
          { status: 404 }
        )
      }

      // Check stock
      if (product.stock_quantity < cartItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${cartItem.quantity}` },
          { status: 400 }
        )
      }

      // Add to Stripe line items
      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: cartItem.quantity,
      })

      // Add to metadata for webhook processing
      metadataItems.push({
        product_id: product.id,
        quantity: cartItem.quantity,
      })
    }

    // Get the origin URL for constructing absolute URLs
    const origin = req.nextUrl.origin

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        customer_name,
        shipping_address: JSON.stringify(shipping_address),
        items: JSON.stringify(metadataItems), // Store items array in metadata
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
