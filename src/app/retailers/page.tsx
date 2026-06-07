import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const serif = 'Georgia, var(--font-serif), serif'

const IMG = {
  hero:     'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=85&fit=crop',
  products: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900&q=80&fit=crop',
}

const steps = [
  { n: '01', title: 'Apply as a retailer', body: 'Tell us about your store — physical, online, or both. We approve retailers who are genuinely curated and care about the brands they carry.' },
  { n: '02', title: 'Browse the marketplace', body: 'Access hundreds of premium Indian D2C brands in one place. Filter by category, MOV, certifications, and more. Every brand is vetted.' },
  { n: '03', title: 'Order on Net-30 terms', body: 'Place orders directly through Serai. Pay 30 days after delivery — no upfront capital needed. Terms are standard across every brand on the platform.' },
  { n: '04', title: 'Brands ship to you', body: 'The brand fulfills your order directly. You receive the products, sell them in your store, and pay Serai 30 days later. Simple.' },
]

const reasons = [
  { title: 'Net-30 on everything', body: 'Every brand on Serai offers Net-30 payment terms. Buy now, pay in 30 days. No negotiating, no exceptions, no awkward conversations.' },
  { title: 'One relationship, hundreds of brands', body: 'Instead of managing accounts with fifty different brands, you manage one account with Serai. One invoice, one payment, one relationship.' },
  { title: 'Only premium brands', body: 'We turn away more brands than we accept. Every brand on Serai has been reviewed for product quality, packaging, and brand story. Your shelves will reflect that.' },
  { title: 'Discover before everyone else', body: 'Founding retailers get early access to new brands before they go wide. Be the first store in your city to carry the next big Indian brand.' },
]

export default function RetailersPage() {
  return (
    <>
      <Navbar variant="light" />
      <main>

        {/* HERO */}
        <section className="bg-[#FAFAF5] border-b border-[#E8E4D9]" style={{ paddingTop: '7rem' }}>
          <div className="container-editorial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end pb-0">
              <div style={{ paddingBottom: '4rem' }}>
                <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#8B6F5E', marginBottom: '1.5rem' }}>
                  For Retailers
                </p>
                <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.4rem, 4vw, 4rem)', fontWeight: 400, letterSpacing: '-0.035em', lineHeight: 1.08, color: '#1C1C1A', marginBottom: '1.5rem' }}>
                  The best Indian brands,
                  <br />
                  <em style={{ color: '#8B6F5E' }}>ready for your shelves.</em>
                </h1>
                <p style={{ fontFamily: serif, fontSize: '1.05rem', lineHeight: 1.85, color: '#4A4A45', marginBottom: '2.5rem', maxWidth: '480px' }}>
                  Serai is a curated wholesale marketplace for boutique retailers.
                  Browse hundreds of premium D2C brands, order on Net-30 terms,
                  and stock your shelves with products your customers will love.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href="/auth/signup?role=retailer" className="btn-gold" style={{ fontSize: '0.82rem' }}>
                    Apply as a Retailer <ArrowRight size={14} />
                  </Link>
                  <Link href="/browse" className="btn-outline" style={{ fontSize: '0.82rem' }}>
                    Browse Brands
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative rounded-t-2xl overflow-hidden" style={{ height: '520px' }}>
                <Image src={IMG.hero} alt="Premium boutique interior" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[#FAFAF5]" style={{ padding: '8rem 0' }}>
          <div className="container-editorial">
            <div style={{ marginBottom: '5rem' }}>
              <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#8B6F5E', marginBottom: '1rem' }}>
                How it works
              </p>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#1C1C1A', lineHeight: 1.1 }}>
                From application to your
                <br />
                <em style={{ color: '#8B6F5E' }}>first order delivered.</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: '#E8E4D9' }}>
              {steps.map((s) => (
                <div key={s.n} style={{ background: '#FAFAF5', padding: '3rem' }}>
                  <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.2em', color: '#8B6F5E', marginBottom: '1rem' }}>{s.n}</p>
                  <h3 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, color: '#1C1C1A', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontFamily: serif, fontSize: '1rem', lineHeight: 1.85, color: '#4A4A45' }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY SERAI */}
        <section style={{ background: '#F4F3EC', padding: '8rem 0' }}>
          <div className="container-editorial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#8B6F5E', marginBottom: '1rem' }}>
                  Why Serai
                </p>
                <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#1C1C1A', lineHeight: 1.1, marginBottom: '3rem' }}>
                  Stock smarter.
                  <br />
                  <em style={{ color: '#8B6F5E' }}>Sell better.</em>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {reasons.map((r) => (
                    <div key={r.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={18} style={{ color: '#8B6F5E', marginTop: '0.25rem', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, color: '#1C1C1A', marginBottom: '0.35rem' }}>{r.title}</p>
                        <p style={{ fontFamily: serif, fontSize: '0.95rem', lineHeight: 1.8, color: '#4A4A45' }}>{r.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                <Image src={IMG.products} alt="Premium products" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#1C1C1A', padding: '8rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#FAFAF5', lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Find your next bestselling brand.
            </h2>
            <p style={{ fontFamily: serif, fontSize: '1.05rem', lineHeight: 1.85, color: '#8A8880', marginBottom: '2.5rem' }}>
              Founding retailers get early access and exclusive terms.
              Applications open now.
            </p>
            <Link href="/auth/signup?role=retailer" className="btn-gold" style={{ fontSize: '0.85rem' }}>
              Apply as a Retailer <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
