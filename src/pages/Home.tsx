import { Link } from 'react-router-dom'
import { Search, Shield, CheckCircle, Star, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold">V</div>
              <span className="text-xl font-bold">VerifiedVA</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/search" className="text-sm font-medium text-gray-400 hover:text-sky-500">Find VAs</Link>
              <Link to="/va/signup" className="text-sm font-medium text-gray-400 hover:text-sky-500">Become a VA</Link>
              <Link to="/client/signup" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-gray-950 to-gray-950" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Trust-First VA Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find <span className="text-sky-500">Verified</span> Virtual Assistants
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Skip the guesswork. Every VA in our marketplace has verified identity, education, and work history. Hire with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3 text-lg font-medium text-white hover:bg-sky-600">
                <Search className="h-5 w-5" />
                Find Your VA
              </Link>
              <Link to="/va/signup" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-lg font-medium hover:bg-gray-800">
                Become a VA
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Verified VAs', value: '500+' },
              { label: 'Happy Clients', value: '1,200+' },
              { label: 'Hours Worked', value: '50,000+' },
              { label: 'Avg Rating', value: '4.9' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why VerifiedVA?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Unlike other platforms where anyone can sign up, we verify every VA before they appear in search.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Pre-Verified VAs', desc: 'Every VA in search has verified identity, education, and references.' },
              { icon: CheckCircle, title: 'Skill-Tested', desc: 'Verified Pro and Elite VAs pass rigorous skill assessments.' },
              { icon: Star, title: 'Quality Over Quantity', desc: "No race to the bottom. Find skilled professionals, not cheap labor." },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-sky-500/10 text-sky-400 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Tiers */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Verification Tiers</h2>
            <p className="text-gray-400">Choose your confidence level. Higher tiers = more verification.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-green-500/30 bg-gray-900/50">
              <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-400 text-sm font-medium mb-4">✓ Verified</span>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Identity verified</li>
                <li>✓ Education confirmed</li>
                <li>✓ 1+ reference checked</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-blue-500/30 bg-gray-900/50">
              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">✓✓ Verified Pro</span>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Everything in Verified</li>
                <li>✓ Skill tests passed</li>
                <li>✓ 2+ references checked</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border border-purple-500/30 bg-gray-900/50">
              <span className="inline-flex items-center px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">✓✓✓ Verified Elite</span>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Everything in Pro</li>
                <li>✓ Background check</li>
                <li>✓ Video interview</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your VA?</h2>
          <p className="text-gray-400 mb-8">Join hundreds of businesses who've found their perfect match.</p>
          <Link to="/search" className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-8 py-4 text-lg font-medium text-white hover:bg-sky-600">
            <Search className="h-5 w-5" />
            Start Searching
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-500 text-white text-xs font-bold flex items-center justify-center">V</div>
            <span className="text-sm text-gray-400">© 2026 VerifiedVA</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-sky-500">Privacy</a>
            <a href="#" className="hover:text-sky-500">Terms</a>
            <a href="#" className="hover:text-sky-500">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
