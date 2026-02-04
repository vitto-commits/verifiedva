import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconX, IconMapPin, IconGlobe, IconBriefcase, IconMessage, IconCalendar, IconClock, IconCheckCircle, IconLoader, IconStar } from './icons'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { getSignedVideoUrl } from '../lib/storage'
import type { Skill } from '../types/database'

interface VAWithProfile {
  id: string
  user_id: string
  headline: string | null
  bio: string | null
  hourly_rate: number | null
  years_experience: number
  location: string | null
  timezone: string | null
  languages: string[]
  availability: string
  verification_status: string
  portfolio_url: string | null
  resume_url: string | null
  video_intro_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: { full_name: string | null; avatar_url: string | null }
  va_skills?: { 
    skill: Skill | null
    proficiency_level?: number
    verified_at?: string | null
    assessment_score?: number | null
  }[]
}

interface VAPreviewPanelProps {
  va: VAWithProfile | null
  onClose: () => void
}

const VerificationBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; bg: string; text: string; desc: string }> = {
    pending: { label: 'Pending', bg: 'bg-gray-500/20', text: 'text-slate-600', desc: 'Not verified' },
    verified: { label: '✓ Verified', bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]', desc: 'Identity confirmed' },
    pro: { label: '✓✓ Pro', bg: 'bg-blue-500/20', text: 'text-blue-400', desc: 'Skills tested' },
    elite: { label: '✓✓✓ Elite', bg: 'bg-[hsl(var(--secondary))]/20', text: 'text-purple-400', desc: 'Full background check' },
  }
  const c = config[status] || config.pending
  return (
    <div className={`inline-flex flex-col px-3 py-2 rounded-lg ${c.bg}`}>
      <span className={`font-semibold text-sm ${c.text}`}>{c.label}</span>
      <span className="text-xs text-slate-500">{c.desc}</span>
    </div>
  )
}

// Generate AI-like insights based on VA data
const generateInsights = (va: VAWithProfile): string => {
  const parts: string[] = []
  const name = va.profile?.full_name?.split(' ')[0] || 'This VA'
  
  // Skills insights
  const verifiedSkills = va.va_skills?.filter(vs => vs.verified_at) || []
  const topSkill = verifiedSkills.sort((a, b) => (b.assessment_score || 0) - (a.assessment_score || 0))[0]
  
  if (topSkill?.skill?.name && topSkill.assessment_score) {
    parts.push(`${name} excels at ${topSkill.skill.name} (${topSkill.assessment_score}% assessment score)`)
  } else if (va.va_skills && va.va_skills.length > 0) {
    const skillNames = va.va_skills.slice(0, 2).map(vs => vs.skill?.name).filter(Boolean)
    if (skillNames.length > 0) {
      parts.push(`${name} specializes in ${skillNames.join(' and ')}`)
    }
  }
  
  // Experience insights
  if (va.years_experience >= 5) {
    parts.push(`${va.years_experience}+ years of experience`)
  } else if (va.years_experience >= 2) {
    parts.push(`${va.years_experience} years in the field`)
  }
  
  // Availability insights
  if (va.availability === 'full-time') {
    parts.push('available for full-time engagement')
  }
  
  // Verification insights
  if (va.verification_status === 'elite') {
    parts.push('passed comprehensive background verification')
  } else if (va.verification_status === 'pro') {
    parts.push('skills independently verified')
  }
  
  if (parts.length === 0) {
    return `${name} is ready to help with your business needs.`
  }
  
  // Combine parts naturally
  if (parts.length === 1) return parts[0] + '.'
  if (parts.length === 2) return parts[0] + ', and ' + parts[1] + '.'
  return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1] + '.'
}

