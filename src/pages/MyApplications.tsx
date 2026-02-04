import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconBriefcase, IconClock, IconDollar, IconLoader, IconCheckCircle, IconXCircle, IconStar, IconMessage } from '../components/icons'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Application {
  id: string
  job_id: string
  cover_letter: string | null
  proposed_rate: number | null
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired'
  created_at: string
  job: {
    id: string
    title: string
    description: string
    budget_type: 'hourly' | 'fixed'
    budget_min: number | null
    budget_max: number | null
    status: string
    client: {
      id: string
      company_name: string | null
      user_id: string
      profile: {
        full_name: string | null
      }
    }
  }
}

const statusConfig: Record<string, { label: string; icon: typeof IconClock; bg: string; text: string }> = {
  pending: { label: 'Pending', icon: IconClock, bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  shortlisted: { label: 'Shortlisted', icon: IconStar, bg: 'bg-blue-500/20', text: 'text-blue-400' },
  rejected: { label: 'Not Selected', icon: IconXCircle, bg: 'bg-gray-500/20', text: 'text-slate-600' },
  hired: { label: 'Hired!', icon: IconCheckCircle, bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]' },
}

export default function MyApplications() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (!authLoading && profile?.user_type !== 'va') {
      navigate('/dashboard')
      return
    }
  }, [user, profile, authLoading, navigate])

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      // Get VA ID first
      const { data: vaData } = await supabase
        .from('vas')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!vaData) {
        setLoading(false)
        return
      }

      // Fetch applications with job details
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs (
            id,
            title,
            description,
            budget_type,
            budget_min,
            budget_max,
            status,
            client:clients!jobs_client_id_fkey (
              id,
              company_name,
              user_id,
              profile:profiles!clients_user_id_fkey (
                full_name
              )
            )
          )
        `)
        .eq('va_id', vaData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error)
      } else {
        setApplications(data || [])
      }

      setLoading(false)
    }

    if (user) {
      fetchApplications()
    }
  }, [user])

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return ['pending', 'shortlisted'].includes(app.status)
    if (activeTab === 'closed') return ['rejected', 'hired'].includes(app.status) || app.job.status !== 'open'
    return true
  })

  const formatBudget = (job: Application['job']) => {
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
    return 'Not specified'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleMessageClient = async (clientUserId: string) => {
    // Get or create conversation with client
    const { data: convId } = await supabase
      .rpc('get_or_create_conversation', {
        user1: user!.id,
        user2: clientUserId,
      })

    if (convId) {
      navigate(`/messages/${convId}`)
    }
  }

  const counts = {
    all: applications.length,
    active: applications.filter(a => ['pending', 'shortlisted'].includes(a.status)).length,
    closed: applications.filter(a => ['rejected', 'hired'].includes(a.status) || a.job.status !== 'open').length,
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-slate-600">
            Track the status of jobs you've applied to
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/70 rounded-xl mb-6 overflow-x-auto">
          {(['all', 'active', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-2xl bg-white/70 mb-4">
              <IconBriefcase className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications`}
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              {activeTab === 'all'
                ? 'Start applying to jobs to see them here'
                : 'Check other tabs for your applications'}
            </p>
            {activeTab === 'all' && (
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:bg-[hsl(var(--primary))]/90"
              >
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.pending
              const StatusIcon = status.icon
              const jobClosed = app.job.status !== 'open'

              return (
                <div
                  key={app.id}
                  className={`bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
                    jobClosed && app.status === 'pending' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {app.job.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600">
                        {app.job.client?.company_name || app.job.client?.profile?.full_name || 'Client'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.text} text-xs font-medium flex-shrink-0`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </div>
                  </div>

                  {/* Job Closed Notice */}
                  {jobClosed && app.status === 'pending' && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs">
                      This job has been {app.job.status === 'filled' ? 'filled' : 'closed'}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <IconDollar className="h-3.5 w-3.5" />
                      {formatBudget(app.job)}
                    </span>
                    {app.proposed_rate && (
                      <span className="flex items-center gap-1">
                        Your rate: ${app.proposed_rate}{app.job.budget_type === 'hourly' ? '/hr' : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <IconClock className="h-3.5 w-3.5" />
                      Applied {formatDate(app.created_at)}
                    </span>
                  </div>

                  {/* Cover Letter Preview */}
                  {app.cover_letter && (
                    <div className="mb-4 p-3 rounded-lg bg-white/70 border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Your cover letter:</p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {(app.status === 'shortlisted' || app.status === 'hired') && (
                      <button
                        onClick={() => handleMessageClient(app.job.client.user_id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary))]/20 transition-colors"
                      >
                        <IconMessage className="h-4 w-4" />
                        Message Client
                      </button>
                    )}
                    <Link
                      to={`/jobs/${app.job.id}/apply`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
