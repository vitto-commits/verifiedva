import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  IconUsers, IconBriefcase, IconCheckCircle, IconClock,
  IconTrendingUp, IconShield, IconLoader, IconSearch,
  IconEye, IconBan, IconCheckCheck, IconVideo
} from '../components/icons'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import { getSignedVideoUrl } from '../lib/storage'

interface Stats {
  totalUsers: number
  totalVAs: number
  verifiedVAs: number
  pendingVAs: number
  totalClients: number
  totalJobs: number
  openJobs: number
  totalApplications: number
  pendingVideoReviews: number
}

interface VA {
  id: string
  user_id: string
  headline: string
  hourly_rate: number
  years_experience: number
  verification_status: string
  video_review_status: string | null
  video_intro_url: string | null
  created_at: string
  profile: {
    full_name: string
    email: string
    avatar_url: string
  }
  skills_count: number
}

interface User {
  id: string
  email: string
  full_name: string
  user_type: string
  is_admin: boolean
  created_at: string
}

type Tab = 'overview' | 'vas' | 'users' | 'jobs' | 'video_reviews'

export default function Admin() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [vas, setVAs] = useState<VA[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [pendingVideoReviews, setPendingVideoReviews] = useState<VA[]>([])
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      setIsAdmin(data?.is_admin || false)
      setCheckingAdmin(false)
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [user, authLoading])

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      if (!user) {
        navigate('/login')
      } else if (!isAdmin) {
        navigate('/dashboard')
      }
    }
  }, [user, isAdmin, authLoading, checkingAdmin, navigate])

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!isAdmin) return

      setLoading(true)

      // Get stats
      const [
        { count: totalUsers },
        { count: totalVAs },
        { count: verifiedVAs },
        { count: pendingVAs },
        { count: totalClients },
        { count: totalJobs },
        { count: openJobs },
        { count: totalApplications },
        { count: pendingVideoReviews }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vas').select('*', { count: 'exact', head: true }),
        supabase.from('vas').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('vas').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('vas').select('*', { count: 'exact', head: true }).eq('video_review_status', 'pending')
      ])

      setStats({
        totalUsers: totalUsers || 0,
        totalVAs: totalVAs || 0,
        verifiedVAs: verifiedVAs || 0,
        pendingVAs: pendingVAs || 0,
        totalClients: totalClients || 0,
        totalJobs: totalJobs || 0,
        openJobs: openJobs || 0,
        totalApplications: totalApplications || 0,
        pendingVideoReviews: pendingVideoReviews || 0
      })

      // Get VAs with profiles
      const { data: vasData } = await supabase
        .from('vas')
        .select(`
          *,
          profile:profiles!vas_user_id_fkey(full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (vasData) {
        // Get skill counts
        const vasWithSkills = await Promise.all(
          vasData.map(async (va) => {
            const { count } = await supabase
              .from('va_skills')
              .select('*', { count: 'exact', head: true })
              .eq('va_id', va.id)
            return { ...va, skills_count: count || 0 }
          })
        )
        setVAs(vasWithSkills)
      }

      // Get users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersData) {
        setUsers(usersData)
      }

      // Get pending video reviews
      const { data: pendingReviewsData } = await supabase
        .from('vas')
        .select(`
          *,
          profile:profiles!vas_user_id_fkey(full_name, email, avatar_url)
        `)
        .eq('video_review_status', 'pending')
        .order('created_at', { ascending: false })

      if (pendingReviewsData) {
        setPendingVideoReviews(pendingReviewsData)
        
        // Fetch signed URLs for videos
        const urls: Record<string, string> = {}
        await Promise.all(
          pendingReviewsData.map(async (va) => {
            if (va.video_intro_url) {
              const signedUrl = await getSignedVideoUrl(va.video_intro_url)
              if (signedUrl) urls[va.id] = signedUrl
            }
          })
        )
        setVideoUrls(urls)
      }

      setLoading(false)
    }

    loadData()
  }, [isAdmin])

  const updateVAStatus = async (vaId: string, status: 'verified' | 'rejected' | 'pending') => {
    setUpdating(vaId)
    
    const oldVA = vas.find(v => v.id === vaId)
    const { error } = await supabase
      .from('vas')
      .update({ verification_status: status })
      .eq('id', vaId)

    if (!error) {
      // Log audit event
      const actionMap = {
        verified: 'va.verify',
        rejected: 'va.reject',
        pending: 'va.set_pending',
      } as const
      await logAuditEvent({
        action: actionMap[status],
        targetType: 'va',
        targetId: vaId,
        details: { 
          oldStatus: oldVA?.verification_status,
          newStatus: status,
          vaName: oldVA?.profile?.full_name 
        },
      })

      setVAs(prev => prev.map(va => 
        va.id === vaId ? { ...va, verification_status: status } : va
      ))
      
      // Update stats
      if (stats) {
        let newStats = { ...stats }
        
        if (oldVA?.verification_status === 'verified') newStats.verifiedVAs--
        if (oldVA?.verification_status === 'pending') newStats.pendingVAs--
        
        if (status === 'verified') newStats.verifiedVAs++
        if (status === 'pending') newStats.pendingVAs++
        
        setStats(newStats)
      }
    }
    
    setUpdating(null)
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    
    const targetUser = users.find(u => u.id === userId)
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)

    if (!error) {
      // Log audit event
      await logAuditEvent({
        action: currentStatus ? 'user.revoke_admin' : 'user.grant_admin',
        targetType: 'user',
        targetId: userId,
        details: { 
          userName: targetUser?.full_name,
          userEmail: targetUser?.email 
        },
      })

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_admin: !currentStatus } : u
      ))
    }
    
    setUpdating(null)
  }

  const approveVideoReview = async (vaId: string) => {
    if (!confirm('Approve this video intro? The VA will be verified.')) return
    
    setUpdating(vaId)
    
    const va = pendingVideoReviews.find(v => v.id === vaId)
    const { error } = await supabase
      .from('vas')
      .update({ 
        video_review_status: 'approved',
        is_verified: true
      })
      .eq('id', vaId)

    if (!error) {
      await logAuditEvent({
        action: 'va.video_approved',
        targetType: 'va',
        targetId: vaId,
        details: { 
          vaName: va?.profile?.full_name,
          vaEmail: va?.profile?.email
        },
      })

      // Remove from pending list
      setPendingVideoReviews(prev => prev.filter(v => v.id !== vaId))
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingVideoReviews: stats.pendingVideoReviews - 1,
          verifiedVAs: stats.verifiedVAs + 1
        })
      }
    }
    
    setUpdating(null)
  }

  const rejectVideoReview = async (vaId: string) => {
    if (!confirm('Reject this video intro? The VA will need to upload a new video.')) return
    
    setUpdating(vaId)
    
    const va = pendingVideoReviews.find(v => v.id === vaId)
    const { error } = await supabase
      .from('vas')
      .update({ 
        video_review_status: 'rejected',
        is_verified: false
      })
      .eq('id', vaId)

    if (!error) {
      await logAuditEvent({
        action: 'va.video_rejected',
        targetType: 'va',
        targetId: vaId,
        details: { 
          vaName: va?.profile?.full_name,
          vaEmail: va?.profile?.email
        },
      })

      // Remove from pending list
      setPendingVideoReviews(prev => prev.filter(v => v.id !== vaId))
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingVideoReviews: stats.pendingVideoReviews - 1
        })
      }
    }
    
    setUpdating(null)
  }

  const filteredVAs = vas.filter(va => {
    const matchesSearch = 
      va.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      va.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      va.headline?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || va.verification_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || checkingAdmin) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[hsl(var(--primary))]/10">
            <IconShield className="h-6 w-6 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Manage VAs, users, and platform settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/50 p-1 rounded-xl w-fit overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: IconTrendingUp },
            { id: 'video_reviews', label: 'Video Reviews', icon: IconVideo, badge: stats?.pendingVideoReviews },
            { id: 'vas', label: 'VAs', icon: IconUsers },
            { id: 'users', label: 'Users', icon: IconUsers },
            { id: 'jobs', label: 'Jobs', icon: IconBriefcase }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors relative ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id 
                    ? 'bg-white text-[hsl(var(--primary))]' 
                    : 'bg-[hsl(var(--primary))] text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Total Users" 
              value={stats.totalUsers} 
              icon={IconUsers}
              color="blue"
            />
            <StatCard 
              label="Total VAs" 
              value={stats.totalVAs} 
              icon={IconUsers}
              color="emerald"
            />
            <StatCard 
              label="Verified VAs" 
              value={stats.verifiedVAs} 
              icon={IconCheckCircle}
              color="green"
            />
            <StatCard 
              label="Pending VAs" 
              value={stats.pendingVAs} 
              icon={IconClock}
              color="yellow"
            />
            <StatCard 
              label="Total Clients" 
              value={stats.totalClients} 
              icon={IconBriefcase}
              color="purple"
            />
            <StatCard 
              label="Total Jobs" 
              value={stats.totalJobs} 
              icon={IconBriefcase}
              color="indigo"
            />
            <StatCard 
              label="Open Jobs" 
              value={stats.openJobs} 
              icon={IconBriefcase}
              color="cyan"
            />
            <StatCard 
              label="Applications" 
              value={stats.totalApplications} 
              icon={IconTrendingUp}
              color="pink"
            />
          </div>
        )}

        {/* Video Reviews Tab */}
        {activeTab === 'video_reviews' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600 mb-4">
              {pendingVideoReviews.length} video{pendingVideoReviews.length !== 1 ? 's' : ''} pending review
            </div>

            {pendingVideoReviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <IconVideo className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">No pending video reviews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVideoReviews.map(va => (
                  <div key={va.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    {/* VA Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {va.profile?.full_name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{va.profile?.full_name}</div>
                        <div className="text-sm text-slate-500">{va.profile?.email}</div>
                        {va.headline && (
                          <div className="text-sm text-slate-600 mt-1">{va.headline}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Submitted</div>
                        <div className="text-sm text-slate-700">
                          {new Date(va.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Video Player */}
                    {videoUrls[va.id] ? (
                      <div className="mb-4 rounded-xl overflow-hidden bg-slate-900 aspect-video">
                        <video
                          src={videoUrls[va.id]}
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                        />
                      </div>
                    ) : (
                      <div className="mb-4 rounded-xl bg-slate-100 aspect-video flex items-center justify-center">
                        <IconLoader className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => approveVideoReview(va.id)}
                        disabled={updating === va.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating === va.id ? (
                          <IconLoader className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <IconCheckCircle className="h-5 w-5" />
                            Approve & Verify
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => rejectVideoReview(va.id)}
                        disabled={updating === va.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating === va.id ? (
                          <IconLoader className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <IconBan className="h-5 w-5" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VAs Tab */}
        {activeTab === 'vas' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search VAs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* VA List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">VA</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Rate</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Skills</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVAs.map(va => (
                      <tr key={va.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-bold">
                              {va.profile?.full_name?.[0] || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{va.profile?.full_name}</div>
                              <div className="text-xs text-slate-500">{va.profile?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">${va.hourly_rate}/hr</td>
                        <td className="px-4 py-3 text-slate-700">{va.skills_count} skills</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={va.verification_status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {va.verification_status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateVAStatus(va.id, 'verified')}
                                  disabled={updating === va.id}
                                  className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-50"
                                  title="Approve"
                                >
                                  {updating === va.id ? (
                                    <IconLoader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <IconCheckCheck className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => updateVAStatus(va.id, 'rejected')}
                                  disabled={updating === va.id}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <IconBan className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {va.verification_status === 'verified' && (
                              <button
                                onClick={() => updateVAStatus(va.id, 'pending')}
                                disabled={updating === va.id}
                                className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 disabled:opacity-50"
                                title="Revoke Verification"
                              >
                                <IconClock className="h-4 w-4" />
                              </button>
                            )}
                            {va.verification_status === 'rejected' && (
                              <button
                                onClick={() => updateVAStatus(va.id, 'pending')}
                                disabled={updating === va.id}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 disabled:opacity-50"
                                title="Re-review"
                              >
                                <IconEye className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredVAs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No VAs found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">User</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Joined</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Admin</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-slate-900">{u.full_name || 'No name'}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.user_type === 'va' 
                              ? 'bg-[hsl(var(--primary))]/10 text-emerald-600' 
                              : 'bg-blue-500/10 text-blue-600'
                          }`}>
                            {u.user_type === 'va' ? 'VA' : 'Client'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {u.is_admin ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[hsl(var(--secondary))]/10 text-purple-600">
                              Admin
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => toggleAdmin(u.id, u.is_admin)}
                              disabled={updating === u.id || u.id === user?.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                                u.is_admin
                                  ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                  : 'bg-[hsl(var(--secondary))]/10 text-purple-600 hover:bg-[hsl(var(--secondary))]/20'
                              }`}
                            >
                              {updating === u.id ? (
                                <IconLoader className="h-3 w-3 animate-spin" />
                              ) : u.is_admin ? (
                                'Remove Admin'
                              ) : (
                                'Make Admin'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="text-center py-12 text-slate-500">
            <IconBriefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Jobs management coming soon</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function StatCard({ label, value, icon: Icon, color }: { 
  label: string
  value: number
  icon: any
  color: string 
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600',
    emerald: 'bg-[hsl(var(--primary))]/10 text-emerald-600',
    green: 'bg-green-500/10 text-green-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    purple: 'bg-[hsl(var(--secondary))]/10 text-purple-600',
    indigo: 'bg-indigo-500/10 text-indigo-600',
    cyan: 'bg-[hsl(var(--secondary))]/10 text-cyan-600',
    pink: 'bg-pink-500/10 text-pink-600'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Pending' },
    verified: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Verified' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Rejected' }
  }

  const { bg, text, label } = config[status] || config.pending

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
