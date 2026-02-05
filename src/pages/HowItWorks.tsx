import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconSearch, IconShield, IconCheckCircle, IconArrowRight, IconUsers, IconUser, IconAward, IconStar, IconBriefcase } from '../components/icons'
import Layout from '../components/Layout'

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'clients' | 'vas'>('clients')

  const clientSteps = [
    {
      number: '01',
      icon: IconSearch,
      title: 'Search & Filter',
      desc: 'Browse verified VAs by skill, hourly rate, availability, and experience level. Every profile you see has already been pre-vetted.',
      color: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
    },
    {
      number: '02',
      icon: IconStar,
      title: 'Review & Compare',
      desc: 'Watch video intros, check skill assessment scores, and read attribute-based reviews. Compare VAs side by side to find the perfect fit.',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      number: '03',
      icon: IconCheckCircle,
      title: 'Hire Directly',
      desc: 'No middlemen, no ongoing platform fees. Connect with your chosen VA and start working together on your terms.',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
  ]

  const vaSteps = [
    {
      number: '01',
      icon: IconUser,
      title: 'Create Your Profile',
      desc: 'Showcase your skills, experience, and set your hourly rate. Upload a video intro to stand out from the crowd.',
      color: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
    },
    {
      number: '02',
      icon: IconShield,
      title: 'Get Verified',
      desc: 'Complete identity verification and skill assessments. The higher your tier (Verified → Pro → Elite), the more trust you build.',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      number: '03',
      icon: IconBriefcase,
      title: 'Get Discovered',
      desc: 'Your profile works 24/7. Clients find you through search, filter by your skills, and review your verified qualifications.',
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      number: '04',
      icon: IconAward,
      title: 'Get Hired & Build Reputation',
      desc: 'Accept work, deliver great results, and earn reviews. Each engagement builds your reputation and helps you land better clients.',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
  ]

  const steps = activeTab === 'clients' ? clientSteps : vaSteps

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[hsl(var(--primary))]/5" />
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              How It <span className="text-[hsl(var(--primary))]">Works</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Whether you're hiring a VA or looking for work, getting started is simple.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Toggle */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10 sm:mb-16">
            <div className="inline-flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                  activeTab === 'clients'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <IconUsers className="h-4 w-4 sm:h-5 sm:w-5" />
                  I'm Hiring
                </span>
              </button>
              <button
                onClick={() => setActiveTab('vas')}
                className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                  activeTab === 'vas'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <IconUser className="h-4 w-4 sm:h-5 sm:w-5" />
                  I'm a VA
                </span>
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {steps.map((step, i) => (
                <div key={step.number} className="flex gap-4 sm:gap-6">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${step.color} font-bold text-sm sm:text-base flex-shrink-0`}>
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 my-2" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="pb-6 sm:pb-8 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="h-5 w-5 text-slate-400" />
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Differences */}
      <section className="py-12 sm:py-16 md:py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[hsl(var(--primary))] font-semibold text-sm sm:text-base mb-2">WHY DIFFERENT</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Not Your Average Job Board</h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { title: 'No ongoing fees', desc: 'Browse free, hire direct. We don\'t take a cut from your working relationship.', emoji: '💰' },
              { title: 'Pre-screened talent', desc: 'Every VA is verified before listing. You only see real, vetted professionals.', emoji: '✅' },
              { title: 'Transparent reviews', desc: 'Attribute-based reviews tell you exactly what each VA is great at — and where they can improve.', emoji: '⭐' },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link 
                to="/search" 
                className="flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-[hsl(var(--primary))]/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <IconSearch className="h-5 w-5" />
                Find a VA
              </Link>
              <Link 
                to="/va/signup" 
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-all"
              >
                Become a VA
                <IconArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
