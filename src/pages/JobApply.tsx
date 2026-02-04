import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { notifyJobApplication } from '../lib/email'

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
    user_id: string
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
}

export default function JobApply() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [vaId, setVaId] = useState<string | null>(null)

  // Form state
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (!authLoading && profile?.user_type !== 'va') {
      navigate('/jobs')
      return
    }
  }, [user, profile, authLoading, navigate])

  useEffect(() => {
    const fetchJob = async () => {
      if (!id || !user) return

      // Get job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients!jobs_client_id_fkey (
            id,
            user_id,
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
        .eq('id', id)
        .single()

      if (jobError || !jobData) {
        setError('Job not found')
        setLoading(false)
        return
      }

      setJob(jobData)

      // Get VA ID
      const { data: vaData } = await supabase
        .from('vas')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (vaData) {
        setVaId(vaData.id)

        // Check if already applied
        const { data: existingApp } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', id)
          .eq('va_id', vaData.id)
          .single()

        if (existingApp) {
          setAlreadyApplied(true)
        }
      }

      setLoading(false)
    }

    if (user) {
      fetchJob()
    }
  }, [id, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !vaId || submitting) return

    setSubmitting(true)
    setError('')

    const { error: submitError } = await supabase
      .from('job_applications')
      .insert({
        job_id: job.id,
        va_id: vaId,
        cover_letter: coverLetter.trim() || null,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
        status: 'pending',
      })

    if (submitError) {
      console.error('Submit error:', submitError)
      setError('Failed to submit application. Please try again.')
      setSubmitting(false)
      return
    }

    // Send email notification to client (fire and forget)
    if (job.client?.user_id) {
      notifyJobApplication({
        clientUserId: job.client.user_id,
        clientName: job.client.company_name || job.client.profile?.full_name || 'there',
        applicantName: profile?.full_name || 'A VA',
        jobTitle: job.title,
        jobId: job.id,
        proposedRate: proposedRate ? parseFloat(proposedRate) : null,
      }).catch(console.error)
    }

    setSuccess(true)
  }

  const formatBudget = (job: Job) => {
    if (job.budget_type === 'hourly') {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min}-${job.budget_max}/hr`
      } else if (job.budget_min) {
        return `$${job.budget_min}+/hr`
      }
    } else {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min.toLocaleString()}-${job.budget_max.toLocaleString()} fixed`
      } else if (job.budget_min) {
        return `$${job.budget_min.toLocaleString()}+ fixed`
      }
    }
    return 'Budget not specified'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  if (error && !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex p-4 rounded-2xl bg-red-500/10 mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">{error}</h1>
            <Link
              to="/jobs"
              className="text-[hsl(var(--primary))] hover:opacity-80"
            >
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  if (success) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex p-4 rounded-2xl bg-[hsl(var(--primary))]/10 mb-4">
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
            <p className="text-slate-600 mb-6">
              Your application for "{job?.title}" has been sent to the client.
              They'll review it and reach out if interested.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-50 border border-slate-200"
              >
                Browse More Jobs
              </Link>
              <Link
                to="/my-applications"
                className="px-6 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:bg-[hsl(var(--primary))]/90"
              >
                View My Applications
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!job) return null

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          {/* Job Header */}
          <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{job.title}</h1>
            <p className="text-slate-600 mb-4">
              {job.client?.company_name || job.client?.profile?.full_name || 'Client'}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 mb-4">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {formatBudget(job)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Posted {formatDate(job.created_at)}
              </span>
            </div>

            {/* Skills */}
            {job.job_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.job_skills.map((js) => (
                  <span
                    key={js.skill.id}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs"
                  >
                    {js.skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
            <h2 className="font-semibold mb-3">Job Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Application Form */}
          {alreadyApplied ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Already Applied</h3>
              <p className="text-slate-600 text-sm mb-4">
                You've already submitted an application for this job.
              </p>
              <Link
                to="/my-applications"
                className="text-[hsl(var(--primary))] hover:opacity-80 text-sm"
              >
                View My Applications →
              </Link>
            </div>
          ) : job.status !== 'open' ? (
            <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Job No Longer Available</h3>
              <p className="text-slate-600 text-sm">
                This position has been {job.status === 'filled' ? 'filled' : 'closed'}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h2 className="font-semibold mb-4">Your Application</h2>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Cover Letter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself and explain why you're a great fit for this role..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 resize-none text-base"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Highlight relevant experience and what makes you unique
                  </p>
                </div>

                {/* Proposed Rate */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Rate {job.budget_type === 'hourly' ? '(per hour)' : '(total)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                      placeholder={job.budget_min ? String(job.budget_min) : '0'}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-base"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Client's budget: {formatBudget(job)}
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold text-lg hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
