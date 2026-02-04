import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, DollarSign, Clock, Briefcase, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Skill } from '../types/database'

export default function CreateJob() {
  const navigate = useNavigate()
  const { user, profile, clientProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [step, setStep] = useState(1)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetType, setBudgetType] = useState<'hourly' | 'fixed'>('hourly')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract'>('full-time')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'intermediate' | 'expert'>('intermediate')

  useEffect(() => {
    if (!user || profile?.user_type !== 'client') {
      navigate('/login')
    }
  }, [user, profile, navigate])

  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase.from('skills').select('*').order('category').order('name')
      if (data) setSkills(data)
    }
    fetchSkills()
  }, [])

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId))
    } else if (selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  const handleSubmit = async () => {
    if (!user || !clientProfile) return

    if (!title.trim()) {
      setError('Please enter a job title')
      return
    }
    if (!description.trim()) {
      setError('Please enter a job description')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          client_id: clientProfile.id,
          title,
          description,
          budget_type: budgetType,
          budget_min: budgetMin ? parseFloat(budgetMin) : null,
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          job_type: jobType,
          experience_level: experienceLevel,
          status: 'open',
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Add job skills
      if (job && selectedSkills.length > 0) {
        const skillInserts = selectedSkills.map(skillId => ({
          job_id: job.id,
          skill_id: skillId,
        }))
        await supabase.from('job_skills').insert(skillInserts)
      }

      navigate('/my-jobs')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const canProceedStep1 = title.trim() && description.trim()

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Back */}
            <Link 
              to="/my-jobs" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 py-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              My Jobs
            </Link>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Post a Job</h1>
              <p className="text-sm sm:text-base text-gray-400">Find the perfect VA for your needs</p>
            </div>

            {/* Progress */}
            <div className="flex gap-2 mb-6 sm:mb-8">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    s <= step ? 'bg-emerald-500' : 'bg-gray-700'
                  }`} 
                />
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Briefcase className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Job Details</h2>
                      <p className="text-sm text-gray-400">Describe what you're looking for</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base"
                      placeholder="e.g., Executive Virtual Assistant for E-commerce Business"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 h-32 sm:h-40 resize-none text-base"
                      placeholder="Describe the role, responsibilities, and what you're looking for in an ideal candidate..."
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Include key tasks, tools used, and work schedule expectations</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Type</label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { value: 'full-time', label: 'Full-time', desc: '40 hrs/wk' },
                        { value: 'part-time', label: 'Part-time', desc: '20 hrs/wk' },
                        { value: 'contract', label: 'Contract', desc: 'Project' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setJobType(option.value as typeof jobType)}
                          className={`p-3 rounded-xl border text-center transition-colors active:scale-[0.98] ${
                            jobType === option.value
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Budget & Experience */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Budget & Requirements</h2>
                      <p className="text-sm text-gray-400">Set your budget and experience level</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Budget Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBudgetType('hourly')}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          budgetType === 'hourly'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-gray-700 text-gray-400'
                        }`}
                      >
                        <Clock className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-medium text-sm">Hourly Rate</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBudgetType('fixed')}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          budgetType === 'fixed'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-gray-700 text-gray-400'
                        }`}
                      >
                        <DollarSign className="h-5 w-5 mx-auto mb-1" />
                        <div className="font-medium text-sm">Fixed Price</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Budget Range {budgetType === 'hourly' ? '($/hr)' : '($)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base"
                          placeholder="Min"
                        />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      {budgetType === 'hourly' 
                        ? 'Philippine VAs typically charge $5-25/hr' 
                        : 'Enter total project budget'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Experience Level</label>
                    <div className="space-y-2">
                      {[
                        { value: 'entry', label: 'Entry Level', desc: '0-2 years experience' },
                        { value: 'intermediate', label: 'Intermediate', desc: '2-5 years experience' },
                        { value: 'expert', label: 'Expert', desc: '5+ years experience' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setExperienceLevel(option.value as typeof experienceLevel)}
                          className={`w-full p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                            experienceLevel === option.value
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div>
                            <div className={`font-medium text-sm ${experienceLevel === option.value ? 'text-emerald-400' : 'text-white'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </div>
                          {experienceLevel === option.value && (
                            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Skills */}
              {step === 3 && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Briefcase className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Required Skills</h2>
                      <p className="text-sm text-gray-400">Select up to 10 skills ({selectedSkills.length}/10)</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 -mr-2">
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category}>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sticky top-0 bg-gray-800/90 backdrop-blur py-1">
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
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
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
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-700">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 active:bg-gray-700"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={() => {
                      setError('')
                      if (step === 1 && !canProceedStep1) {
                        setError('Please fill in the job title and description')
                        return
                      }
                      setStep(step + 1)
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm active:scale-[0.98]"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Post Job
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
