"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="w-full bg-slate-900 relative z-40">
      <div className="container mx-auto px-4 sm:px-6 py-7">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Juniper Proposals"
                width={140}
                height={36}
                className="invert w-[120px] h-auto sm:w-[140px]"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                Home
              </Link>
              <Link href="/#about" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                About
              </Link>
              <Link href="/#services" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                Services
              </Link>
              <Link href="/blog" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                News and Insights
              </Link>
              <Link
                href="/#references"
                className="text-white/80 hover:text-white font-medium text-sm transition-colors"
              >
                References
              </Link>
              <Link href="/#contact" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                Contact
              </Link>
            </div>
            <button
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div
              className="absolute top-[88px] left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="container mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col space-y-6">
                  <Link
                    href="/"
                    className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/#about"
                    className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/#services"
                    className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="/blog"
                    className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    News and Insights
                  </Link>
                  <Link
                    href="/#references"
                    className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    References
                  </Link>
                  <Link
                    href="/#contact"
                    className="text-white hover:text-white/80 font-medium text-base py-3 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
