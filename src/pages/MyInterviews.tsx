import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconCalendar, IconClock, IconVideo, IconMessage, IconX, IconLoader, IconCheckCircle, IconAlertCircle } from '../components/icons'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Interview {
  id: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  meeting_link: string | null
  notes: string | null
  job: {
    id: string
    title: string
  } | null
  // For clients
  va?: {
    id: string
    profile: {
      id: string
      full_name: string | null
    }
  }
  // For VAs
  client?: {
    id: string
    company_name: string | null
    user_id: string
    profile: {
      id: string
      full_name: string | null
    }
  }
}

const statusConfig = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-500/20', text: 'text-blue-400', icon: IconCalendar },
  completed: { label: 'Completed', bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]', icon: IconCheckCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-500/20', text: 'text-slate-600', icon: IconX },
  no_show: { label: 'No Show', bg: 'bg-red-500/20', text: 'text-red-400', icon: IconAlertCircle },
}

export default function MyInterviews() {
  const navigate = useNavigate()
  const { user, profile, vaProfile, clientProfile, loading: authLoading } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user || !profile) return

      let query = supabase.from('interviews').select(`
        *,
        job:jobs(id, title)
      `)

      if (profile.user_type === 'va' && vaProfile) {
        query = query
          .eq('va_id', vaProfile.id)
          .select(`
            *,
            job:jobs(id, title),
            client:clients!interviews_client_id_fkey(
              id,
              company_name,
              user_id,
              profile:profiles!clients_user_id_fkey(id, full_name)
            )
          `)
      } else if (profile.user_type === 'client' && clientProfile) {
        query = query
          .eq('client_id', clientProfile.id)
          .select(`
            *,
            job:jobs(id, title),
            va:vas!interviews_va_id_fkey(
              id,
              profile:profiles!vas_user_id_fkey(id, full_name)
            )
          `)
      }

      const { data } = await query.order('scheduled_at', { ascending: true })

      if (data) {
        setInterviews(data)
      }
      setLoading(false)
    }

    if (user && profile && (vaProfile || clientProfile)) {
      fetchInterviews()
    } else if (!authLoading && user && profile) {
      // User exists but no VA/client profile yet
      setLoading(false)
    }
  }, [user, profile, vaProfile, clientProfile, authLoading])

  const now = new Date()
  const upcomingInterviews = interviews.filter(
    i => new Date(i.scheduled_at) >= now && i.status === 'scheduled'
  )
  const pastInterviews = interviews.filter(
    i => new Date(i.scheduled_at) < now || i.status !== 'scheduled'
  )

  const handleCancel = async (interviewId: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return

    setCancelling(interviewId)
    
    const { error } = await supabase
      .from('interviews')
      .update({
        status: 'cancelled',
        cancelled_by: user?.id,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', interviewId)

    if (!error) {
      setInterviews(interviews.map(i => 
        i.id === interviewId ? { ...i, status: 'cancelled' as const } : i
      ))
    }
    
    setCancelling(null)
  }

  const handleMessageOther = async (otherUserId: string) => {
    const { data: convId } = await supabase
      .rpc('get_or_create_conversation', {
        user1: user!.id,
        user2: otherUserId,
      })

    if (convId) {
      navigate(`/messages/${convId}`)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }
  }

  const isVA = profile?.user_type === 'va'

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  const displayInterviews = activeTab === 'upcoming' ? upcomingInterviews : pastInterviews

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Interviews</h1>
              <p className="text-slate-600 text-sm">
                {upcomingInterviews.length} upcoming, {pastInterviews.length} past
              </p>
            </div>
            {isVA && (
              <Link
                to="/availability"
                className="px-4 py-2 rounded-lg bg-white text-slate-700 text-sm font-medium hover:bg-slate-100"
              >
                Set Availability
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/70 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-slate-100 text-white'
                  : 'text-slate-600 hover:text-white'
              }`}
            >
              Upcoming ({upcomingInterviews.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-slate-100 text-white'
                  : 'text-slate-600 hover:text-white'
              }`}
            >
              Past ({pastInterviews.length})
            </button>
          </div>

          {/* Interviews List */}
          {displayInterviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-white/70 mb-4">
                <IconCalendar className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {activeTab === 'upcoming' ? 'No upcoming interviews' : 'No past interviews'}
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                {activeTab === 'upcoming'
                  ? isVA
                    ? 'Make sure your availability is set so clients can book'
                    : 'Browse VAs and schedule interviews with candidates'
                  : 'Your interview history will appear here'}
              </p>
              {activeTab === 'upcoming' && (
                <Link
                  to={isVA ? '/availability' : '/search'}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium"
                >
                  {isVA ? 'Set Availability' : 'Browse VAs'}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayInterviews.map((interview) => {
                const { date, time } = formatDateTime(interview.scheduled_at)
                const status = statusConfig[interview.status]
                const StatusIcon = status.icon
                const otherName = isVA
                  ? interview.client?.company_name || interview.client?.profile?.full_name
                  : interview.va?.profile?.full_name
                const otherUserId = isVA
                  ? interview.client?.user_id
                  : interview.va?.profile?.id

                return (
                  <div
                    key={interview.id}
                    className="bg-white/70 border border-slate-200 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-medium text-lg">{otherName || 'Unknown'}</div>
                        <div className="text-sm text-slate-600">
                          {isVA ? 'Client' : 'Virtual Assistant'}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.text} text-xs font-medium`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <IconCalendar className="h-4 w-4 text-slate-500" />
                        {date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <IconClock className="h-4 w-4 text-slate-500" />
                        {time} ({interview.duration_minutes} min)
                      </div>
                    </div>

                    {/* Job reference */}
                    {interview.job && (
                      <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 text-sm">
                        <span className="text-slate-500">Regarding: </span>
                        <Link to={`/jobs/${interview.job.id}`} className="text-[hsl(var(--primary))] hover:underline">
                          {interview.job.title}
                        </Link>
                      </div>
                    )}

                    {/* Notes */}
                    {interview.notes && (
                      <div className="mb-4 text-sm text-slate-600">
                        <span className="text-slate-500">Notes: </span>
                        {interview.notes}
                      </div>
                    )}

                    {/* Actions */}
                    {interview.status === 'scheduled' && (
                      <div className="flex flex-wrap gap-2">
                        {interview.meeting_link && (
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary))]/20"
                          >
                            <IconVideo className="h-4 w-4" />
                            Join Call
                          </a>
                        )}
                        {otherUserId && (
                          <button
                            onClick={() => handleMessageOther(otherUserId)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100"
                          >
                            <IconMessage className="h-4 w-4" />
                            Message
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(interview.id)}
                          disabled={cancelling === interview.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {cancelling === interview.id ? (
                            <IconLoader className="h-4 w-4 animate-spin" />
                          ) : (
                            <IconX className="h-4 w-4" />
                          )}
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
