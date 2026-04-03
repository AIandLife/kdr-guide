import Link from 'next/link'
import { Building2, Home, Search, Users } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-orange-500" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/feasibility"
            className="inline-flex items-center gap-2 text-orange-600 font-medium px-6 py-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <Search className="w-4 h-4" />
            Feasibility Check
          </Link>
          <Link
            href="/professionals"
            className="inline-flex items-center gap-2 text-gray-600 font-medium px-6 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Users className="w-4 h-4" />
            Find Pros
          </Link>
        </div>
      </div>
    </div>
  )
}
