import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  IconShield,
  IconCheckCircle,
  IconStar,
  IconVideo,
  IconZap,
  IconSearch,
  IconArrowRight,
  IconUsers,
  IconAward,
  IconGlobe,
  IconBuilding,
} from '../components/icons'

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[hsl(var(--primary))]/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] md:w-[900px] h-[520px] md:h-[900px] bg-[hsl(var(--primary))]/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs sm:text-sm font-medium mb-6">
              <IconShield className="h-4 w-4" />
              VerifiedVA Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Built for agencies tired of{' '}
              <span className="text-[hsl(var(--primary))]">bad VA hires</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Our mission is simple: help teams hire dependable Filipino virtual assistants with real proof of
              skill — faster, with less risk.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3.5 text-base font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <IconSearch className="h-5 w-5" />
                Start browsing VAs
              </Link>
              <Link
                to="/va/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                I’m a VA
                <IconArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2">THE PROBLEM</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Hiring VAs shouldn’t feel like gambling</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Agencies lose time and margin when a hire looks great on paper — then disappears or underdelivers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: IconUsers,
                title: 'Unreliable freelancers',
                desc: 'Missed deadlines, ghosting, inconsistent quality — and you’re back at square one.',
                tint: 'bg-slate-100 text-slate-700',
              },
              {
                icon: IconAward,
                title: 'No skill verification',
                desc: 'Most platforms don’t validate skills. You only find out after you’ve paid the price.',
                tint: 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]',
              },
              {
                icon: IconZap,
                title: 'Time wasted interviewing',
                desc: 'Endless screening calls just to confirm basic capabilities.',
                tint: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6"
              >
                <div className={`inline-flex p-3 rounded-xl ${card.tint} mb-4`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm sm:text-base text-slate-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-12 sm:py-16 md:py-20 bg-white/50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2">THE SOLUTION</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">A marketplace designed for trust</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              VA Marketplace is built to make the “proof” visible — before you hire.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: IconShield,
                title: 'Pre-vetted profiles',
                desc: 'Only verified VAs are discoverable — no unreviewed listings in the marketplace.',
                tint: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
              },
              {
                icon: IconAward,
                title: 'Skills-tested talent',
                desc: 'Assessments help validate real capability, not just claims on a resume.',
                tint: 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]',
              },
              {
                icon: IconVideo,
                title: 'Video introductions',
                desc: 'Quickly evaluate communication style and professionalism without a scheduling loop.',
                tint: 'bg-slate-100 text-slate-700',
              },
              {
                icon: IconStar,
                title: 'Attribute-based reviews',
                desc: 'Feedback includes specific tags like communication, initiative, accuracy, and reliability.',
                tint: 'bg-amber-500/10 text-amber-700',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6"
              >
                <div className={`inline-flex p-3 rounded-xl ${card.tint} mb-4`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm sm:text-base text-slate-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Tiers */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2">TRUST</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Every VA is verified before they appear</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Verification tiers make it easy to choose your confidence level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Verified',
                badge: 'Verified',
                accent: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
                points: ['Identity verified', 'Basic screening', 'Ready for client outreach'],
              },
              {
                name: 'Pro',
                badge: 'Pro',
                accent: 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))] border-[hsl(var(--secondary))]/20',
                points: ['Everything in Verified', 'Skills assessments completed', 'Stronger signal for agencies'],
              },
              {
                name: 'Elite',
                badge: 'Elite',
                accent: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20',
                points: ['Everything in Pro', 'Enhanced review process', 'Top-tier profiles that stand out'],
              },
            ].map((tier) => (
              <div key={tier.name} className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${tier.accent} text-xs sm:text-sm font-semibold mb-4`}>
                  <IconCheckCircle className="h-4 w-4" />
                  {tier.badge}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{tier.name} tier</h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  {tier.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <IconCheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Powered by */}
      <section className="py-12 sm:py-16 bg-white/50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2">POWERED BY</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Vertice Staffing</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                VA Marketplace is built by the team at Vertice Staffing. We’re based in the Philippines and focused on
                making remote hiring more reliable for agencies around the world.
              </p>
            </div>
            <div className="bg-white/70 border border-slate-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="inline-flex p-3 rounded-xl bg-slate-100 text-slate-700">
                  <IconBuilding className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Philippines-based team</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Local insight, strong recruiting networks, and a deep understanding of the VA talent market.
                  </div>
                </div>
              </div>
              <div className="h-px bg-slate-200 my-4" />
              <div className="flex items-start gap-3">
                <div className="inline-flex p-3 rounded-xl bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]">
                  <IconGlobe className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Agency-first mindset</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Built to reduce churn, speed up screening, and create repeatable hiring outcomes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Ready to hire with confidence?</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto">
              Browse verified VAs, review skills, and connect directly.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
            >
              <IconSearch className="h-5 w-5" />
              Start browsing VAs
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
