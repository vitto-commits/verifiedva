import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Skill } from '../types/database'
import {
  IconEdit,
  IconExternalLink,
  IconLoader,
  IconCheckCircle,
  IconClock,
  IconX,
  IconSearch,
  IconAward,
  IconAlertCircle,
  IconVideo,
} from '../components/icons'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, vaProfile, clientProfile, loading: authLoading, refreshProfile } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // VA edit form
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [availability, setAvailability] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (vaProfile) {
      setHeadline(vaProfile.headline || '')
      setBio(vaProfile.bio || '')
      setHourlyRate(vaProfile.hourly_rate?.toString() || '')
      setAvailability(vaProfile.availability || 'full-time')
      setLocation(vaProfile.location || '')

      const fetchSkills = async () => {
        const { data } = await supabase
          .from('va_skills')
          .select('skill:skills(*)')
          .eq('va_id', vaProfile.id)
        if (data) {
          setSkills(data.map((d: any) => d.skill as Skill))
        }
      }
      fetchSkills()
    }
  }, [vaProfile])

  const handleSaveProfile = async () => {
    if (!vaProfile) return

    setSaving(true)
    try {
      await supabase
        .from('vas')
        .update({
          headline,
          bio,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          availability,
          location,
        })
        .eq('id', vaProfile.id)

      await refreshProfile()
      setEditMode(false)
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  if (!user || !profile) {
    return null
  }

  const isVA = profile.user_type === 'va'
  const isClient = profile.user_type === 'client'

  const getVerificationStatus = (vaProfile: any) => {
    // Verification now depends on video review status
    const videoStatus = vaProfile?.video_review_status
    
    if (videoStatus === 'approved') {
      return {
        icon: IconCheckCircle,
        color: 'text-[hsl(var(--primary))]',
        bg: 'bg-[hsl(var(--primary))]/10',
        label: 'Verified',
        desc: 'Your video has been approved'
      }
    }
    
    if (videoStatus === 'pending') {
      return {
        icon: IconClock,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        label: 'Video Review Pending',
        desc: 'Your video is being reviewed by our team'
      }
    }
    
    if (videoStatus === 'rejected') {
      return {
        icon: IconAlertCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        label: 'Video Rejected',
        desc: 'Please upload a new video that meets our guidelines'
      }
    }
    
    // No video uploaded yet
    return {
      icon: IconVideo,
      color: 'text-slate-400',
      bg: 'bg-slate-100',
      label: 'Not Verified',
      desc: 'Upload a video intro to get verified'
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-slate-600">
                Welcome back, {profile.full_name || user.email?.split('@')[0]}
              </p>
            </div>
            {isVA && vaProfile && (
              <Link
                to={`/va/${vaProfile.id}`}
                className="inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:text-emerald-300 py-1"
              >
                <IconExternalLink className="h-4 w-4" />
                View Public Profile
              </Link>
            )}
          </div>

          {/* Mobile: Account Summary Card */}
          <div className="lg:hidden mb-4">
            <div className="bg-white/70 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {profile.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{profile.full_name || 'User'}</div>
                  <div className="text-sm text-slate-600 truncate">{user.email}</div>
                </div>
                {isVA && vaProfile && (() => {
                  const status = getVerificationStatus(vaProfile)
                  return (
                    <span className={`px-2 py-1 text-xs rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  )
                })()}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* VA Profile Card */}
              {isVA && vaProfile && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold">Your VA Profile</h2>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 sm:gap-2 text-sm text-[hsl(var(--primary))] hover:text-emerald-300 py-1 px-2 -mr-2 rounded-lg active:bg-[hsl(var(--primary))]/10"
                      >
                        <IconEdit className="h-4 w-4" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditMode(false)}
                          className="p-2 text-slate-600 hover:text-white rounded-lg active:bg-slate-100"
                        >
                          <IconX className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="px-4 py-2 text-sm bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 font-medium"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Headline</label>
                        <input
                          type="text"
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-white text-base focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                          placeholder="e.g., Executive Virtual Assistant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-white h-24 resize-none text-base focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                          placeholder="Tell clients about yourself..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Rate ($/hr)</label>
                          <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-white text-base focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Availability</label>
                          <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-white text-base focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 appearance-none"
                          >
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-white text-base focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                          placeholder="e.g., Manila, Philippines"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs sm:text-sm text-slate-500">Headline</span>
                        <p className="text-white text-sm sm:text-base">{vaProfile.headline || <span className="text-slate-500">Not set</span>}</p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-slate-500">Bio</span>
                        <p className="text-white text-sm sm:text-base">{vaProfile.bio || <span className="text-slate-500">Not set</span>}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs sm:text-sm text-slate-500">Hourly Rate</span>
                          <p className="text-white text-sm sm:text-base">{vaProfile.hourly_rate ? `$${vaProfile.hourly_rate}/hr` : <span className="text-slate-500">Not set</span>}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-slate-500">Availability</span>
                          <p className="text-white text-sm sm:text-base capitalize">{vaProfile.availability?.replace('-', ' ') || <span className="text-slate-500">Not set</span>}</p>
                        </div>
                      </div>
                      {skills.length > 0 && (
                        <div>
                          <span className="text-xs sm:text-sm text-slate-500">Skills</span>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                            {skills.map((skill) => (
                              <span key={skill.id} className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Client Info Card */}
              {isClient && clientProfile && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Your Account</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <span className="text-xs sm:text-sm text-slate-500">Company</span>
                      <p className="text-white text-sm sm:text-base">{clientProfile.company_name || <span className="text-slate-500">Not set</span>}</p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-slate-500">Industry</span>
                      <p className="text-white text-sm sm:text-base">{clientProfile.industry || <span className="text-slate-500">Not set</span>}</p>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-slate-500">Company Size</span>
                      <p className="text-white text-sm sm:text-base">{clientProfile.company_size || <span className="text-slate-500">Not set</span>}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions - Client */}
              {isClient && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Link
                      to="/jobs/new"
                      className="p-4 rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 hover:border-[hsl(var(--primary))]/50 active:bg-[hsl(var(--primary))]/10 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">📝</div>
                      <div className="font-medium text-sm sm:text-base text-[hsl(var(--primary))]">Post a Job</div>
                    </Link>
                    <Link
                      to="/my-jobs"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-medium text-sm sm:text-base">My Jobs</div>
                    </Link>
                    <Link
                      to="/search"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <IconSearch className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                      <div className="font-medium text-sm sm:text-base">Browse VAs</div>
                    </Link>
                    <Link
                      to="/messages"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">💬</div>
                      <div className="font-medium text-sm sm:text-base">Messages</div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Actions - VA */}
              {isVA && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Link
                      to="/jobs"
                      className="p-4 rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 hover:border-[hsl(var(--primary))]/50 active:bg-[hsl(var(--primary))]/10 transition-colors text-center"
                    >
                      <IconSearch className="h-6 w-6 mx-auto mb-2 text-[hsl(var(--primary))]" />
                      <div className="font-medium text-sm sm:text-base text-[hsl(var(--primary))]">Browse Jobs</div>
                    </Link>
                    <Link
                      to="/my-applications"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-medium text-sm sm:text-base">My Applications</div>
                    </Link>
                    <Link
                      to="/assessments"
                      className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--secondary))]/10 to-[hsl(var(--secondary))]/10 border border-[hsl(var(--secondary))]/30 hover:border-[hsl(var(--secondary))]/50 active:bg-[hsl(var(--secondary))]/10 transition-colors text-center"
                    >
                      <IconAward className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                      <div className="font-medium text-sm sm:text-base text-purple-400">Skill Tests</div>
                    </Link>
                    <Link
                      to="/availability"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <IconClock className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                      <div className="font-medium text-sm sm:text-base">Set Availability</div>
                    </Link>
                    <Link
                      to="/video-intro"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">🎥</div>
                      <div className="font-medium text-sm sm:text-base">Video Intro</div>
                    </Link>
                    <Link
                      to="/my-interviews"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">📅</div>
                      <div className="font-medium text-sm sm:text-base">My Interviews</div>
                    </Link>
                    {vaProfile && (
                      <Link
                        to={`/va/${vaProfile.id}`}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                      >
                        <IconExternalLink className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                        <div className="font-medium text-sm sm:text-base">View Profile</div>
                      </Link>
                    )}
                    <Link
                      to="/messages"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">💬</div>
                      <div className="font-medium text-sm sm:text-base">Messages</div>
                    </Link>
                  </div>
                </div>
              )}

              {/* CTA for Client */}
              {isClient && (
                <Link
                  to="/jobs/new"
                  className="block w-full py-3.5 sm:py-4 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold text-center hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  Post a Job →
                </Link>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block space-y-6">
              {/* Account Card */}
              <div className="bg-white/70 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xl font-bold">
                    {profile.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{profile.full_name || 'User'}</div>
                    <div className="text-sm text-slate-600 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-500">Account Type</div>
                  <div className="font-medium capitalize">{profile.user_type}</div>
                </div>
              </div>

              {/* Verification Status (VA only) */}
              {isVA && vaProfile && (
                <div className="bg-white/70 border border-slate-200 rounded-2xl p-6">
                  <h3 className="font-medium mb-4">Verification Status</h3>
                  {(() => {
                    const status = getVerificationStatus(vaProfile)
                    const Icon = status.icon
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${status.color}`} />
                          <span className={`font-medium ${status.color}`}>{status.label}</span>
                        </div>
                        <p className="text-sm text-slate-600">{status.desc}</p>
                        {!vaProfile.video_review_status && (
                          <Link 
                            to="/video-intro"
                            className="block w-full mt-3 px-4 py-2.5 rounded-xl border border-[hsl(var(--primary))] text-[hsl(var(--primary))] text-sm font-medium text-center hover:bg-[hsl(var(--primary))]/10 active:bg-[hsl(var(--primary))]/20 transition-colors"
                          >
                            Upload Video Intro
                          </Link>
                        )}
                        {vaProfile.video_review_status === 'rejected' && (
                          <Link 
                            to="/video-intro"
                            className="block w-full mt-3 px-4 py-2.5 rounded-xl border border-[hsl(var(--primary))] text-[hsl(var(--primary))] text-sm font-medium text-center hover:bg-[hsl(var(--primary))]/10 active:bg-[hsl(var(--primary))]/20 transition-colors"
                          >
                            Upload New Video
                          </Link>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Profile Visibility (VA only) */}
              {isVA && vaProfile && (
                <div className="bg-white/70 border border-slate-200 rounded-2xl p-6">
                  <h3 className="font-medium mb-4">Profile Visibility</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Active & Searchable</span>
                    <div className={`w-3 h-3 rounded-full ${vaProfile.is_active ? 'bg-[hsl(var(--primary))]' : 'bg-gray-500'}`} />
                  </div>
                  {vaProfile.verification_status === 'pending' && (
                    <p className="text-xs text-slate-500 mt-2">
                      Complete verification to appear in search results
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: Verification Card (VA only) */}
            {isVA && vaProfile && (
              <div className="lg:hidden bg-white/70 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">Verification Status</h3>
                    {(() => {
                      const status = getVerificationStatus(vaProfile)
                      return (
                        <p className={`text-sm ${status.color}`}>{status.label}</p>
                      )
                    })()}
                  </div>
                  {!vaProfile.video_review_status && (
                    <Link 
                      to="/video-intro"
                      className="px-4 py-2 rounded-xl border border-[hsl(var(--primary))] text-[hsl(var(--primary))] text-sm font-medium active:bg-[hsl(var(--primary))]/10"
                    >
                      Upload Video
                    </Link>
                  )}
                  {vaProfile.video_review_status === 'rejected' && (
                    <Link 
                      to="/video-intro"
                      className="px-4 py-2 rounded-xl border border-[hsl(var(--primary))] text-[hsl(var(--primary))] text-sm font-medium active:bg-[hsl(var(--primary))]/10"
                    >
                      New Video
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
