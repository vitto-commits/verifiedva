import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, Clock, DollarSign, MapPin, Loader2, MessageCircle, CheckCircle, X, ChevronDown, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import AuthGuard from '../components/AuthGuard'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Skill } from '../types/database'

interface Job {
  id: string
  client_id: string
  title: string
  description: string
  budget_type: 'hourly' | 'fixed'
  budget_min: number | null
  budget_max: number | null
  job_type: string
  experience_level: string
  status: string
  created_at: string
  job_skills?: { skill: Skill }[]
}

interface Application {
  id: string
  va_id: string
  cover_letter: string
  proposed_rate: number | null
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired'
  created_at: string
  va: {
    id: string
    headline: string | null
    hourly_rate: number | null
    years_experience: number
    location: string | null
    verification_status: string
    profile: {
      full_name: string | null
      avatar_url: string | null
    }
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]', label: 'Open' },
    paused: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Paused' },
    closed: { bg: 'bg-gray-500/20', text: 'text-slate-600', label: 'Closed' },
    filled: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Filled' },
  }
  const c = configs[status] || configs.open
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-gray-500/20', text: 'text-slate-600', label: 'Pending' },
    shortlisted: { bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]', label: 'Shortlisted' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' },
    hired: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Hired' },
  }
  const c = configs[status] || configs.pending
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

const VerificationBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'text-slate-600' },
    verified: { label: '✓ Verified', color: 'text-[hsl(var(--primary))]' },
    pro: { label: '✓✓ Pro', color: 'text-blue-400' },
    elite: { label: '✓✓✓ Elite', color: 'text-purple-400' },
  }
  const c = configs[status] || configs.pending
  return <span className={`text-xs font-medium ${c.color}`}>{c.label}</span>
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { clientProfile } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'details' | 'applicants'>('applicants')
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const isOwner = clientProfile?.id === job?.client_id

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return

      const { data: jobData } = await supabase
        .from('jobs')
        .select(`
          *,
          job_skills(skill:skills(*))
        `)
        .eq('id', id)
        .single()

      if (jobData) {
        setJob(jobData as Job)

        // Fetch applications if owner
        if (clientProfile && jobData.client_id === clientProfile.id) {
          const { data: apps } = await supabase
            .from('job_applications')
            .select(`
              *,
              va:vas(
                id,
                headline,
                hourly_rate,
                years_experience,
                location,
                verification_status,
                profile:profiles(full_name, avatar_url)
              )
            `)
            .eq('job_id', id)
            .order('created_at', { ascending: false })

          if (apps) setApplications(apps as Application[])
        }
      }
      setLoading(false)
    }

    fetchJob()
  }, [id, clientProfile])

  const handleApplicationStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', appId)

    if (!error) {
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, status: newStatus as Application['status'] } : app
      ))
    }
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

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  if (!job) {
    return (
      <AuthGuard>
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-slate-600 mb-4">Job not found</p>
            <Link to="/my-jobs" className="text-[hsl(var(--primary))] hover:opacity-80">
              ← Back to My Jobs
            </Link>
          </div>
        </Layout>
      </AuthGuard>
    )
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length

  return (
    <AuthGuard>
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <Link 
            to="/my-jobs" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 py-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            My Jobs
          </Link>

          {/* Header Card */}
          <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-14 w-14 rounded-xl bg-gradient-to-br to-[hsl(var(--secondary))]/20 to-[hsl(var(--secondary))]/20 items-center justify-center flex-shrink-0">
                <Briefcase className="h-7 w-7 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="text-lg sm:text-xl font-bold">{job.title}</h1>
                  <StatusBadge status={job.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    {formatBudget(job)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {job.job_type.replace('-', ' ')}
                  </span>
                  <span className="text-slate-500">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Mobile Friendly */}
          {isOwner && (
            <div className="flex gap-1 p-1 bg-white/70 rounded-xl mb-4 sm:mb-6">
              <button
                onClick={() => setTab('applicants')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'applicants'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Applicants
                {applications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs">
                    {applications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab('details')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'details'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Job Details
              </button>
            </div>
          )}

          {/* Details Tab */}
          {(tab === 'details' || !isOwner) && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h2 className="font-semibold mb-3">Description</h2>
                <p className="text-slate-700 whitespace-pre-wrap text-sm sm:text-base">{job.description}</p>
              </div>

              {job.job_skills && job.job_skills.length > 0 && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="font-semibold mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.job_skills.map((js) => (
                      <span key={js.skill.id} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm">
                        {js.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h2 className="font-semibold mb-3">Requirements</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Experience Level</span>
                    <p className="text-slate-900 capitalize">{job.experience_level}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Job Type</span>
                    <p className="text-slate-900 capitalize">{job.job_type.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Budget Type</span>
                    <p className="text-slate-900 capitalize">{job.budget_type}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applicants Tab */}
          {tab === 'applicants' && isOwner && (
            <div>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4 sm:mb-6">
                <div className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">{applications.length}</div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400">{pendingCount}</div>
                  <div className="text-xs text-slate-500">Pending</div>
                </div>
                <div className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--primary))]">{shortlistedCount}</div>
                  <div className="text-xs text-slate-500">Shortlisted</div>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 bg-white/70 border border-slate-200 rounded-xl">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-600 text-sm">No applications yet</p>
                  <p className="text-slate-500 text-xs mt-1">VAs will appear here when they apply</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white/70 border border-slate-200 rounded-xl overflow-hidden"
                    >
                      {/* Main row */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Avatar */}
                          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-lg font-bold flex-shrink-0">
                            {app.va.profile?.full_name?.[0]?.toUpperCase() || 'V'}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <Link
                                    to={`/va/${app.va.id}`}
                                    className="font-semibold text-slate-900 hover:text-[hsl(var(--primary))] transition-colors"
                                  >
                                    {app.va.profile?.full_name || 'VA'}
                                  </Link>
                                  <VerificationBadge status={app.va.verification_status} />
                                </div>
                                {app.va.headline && (
                                  <p className="text-sm text-slate-600 line-clamp-1">{app.va.headline}</p>
                                )}
                              </div>
                              <ApplicationStatusBadge status={app.status} />
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs sm:text-sm text-slate-500">
                              {app.proposed_rate && (
                                <span className="text-[hsl(var(--primary))] font-medium">
                                  ${app.proposed_rate}/hr proposed
                                </span>
                              )}
                              {app.va.years_experience > 0 && (
                                <span>{app.va.years_experience} yrs exp</span>
                              )}
                              {app.va.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {app.va.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expand toggle */}
                        <button
                          onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          className="flex items-center gap-1 mt-3 text-sm text-slate-600 hover:text-slate-900"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedApp === app.id ? 'rotate-180' : ''}`} />
                          {expandedApp === app.id ? 'Hide' : 'View'} cover letter
                        </button>
                      </div>

                      {/* Expanded content */}
                      {expandedApp === app.id && (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-slate-200 pt-4">
                          <h4 className="text-sm font-medium text-slate-600 mb-2">Cover Letter</h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">
                            {app.cover_letter || 'No cover letter provided'}
                          </p>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/va/${app.va.id}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Profile
                            </Link>
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApplicationStatus(app.id, 'shortlisted')}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-sm hover:bg-[hsl(var(--primary))]/30"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => handleApplicationStatus(app.id, 'rejected')}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:text-red-400 hover:border-red-500/50"
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {app.status === 'shortlisted' && (
                              <button
                                onClick={() => handleApplicationStatus(app.id, 'hired')}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm hover:bg-[hsl(var(--primary))]/90"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark as Hired
                              </button>
                            )}
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                              <MessageCircle className="h-4 w-4" />
                              Message
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
    </AuthGuard>
  )
}
