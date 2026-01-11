// Database schema types for Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          product_id: string
          customer_email: string
          customer_name: string | null
          shipping_address: Json
          stripe_payment_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_email: string
          customer_name?: string | null
          shipping_address: Json
          stripe_payment_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_email?: string
          customer_name?: string | null
          shipping_address?: Json
          stripe_payment_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
