'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificationBell from './NotificationBell'

interface NavbarProps {
  variant?: 'light' | 'transparent' | 'solid'
  userRole?: 'brand' | 'retailer' | 'admin' | null
}

const publicNavItems = [
  { href: '/browse', label: 'Browse Brands' },
  { href: '/brands', label: 'For Brands' },
  { href: '/retailers', label: 'For Retailers' },
  { href: '/about', label: 'About' },
]

const brandNavItems = [
  { href: '/brand/dashboard', label: 'Dashboard' },
  { href: '/brand/products', label: 'Products' },
  { href: '/brand/orders', label: 'Orders' },
  { href: '/brand/returns', label: 'Returns' },
  { href: '/brand/reviews', label: 'Reviews' },
  { href: '/brand/settings', label: 'Settings' },
]

const retailerNavItems = [
  { href: '/retailer/dashboard', label: 'Dashboard' },
  { href: '/retailer/browse', label: 'Browse' },
  { href: '/retailer/saved', label: 'Saved' },
  { href: '/retailer/orders', label: 'Orders' },
  { href: '/retailer/returns', label: 'Returns' },
  { href: '/retailer/settings', label: 'Settings' },
]

const authNavItems: Record<string, { href: string; label: string }[]> = {
  brand: brandNavItems,
  retailer: retailerNavItems,
}

export default function Navbar({ variant = 'light', userRole }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isFloating = scrolled || mobileOpen || searchOpen
  const currentNavItems = userRole ? authNavItems[userRole] : undefined

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchValue.trim()
    if (!q) return
    setSearchOpen(false)
    setMobileOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isFloating
          ? 'bg-[#faf8f5]/97 backdrop-blur-md border-b border-[#e8e0d8] shadow-sm'
          : variant === 'light'
            ? 'bg-[#faf8f5] border-b border-[#e8e0d8]'
            : 'bg-transparent'
      )}
    >
      <nav className="container-editorial">
        <div className="flex items-center justify-between h-16 lg:h-[70px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {/* Complex mark: layered diamond + arch + fine inner detail */}
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer thin square */}
              <rect x="1" y="1" width="32" height="32" rx="1.5" stroke="#B08D57" strokeWidth="0.8" fill="none"/>
              {/* Inner square rotated 45deg (diamond) */}
              <rect x="9.2" y="9.2" width="15.6" height="15.6" rx="0.5" stroke="#B08D57" strokeWidth="0.7" fill="none" transform="rotate(45 17 17)"/>
              {/* Central arch */}
              <path d="M11.5 23.5 L11.5 16.5 Q11.5 10.5 17 10.5 Q22.5 10.5 22.5 16.5 L22.5 23.5" stroke="#B08D57" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
              {/* Keystone dot at arch apex */}
              <circle cx="17" cy="10.5" r="1" fill="#B08D57"/>
              {/* Base line */}
              <line x1="9" y1="23.5" x2="25" y2="23.5" stroke="#B08D57" strokeWidth="1" strokeLinecap="round"/>
              {/* Two small flanking dots */}
              <circle cx="10" cy="23.5" r="0.8" fill="#B08D57"/>
              <circle cx="24" cy="23.5" r="0.8" fill="#B08D57"/>
            </svg>
            <span
              className="text-[0.95rem] tracking-[0.32em] uppercase text-[#1a1614] transition-colors group-hover:text-[#B08D57]"
              style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontWeight: 400 }}
            >
              Serai
            </span>
          </Link>

          {/* ── Center nav — public pages ── */}
          {!userRole && (
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[0.78rem] font-medium font-sans transition-colors duration-200',
                    pathname === item.href
                      ? 'text-[#B08D57]'
                      : 'text-[#7a706b] hover:text-[#1a1614]'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* ── Authenticated nav ── */}
          {currentNavItems && (
            <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              {currentNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[0.78rem] font-medium font-sans transition-colors',
                    pathname.startsWith(item.href) ? 'text-[#B08D57]' : 'text-[#7a706b] hover:text-[#1a1614]'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* ── Right side ── */}
          <div className="flex items-center gap-3">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? 'Close search' : 'Search'}
              className="p-2 text-[#7a706b] hover:text-[#1a1614] transition-colors"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Notification bell for authenticated users */}
            {userRole && <NotificationBell />}

            {/* Cart icon for retailers */}
            {userRole === 'retailer' && (
              <Link
                href="/retailer/cart"
                aria-label="Cart"
                className="relative p-2 text-[#7a706b] hover:text-[#1a1614] transition-colors"
              >
                <ShoppingBag size={19} />
              </Link>
            )}

            {userRole ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/auth/signout"
                  className="text-[0.78rem] text-[#b8b0a8] hover:text-[#1a1614] transition-colors font-sans"
                >
                  Sign out
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-[0.78rem] font-medium text-[#7a706b] hover:text-[#1a1614] transition-colors font-sans px-3 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup?role=brand"
                  className="btn-gold !bg-[#1C1C1A] hover:!bg-[#2E2E2B] text-[0.76rem] !py-2.5 !px-5"
                >
                  List Your Brand
                </Link>
                <Link
                  href="/auth/signup?role=retailer"
                  className="btn-outline !border-[#1C1C1A] !text-[#1C1C1A] hover:!bg-[#1C1C1A] hover:!text-white text-[0.76rem] !py-2.5 !px-5"
                >
                  Shop as Retailer
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#1a1614]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Search bar ── */}
      {searchOpen && (
        <div className="bg-[#faf8f5] border-t border-[#e8e0d8] px-6 py-4">
          <form onSubmit={handleSearchSubmit} className="container-editorial relative max-w-2xl mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a8]" />
            <input
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-[#e8e0d8] bg-white text-sm text-[#1a1614] placeholder:text-[#b8b0a8] focus:outline-none focus:ring-1 focus:ring-[#1C1C1A] transition-all"
              placeholder="Search brands and products..."
            />
          </form>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#faf8f5] border-t border-[#e8e0d8] px-6 py-6">
          <div className="flex flex-col gap-5">
            {!userRole ? (
              <>
                {publicNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-[#7a706b] font-sans"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-[#e8e0d8] my-1" />
                <Link
                  href="/auth/signin"
                  className="text-sm text-[#7a706b] font-sans"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup?role=brand"
                  className="btn-gold !bg-[#1C1C1A] hover:!bg-[#2E2E2B] text-center justify-center !text-[0.78rem]"
                  onClick={() => setMobileOpen(false)}
                >
                  List Your Brand
                </Link>
                <Link
                  href="/auth/signup?role=retailer"
                  className="btn-outline !border-[#1C1C1A] !text-[#1C1C1A] hover:!bg-[#1C1C1A] hover:!text-white text-center justify-center !text-[0.78rem]"
                  onClick={() => setMobileOpen(false)}
                >
                  Shop as Retailer
                </Link>
              </>
            ) : (
              <>
                {currentNavItems?.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium font-sans',
                      pathname.startsWith(item.href) ? 'text-[#B08D57]' : 'text-[#7a706b]'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-[#e8e0d8] my-1" />
                <Link
                  href="/auth/signout"
                  className="text-sm text-[#b8b0a8] font-sans"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign out
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
