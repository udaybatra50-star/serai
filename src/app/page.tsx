import Link from 'next/link'
import Image from 'next/image'
import SafeImage from '@/components/ui/SafeImage'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/ui/Reveal'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, CheckCircle2, ShieldCheck, Wallet, BadgeCheck } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   SERAI — Landing Page  (Faire-quality visual marketplace)
───────────────────────────────────────────────────────────── */

/* Unsplash placeholder images — decorative lifestyle photography only, swap for real shoots at launch */
const IMG = {
  hero:      'https://images.unsplash.com/photo-1757800945999-ed0fa905d0f5?w=1200&q=85&fit=crop',
  skincare:  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=85&fit=crop',
  haircare:  'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=900&q=85&fit=crop',
  wellness:  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=85&fit=crop',
  fragrance: 'https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?w=900&q=85&fit=crop',
  makeup:    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=85&fit=crop',
  bodycare:  'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=900&q=85&fit=crop',
  founder:   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&fit=crop',
  boutique:  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=900&q=80&fit=crop',
}

/* Curated showcase photography cycled across the Featured Brands cards */
const BRAND_SHOWCASE_IMG = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=900&q=85&fit=crop',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=85&fit=crop',
]

const CATEGORY_TILES = [
  { slug: 'skincare', label: 'Skincare', img: IMG.skincare, kind: 'subcategory' as const },
  { slug: 'hair-care', label: 'Hair Care', img: IMG.haircare, kind: 'subcategory' as const },
  { slug: 'wellness', label: 'Wellness', img: IMG.wellness, kind: 'category' as const },
  { slug: 'fragrances', label: 'Fragrances', img: IMG.fragrance, kind: 'subcategory' as const },
  { slug: 'makeup', label: 'Makeup', img: IMG.makeup, kind: 'subcategory' as const },
  { slug: 'body-care', label: 'Body Care', img: IMG.bodycare, kind: 'subcategory' as const },
]

function brandCountLabel(count: number) {
  if (count === 0) return 'New on Serai'
  return `${count} ${count === 1 ? 'brand' : 'brands'}`
}

interface FeaturedBrandRow {
  id: string
  name: string
  slug: string
  tagline: string | null
  logo_url: string | null
  origin_city: string | null
  minimum_order_value: number
  payment_terms_days: number
  categories?: { category: { name: string } | null }[]
}

interface BrandLinkRow {
  brand_id: string
  subcategory?: { slug: string } | null
  category?: { slug: string } | null
}

