-- ============================================================
-- BLUSHLINE WHOLESALE MARKETPLACE - DATABASE SCHEMA
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CATEGORIES (extensible architecture for future categories)
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Seed initial categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Beauty', 'beauty', 'Skincare, makeup, and cosmetics', 1),
  ('Wellness', 'wellness', 'Health supplements, aromatherapy, and holistic wellness', 2);

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ((SELECT id FROM categories WHERE slug = 'beauty'), 'Skincare', 'skincare', 1),
  ((SELECT id FROM categories WHERE slug = 'beauty'), 'Makeup', 'makeup', 2),
  ((SELECT id FROM categories WHERE slug = 'beauty'), 'Hair Care', 'hair-care', 3),
  ((SELECT id FROM categories WHERE slug = 'beauty'), 'Body Care', 'body-care', 4),
  ((SELECT id FROM categories WHERE slug = 'beauty'), 'Fragrances', 'fragrances', 5),
  ((SELECT id FROM categories WHERE slug = 'beauty'), 'Tools & Devices', 'tools-devices', 6),
  ((SELECT id FROM categories WHERE slug = 'wellness'), 'Supplements', 'supplements', 1),
  ((SELECT id FROM categories WHERE slug = 'wellness'), 'Aromatherapy', 'aromatherapy', 2),
  ((SELECT id FROM categories WHERE slug = 'wellness'), 'Ayurveda', 'ayurveda', 3),
  ((SELECT id FROM categories WHERE slug = 'wellness'), 'Yoga & Fitness', 'yoga-fitness', 4),
  ((SELECT id FROM categories WHERE slug = 'wellness'), 'Sleep & Relaxation', 'sleep-relaxation', 5);

-- ============================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('brand', 'retailer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  founded_year INTEGER,
  origin_city TEXT,
  origin_state TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  minimum_order_value DECIMAL(10,2) NOT NULL DEFAULT 5000,
  -- Net-30 terms
  payment_terms_days INTEGER DEFAULT 30,
  brand_payout_days INTEGER DEFAULT 7,
  -- Bank details for payouts
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_categories (
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (brand_id, category_id)
);

CREATE TABLE brand_subcategories (
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  PRIMARY KEY (brand_id, subcategory_id)
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT,
  ingredients TEXT,
  how_to_use TEXT,
  benefits TEXT,
  -- Pricing
  mrp DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) NOT NULL,
  -- Stock
  stock_quantity INTEGER DEFAULT 0,
  minimum_order_quantity INTEGER DEFAULT 1,
  -- Media
  images JSONB DEFAULT '[]',
  -- Metadata
  weight_grams INTEGER,
  dimensions JSONB,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, sku)
);

-- ============================================================
-- RETAILERS
-- ============================================================
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  store_type TEXT CHECK (store_type IN ('boutique', 'spa', 'salon', 'wellness_center', 'pharmacy', 'online', 'department_store', 'other')),
  logo_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  -- Location
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  -- Verification
  gst_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  -- Credit
  credit_limit DECIMAL(10,2) DEFAULT 50000,
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  brand_id UUID NOT NULL REFERENCES brands(id),
  -- Status lifecycle: draft → confirmed → processing → shipped → delivered → completed
  -- Payment: pending → authorized → paid → overdue → refunded
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'overdue', 'refunded', 'failed')),
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  -- Payment terms (Net-30)
  payment_due_date DATE,
  brand_payout_date DATE,
  brand_payout_status TEXT DEFAULT 'pending' CHECK (brand_payout_status IN ('pending', 'scheduled', 'paid')),
  -- Razorpay
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  -- Shipping
  shipping_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  -- Notes
  retailer_notes TEXT,
  brand_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS & TRANSACTIONS
-- ============================================================
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  type TEXT NOT NULL CHECK (type IN ('retailer_payment', 'brand_payout', 'refund', 'platform_fee')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  razorpay_payment_id TEXT,
  razorpay_transfer_id TEXT,
  metadata JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLISTS / SAVED BRANDS
-- ============================================================
CREATE TABLE retailer_saved_brands (
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (retailer_id, brand_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_is_active ON brands(is_active);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX idx_orders_brand_id ON orders(brand_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_payment_due_date ON orders(payment_due_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Brands: public read for approved, write only by owner
CREATE POLICY "Anyone can view approved brands" ON brands FOR SELECT USING (status = 'approved' AND is_active = true);
CREATE POLICY "Brand owners can manage their brand" ON brands FOR ALL USING (user_id = auth.uid());

-- Products: public read for active products of active brands
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Brand owners can manage products" ON products FOR ALL USING (
  brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
);

-- Retailers: owners can manage
CREATE POLICY "Retailer owners can manage their retailer" ON retailers FOR ALL USING (user_id = auth.uid());

-- Orders: brand and retailer parties can see their orders
CREATE POLICY "Order parties can view orders" ON orders FOR SELECT USING (
  retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid()) OR
  brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
);
CREATE POLICY "Retailers can create orders" ON orders FOR INSERT WITH CHECK (
  retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid())
);
CREATE POLICY "Order parties can update orders" ON orders FOR UPDATE USING (
  retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid()) OR
  brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
);

-- Order items follow order access
CREATE POLICY "Order item access follows order access" ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE
      retailer_id IN (SELECT id FROM retailers WHERE user_id = auth.uid()) OR
      brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  )
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_retailers_updated_at BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'BL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Set payment due dates on order confirmation
CREATE OR REPLACE FUNCTION set_payment_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    NEW.payment_due_date = (NOW() + INTERVAL '30 days')::DATE;
    NEW.brand_payout_date = (NOW() + INTERVAL '7 days')::DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_payment_dates BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_payment_dates();
