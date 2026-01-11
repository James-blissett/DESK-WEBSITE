-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address JSONB NOT NULL,
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on orders product_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- Create index on orders customer_email for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Create index on orders stripe_payment_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON orders(stripe_payment_id);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
-- Allow public read access to products (both anonymous and authenticated users)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert products (optional - adjust based on your needs)
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update products (optional - adjust based on your needs)
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for orders table
-- Only authenticated users can view their own orders (matched by email)
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = customer_email);

-- Allow authenticated users to insert their own orders
CREATE POLICY "Authenticated users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = customer_email);

-- Allow authenticated users to update their own orders (e.g., status updates)
CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = customer_email)
  WITH CHECK (auth.jwt()->>'email' = customer_email);

-- Optional: Allow service role to have full access (for server-side operations)
-- This is typically needed for server-side operations like webhook handlers
CREATE POLICY "Service role has full access to orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
