export type UserRole = 'brand' | 'retailer' | 'admin'

export type BrandStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type RetailerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'overdue' | 'refunded' | 'failed'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  user_id: string
  name: string
  slug: string
  tagline?: string
  description?: string
  logo_url?: string
  cover_image_url?: string
  website_url?: string
  instagram_handle?: string
  founded_year?: number
  origin_city?: string
  origin_state?: string
  is_verified: boolean
  is_active: boolean
  status: BrandStatus
  minimum_order_value: number
  payment_terms_days: number
  brand_payout_days: number
  gst_number?: string
  created_at: string
  updated_at: string
  // Joined
  categories?: Category[]
  subcategories?: Subcategory[]
  products?: Product[]
}

export interface Product {
  id: string
  brand_id: string
  category_id: string
  subcategory_id?: string
  name: string
  sku: string
  description?: string
  ingredients?: string
  how_to_use?: string
  benefits?: string
  mrp: number
  wholesale_price: number
  stock_quantity: number
  minimum_order_quantity: number
  images: string[]
  weight_grams?: number
  is_active: boolean
  is_featured: boolean
  tags?: string[]
  created_at: string
  updated_at: string
  // Joined
  brand?: Brand
  category?: Category
  subcategory?: Subcategory
}

export interface Retailer {
  id: string
  user_id: string
  business_name: string
  slug: string
  description?: string
  store_type?: string
  logo_url?: string
  website_url?: string
  instagram_handle?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  pincode?: string
  gst_number?: string
  is_verified: boolean
  is_active: boolean
  status: RetailerStatus
  credit_limit: number
  outstanding_balance: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  retailer_id: string
  brand_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal: number
  discount_amount: number
  shipping_amount: number
  total_amount: number
  payment_due_date?: string
  brand_payout_date?: string
  brand_payout_status: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  shipping_address?: ShippingAddress
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  retailer_notes?: string
  brand_notes?: string
  created_at: string
  updated_at: string
  // Joined
  items?: OrderItem[]
  brand?: Brand
  retailer?: Retailer
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
}

export interface CartItem {
  product: Product
  quantity: number
}
