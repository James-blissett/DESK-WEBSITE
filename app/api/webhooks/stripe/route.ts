import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log(`Webhook verified: ${event.type} (ID: ${event.id})`)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', errorMessage)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Processing checkout.session.completed:', session.id)

      // Extract metadata
      const productId = session.metadata?.product_id
      const customerName = session.metadata?.customer_name
      const shippingAddressStr = session.metadata?.shipping_address
      const customerEmail = session.customer_email || session.customer_details?.email

      // Validate required data
      if (!productId) {
        console.error('Missing product_id in session metadata:', session.id)
        return NextResponse.json(
          { received: true, error: 'Missing product_id in metadata' },
          { status: 200 } // Return 200 to acknowledge receipt
        )
      }

      if (!customerEmail) {
        console.error('Missing customer_email in session:', session.id)
        return NextResponse.json(
          { received: true, error: 'Missing customer_email' },
          { status: 200 }
        )
      }

      // Parse shipping address
      let shippingAddress: any
      try {
        shippingAddress = shippingAddressStr ? JSON.parse(shippingAddressStr) : {}
      } catch (parseError) {
        console.error('Failed to parse shipping_address JSON:', parseError)
        shippingAddress = { address: shippingAddressStr || '' }
      }

      // Create server-side Supabase client
      const supabase = createServerSupabase()

      // Fetch current product stock
      console.log(`Fetching product: ${productId}`)
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single()

      if (productError) {
        console.error('Error fetching product:', productError)
        throw new Error(`Failed to fetch product: ${productError.message}`)
      }

      if (!product) {
        console.error('Product not found:', productId)
        throw new Error(`Product not found: ${productId}`)
      }

      // Decrement product stock_quantity
      const newStockQuantity = Math.max(0, product.stock_quantity - 1)
      console.log(`Decrementing stock for product: ${productId} (${product.stock_quantity} -> ${newStockQuantity})`)

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', productId)

      if (updateError) {
        console.error('Error decrementing stock:', updateError)
        throw new Error(`Failed to decrement stock: ${updateError.message}`)
      }

      console.log(`Stock decremented successfully for product: ${productId}`)

      // Insert order record
      console.log(`Inserting order for product: ${productId}, customer: ${customerEmail}`)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          product_id: productId,
          customer_email: customerEmail,
          customer_name: customerName || null,
          shipping_address: shippingAddress,
          stripe_payment_id: session.id,
          status: 'completed', // Using 'completed' as per schema constraint
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error inserting order:', orderError)
        throw new Error(`Failed to insert order: ${orderError.message}`)
      }

      console.log(`Order created successfully: ${order.id} for product ${productId}`)
      console.log(`Checkout session ${session.id} processed successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error processing checkout.session.completed:', errorMessage)
      console.error('Full error:', error)
      // Return 200 to acknowledge receipt even if processing failed
      // This prevents Stripe from retrying (you may want to handle retries differently)
      return NextResponse.json(
        { received: true, error: errorMessage },
        { status: 200 }
      )
    }
  } else {
    // Log unhandled event types
    console.log(`Unhandled event type: ${event.type} (ID: ${event.id})`)
  }

  // Return 200 for all events (even unhandled ones)
  return NextResponse.json({ received: true })
}
