import { Link } from 'react-router-dom'
import { Search, Shield, CheckCircle, Star, ArrowRight, Users, Clock, Award, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    { q: "How do you verify VAs?", a: "Every VA goes through identity verification, education confirmation, and reference checks. Higher tiers include skill tests, background checks, and video interviews." },
    { q: "What's the difference between tiers?", a: "Verified = identity + education + 1 reference. Pro = skill tests + 2 references. Elite = background check + video interview." },
    { q: "How much does it cost?", a: "Browsing and connecting with VAs is free. VAs set their own rates, typically $5-25/hr depending on skills and experience." },
    { q: "Can I hire directly?", a: "Yes. Once you find a VA you like, you can hire them directly. We don't take ongoing fees from your working relationship." },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm">VA</div>
              <span className="text-xl font-bold tracking-tight">marketplace</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900">Find VAs</Link>
              <Link to="/va/signup" className="text-sm font-medium text-gray-600 hover:text-gray-900">For VAs</Link>
              <Link to="/client/signup" className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6 border border-emerald-100">
              <Shield className="h-4 w-4" />
              Pre-Verified Virtual Assistants
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Hire VAs You Can Actually Trust
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Skip the guesswork. Every VA is verified before they appear in search. Find skilled Filipino talent with confirmed identity, education, and references.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3.5 text-base font-medium text-white hover:bg-gray-800 transition-colors">
                <Search className="h-5 w-5" />
                Find Your VA
              </Link>
              <Link to="/va/signup" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-6 py-3.5 text-base font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
                I'm a VA
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 mb-4">Trusted by growing businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {['Agency A', 'StartupCo', 'GrowthHQ', 'ScaleFast', 'BuildRight'].map((name) => (
              <span key={name} className="text-lg font-semibold text-gray-400">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">The Numbers</h2>
            <p className="text-3xl md:text-4xl font-bold">Results That Speak</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '500+', label: 'Verified VAs', color: 'text-emerald-500' },
              { icon: Star, value: '4.9', label: 'Avg Rating', color: 'text-amber-500' },
              { icon: Clock, value: '50K+', label: 'Hours Worked', color: 'text-blue-500' },
              { icon: Award, value: '98%', label: 'Success Rate', color: 'text-purple-500' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">How It Works</h2>
            <p className="text-3xl md:text-4xl font-bold">Simple Process, Trusted Results</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { step: '01', title: 'Search & Filter', desc: 'Browse verified VAs by skills, experience, rate, and verification tier.' },
              { step: '02', title: 'Review Profiles', desc: 'See verified credentials, work samples, ratings, and what exactly has been verified.' },
              { step: '03', title: 'Connect & Hire', desc: 'Message VAs directly and hire on your terms. No middleman fees.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Tiers */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">Verification Tiers</h2>
            <p className="text-3xl md:text-4xl font-bold">Choose Your Confidence Level</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl border-2 border-green-200 bg-green-50/50">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
                ✓ Verified
              </div>
              <p className="text-gray-600 text-sm mb-4">Foundation of trust</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Identity verified</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Education confirmed</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 1+ reference checked</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border-2 border-blue-200 bg-blue-50/50">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
                ✓✓ Pro
              </div>
              <p className="text-gray-600 text-sm mb-4">Skills validated</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Everything in Verified</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Skill tests passed</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> 2+ references checked</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border-2 border-purple-200 bg-purple-50/50">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
                ✓✓✓ Elite
              </div>
              <p className="text-gray-600 text-sm mb-4">Maximum assurance</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-purple-500" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-purple-500" /> Background check</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-purple-500" /> Video interview</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">FAQ</h2>
            <p className="text-3xl md:text-4xl font-bold">Common Questions</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-medium hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-emerald-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your VA?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">Join businesses who've found reliable, verified virtual assistants.</p>
          <Link to="/search" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-medium text-white hover:bg-emerald-600 transition-colors">
            <Search className="h-5 w-5" />
            Start Searching
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">VA</div>
            <span className="text-sm text-gray-500">© 2026 VA Marketplace</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
