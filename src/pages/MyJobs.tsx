import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Briefcase, Clock, DollarSign, Users, ChevronRight, Loader2, MoreVertical, Eye, Pause, Trash2, Play } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Job {
  id: string
  title: string
  description: string
  budget_type: 'hourly' | 'fixed'
  budget_min: number | null
  budget_max: number | null
  job_type: string
  experience_level: string
  status: 'open' | 'paused' | 'closed' | 'filled'
  created_at: string
  application_count?: number
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Open' },
    paused: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Paused' },
    closed: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Closed' },
    filled: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Filled' },
  }
  const c = configs[status] || configs.open
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export default function MyJobs() {
  const navigate = useNavigate()
  const { user, profile, clientProfile, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== 'client')) {
      navigate('/login')
    }
  }, [user, profile, authLoading, navigate])

  useEffect(() => {
    const fetchJobs = async () => {
      if (!clientProfile) return

      const { data } = await supabase
        .from('jobs')
        .select(`
          *,
          job_applications(count)
        `)
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false })

      if (data) {
        const jobsWithCount = data.map((job: any) => ({
          ...job,
          application_count: job.job_applications?.[0]?.count || 0,
        }))
        setJobs(jobsWithCount)
      }
      setLoading(false)
    }

    if (clientProfile) {
      fetchJobs()
    }
  }, [clientProfile])

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)

    if (!error) {
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus as Job['status'] } : job
      ))
    }
    setActionMenuId(null)
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (!error) {
      setJobs(jobs.filter(job => job.id !== jobId))
    }
    setActionMenuId(null)
  }

  const formatBudget = (job: Job) => {
    if (!job.budget_min && !job.budget_max) return 'Not specified'
    const suffix = job.budget_type === 'hourly' ? '/hr' : ' total'
    if (job.budget_min && job.budget_max) {
      return `$${job.budget_min} - $${job.budget_max}${suffix}`
    }
    if (job.budget_min) return `From $${job.budget_min}${suffix}`
    return `Up to $${job.budget_max}${suffix}`
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">My Jobs</h1>
              <p className="text-sm text-gray-400">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
            </div>
            <Link
              to="/jobs/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Post Job</span>
            </Link>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex p-4 rounded-2xl bg-gray-800/50 mb-4">
                <Briefcase className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
              <p className="text-gray-400 mb-6 text-sm">Post your first job to start finding VAs</p>
              <Link
                to="/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="hidden sm:flex h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-emerald-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <Link 
                            to={`/jobs/${job.id}`}
                            className="text-base sm:text-lg font-semibold text-white hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={job.status} />
                            <span className="text-xs text-gray-500">
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === job.id ? null : job.id)}
                            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {actionMenuId === job.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setActionMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1 z-50">
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                                {job.status === 'open' ? (
                                  <button
                                    onClick={() => handleStatusChange(job.id, 'paused')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
                                  >
                                    <Pause className="h-4 w-4" />
                                    Pause Job
                                  </button>
                                ) : job.status === 'paused' ? (
                                  <button
                                    onClick={() => handleStatusChange(job.id, 'open')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
                                  >
                                    <Play className="h-4 w-4" />
                                    Resume Job
                                  </button>
                                ) : null}
                                <button
                                  onClick={() => handleDelete(job.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Description preview */}
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" />
                          {formatBudget(job)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {job.job_type.replace('-', ' ')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {job.application_count || 0} applicant{job.application_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Desktop: View button */}
                    <div className="hidden sm:block">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-sm text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Mobile: Tap to view hint */}
                  <Link
                    to={`/jobs/${job.id}`}
                    className="sm:hidden flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50 text-sm text-emerald-400"
                  >
                    View applicants
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
