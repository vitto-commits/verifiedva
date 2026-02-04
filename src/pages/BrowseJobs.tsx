import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconSearch, IconClock, IconDollar, IconBriefcase, IconFilter, IconX, IconLoader, IconChevronRight } from '../components/icons'
import Layout from '../components/Layout'
import AuthGuard from '../components/AuthGuard'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Job {
  id: string
  title: string
  description: string
  budget_type: 'hourly' | 'fixed'
  budget_min: number | null
  budget_max: number | null
  status: string
  created_at: string
  client: {
    id: string
    company_name: string | null
    profile: {
      full_name: string | null
    }
  }
  job_skills: {
    skill: {
      id: string
      name: string
    }
  }[]
  _count?: {
    applications: number
  }
}

export default function BrowseJobs() {
  const { user, profile, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  
  // Filters
  const [budgetType, setBudgetType] = useState<string>('')
  const [minBudget, setMinBudget] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      // Fetch open jobs with client info and skills
      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:clients!jobs_client_id_fkey (
            id,
            company_name,
            profile:profiles!clients_user_id_fkey (
              full_name
            )
          ),
          job_skills (
            skill:skills (
              id,
              name
            )
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (budgetType) {
        query = query.eq('budget_type', budgetType)
      }

      if (minBudget) {
        query = query.gte('budget_min', parseInt(minBudget))
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching jobs:', error)
      } else {
        setJobs(data || [])
      }

      // If logged in as VA, get applied job IDs
      if (user && profile?.user_type === 'va') {
        const { data: vaData } = await supabase
          .from('vas')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (vaData) {
          const { data: applications } = await supabase
            .from('job_applications')
            .select('job_id')
            .eq('va_id', vaData.id)

          if (applications) {
            setAppliedJobIds(new Set(applications.map(a => a.job_id)))
          }
        }
      }

      setLoading(false)
    }

    fetchJobs()
  }, [user, profile, budgetType, minBudget])

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      job.job_skills.some(js => js.skill.name.toLowerCase().includes(q))
    )
  })

  const formatBudget = (job: Job) => {
    if (job.budget_type === 'hourly') {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min}-${job.budget_max}/hr`
      } else if (job.budget_min) {
        return `$${job.budget_min}+/hr`
      }
    } else {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min.toLocaleString()}-${job.budget_max.toLocaleString()}`
      } else if (job.budget_min) {
        return `$${job.budget_min.toLocaleString()}+`
      }
    }
    return 'Budget not specified'
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const activeFiltersCount = [budgetType, minBudget].filter(Boolean).length

  if (authLoading || loading) {
    return (
      <AuthGuard requireType="va">
        <Layout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireType="va">
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-slate-600">
            {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="sticky top-[57px] sm:top-[65px] z-30 -mx-4 px-4 py-3 bg-white/90 backdrop-blur border-b border-slate-200 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search jobs or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <IconFilter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[hsl(var(--primary))] text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {budgetType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs">
                  {budgetType === 'hourly' ? 'Hourly' : 'Fixed Price'}
                  <button onClick={() => setBudgetType('')} className="hover:text-slate-900">
                    <IconX className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minBudget && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs">
                  ${minBudget}+ min
                  <button onClick={() => setMinBudget('')} className="hover:text-slate-900">
                    <IconX className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Job List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-2xl bg-white/70 mb-4">
              <IconBriefcase className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-slate-600 text-sm">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new opportunities'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const hasApplied = appliedJobIds.has(job.id)
              
              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}/apply`}
                  className="block bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-slate-300 hover:bg-white active:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{job.title}</h3>
                        {hasApplied && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium flex-shrink-0">
                            Applied
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">
                        {job.client?.company_name || job.client?.profile?.full_name || 'Client'}
                      </p>

                      <p className="text-sm text-slate-700 line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      {/* Skills */}
                      {job.job_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.job_skills.slice(0, 4).map((js) => (
                            <span
                              key={js.skill.id}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs"
                            >
                              {js.skill.name}
                            </span>
                          ))}
                          {job.job_skills.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                              +{job.job_skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <IconDollar className="h-3.5 w-3.5" />
                          {formatBudget(job)}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock className="h-3.5 w-3.5" />
                          {formatTimeAgo(job.created_at)}
                        </span>
                      </div>
                    </div>

                    <IconChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-6 animate-slide-in-from-bottom sm:animate-none">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 -mr-2 text-slate-600 hover:text-slate-900"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Budget Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Budget Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '', label: 'Any' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'fixed', label: 'Fixed Price' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBudgetType(opt.value)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        budgetType === opt.value
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Budget */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Budget
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['', '10', '25', '50'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMinBudget(val)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        minBudget === val
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {val ? `$${val}+` : 'Any'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setBudgetType('')
                  setMinBudget('')
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-slate-100"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:bg-[hsl(var(--primary))]/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </AuthGuard>
  )
}
