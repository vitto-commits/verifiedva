import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCheck, IconChevronRight, IconChevronLeft, IconEye, IconEyeOff, IconLoader, IconUser, IconBriefcase, IconWrench } from '../components/icons'
import Layout from '../components/Layout'
import { Button, Input, Textarea } from '../components/ui'
import Captcha from '../components/Captcha'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Skill } from '../types/database'

const steps = [
  { id: 1, name: 'Account', icon: IconUser },
  { id: 2, name: 'Profile', icon: IconUser },
  { id: 3, name: 'Work', icon: IconBriefcase },
  { id: 4, name: 'Skills', icon: IconWrench },
]

export default function VASignup() {
  const navigate = useNavigate()
  const { user, signUp } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [timezone, setTimezone] = useState('UTC+8')

  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState(0)
  const [hourlyRate, setHourlyRate] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')
  const [availability, setAvailability] = useState('full-time')

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  useEffect(() => {
    if (user) setCurrentStep(2)
  }, [user])

  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase.from('skills').select('*').order('category').order('name')
      if (data) setSkills(data)
    }
    fetchSkills()
  }, [])

  const handleAccountSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!captchaToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setError('Please complete the CAPTCHA verification')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await signUp(email, password, 'va', fullName || email.split('@')[0])

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setCurrentStep(2)
      setLoading(false)
    }
  }

  const handleProfileSubmit = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    setCurrentStep(3)
  }

  const handleProfessionalSubmit = async () => {
    setCurrentStep(4)
  }

  const handleFinalSubmit = async () => {
    if (!user) {
      setError('You must be logged in')
      return
    }

    setLoading(true)
    setError('')

    try {
      await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      const { error: vaError } = await supabase
        .from('vas')
        .update({
          headline,
          bio,
          years_experience: yearsExperience,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          hours_per_week: hoursPerWeek ? parseInt(hoursPerWeek) : null,
          availability,
          location,
          timezone,
        })
        .eq('user_id', user.id)

      if (vaError) throw vaError

      const { data: vaData } = await supabase
        .from('vas')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (vaData && selectedSkills.length > 0) {
        const vaId = (vaData as { id: string }).id
        const skillInserts = selectedSkills.map(skillId => ({
          va_id: vaId,
          skill_id: skillId,
        }))

        await supabase.from('va_skills').upsert(skillInserts)
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId))
    } else if (selectedSkills.length < 15) {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] py-6 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-lg sm:max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Become a VA</h1>
              <p className="text-sm sm:text-base text-slate-600">Join our marketplace of verified virtual assistants</p>
            </div>

            {/* Progress bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-600">Step {currentStep} of {steps.length}</span>
                <span className="text-xs sm:text-sm text-[hsl(var(--primary))] font-medium">{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-between mb-6 sm:mb-8 px-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id === currentStep
                      ? 'text-[hsl(var(--primary))]'
                      : step.id < currentStep
                      ? 'text-[hsl(var(--primary))]'
                      : 'text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-colors ${
                      step.id === currentStep
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : step.id < currentStep
                        ? 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]'
                        : 'bg-white text-slate-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <IconCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs">{step.name}</span>
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white/50 p-4 sm:p-6 md:p-8">
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Account */}
              {currentStep === 1 && !user && (
                <div className="space-y-4 sm:space-y-5">
                  <h2 className="text-lg sm:text-xl font-semibold">Create Your Account</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Email</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-12"
                          placeholder="Min 8 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-slate-700"
                          tabIndex={-1}
                        >
                          {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                      />
                    </div>
                    <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer p-2 -m-2 rounded-lg active:bg-white/70">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-gray-600 bg-white text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] focus:ring-offset-0"
                      />
                      <span>I agree to the Terms of Service and Privacy Policy</span>
                    </label>
                    <Captcha 
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Profile */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-5">
                  <h2 className="text-lg sm:text-xl font-semibold">Your Profile</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Full Name</label>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Location</label>
                      <Input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Manila, Philippines"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-base appearance-none"
                      >
                        <option value="UTC+8">UTC+8 (Philippine Time)</option>
                        <option value="UTC+7">UTC+7</option>
                        <option value="UTC+9">UTC+9</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Professional */}
              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-5">
                  <h2 className="text-lg sm:text-xl font-semibold">Professional Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Professional Headline</label>
                      <Input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g., Executive Virtual Assistant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="h-28 sm:h-32"
                        placeholder="Tell clients about yourself..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Experience</label>
                        <select
                          value={yearsExperience}
                          onChange={(e) => setYearsExperience(parseInt(e.target.value))}
                          className="w-full px-3 sm:px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-base appearance-none"
                        >
                          <option value="0">&lt; 1 year</option>
                          <option value="1">1-2 years</option>
                          <option value="3">3-5 years</option>
                          <option value="6">5-10 years</option>
                          <option value="10">10+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Rate ($/hr)</label>
                        <Input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="px-3 sm:px-4"
                          placeholder="15"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Hours per Week</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { value: '', label: 'Flexible' },
                          { value: '10', label: '10h' },
                          { value: '20', label: '20h' },
                          { value: '30', label: '30h' },
                          { value: '40', label: '40h' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setHoursPerWeek(opt.value)}
                            className={`px-2 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors active:scale-[0.98] ${
                              hoursPerWeek === opt.value
                                ? 'border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Availability</label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {['full-time', 'part-time', 'contract'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAvailability(option)}
                            className={`px-2 sm:px-4 py-2.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors active:scale-[0.98] ${
                              availability === option
                                ? 'border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {option === 'full-time' ? 'Full-time' : option === 'part-time' ? 'Part-time' : 'Contract'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Skills */}
              {currentStep === 4 && (
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">Select Your Skills</h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      Tap to select up to 15 skills ({selectedSkills.length}/15)
                    </p>
                  </div>
                  <div className="space-y-4 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-2 -mr-2">
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category}>
                        <h3 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 sticky top-0 bg-white/90 backdrop-blur py-1">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {categorySkills.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors active:scale-95 ${
                                selectedSkills.includes(skill.id)
                                  ? 'bg-[hsl(var(--primary))] text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {skill.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1 || (currentStep === 2 && !user)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white active:bg-slate-100 transition-colors text-sm ${
                    (currentStep === 1 || (currentStep === 2 && !user)) ? 'invisible' : ''
                  }`}
                >
                  <IconChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <Button
                  onClick={() => {
                    setError('')
                    if (currentStep === 1) handleAccountSubmit()
                    else if (currentStep === 2) handleProfileSubmit()
                    else if (currentStep === 3) handleProfessionalSubmit()
                    else if (currentStep === 4) handleFinalSubmit()
                  }}
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <IconLoader className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {currentStep === steps.length ? 'Complete' : 'Continue'}
                      <IconChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
