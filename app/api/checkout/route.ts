import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { product_id, customer_email, customer_name, shipping_address } = body

    // Validate required fields
    if (!product_id || !customer_email || !customer_name || !shipping_address) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, customer_email, customer_name, shipping_address' },
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

    // Create server-side Supabase client
    const supabase = createServerSupabase()

    // Fetch product from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .eq('id', product_id)
      .single()

    if (productError) {
      console.error('Error fetching product:', productError)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product has stock
    if (!product || product.stock_quantity <= 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Get the origin URL for constructing absolute URLs
    const origin = req.nextUrl.origin

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: product.name,
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        product_id,
        customer_name,
        shipping_address: JSON.stringify(shipping_address),
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
