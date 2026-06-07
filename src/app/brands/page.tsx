import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const serif = 'Georgia, var(--font-serif), serif'

const IMG = {
  hero:    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=85&fit=crop',
  shelf:   'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80&fit=crop',
  product: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80&fit=crop',
}

const steps = [
  { n: '01', title: 'Apply in minutes', body: 'Tell us about your brand, your products, and your minimum order values. We review every application personally. No algorithm, no auto-rejection.' },
  { n: '02', title: 'We set you up', body: 'Your brand page goes live on Serai. Professional photography guidelines, product descriptions, pricing — we help you present your best self to retail buyers.' },
  { n: '03', title: 'Retailers discover you', body: 'Curated boutique buyers across India browse Serai actively looking for brands like yours. No cold emails. No trade show fees. They come to you.' },
  { n: '04', title: 'Orders arrive. You ship.', body: 'When a retailer places an order you get notified instantly. You fulfill the order directly. Serai handles payment collection and transfers your money within 7 days.' },
]

const reasons = [
  { title: 'Paid in 7 days', body: 'Retailers get Net-30 terms. You get paid in 7 days regardless. Serai carries the payment risk — not you.' },
  { title: 'No upfront cost', body: 'Free to apply and list. We take a small commission only when you make a sale. Zero risk to get started.' },
  { title: 'Curated buyers only', body: 'Every retailer on Serai is vetted. You are not selling to just anyone — you are selling to stores that were hand-picked to carry premium brands.' },
  { title: 'You control everything', body: 'Set your own MOVs, your own pricing, your own terms. Serai is your wholesale channel — not a marketplace that tells you what to charge.' },
]

export default function BrandsPage() {
  return (
    <>
      <Navbar variant="light" />
      <main>

        {/* HERO */}
        <section className="bg-[#FAFAF5] border-b border-[#E8E4D9]" style={{ paddingTop: '7rem' }}>
          <div className="container-editorial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end pb-0">
              <div style={{ paddingBottom: '4rem' }}>
                <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#B08D57', marginBottom: '1.5rem' }}>
                  For Brands
                </p>
                <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.4rem, 4vw, 4rem)', fontWeight: 400, letterSpacing: '-0.035em', lineHeight: 1.08, color: '#1C1C1A', marginBottom: '1.5rem' }}>
                  Your offline retail channel,
                  <br />
                  <em style={{ color: '#B08D57' }}>without the chaos.</em>
                </h1>
                <p style={{ fontFamily: serif, fontSize: '1.05rem', lineHeight: 1.85, color: '#4A4A45', marginBottom: '2.5rem', maxWidth: '480px' }}>
                  Serai connects your brand with curated boutique retailers across India.
                  You get paid in 7 days. They get Net-30 terms. Nobody chases anyone.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href="/auth/signup?role=brand" className="btn-gold" style={{ fontSize: '0.82rem' }}>
                    Apply as a Brand <ArrowRight size={14} />
                  </Link>
                  <Link href="/about" className="btn-outline" style={{ fontSize: '0.82rem' }}>
                    Our Story
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative rounded-t-2xl overflow-hidden" style={{ height: '520px' }}>
                <Image src={IMG.hero} alt="Brand founder" fill className="object-cover object-top" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[#FAFAF5]" style={{ padding: '8rem 0' }}>
          <div className="container-editorial">
            <div style={{ marginBottom: '5rem' }}>
              <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#B08D57', marginBottom: '1rem' }}>
                How it works
              </p>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#1C1C1A', lineHeight: 1.1 }}>
                From application to your
                <br />
                <em style={{ color: '#B08D57' }}>first retail order.</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: '#E8E4D9' }}>
              {steps.map((s) => (
                <div key={s.n} style={{ background: '#FAFAF5', padding: '3rem' }}>
                  <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.2em', color: '#B08D57', marginBottom: '1rem' }}>{s.n}</p>
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
              <div className="relative rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                <Image src={IMG.shelf} alt="Brand products on shelf" fill className="object-cover" />
              </div>
              <div>
                <p style={{ fontFamily: serif, fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#B08D57', marginBottom: '1rem' }}>
                  Why Serai
                </p>
                <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#1C1C1A', lineHeight: 1.1, marginBottom: '3rem' }}>
                  Built around
                  <br />
                  <em style={{ color: '#B08D57' }}>your interests.</em>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {reasons.map((r) => (
                    <div key={r.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={18} style={{ color: '#B08D57', marginTop: '0.25rem', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, color: '#1C1C1A', marginBottom: '0.35rem' }}>{r.title}</p>
                        <p style={{ fontFamily: serif, fontSize: '0.95rem', lineHeight: 1.8, color: '#4A4A45' }}>{r.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#1C1C1A', padding: '8rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#FAFAF5', lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Ready to grow offline?
            </h2>
            <p style={{ fontFamily: serif, fontSize: '1.05rem', lineHeight: 1.85, color: '#8A8880', marginBottom: '2.5rem' }}>
              Applications for the founding brand cohort are open now.
              Launching August 2026.
            </p>
            <Link href="/auth/signup?role=brand" className="btn-gold" style={{ fontSize: '0.85rem' }}>
              Apply as a Brand <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
