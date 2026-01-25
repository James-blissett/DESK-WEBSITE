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
      const itemsStr = session.metadata?.items
      const legacyProductId = session.metadata?.product_id // Support legacy single product format
      const customerName = session.metadata?.customer_name
      const shippingAddressStr = session.metadata?.shipping_address
      const customerEmail = session.customer_email || session.customer_details?.email

      // Validate required data
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

      // Parse items array (support both new format and legacy single product)
      let items: Array<{ product_id: string; quantity: number }> = []
      
      if (itemsStr) {
        // New format: array of items
        try {
          items = JSON.parse(itemsStr)
        } catch (parseError) {
          console.error('Failed to parse items JSON:', parseError)
          throw new Error('Invalid items format in metadata')
        }
      } else if (legacyProductId) {
        // Legacy format: single product
        items = [{ product_id: legacyProductId, quantity: 1 }]
      } else {
        console.error('Missing items or product_id in session metadata:', session.id)
        return NextResponse.json(
          { received: true, error: 'Missing items or product_id in metadata' },
          { status: 200 }
        )
      }

      if (items.length === 0) {
        console.error('Empty items array in session:', session.id)
        return NextResponse.json(
          { received: true, error: 'Empty items array' },
          { status: 200 }
        )
      }

      // Create server-side Supabase client
      const supabase = createServerSupabase()

      // Process each item
      for (const item of items) {
        const { product_id, quantity } = item

        // Fetch current product stock
        console.log(`Fetching product: ${product_id}`)
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', product_id)
          .single()

        if (productError) {
          console.error('Error fetching product:', productError)
          throw new Error(`Failed to fetch product ${product_id}: ${productError.message}`)
        }

        if (!product) {
          console.error('Product not found:', product_id)
          throw new Error(`Product not found: ${product_id}`)
        }

        // Decrement product stock_quantity
        const newStockQuantity = Math.max(0, product.stock_quantity - quantity)
        console.log(`Decrementing stock for product: ${product_id} (${product.stock_quantity} -> ${newStockQuantity}, quantity: ${quantity})`)

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', product_id)

        if (updateError) {
          console.error('Error decrementing stock:', updateError)
          throw new Error(`Failed to decrement stock for product ${product_id}: ${updateError.message}`)
        }

        console.log(`Stock decremented successfully for product: ${product_id}`)

        // Insert order record for each item
        console.log(`Inserting order for product: ${product_id}, quantity: ${quantity}, customer: ${customerEmail}`)
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            product_id: product_id,
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
          throw new Error(`Failed to insert order for product ${product_id}: ${orderError.message}`)
        }

        console.log(`Order created successfully: ${order.id} for product ${product_id} (quantity: ${quantity})`)
      }

      console.log(`Checkout session ${session.id} processed successfully for ${items.length} item(s)`)
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
