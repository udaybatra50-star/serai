import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#F4F3EC] border-t border-[#E8E4D9]">
      <div className="container-editorial py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="32" height="32" rx="1.5" stroke="#B08D57" strokeWidth="0.8" fill="none"/>
                <rect x="9.2" y="9.2" width="15.6" height="15.6" rx="0.5" stroke="#B08D57" strokeWidth="0.7" fill="none" transform="rotate(45 17 17)"/>
                <path d="M11.5 23.5 L11.5 16.5 Q11.5 10.5 17 10.5 Q22.5 10.5 22.5 16.5 L22.5 23.5" stroke="#B08D57" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                <circle cx="17" cy="10.5" r="1" fill="#B08D57"/>
                <line x1="9" y1="23.5" x2="25" y2="23.5" stroke="#B08D57" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="10" cy="23.5" r="0.8" fill="#B08D57"/>
                <circle cx="24" cy="23.5" r="0.8" fill="#B08D57"/>
              </svg>
              <span
                className="text-[0.95rem] tracking-[0.32em] uppercase text-[#1C1C1A]"
                style={{ fontFamily: 'Georgia, var(--font-serif), serif', fontWeight: 400 }}
              >
                Serai
              </span>
            </div>
            <p className="text-sm text-[#4A4A45] leading-relaxed max-w-xs font-sans font-light mb-6">
              India&apos;s wholesale marketplace connecting premium D2C beauty and wellness brands with curated boutique retailers.
            </p>
            <p className="text-xs text-[#8A8880] font-sans mb-4">Starting with beauty &amp; wellness — expanding soon.</p>
            <div className="flex gap-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8A8880] hover:text-[#1C1C1A] transition-colors font-sans"
              >
                Instagram
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8A8880] hover:text-[#1C1C1A] transition-colors font-sans"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="overline text-[#8A8880] mb-5">For Brands</p>
            <ul className="space-y-3">
              {[
                { label: 'How it works', href: '/brands' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Apply as a brand', href: '/auth/signup?role=brand' },
                { label: 'Brand dashboard', href: '/brand/dashboard' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#4A4A45] hover:text-[#1C1C1A] transition-colors font-sans font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="overline text-[#8A8880] mb-5">For Retailers</p>
            <ul className="space-y-3">
              {[
                { label: 'Browse brands', href: '/browse' },
                { label: 'How ordering works', href: '/retailers' },
                { label: 'Payment terms', href: '/retailers#terms' },
                { label: 'Apply as retailer', href: '/auth/signup?role=retailer' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#4A4A45] hover:text-[#1C1C1A] transition-colors font-sans font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="overline text-[#8A8880] mb-5">Company</p>
            <ul className="space-y-3">
              {[
                { label: 'About Serai', href: '/about' },
                { label: 'Contact us', href: '/contact' },
                { label: 'Privacy policy', href: '/privacy' },
                { label: 'Terms of service', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#4A4A45] hover:text-[#1C1C1A] transition-colors font-sans font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-7 border-t border-[#E8E4D9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8A8880] font-sans">
            © 2025 Serai Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-[#8A8880] font-sans">
            Crafted in India · Net-30 for retailers · Pay-in-7 for brands
          </p>
        </div>
      </div>
    </footer>
  )
}
