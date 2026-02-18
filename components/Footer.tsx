import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <>
      {/* Contact Section */}
      <section className="py-16 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 leading-tight mb-12">
              Let's work
              <br />
              together
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Ready to win your next proposal? Contact us today to get started with professional proposal management
              services.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-16">
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-500 uppercase tracking-wide">Email</div>
                <div className="text-gray-900">hello@juniperproposals.com</div>
              </div>
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-500 uppercase tracking-wide">Phone</div>
                <div className="text-gray-900">(555) 123-4567</div>
              </div>
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-500 uppercase tracking-wide">Location</div>
                <div className="text-gray-900">Nationwide Service</div>
              </div>
            </div>

            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-12 py-4 rounded-none font-normal text-sm tracking-wide">
              <Link href="/#contact" className="flex items-center">
                Start Project
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <Link href="/">
                <Image src="/logo.png" alt="Juniper Proposals" width={140} height={36} />
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Juniper Proposals. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
