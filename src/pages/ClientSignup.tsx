import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2, Building2, Users } from 'lucide-react'
import Layout from '../components/Layout'
import { Button, Input } from '../components/ui'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

export default function ClientSignup() {
  const navigate = useNavigate()
  const { signUp, user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [agreed, setAgreed] = useState(false)

  // Company
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreed) {
      setError('You must agree to the Terms of Service')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await signUp(email, password, 'client', fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setStep(2)
      setLoading(false)
    }
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          company_name: companyName || null,
          company_website: companyWebsite || null,
          industry: industry || null,
          company_size: companySize || null,
        })
        .eq('user_id', user.id)

      if (clientError) throw clientError

      navigate('/search')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const industries = [
    'Marketing / Advertising',
    'Technology / SaaS',
    'E-commerce / Retail',
    'Real Estate',
    'Healthcare',
    'Finance / Accounting',
    'Legal',
    'Education',
    'Consulting',
    'Other',
  ]

  const sizes = [
    'Just me',
    '2-10 employees',
    '11-50 employees',
    '51-200 employees',
    '200+ employees',
  ]

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-3 rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 mb-4">
              {step === 1 ? (
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-[hsl(var(--primary))]" />
              ) : (
                <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-[hsl(var(--primary))]" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {step === 1 ? 'Create Your Account' : 'About Your Company'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              {step === 1 ? 'Start finding verified VAs in minutes' : 'Help us match you with the right VAs'}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6 sm:mb-8">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-[hsl(var(--primary))]' : 'bg-slate-100'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-[hsl(var(--primary))]' : 'bg-slate-100'}`} />
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Work Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12"
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-slate-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer p-2 -mx-2 rounded-lg active:bg-white/70">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-600 bg-white text-[hsl(var(--primary))] focus:ring-emerald-500 focus:ring-offset-0"
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-[hsl(var(--primary))]">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[hsl(var(--primary))]">Privacy Policy</a>
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full mt-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Company */}
          {step === 2 && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Company Name <span className="text-slate-500">(optional)</span>
                </label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  autoComplete="organization"
                />
              </div>

              <div>
                <label htmlFor="companyWebsite" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Website <span className="text-slate-500">(optional)</span>
                </label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://example.com"
                  autoComplete="url"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Industry
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-base appearance-none"
                >
                  <option value="">Select industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Company Size
                </label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-base appearance-none"
                >
                  <option value="">Select size</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/search')}
                  className="flex-1"
                  size="lg"
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Find VAs
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center text-sm text-slate-600 space-y-2">
            {step === 1 && (
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-[hsl(var(--primary))] hover:opacity-80">
                  Sign in
                </Link>
              </p>
            )}
            <p>
              Are you a VA?{' '}
              <Link to="/va/signup" className="text-[hsl(var(--primary))] hover:opacity-80">
                Create a VA profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
