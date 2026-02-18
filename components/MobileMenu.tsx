"use client"

import { useState } from "react"

export default function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-[88px] left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col space-y-6">
                <a
                  href="#home"
                  className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#about"
                  className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#services"
                  className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a
                  href="#news"
                  className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  News and Insights
                </a>
                <a
                  href="#references"
                  className="text-white hover:text-white/80 font-medium text-base py-3 border-b border-slate-700/50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  References
                </a>
                <a
                  href="#contact"
                  className="text-white hover:text-white/80 font-medium text-base py-3 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
