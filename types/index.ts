// Base TypeScript types for the standing desk website

export interface StandingDesk {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  heightRange: {
    min: number
    max: number
  }
  weightCapacity: number
  features: string[]
  inStock: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  deskId: string
  quantity: number
}

export interface Order {
  id: string
  userId?: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
}

export interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
}
