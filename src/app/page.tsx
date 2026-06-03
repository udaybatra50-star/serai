import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, CheckCircle2, Star } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   SERAI — Landing Page  (Faire-quality visual marketplace)
   Fix 1: Real photography in every major section
   Fix 2: Heavier, bolder typography (weight 500/600)
   Fix 3: Marketplace structure — show, don't describe
   Fix 4: Strong section contrast — alternating dark/light/image
   Fix 5: Hero shows what's inside, not just what we are
───────────────────────────────────────────────────────────── */

/* Unsplash placeholder images — swap for real brand photos at launch */
const IMG = {
  hero:      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1600&q=85&fit=crop',
  skincare:  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&fit=crop',
  haircare:  'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80&fit=crop',
  wellness:  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80&fit=crop',
  fragrance: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80&fit=crop',
  makeup:    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&fit=crop',
  bodycare:  'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80&fit=crop',
  founder:   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&fit=crop',
  boutique:  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=900&q=80&fit=crop',
  brand1:    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&fit=crop',
  brand2:    'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&q=80&fit=crop',
  brand3:    'https://images.unsplash.com/photo-1590739225287-bd31519780c8?w=400&q=80&fit=crop',
}

export default function HomePage() {
  return (
    <>
      <Navbar variant="light" />
      <main className="flex-1">

        {/* ══════════════════════════════════════════════
            1. HERO — editorial split, Aesop-quiet
        ══════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF5] border-b border-[#E8E4D9]">
          <div className="container-editorial w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_520px] gap-10 lg:gap-20 items-end py-20 lg:py-28">

              {/* Left — headline + CTAs */}
              <div className="max-w-[540px]">
                {/* Overline */}
                <p
                  className="overline text-[#B08D57] mb-7"
                  style={{ letterSpacing: '0.22em' }}
                >
                  Founding Cohort — Now Open
                </p>

                <h1
                  className="text-[#1C1C1A] mb-6"
                  style={{
                    fontFamily: 'Georgia, var(--font-serif), serif',
                    fontSize: 'clamp(2.6rem, 4vw, 4.2rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.08,
                  }}
                >
                  Your wholesale channel,
                  <br />
                  <em style={{ color: '#B08D57' }}>built for scale.</em>
                </h1>

                <p
                  className="text-[#4A4A45] mb-8"
                  style={{
                    fontFamily: 'Georgia, var(--font-serif), serif',
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                    fontWeight: 400,
                  }}
                >
                  Connect with curated boutique retailers across India.
                  Net-30 for retailers. Paid in 7 days for brands.
                  Nobody chases anyone.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link href="/auth/signup?role=brand" className="btn-gold !text-[0.82rem] !px-8 !py-3.5">
                    List Your Brand <ArrowRight size={14} />
                  </Link>
                  <Link href="/auth/signup?role=retailer" className="btn-outline !text-[0.82rem] !px-8 !py-3.5">
                    Shop as Retailer
                  </Link>
                </div>

                <div className="pt-7 border-t border-[#E8E4D9]">
                  <p
                    style={{
                      fontFamily: 'Georgia, var(--font-serif), serif',
                      fontSize: '0.92rem',
                      fontStyle: 'italic',
                      color: '#4A4A45',
                      lineHeight: 1.7,
                    }}
                  >
                    Launching August 2026.{' '}
                    <span style={{ color: '#8A8880' }}>
                      Beauty &amp; wellness first — home, food &amp; lifestyle in 2027.
                    </span>
                  </p>
                </div>
              </div>

              {/* Right — flowing portrait, full height */}
              <div className="hidden lg:block relative rounded-3xl overflow-hidden" style={{ height: '620px' }}>
                <Image
                  src={IMG.hero}
                  alt="A founder holding premium beauty products"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════
            3. CATEGORY GRID — images first, Faire-style tiles
               This is the #1 thing Faire does that we didn't
        ══════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF5] py-24 lg:py-32">
          <div className="container-editorial">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="overline mb-3">Browse by category</p>
                <h2
                  className="text-[#1C1C1A]"
                  style={{
                    fontFamily: 'Georgia, var(--font-serif), serif',
                    fontSize: 'clamp(2.4rem, 3.5vw, 3.4rem)',
                    fontWeight: 400,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  Find your next
                  <br />
                  <em style={{ color: '#B08D57', fontStyle: 'italic' }}>bestselling brand.</em>
                </h2>
              </div>
              <Link href="/browse" className="hidden lg:inline-flex items-center gap-2 text-sm text-[#8A8880] hover:text-[#1C1C1A] transition-colors font-sans">
                Browse all <ArrowRight size={13} />
              </Link>
            </div>

            {/* Flowing editorial image grid — varied heights, organic feel */}
            <div className="grid grid-cols-12 gap-3 lg:gap-4" style={{ gridTemplateRows: 'auto' }}>

              {/* Skincare — tall left anchor */}
              <Link href="/browse?category=skincare"
                className="group relative col-span-7 lg:col-span-5 rounded-2xl overflow-hidden"
                style={{ minHeight: '520px' }}
              >
                <Image src={IMG.skincare} alt="Skincare" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-7 left-7">
                  <p className="text-white/60 font-sans text-[0.62rem] tracking-[0.22em] uppercase mb-1.5">80+ brands</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Skincare</p>
                </div>
              </Link>

              {/* Right column — stacked two */}
              <div className="col-span-5 lg:col-span-4 flex flex-col gap-3 lg:gap-4">
                <Link href="/browse?category=hair"
                  className="group relative rounded-2xl overflow-hidden flex-1"
                  style={{ minHeight: '248px' }}
                >
                  <Image src={IMG.haircare} alt="Hair Care" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-white/60 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">45+ brands</p>
                    <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Hair Care</p>
                  </div>
                </Link>
                <Link href="/browse?category=wellness"
                  className="group relative rounded-2xl overflow-hidden flex-1"
                  style={{ minHeight: '248px' }}
                >
                  <Image src={IMG.wellness} alt="Wellness" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-white/60 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">60+ brands</p>
                    <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Wellness</p>
                  </div>
                </Link>
              </div>

              {/* Far right — tall portrait */}
              <Link href="/browse?category=fragrance"
                className="group relative col-span-12 lg:col-span-3 rounded-2xl overflow-hidden"
                style={{ minHeight: '260px' }}
              >
                <Image src={IMG.fragrance} alt="Fragrances" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-7 left-7">
                  <p className="text-white/60 font-sans text-[0.62rem] tracking-[0.22em] uppercase mb-1.5">30+ brands</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Fragrances</p>
                </div>
              </Link>

              {/* Bottom row — two wide tiles */}
              <Link href="/browse?category=makeup"
                className="group relative col-span-6 rounded-2xl overflow-hidden"
                style={{ minHeight: '200px' }}
              >
                <Image src={IMG.makeup} alt="Makeup" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white/60 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">55+ brands</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Makeup</p>
                </div>
              </Link>

              <Link href="/browse?category=body"
                className="group relative col-span-6 rounded-2xl overflow-hidden"
                style={{ minHeight: '200px' }}
              >
                <Image src={IMG.bodycare} alt="Body Care" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white/60 font-sans text-[0.6rem] tracking-[0.2em] uppercase mb-1">40+ brands</p>
                  <p className="text-white font-light" style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Body Care</p>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. VALUE PROPS — 3 clean, no boxes, no tags
        ══════════════════════════════════════════════ */}
        <section className="bg-white py-24 lg:py-36 border-t border-[#E8E4D9]">
          <div className="container-editorial">
            <div className="text-center mb-20">
              <p className="overline mb-4">Why Serai</p>
              <h2
                className="text-[#1C1C1A] mx-auto"
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#F0ECE4]">
              {[
                {
                  num: '01',
                  title: 'Curated Retailers Only',
                  body: 'Every retailer is manually reviewed. Your brand reaches premium boutiques and spas, not discount resellers.',
                },
                {
                  num: '02',
                  title: 'Paid in 7 Days',
                  body: 'We extend Net-30 terms to retailers so they order with confidence. Your payout arrives within 7 days of dispatch.',
                },
                {
                  num: '03',
                  title: 'Zero Commission, Month One',
                  body: 'List your brand, build your retailer relationships, complete your first orders. We take nothing until month two.',
                },
              ].map((v) => (
                <div key={v.title} className="flex flex-col items-center text-center px-10 py-14 lg:px-12">
                  <span
                    className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase text-[#B08D57] font-sans mb-5"
                  >
                    {v.num}
                  </span>
                  <h3
                    className="text-[#1C1C1A] mb-4"
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
                    className="text-[#6A6560]"
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. FOR BRANDS — full image left, text right
               Show the founder experience visually
        ══════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF5] border-t border-[#E8E4D9] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Image */}
            <div className="relative min-h-[400px] lg:min-h-full order-2 lg:order-1">
              <Image
                src={IMG.founder}
                alt="Brand founder"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#1C1C1A]/10" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center px-10 py-20 lg:px-16 lg:py-24 order-1 lg:order-2">
              <p className="overline mb-6 text-[#B08D57]" style={{ color: '#B08D57' }}>For Brand Founders</p>
              <h2
                className="text-[#1C1C1A] mb-7"
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
                className="text-[#4A4A45] mb-10"
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
                    <span style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, color: '#4A4A45' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div>
                <Link href="/auth/signup?role=brand" className="btn-gold !text-[0.82rem] !px-8 !py-4">
                  Apply as a Brand <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            6. FOR RETAILERS — dark section for contrast
               Image right, text left, sage accent
        ══════════════════════════════════════════════ */}
        <section className="bg-[#1C1C1A] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Content */}
            <div className="flex flex-col justify-center px-10 py-20 lg:px-16 lg:py-24">
              <p className="overline mb-6" style={{ color: '#8B6F5E' }}>For Boutique Retailers</p>
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
                <em style={{ color: '#8B6F5E', fontStyle: 'italic' }}>D2C beauty brands.</em>
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
                  'Hundreds of verified Indian D2C brands in one place',
                  'Net-30 payment terms on every order',
                  'No hidden fees, no negotiation',
                  'One dashboard for all your brand relationships',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-[#8B6F5E] mt-[3px] shrink-0" strokeWidth={2} />
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
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-[#1C1C1A]/30" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7. FEATURED BRANDS — 3 product cards
               Faire-style brand discovery teaser
        ══════════════════════════════════════════════ */}
        <section className="bg-white py-24 lg:py-32 border-t border-[#E8E4D9]">
          <div className="container-editorial">
            <div className="text-center mb-14">
              <p className="overline mb-4">On Serai</p>
              <h2
                className="text-[#1C1C1A] mx-auto"
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { name: 'Juicy Chemistry', cat: 'Organic Skincare', loc: 'Coimbatore', mov: '₹5,000', terms: 'Net-30', img: IMG.brand1, tag: 'Trending' },
                { name: 'Forest Essentials', cat: 'Luxury Ayurveda', loc: 'New Delhi', mov: '₹8,000', terms: 'Net-30', img: IMG.brand2, tag: 'Staff Pick' },
                { name: 'Plum Goodness', cat: 'Vegan Beauty', loc: 'Mumbai', mov: '₹3,000', terms: 'Net-30', img: IMG.brand3, tag: 'New' },
              ].map((brand) => (
                <div key={brand.name} className="group rounded-xl border border-[#E8E4D9] overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Product image */}
                  <div className="relative h-52 overflow-hidden bg-[#F4F3EC]">
                    <Image
                      src={brand.img}
                      alt={brand.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="tag tag-gold text-[0.58rem]">{brand.tag}</span>
                    </div>
                  </div>
                  {/* Card info */}
                  <div className="p-6">
                    <p className="text-[0.65rem] tracking-[0.15em] uppercase text-[#8A8880] font-sans mb-1.5">{brand.cat}</p>
                    <h3
                      className="text-[#1C1C1A] mb-1"
                      style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '1.1rem', fontWeight: 400 }}
                    >
                      {brand.name}
                    </h3>
                    <p className="text-xs text-[#8A8880] font-sans mb-4">{brand.loc}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#F4F3EC]">
                      <div>
                        <p className="text-[0.6rem] text-[#8A8880] font-sans uppercase tracking-wider mb-0.5">Min. Order</p>
                        <p className="text-sm font-semibold text-[#1C1C1A] font-sans">{brand.mov}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.6rem] text-[#8A8880] font-sans uppercase tracking-wider mb-0.5">Terms</p>
                        <p className="text-sm font-semibold text-[#B08D57] font-sans">{brand.terms}</p>
                      </div>
                      <Link
                        href="/auth/signup?role=retailer"
                        className="flex items-center gap-1.5 text-[0.72rem] font-medium font-sans text-[#1C1C1A] border border-[#E8E4D9] rounded px-3 py-2 hover:bg-[#FAFAF5] transition-colors"
                      >
                        View <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/auth/signup?role=retailer" className="btn-outline !text-[0.82rem] !px-8 !py-4">
                Browse All Brands <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8. TESTIMONIALS — with product images
        ══════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF5] py-24 lg:py-32 border-t border-[#E8E4D9]">
          <div className="container-editorial">
            <div className="text-center mb-14">
              <p className="overline mb-4">From our community</p>
              <h2
                className="text-[#1C1C1A] mx-auto"
                style={{
                  fontFamily: 'Georgia, var(--font-serif), serif',
                  fontSize: 'clamp(2rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}
              >
                Founders who ship on Serai.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "Serai opened our skincare line to 40 new retail partners in the first quarter. The payment tracking is genuinely brilliant.",
                  author: "Priya Kapoor",
                  role: "Founder, Verdant Skin Co.",
                  img: IMG.brand1,
                },
                {
                  quote: "Discovering quality Indian brands used to take months. Serai compressed that into an afternoon, with full confidence every brand was vetted.",
                  author: "Ananya Mehta",
                  role: "Owner, The Beauty Edit, Mumbai",
                  img: IMG.brand2,
                },
                {
                  quote: "The Net-30 terms changed our cash flow completely. We finally have a wholesale partner that understands how boutique retail actually works.",
                  author: "Vikram Nair",
                  role: "Director, Luxe Apothecary, Bangalore",
                  img: IMG.brand3,
                },
              ].map((t) => (
                <div key={t.author} className="bg-white rounded-xl border border-[#E8E4D9] overflow-hidden">
                  <div className="relative h-40">
                    <Image src={t.img} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-[#1C1C1A]/30" />
                  </div>
                  <div className="p-7">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-[#B08D57] text-[#B08D57]" />)}
                    </div>
                    <blockquote
                      className="text-[#1C1C1A] mb-6"
                      style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontSize: '0.92rem', lineHeight: 1.8, fontWeight: 400 }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="pt-4 border-t border-[#F4F3EC]">
                      <p className="text-sm font-semibold text-[#1C1C1A] font-sans">{t.author}</p>
                      <p className="text-xs text-[#8A8880] font-sans mt-0.5 font-light">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            9. CTA — warm gold bg, centered, no dark
        ══════════════════════════════════════════════ */}
        <section className="bg-[#F0E8D5] py-32 lg:py-44 border-t border-[#DFD0B0]">
          <div className="container-editorial text-center">
            <p className="overline mb-7 text-[#8A6A35]" style={{ color: '#8A6A35' }}>Ready to begin?</p>
            <h2
              className="text-[#1C1C1A] mb-7 mx-auto"
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
              className="text-[#4A4A45] mb-12 mx-auto"
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
              <Link href="/auth/signup?role=brand" className="btn-gold !text-[0.82rem] !px-9 !py-4">
                List Your Brand <ArrowRight size={14} />
              </Link>
              <Link
                href="/auth/signup?role=retailer"
                className="inline-flex items-center gap-3 bg-white text-[#1C1C1A] px-9 py-4 text-[0.82rem] font-medium font-sans border border-[#DFD0B0] rounded-sm hover:border-[#B08D57] transition-all"
              >
                Shop as Retailer <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
