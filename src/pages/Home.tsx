import { Link, useNavigate } from 'react-router-dom'
import { IconSearch, IconShield, IconCheckCircle, IconStar, IconArrowRight, IconUsers, IconChevronDown, IconZap, IconGlobe, IconDollar } from '../components/icons'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'

export default function Home() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const faqs = [
    { q: "How do you verify VAs?", a: "Every VA goes through identity verification, skill assessment, and reference checks. Higher tiers include background checks and video interviews." },
    { q: "What's the difference between tiers?", a: "Pending = just signed up. Verified = identity confirmed. Pro = skill tests + 2 references. Elite = background check + video interview." },
    { q: "How much does it cost?", a: "Browsing and connecting with VAs is free. VAs set their own rates, typically $5-25/hr depending on skills and experience." },
    { q: "Can I hire directly?", a: "Yes! Once you find a VA you like, you can hire them directly. We don't take ongoing fees from your working relationship." },
  ]

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[hsl(var(--primary))]/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-[hsl(var(--primary))]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <IconShield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Pre-Verified Filipino VAs
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
              Hiring virtual assistants
              <br />
              <span className="text-[hsl(var(--primary))]">just got a whole lot easier.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Browse pre-verified Filipino virtual assistants. Review skills, watch intros, and hire directly.
              No middlemen — just great talent.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link 
                to="/search" 
                className="flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-[hsl(var(--primary))]/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <IconSearch className="h-5 w-5" />
                Find Your VA
              </Link>
              <Link 
                to="/va/signup" 
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-all"
              >
                I'm a VA
                <IconArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 bg-white/50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: IconUsers, value: '500+', label: 'Verified VAs', tint: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' },
              { icon: IconStar, value: '4.9', label: 'Avg Rating', tint: 'bg-amber-500/10 text-amber-700' },
              { icon: IconDollar, value: '60%', label: 'Cost Savings', tint: 'bg-[hsl(var(--primary))]/10 text-emerald-700' },
              { icon: IconZap, value: '24h', label: 'Avg Response', tint: 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${stat.tint} mb-2 sm:mb-3`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VA Marketplace */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2 sm:mb-3">WHY VA MARKETPLACE</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Stop Gambling on Talent
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: IconShield,
                title: 'Pre-verified experience',
                desc: 'Every VA passes identity and reference checks before listing.',
                tint: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
              },
              {
                icon: IconGlobe,
                title: 'Filipino talent',
                desc: 'Access skilled professionals with excellent English and strong work ethic.',
                tint: 'bg-slate-100 text-slate-700',
              },
              {
                icon: IconDollar,
                title: 'Lower costs',
                desc: 'Save 60–70% on talent costs without sacrificing quality.',
                tint: 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8">
                <div className={`inline-flex p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${feature.tint} mb-3 sm:mb-4`}>
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-slate-900">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Tiers */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2 sm:mb-3">VERIFICATION TIERS</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Choose Your Confidence Level</h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                tier: 'Verified',
                badge: '✓',
                color: 'emerald',
                desc: 'Foundation of trust',
                checks: ['Identity verified', 'Education confirmed', '1+ reference'],
              },
              {
                tier: 'Pro',
                badge: '✓✓',
                color: 'blue',
                desc: 'Skills validated',
                checks: ['Everything in Verified', 'Skill tests passed', '2+ references'],
              },
              {
                tier: 'Elite',
                badge: '✓✓✓',
                color: 'purple',
                desc: 'Maximum assurance',
                checks: ['Everything in Pro', 'Background check', 'Video interview'],
              },
            ].map((tier) => (
              <div 
                key={tier.tier}
                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-${tier.color}-500/30 bg-${tier.color}-500/5`}
              >
                <div className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-${tier.color}-500/20 text-${tier.color}-400 text-xs sm:text-sm font-semibold mb-3 sm:mb-4`}>
                  {tier.badge} {tier.tier}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">{tier.desc}</p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {tier.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2">
                      <IconCheckCircle className={`h-4 w-4 text-${tier.color}-500 flex-shrink-0 mt-0.5`} />
                      <span className="text-slate-700">{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 md:py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2 sm:mb-3">FAQ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Common Questions</h2>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/70 rounded-xl border border-slate-200 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between gap-4 font-medium text-sm sm:text-base hover:bg-white active:bg-slate-100 transition-colors"
                >
                  <span>{faq.q}</span>
                  <IconChevronDown className={`h-5 w-5 text-slate-600 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-6 pb-4 text-sm sm:text-base text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to find your VA?</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto">
              Join businesses saving 60-70% on talent costs with verified Filipino virtual assistants.
            </p>
            <Link 
              to="/search" 
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
            >
              <IconSearch className="h-5 w-5" />
              Start Searching
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
