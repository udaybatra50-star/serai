import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'

const serif = 'Georgia, var(--font-serif), serif'

const IMG = {
  hero:     'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=85&fit=crop',
  hands:    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1400&q=85&fit=crop',
  boutique: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=900&q=80&fit=crop',
  uday:     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop',
  rajvir:   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&fit=crop',
}

const body: React.CSSProperties = {
  fontFamily: serif,
  fontSize: '1.1rem',
  lineHeight: 1.95,
  fontWeight: 400,
  color: '#2E2E2B',
}

export default function AboutPage() {
  return (
    <>
      <Navbar variant="light" />
      <main>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="bg-[#FAFAF5] text-center" style={{ paddingTop: '11rem', paddingBottom: '4rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>
            <p style={{
              fontFamily: serif,
              fontSize: '0.7rem',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#B08D57',
              marginBottom: '2rem',
            }}>
              Our Story
            </p>
            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
              fontWeight: 400,
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: '#1C1C1A',
              marginBottom: '3.5rem',
            }}>
              Built from a frustration.
              <br />
              <em style={{ color: '#B08D57' }}>Launched from a conviction.</em>
            </h1>
          </div>

          {/* Hero image */}
          <div className="container-editorial">
            <div className="relative rounded-2xl overflow-hidden w-full" style={{ height: 'clamp(280px, 45vw, 580px)' }}>
              <Image
                src={IMG.hero}
                alt="A warm marketplace interior"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── WHAT IS A SERAI — standalone, generous space ── */}
        <section className="bg-[#FAFAF5]" style={{ padding: '9rem 1.5rem' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              fontWeight: 400,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: '#1C1C1A',
              marginBottom: '2.5rem',
            }}>
              What is a Serai?
            </h2>
            <p style={{ ...body, marginBottom: '1.8rem' }}>
              A serai was the great marketplace of the ancient trade routes. Merchants would gather
              under one roof. Spice traders from Kerala, weavers from Varanasi, perfumers from
              Lucknow. Each bringing the finest of what their region produced. The serai was not
              just a place of commerce. It was a place of trust. Of curation. Of connection between
              makers and the people who carried their work into the world.
            </p>
            <p style={body}>
              We chose this name deliberately. Because we believe India's founders deserve exactly
              that kind of marketplace. One where the best brands find their way to the right stores.
              Not through cold calls and WhatsApp chaos. But through something built with the same
              intention as those ancient caravanserais. Bringing the best together, and making trade
              feel dignified again.
            </p>
          </div>
        </section>

        {/* ── INTERLUDE IMAGE ───────────────────────────────── */}
        <section className="bg-[#FAFAF5]" style={{ paddingBottom: '0' }}>
          <div className="container-editorial">
            <div className="relative rounded-2xl overflow-hidden w-full" style={{ height: 'clamp(240px, 38vw, 500px)' }}>
              <Image
                src={IMG.hands}
                alt="Hands holding a beautifully packaged wellness product"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* ── WHERE THIS BEGAN ──────────────────────────────── */}
        <section className="bg-[#FAFAF5]" style={{ padding: '9rem 0' }}>
          <div className="container-editorial">
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '5rem', alignItems: 'start' }}>

              <div>
                <h2 style={{
                  fontFamily: serif,
                  fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#1C1C1A',
                  marginBottom: '2.5rem',
                }}>
                  Where this began.
                </h2>
                <p style={{ ...body, marginBottom: '1.6rem' }}>
                  We grew up in Punjab watching our family build businesses the hard way.
                  Relationships built over years. Trust earned slowly. Distribution won store by
                  store, city by city, through sheer persistence.
                </p>
                <p style={{ ...body, marginBottom: '1.6rem' }}>
                  When we started talking to D2C founders across India we heard the same story
                  everywhere. A skincare brand with fifty thousand loyal customers online but only
                  three offline stores. A wellness brand with a waiting list but no way to reach the
                  boutiques that were actively looking for exactly what they made. The problem was
                  never the product. It was always the bridge.
                </p>
                <p style={body}>
                  Faire solved this in the United States and became a multi-billion dollar company
                  doing it. We looked at India and saw the same problem, the same opportunity, and
                  nobody building the solution. So we decided to build it ourselves.
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden" style={{ height: 'clamp(360px, 40vw, 560px)' }}>
                <Image
                  src={IMG.boutique}
                  alt="A premium boutique interior with curated shelves"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ───────────────────────────────────────── */}
        <div className="container-editorial">
          <div style={{ height: '1px', background: '#E8E4D9' }} />
        </div>

        {/* ── THE FOUNDERS ──────────────────────────────────── */}
        <section className="bg-[#FAFAF5]" style={{ padding: '9rem 0' }}>
          <div className="container-editorial">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <p style={{
                fontFamily: serif,
                fontSize: '0.7rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#B08D57',
                marginBottom: '1.5rem',
              }}>
                The Founders
              </p>
              <h2 style={{
                fontFamily: serif,
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                color: '#1C1C1A',
              }}>
                Two brothers from Punjab.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '5rem', maxWidth: '960px', margin: '0 auto' }}>

              {/* Uday */}
              <div>
                <div className="relative rounded-xl overflow-hidden" style={{ height: '340px', marginBottom: '2rem' }}>
                  <Image src={IMG.uday} alt="Uday Batra" fill className="object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <h3 style={{ fontFamily: serif, fontSize: '1.45rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1C1C1A', marginBottom: '0.4rem' }}>
                  Uday Batra
                </h3>
                <p style={{ fontFamily: serif, fontSize: '0.9rem', fontStyle: 'italic', color: '#B08D57', marginBottom: '1.4rem' }}>
                  Founder and CEO, Cornell University
                </p>
                <p style={{ fontFamily: serif, fontSize: '1rem', lineHeight: 1.9, color: '#4A4A45' }}>
                  Uday studies Applied Economics and Management at Cornell University. He started
                  Serai after spending months speaking with D2C founders across India and hearing
                  the same frustration repeated in every conversation. That getting into offline
                  retail was broken, manual, and exhausting. He is building Serai to be the platform
                  he wished existed when he started asking those questions.
                </p>
              </div>

              {/* Rajvir */}
              <div>
                <div className="relative rounded-xl overflow-hidden" style={{ height: '340px', marginBottom: '2rem' }}>
                  <Image src={IMG.rajvir} alt="Rajvir Batra" fill className="object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <h3 style={{ fontFamily: serif, fontSize: '1.45rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1C1C1A', marginBottom: '0.4rem' }}>
                  Rajvir Batra
                </h3>
                <p style={{ fontFamily: serif, fontSize: '0.9rem', fontStyle: 'italic', color: '#B08D57', marginBottom: '1.4rem' }}>
                  Co-Founder, Harvard University
                </p>
                <p style={{ fontFamily: serif, fontSize: '1rem', lineHeight: 1.9, color: '#4A4A45' }}>
                  Rajvir graduated from Harvard University and brings deep operational and strategic
                  thinking to Serai. Having grown up watching Indian retail from the inside, he
                  understands the trust dynamics between brands and buyers and what it takes to
                  build something that earns lasting loyalty on both sides of a transaction. Together
                  the Batra brothers are building the distribution infrastructure that India's best
                  brands have always deserved but never had.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section style={{ background: '#F0E8D5', padding: '8rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 400,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#1C1C1A',
              marginBottom: '1.5rem',
            }}>
              Join the founding cohort.
            </h2>
            <p style={{ fontFamily: serif, fontSize: '1.05rem', lineHeight: 1.85, color: '#4A4A45', marginBottom: '2.5rem' }}>
              We are inviting a small group of brands to shape what Serai becomes.
              Applications are open now.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup?role=brand" className="btn-gold" style={{ fontSize: '0.82rem', padding: '0.875rem 2.25rem' }}>
                List Your Brand <ArrowRight size={14} />
              </Link>
              <Link href="/auth/signup?role=retailer" className="btn-outline" style={{ fontSize: '0.82rem', padding: '0.875rem 2.25rem' }}>
                Shop as Retailer
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