export default async function HomePage() {
  const supabase = await createClient()

  const subcategorySlugs = CATEGORY_TILES.filter((t) => t.kind === 'subcategory').map((t) => t.slug)
  const categorySlugs = CATEGORY_TILES.filter((t) => t.kind === 'category').map((t) => t.slug)

  const [{ data: subcatRows }, { data: catRows }, { data: featuredBrands }] = await Promise.all([
    supabase
      .from('brand_subcategories')
      .select('brand_id, subcategory:subcategories!inner(slug), brand:brands!inner(status, is_active)')
      .in('subcategory.slug', subcategorySlugs)
      .eq('brand.status', 'approved')
      .eq('brand.is_active', true) as unknown as Promise<{ data: BrandLinkRow[] | null }>,
    supabase
      .from('brand_categories')
      .select('brand_id, category:categories!inner(slug), brand:brands!inner(status, is_active)')
      .in('category.slug', categorySlugs)
      .eq('brand.status', 'approved')
      .eq('brand.is_active', true) as unknown as Promise<{ data: BrandLinkRow[] | null }>,
    supabase
      .from('brands')
      .select('id, name, slug, tagline, logo_url, origin_city, minimum_order_value, payment_terms_days, categories:brand_categories(category:categories(name))')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3) as unknown as Promise<{ data: FeaturedBrandRow[] | null }>,
  ])

  const countsBySlug: Record<string, number> = {}
  for (const slug of subcategorySlugs) {
    countsBySlug[slug] = new Set(
      (subcatRows || []).filter((r) => r.subcategory?.slug === slug).map((r) => r.brand_id)
    ).size
  }
  for (const slug of categorySlugs) {
    countsBySlug[slug] = new Set(
      (catRows || []).filter((r) => r.category?.slug === slug).map((r) => r.brand_id)
    ).size
  }

  const brands = featuredBrands || []

  return (
    <>
      <Navbar variant="light" />
      <main className="flex-1">

        {/* ══════════════════════════════════════════════
            1. HERO — editorial split, Aesop-quiet
        ══════════════════════════════════════════════ */}
        <section className="bg-[#faf8f5]">
          <div className="container-editorial w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_520px] gap-10 lg:gap-20 items-end py-20 lg:py-28">

              {/* Left — headline + CTAs */}
              <Reveal className="max-w-[540px]">
                {/* Overline */}
                <p
                  className="overline text-[#B08D57] mb-7"
                  style={{ letterSpacing: '0.22em' }}
                >
                  Launching August 2026
                </p>

                <h1
                  className="text-[#1a1614] mb-6"
                  style={{
                    fontFamily: 'Georgia, var(--font-serif), serif',
                    fontSize: 'clamp(2.6rem, 4vw, 4.2rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.08,
                  }}
                >
                  India&apos;s wholesale marketplace for premium brands.
                  <br />
                  <em style={{ color: '#B08D57' }}>Discover your next bestselling brand.</em>
                </h1>

                <p
                  className="text-[#7a706b] mb-8"
                  style={{
                    fontFamily: 'Georgia, var(--font-serif), serif',
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                    fontWeight: 400,
                  }}
                >
                  Brands get paid in 7 days. Retailers get Net-30 on every order.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link href="/auth/signup?role=brand" className="btn-gold !bg-[#1C1C1A] hover:!bg-[#2E2E2B] !text-[0.82rem] !px-8 !py-3.5">
                    List Your Brand <ArrowRight size={14} />
                  </Link>
                  <Link href="/auth/signup?role=retailer" className="btn-outline !border-[#1C1C1A] !text-[#1C1C1A] hover:!bg-[#1C1C1A] hover:!text-white !text-[0.82rem] !px-8 !py-3.5">
                    Shop as Retailer
                  </Link>
                </div>

                <div className="pt-7 border-t border-[#e8e0d8]">
                  <p
                    style={{
                      fontFamily: 'Georgia, var(--font-serif), serif',
                      fontSize: '0.92rem',
                      fontStyle: 'italic',
                      color: '#7a706b',
                      lineHeight: 1.7,
                    }}
                  >
                    Launching August 2026.{' '}
                    <span style={{ color: '#b8b0a8' }}>
                      Beauty and wellness first.
                    </span>
                  </p>
                </div>
              </Reveal>

              {/* Right — flowing portrait, full height */}
              <Reveal delay={150} className="hidden lg:block relative rounded-3xl overflow-hidden" >
                <div className="relative w-full h-full" style={{ height: '620px' }}>
                  <Image
                    src={IMG.hero}
                    alt="A founder holding premium beauty products"
                    fill
                    sizes="520px"
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════
            3. CATEGORY GRID — images first, Faire-style tiles
        ══════════════════════════════════════════════ */}
        <section className="bg-[#faf8f5] py-24 lg:py-32">
          <div className="container-editorial">
            <Reveal className="flex items-end justify-between mb-12">
              <div>
                <p className="overline mb-3">Browse by category</p>
                <h2
                  className="text-[#1a1614]"
                  style={{
                    fontFamily: 'Georgia, var(--font-serif), serif',
                    fontSize: 'clamp(2.4rem, 3.5vw, 3.4rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  Every category.
                  <br />
                  <em style={{ color: '#B08D57', fontStyle: 'italic' }}>One platform.</em>
                </h2>
              </div>
              <Link href="/browse" className="hidden lg:inline-flex items-center gap-2 text-sm text-[#b8b0a8] hover:text-[#1a1614] transition-colors font-sans">
                Browse all <ArrowRight size={13} />
              </Link>
            </Reveal>

            {/* Flowing editorial image grid — varied heights, organic feel, true-color overlays */}
            <Reveal delay={100} className="grid grid-cols-12 gap-3 lg:gap-4">

              {/* Skincare — tall left anchor */}
              <Link href="/browse?subcategory=skincare"
                className="group relative col-span-7 lg:col-span-5 rounded-3xl overflow-hidden"
                style={{ minHeight: '520px' }}
              >
                <Image src={IMG.skincare} alt="Skincare" fill sizes="(min-width: 1024px) 42vw, 60vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
                <div className="absolute bottom-7 left-7">
                  <p className="text-white/70 font-sans text-[0.62rem] tracking-[0.22em] uppercase mb-1.5">{brandCountLabel(countsBySlug['skincare'] || 0)}</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Skincare</p>
                </div>
              </Link>

              {/* Right column — stacked two */}
              <div className="col-span-5 lg:col-span-4 flex flex-col gap-3 lg:gap-4">
                <Link href="/browse?subcategory=hair-care"
                  className="group relative rounded-3xl overflow-hidden flex-1"
                  style={{ minHeight: '248px' }}
                >
                  <Image src={IMG.haircare} alt="Hair Care" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-white/70 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">{brandCountLabel(countsBySlug['hair-care'] || 0)}</p>
                    <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Hair Care</p>
                  </div>
                </Link>
                <Link href="/browse?category=wellness"
                  className="group relative rounded-3xl overflow-hidden flex-1"
                  style={{ minHeight: '248px' }}
                >
                  <Image src={IMG.wellness} alt="Wellness" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-white/70 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">{brandCountLabel(countsBySlug['wellness'] || 0)}</p>
                    <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Wellness</p>
                  </div>
                </Link>
              </div>

              {/* Far right — tall portrait */}
              <Link href="/browse?subcategory=fragrances"
                className="group relative col-span-12 lg:col-span-3 rounded-3xl overflow-hidden"
                style={{ minHeight: '260px' }}
              >
                <Image src={IMG.fragrance} alt="Fragrances" fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
                <div className="absolute bottom-7 left-7">
                  <p className="text-white/70 font-sans text-[0.62rem] tracking-[0.22em] uppercase mb-1.5">{brandCountLabel(countsBySlug['fragrances'] || 0)}</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Fragrances</p>
                </div>
              </Link>

              {/* Bottom row — two wide tiles */}
              <Link href="/browse?subcategory=makeup"
                className="group relative col-span-6 rounded-3xl overflow-hidden"
                style={{ minHeight: '200px' }}
              >
                <Image src={IMG.makeup} alt="Makeup" fill sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white/70 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">{brandCountLabel(countsBySlug['makeup'] || 0)}</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Makeup</p>
                </div>
              </Link>

              <Link href="/browse?subcategory=body-care"
                className="group relative col-span-6 rounded-3xl overflow-hidden"
                style={{ minHeight: '200px' }}
              >
                <Image src={IMG.bodycare} alt="Body Care" fill sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white/70 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">{brandCountLabel(countsBySlug['body-care'] || 0)}</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Body Care</p>
                </div>
              </Link>

            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. VALUE PROPS — 3 clean, no boxes, no tags
        ══════════════════════════════════════════════ */}
        <section className="bg-white" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
          <div className="container-editorial">
            <Reveal className="text-center mb-20">
              <p className="overline mb-4">Why Serai</p>
              <h2
                className="text-[#1a1614] mx-auto"
                style={{
                  fontFamily: 'Georgia, var(--font-serif), serif',
                  fontSize: 'clamp(2rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  maxWidth: '400px',
                }}
              >
                Built differently.
                <br />On purpose.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-14 lg:gap-x-12">
              {[
                {
                  num: '01',
                  title: 'Only vetted retailers',
                  body: 'Every retailer on Serai is manually reviewed. Your brand reaches premium boutiques, not discount resellers.',
                },
                {
                  num: '02',
                  title: 'You get paid in 7 days',
                  body: 'We extend Net-30 to retailers so they order freely. Your payout hits your account within 7 days of dispatch. We carry the gap.',
                },
                {
                  num: '03',
                  title: 'Free for your first month',
                  body: 'List your brand, build your first retailer relationships, ship your first orders. We take zero commission until month two.',
                },
              ].map((v, i) => (
                <Reveal key={v.title} delay={i * 100} className="flex flex-col items-center text-center px-10 py-14 lg:px-12">
                  <span
                    className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase text-[#B08D57] font-sans mb-5"
                  >
                    {v.num}
                  </span>
                  <h3
                    className="text-[#1a1614] mb-4"
                    style={{
                      fontFamily: 'Georgia, var(--font-serif), serif',
                      fontSize: '1.25rem',
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    className="text-[#7a706b]"
                    style={{
                      fontFamily: 'Georgia, var(--font-serif), serif',
                      fontSize: '0.9rem',
                      lineHeight: 1.8,
                      fontWeight: 300,
                      maxWidth: '240px',
                    }}
                  >
                    {v.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. FOR BRANDS — full image left, text right
        ══════════════════════════════════════════════ */}
        <section className="bg-[#faf8f5] py-24 lg:py-32">
          <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Image */}
            <Reveal className="relative rounded-3xl overflow-hidden order-2 lg:order-1" style={{ minHeight: '480px' }}>
              <Image
                src={IMG.founder}
                alt="Brand founder"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#1a1614]/10" />
            </Reveal>

            {/* Content */}
            <Reveal delay={120} className="flex flex-col justify-center order-1 lg:order-2">
              <p className="overline mb-6 text-[#B08D57]">For Brand Founders</p>
              <h2
                className="text-[#1a1614] mb-7"
                style={{
                  fontFamily: 'Georgia, var(--font-serif), serif',
                  fontSize: 'clamp(2rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}
              >
                Your wholesale channel,
                <br />
                <em style={{ color: '#B08D57', fontStyle: 'italic' }}>built for scale.</em>
              </h2>
              <p
                className="text-[#7a706b] mb-10"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  fontWeight: 300,
                  maxWidth: '380px',
                }}
              >
                Stop spending founder hours on cold outreach. List once, get discovered continuously. Serai handles the payment complexity so you focus on making great products.
              </p>
              <ul className="space-y-3.5 mb-10">
                {[
                  'Wholesale pricing separate from your D2C storefront',
                  'Payouts in 7 days, regardless of when retailers pay',
                  'One dashboard for all your retailer relationships',
                  'No commission for your first 30 days',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-[#B08D57] mt-[3px] shrink-0" strokeWidth={2} />
                    <span style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, color: '#7a706b' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div>
                <Link href="/auth/signup?role=brand" className="btn-gold !bg-[#1C1C1A] hover:!bg-[#2E2E2B] !text-[0.82rem] !px-8 !py-4">
                  Apply as a Brand <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
          </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            6. FOR RETAILERS — dark floating panel for contrast
        ══════════════════════════════════════════════ */}
        <section className="bg-[#faf8f5] py-24 lg:py-32">
          <div className="container-editorial">
          <Reveal className="rounded-3xl overflow-hidden bg-[#1a1614]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Content */}
            <div className="flex flex-col justify-center px-10 py-16 lg:px-16 lg:py-20">
              <p className="overline mb-6" style={{ color: '#d4a0b8' }}>For Boutique Retailers</p>
              <h2
                className="text-white mb-7"
                style={{
                  fontFamily: 'Georgia, var(--font-serif), serif',
                  fontSize: 'clamp(2rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}
              >
                Discover India&apos;s finest
                <br />
                <em style={{ color: '#d4a0b8', fontStyle: 'italic' }}>D2C beauty brands.</em>
              </h2>
              <p
                className="text-white/60 mb-10"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  fontWeight: 300,
                  maxWidth: '380px',
                }}
              >
                Stop sifting through trade shows and DMs. Every brand is verified. Pricing is transparent. Pay on Net-30 terms designed for how boutique retail actually works.
              </p>
              <ul className="space-y-3.5 mb-10">
                {[
                  'Verified Indian D2C brands in one place',
                  'Net-30 payment terms on every order',
                  'No hidden fees, no negotiation',
                  'One dashboard for all your brand relationships',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-[#d4a0b8] mt-[3px] shrink-0" strokeWidth={2} />
                    <span style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, color: 'rgba(255,255,255,0.55)' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div>
                <Link
                  href="/auth/signup?role=retailer"
                  className="inline-flex items-center gap-3 bg-transparent border border-white/30 text-white px-8 py-4 text-[0.82rem] font-medium font-sans hover:bg-white/10 transition-all rounded-sm"
                >
                  Apply as a Retailer <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="relative min-h-[400px] lg:min-h-full">
              <Image
                src={IMG.boutique}
                alt="Boutique retail store"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-[#1a1614]/30" />
            </div>
          </div>
          </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7. FEATURED BRANDS — real, approved brands only
        ══════════════════════════════════════════════ */}
        <section className="bg-white py-24 lg:py-32">
          <div className="container-editorial">
            <Reveal className="text-center mb-14">
              <p className="overline mb-4">On Serai</p>
              <h2
                className="text-[#1a1614] mx-auto"
                style={{
                  fontFamily: 'Georgia, var(--font-serif), serif',
                  fontSize: 'clamp(2rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}
              >
                Brands your customers
                <br />will love.
              </h2>
            </Reveal>

            {brands.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {brands.map((brand, i) => {
                  const categoryName = brand.categories?.[0]?.category?.name
                  const showcaseImg = BRAND_SHOWCASE_IMG[i % BRAND_SHOWCASE_IMG.length]
                  return (
                    <Reveal key={brand.id} delay={i * 100} className="group rounded-xl overflow-hidden shadow-[0_2px_20px_rgba(26,22,20,0.05)] hover:shadow-[0_12px_36px_rgba(26,22,20,0.12)] transition-shadow duration-300">
                      {/* Brand image — immersive lifestyle photography, logo badge for identity */}
                      <div className="relative h-52 overflow-hidden">
                        <Image
                          src={showcaseImg}
                          alt={brand.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {brand.logo_url && (
                          <div className="absolute bottom-4 left-4 w-11 h-11 rounded-full bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.15)] overflow-hidden p-1.5">
                            <SafeImage src={brand.logo_url} alt={brand.name} fill className="object-contain" />
                          </div>
                        )}
                      </div>
                      {/* Card info */}
                      <div className="p-6">
                        {categoryName && (
                          <p className="text-[0.65rem] tracking-[0.15em] uppercase text-[#b8b0a8] font-sans mb-1.5">{categoryName}</p>
                        )}
                        <h3
                          className="text-[#1a1614] mb-1"
                          style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '1.1rem', fontWeight: 400 }}
                        >
                          {brand.name}
                        </h3>
                        {brand.origin_city && <p className="text-xs text-[#b8b0a8] font-sans mb-4">{brand.origin_city}</p>}
                        <div className="flex items-center justify-between pt-4 border-t border-[#f2ede6]">
                          <div>
                            <p className="text-[0.6rem] text-[#b8b0a8] font-sans uppercase tracking-wider mb-0.5">Min. Order</p>
                            <p className="text-sm font-semibold text-[#1a1614] font-sans">₹{brand.minimum_order_value.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[0.6rem] text-[#b8b0a8] font-sans uppercase tracking-wider mb-0.5">Terms</p>
                            <p className="text-sm font-semibold text-[#B08D57] font-sans">Net-{brand.payment_terms_days}</p>
                          </div>
                          <Link
                            href="/auth/signup?role=retailer"
                            className="flex items-center gap-1.5 text-[0.72rem] font-medium font-sans text-[#1a1614] border border-[#e8e0d8] rounded px-3 py-2 hover:bg-[#faf8f5] transition-colors"
                          >
                            View <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            ) : (
              <div className="text-center max-w-md mx-auto py-8">
                <p className="text-[#7a706b] font-sans mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: '1rem' }}>
                  We&apos;re onboarding our founding cohort of brands right now. Be among the first names retailers discover.
                </p>
                <Link href="/auth/signup?role=brand" className="btn-gold !bg-[#1C1C1A] hover:!bg-[#2E2E2B] !text-[0.78rem] !px-7 !py-3">
                  Apply as a Founding Brand <ArrowRight size={13} />
                </Link>
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/auth/signup?role=retailer" className="btn-outline !border-[#1C1C1A] !text-[#1C1C1A] hover:!bg-[#1C1C1A] hover:!text-white !text-[0.82rem] !px-8 !py-4">
                Browse All Brands <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8. TRUST STRIP — what Serai guarantees
        ══════════════════════════════════════════════ */}
        <section className="bg-[#faf8f5] py-24 lg:py-32">
          <div className="container-editorial">
            <Reveal className="text-center mb-14">
              <p className="overline mb-4">Why it works</p>
              <h2
                className="text-[#1a1614] mx-auto"
                style={{
                  fontFamily: 'Georgia, var(--font-serif), serif',
                  fontSize: 'clamp(2rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}
              >
                Built on terms both sides can trust.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: BadgeCheck,
                  title: 'Every brand is vetted',
                  body: 'Brands go through manual review before they can list, so there is no marketplace spam and no unverified resellers.',
                  color: '#B08D57',
                },
                {
                  icon: Wallet,
                  title: 'Net-30, paid in 7',
                  body: 'Retailers order on Net-30 terms. Brands get paid within 7 days of dispatch, regardless of when the retailer settles.',
                  color: '#3d7a3d',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure payments',
                  body: 'All payments are processed through Razorpay with full transaction records on both sides of every order.',
                  color: '#B08D57',
                },
              ].map((t, i) => (
                <Reveal key={t.title} delay={i * 100} className="bg-white rounded-xl p-8 shadow-[0_2px_20px_rgba(26,22,20,0.05)]">
                  <t.icon size={22} style={{ color: t.color }} className="mb-5" strokeWidth={1.5} />
                  <h3 className="text-[#1a1614] mb-3" style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '1.05rem', fontWeight: 400 }}>
                    {t.title}
                  </h3>
                  <p className="text-sm text-[#7a706b] font-sans font-light" style={{ lineHeight: 1.8 }}>
                    {t.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            9. CTA — accent-tint bg, centered, no dark
        ══════════════════════════════════════════════ */}
        <section className="bg-[#f5e8ef] py-32 lg:py-44">
          <Reveal className="container-editorial text-center">
            <p className="overline mb-7 text-[#B08D57]">Ready to begin?</p>
            <h2
              className="text-[#1a1614] mb-7 mx-auto"
              style={{
                fontFamily: 'Georgia, var(--font-serif), serif',
                fontSize: 'clamp(3rem, 5vw, 5rem)',
                fontWeight: 400,
                letterSpacing: '-0.035em',
                lineHeight: 1.06,
                maxWidth: '680px',
              }}
            >
              The premium wholesale
              <br />platform India was missing.
            </h2>
            <p
              className="text-[#7a706b] mb-12 mx-auto"
              style={{
                fontFamily: 'Georgia, var(--font-serif), serif',
                fontSize: '1.05rem',
                lineHeight: 1.8,
                fontWeight: 300,
                maxWidth: '400px',
              }}
            >
              Whether you are a brand building your first wholesale channel or a retailer searching for India&apos;s best beauty brands, Serai was built for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signup?role=brand" className="btn-gold !bg-[#1C1C1A] hover:!bg-[#2E2E2B] !text-[0.82rem] !px-9 !py-4">
                List Your Brand <ArrowRight size={14} />
              </Link>
              <Link
                href="/auth/signup?role=retailer"
                className="inline-flex items-center gap-3 bg-white text-[#1C1C1A] px-9 py-4 text-[0.82rem] font-medium font-sans border border-[#1C1C1A] rounded-sm hover:bg-[#1C1C1A] hover:text-white transition-all"
              >
                Shop as Retailer <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