export default function VAPreviewPanel({ va, onClose }: VAPreviewPanelProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [startingChat, setStartingChat] = useState(false)
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null)

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (va) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [va])

  // Fetch signed video URL
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (va?.video_intro_url) {
        const url = await getSignedVideoUrl(va.video_intro_url)
        setSignedVideoUrl(url)
      } else {
        setSignedVideoUrl(null)
      }
    }
    fetchSignedUrl()
  }, [va?.video_intro_url])

  const handleStartConversation = async () => {
    if (!user || !va) {
      navigate('/login')
      return
    }

    setStartingChat(true)

    try {
      const { data: convId, error: convError } = await supabase
        .rpc('get_or_create_conversation', {
          user1: user.id,
          user2: va.user_id,
        })

      if (convError) {
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${user.id},participant_2.eq.${va.user_id}),and(participant_1.eq.${va.user_id},participant_2.eq.${user.id})`)
          .single()

        if (existing) {
          navigate(`/messages/${existing.id}`)
          return
        }

        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: va.user_id,
          })
          .select('id')
          .single()

        if (createError) throw createError
        navigate(`/messages/${newConv.id}`)
      } else {
        navigate(`/messages/${convId}`)
      }
    } catch (err) {
      console.error('Failed to start conversation:', err)
      setStartingChat(false)
    }
  }

  if (!va) return null

  const verifiedSkillsCount = va.va_skills?.filter(vs => vs.verified_at)?.length || 0
  const insights = generateInsights(va)

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0">
          <h2 className="font-semibold text-lg">VA Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <IconX className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-140px)]">
          <div className="p-4 space-y-4">
            {/* Profile Header */}
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {va.profile?.full_name?.[0]?.toUpperCase() || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold truncate">{va.profile?.full_name || 'VA'}</h3>
                {va.headline && (
                  <p className="text-slate-600 text-sm line-clamp-2">{va.headline}</p>
                )}
              </div>
            </div>

            {/* Trust Signals Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-[hsl(var(--primary))]">
                  {va.hourly_rate ? `$${va.hourly_rate}` : '—'}
                </div>
                <div className="text-xs text-slate-500">per hour</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-slate-900">
                  <span className="text-green-600">●</span> &lt;24h
                </div>
                <div className="text-xs text-slate-500">response</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-slate-900">
                  {verifiedSkillsCount}
                </div>
                <div className="text-xs text-slate-500">verified skills</div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <IconStar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-blue-600 mb-1">AI Insights</div>
                  <p className="text-sm text-slate-700">{insights}</p>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <VerificationBadge status={va.verification_status} />

            {/* Meta Info */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
              {va.location && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin className="h-4 w-4 text-slate-400" />
                  {va.location}
                </span>
              )}
              {va.timezone && (
                <span className="flex items-center gap-1.5">
                  <IconGlobe className="h-4 w-4 text-slate-400" />
                  {va.timezone}
                </span>
              )}
              {va.years_experience > 0 && (
                <span className="flex items-center gap-1.5">
                  <IconBriefcase className="h-4 w-4 text-slate-400" />
                  {va.years_experience}+ years
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <IconClock className="h-4 w-4 text-slate-400" />
                {va.availability?.replace('-', ' ')}
              </span>
            </div>

            {/* Video Intro */}
            {signedVideoUrl && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Video Introduction</h4>
                <div className="relative rounded-lg overflow-hidden bg-slate-100 aspect-video">
                  <video
                    src={signedVideoUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                </div>
              </div>
            )}

            {/* Bio */}
            {va.bio && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">About</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-6">{va.bio}</p>
              </div>
            )}

            {/* Skills */}
            {va.va_skills && va.va_skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {va.va_skills.map((vs) => (
                    <span
                      key={vs.skill?.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                        vs.verified_at 
                          ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30' 
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {vs.verified_at && <IconCheckCircle className="h-3 w-3" />}
                      {vs.skill?.name}
                      {vs.assessment_score && (
                        <span className="opacity-75">({vs.assessment_score}%)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {va.languages && va.languages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-1.5">
                  {va.languages.map((lang) => (
                    <span key={lang} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View Full Profile Link */}
            <Link
              to={`/va/${va.id}`}
              className="block text-center text-sm text-[hsl(var(--primary))] hover:underline py-2"
            >
              View full profile →
            </Link>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
          <div className="flex gap-3">
            <button
              onClick={handleStartConversation}
              disabled={startingChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold hover:bg-[hsl(var(--primary))]/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {startingChat ? (
                <IconLoader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <IconMessage className="h-5 w-5" />
                  Message
                </>
              )}
            </button>
            <Link
              to={`/book/${va.id}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              <IconCalendar className="h-5 w-5" />
              Interview
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
