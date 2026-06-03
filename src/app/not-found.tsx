import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function NotFound() {
  return (
    <>
      <Navbar variant="solid" />
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#7a706b] font-sans mb-4">404</p>
          <h1 className="text-4xl font-light text-[#1a1614] mb-4" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.025em' }}>
            Page not found
          </h1>
          <p className="text-[#7a706b] text-base mb-10" style={{ fontFamily: 'Georgia, serif' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#6b2d4e] text-white text-xs tracking-[0.1em] uppercase font-sans hover:bg-[#521f3c] transition-colors"
            >
              Back to home
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3 border border-[#e8e0d8] text-[#7a706b] text-xs tracking-[0.1em] uppercase font-sans hover:border-[#1a1614] hover:text-[#1a1614] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
