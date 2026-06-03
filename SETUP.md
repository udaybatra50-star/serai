# Blushline — Setup Guide

## Prerequisites

- Node.js 18+ (installed via nvm)
- Supabase account (free tier works)
- Razorpay account (test mode)
- Vercel account (for deployment)

---

## 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to **SQL Editor** and paste the entire contents of `supabase/schema.sql`
3. Run the migration — this creates all tables, RLS policies, triggers, and seeds initial categories
4. Copy your **Project URL** and **Anon Key** from Settings → API

---

## 2. Environment Variables

Edit `.env.local` with your real credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # From Settings → API → service_role

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...            # Set when configuring webhook in Razorpay dashboard

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Razorpay Setup

1. Create account at https://razorpay.com (use test mode to start)
2. Get Key ID and Key Secret from Settings → API Keys
3. Set up a webhook pointing to `https://your-domain.com/api/webhooks/razorpay`
   - Events to subscribe: `payment.captured`, `payment.failed`, `refund.created`
4. Copy the Webhook Secret

---

## 4. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 5. Deploy to Vercel

```bash
npx vercel
```

Set all environment variables in Vercel dashboard → Settings → Environment Variables.

Update `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL.

---

## 6. Create Admin User

After deploying:

1. Sign up with any email at `/auth/signup`
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```
3. Sign in — you'll have access to `/admin`

---

## Architecture: Adding New Categories

To add new product categories (e.g. Fashion, Home & Living):

```sql
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Fashion', 'fashion', 'Clothing, accessories, and apparel', 3);

INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Clothing', 'clothing', 1),
  ((SELECT id FROM categories WHERE slug = 'fashion'), 'Accessories', 'accessories', 2);
```

The frontend category filters pick up new categories automatically from the database.

---

## Page Map

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/auth/signup` | Sign up (brand or retailer) |
| `/auth/signin` | Sign in |
| `/auth/signout` | Sign out |
| `/onboarding/brand` | Brand onboarding (4 steps) |
| `/onboarding/retailer` | Retailer onboarding (4 steps) |
| `/brand/dashboard` | Brand dashboard — orders, stats, payout tracking |
| `/brand/products` | Product catalogue list |
| `/brand/products/new` | Add new product |
| `/brand/orders` | All brand orders with status filter |
| `/brand/orders/[id]` | Order detail — update status, tracking, notes |
| `/retailer/dashboard` | Retailer dashboard — orders, outstanding balance |
| `/retailer/browse` | Browse & discover brands with filters |
| `/retailer/orders` | All retailer orders with overdue alerts |
| `/retailer/orders/[id]` | Order detail — pay now, shipment status |
| `/retailer/checkout` | Order checkout + Razorpay |
| `/brands/[slug]` | Brand detail page + add-to-order cart |
| `/admin` | Admin dashboard — approve brands/retailers, all orders |

---

## Payment Flow

1. Retailer places order → Razorpay checkout opens
2. Payment authorized → Order confirmed in database
3. Brand payout scheduled for T+7 days
4. Retailer payment due T+30 days
5. Razorpay webhooks update payment status automatically
