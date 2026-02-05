import { Link } from 'react-router-dom'
import { IconSearch, IconArrowRight } from '../components/icons'
import Layout from '../components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="text-7xl sm:text-8xl font-bold text-[hsl(var(--primary))]/20 mb-4">404</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Page not found</h1>
          <p className="text-slate-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-base font-semibold text-white hover:bg-[hsl(var(--primary))]/90 active:scale-[0.98] transition-all"
            >
              <IconSearch className="h-5 w-5" />
              Find VAs
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-all"
            >
              Go Home
              <IconArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
