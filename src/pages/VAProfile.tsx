import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, MessageCircle, Globe, Briefcase, Loader2, ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { VA, Skill, Profile } from '../types/database'

interface VAWithDetails extends VA {
  profile: Profile
  va_skills: { skill: Skill; proficiency_level: number }[]
}

const VerificationBadge = ({ status, compact = false }: { status: string; compact?: boolean }) => {
  const config: Record<string, { label: string; bg: string; text: string; desc: string }> = {
    pending: { label: 'Pending', bg: 'bg-gray-500/20', text: 'text-slate-600', desc: 'Identity not yet verified' },
    verified: { label: '✓ Verified', bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]', desc: 'Identity & education confirmed' },
    pro: { label: '✓✓ Pro', bg: 'bg-blue-500/20', text: 'text-blue-400', desc: 'Skills tested & 2+ references' },
    elite: { label: '✓✓✓ Elite', bg: 'bg-purple-500/20', text: 'text-purple-400', desc: 'Background check & interview' },
  }
  const c = config[status] || config.pending

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    )
  }

  return (
    <div className={`inline-flex flex-col items-start px-3 py-2 rounded-lg ${c.bg}`}>
      <span className={`font-semibold text-sm ${c.text}`}>{c.label}</span>
      <span className="text-xs text-slate-500">{c.desc}</span>
    </div>
  )
}

export default function VAProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [va, setVa] = useState<VAWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [startingChat, setStartingChat] = useState(false)

  const handleStartConversation = async () => {
    if (!user || !va) {
      navigate('/login')
      return
    }

    setStartingChat(true)

    try {
      // Get or create conversation
      const { data: convId, error: convError } = await supabase
        .rpc('get_or_create_conversation', {
          user1: user.id,
          user2: va.profile.id,
        })

      if (convError) {
        // Fallback: try to find existing conversation
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${user.id},participant_2.eq.${va.profile.id}),and(participant_1.eq.${va.profile.id},participant_2.eq.${user.id})`)
          .single()

        if (existing) {
          navigate(`/messages/${existing.id}`)
          return
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: va.profile.id,
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

  useEffect(() => {
    const fetchVA = async () => {
      if (!id) return

      setLoading(true)
      const { data, error } = await supabase
        .from('vas')
        .select(`
          *,
          profile:profiles(*),
          va_skills(
            proficiency_level,
            skill:skills(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        setError('VA not found')
      } else {
        setVa(data as VAWithDetails)
      }
      setLoading(false)
    }

    fetchVA()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  if (error || !va) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-slate-600 mb-4 text-center">{error || 'VA not found'}</p>
          <Link 
            to="/search" 
            className="flex items-center gap-2 text-[hsl(var(--primary))] hover:text-emerald-300 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
        </div>
      </Layout>
    )
  }

  const skillsByCategory = va.va_skills?.reduce((acc, vs) => {
    const cat = vs.skill?.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(vs)
    return acc
  }, {} as Record<string, typeof va.va_skills>)

  return (
    <Layout>
      {/* Mobile-friendly padding bottom for sticky CTA */}
      <div className="pb-24 lg:pb-0">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          {/* Back button */}
          <Link 
            to="/search" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-white mb-4 sm:mb-6 transition-colors py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to search</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Header Card */}
              <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Avatar + Mobile badge */}
                  <div className="flex items-start gap-4 sm:block">
                    <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-2xl sm:text-3xl font-bold text-white flex-shrink-0">
                      {va.profile?.full_name?.[0]?.toUpperCase() || 'V'}
                    </div>
                    {/* Mobile: Name + Badge */}
                    <div className="sm:hidden flex-1 min-w-0">
                      <h1 className="text-xl font-bold truncate">{va.profile?.full_name || 'VA'}</h1>
                      <div className="mt-1">
                        <VerificationBadge status={va.verification_status} compact />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Desktop: Name */}
                    <h1 className="hidden sm:block text-2xl font-bold mb-2">{va.profile?.full_name || 'VA'}</h1>
                    
                    {va.headline && (
                      <p className="text-base sm:text-lg text-slate-600 mb-3">{va.headline}</p>
                    )}
                    
                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      {va.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {va.location}
                        </span>
                      )}
                      {va.timezone && (
                        <span className="flex items-center gap-1.5">
                          <Globe className="h-4 w-4" />
                          {va.timezone}
                        </span>
                      )}
                      {va.years_experience > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          {va.years_experience}+ years
                        </span>
                      )}
                    </div>
                    
                    {/* Desktop badge */}
                    <div className="hidden sm:block mt-4">
                      <VerificationBadge status={va.verification_status} compact />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats - Mobile */}
              <div className="grid grid-cols-3 gap-2 lg:hidden">
                {va.hourly_rate && (
                  <div className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-[hsl(var(--primary))]">${va.hourly_rate}</div>
                    <div className="text-xs text-slate-500">per hour</div>
                  </div>
                )}
                <div className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-white capitalize">
                    {va.availability?.split('-')[0] || 'Any'}
                  </div>
                  <div className="text-xs text-slate-500">availability</div>
                </div>
                <div className="bg-white/70 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-lg sm:text-xl font-bold text-white">24h</div>
                  <div className="text-xs text-slate-500">response</div>
                </div>
              </div>

              {/* Bio */}
              {va.bio && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">About</h2>
                  <p className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap leading-relaxed">{va.bio}</p>
                </div>
              )}

              {/* Video Intro */}
              {va.video_intro_url && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Video Introduction</h2>
                  <div className="relative rounded-xl overflow-hidden bg-white aspect-video">
                    <video
                      src={va.video_intro_url}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      poster=""
                    />
                  </div>
                </div>
              )}

              {/* Skills */}
              {va.va_skills && va.va_skills.length > 0 && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Skills</h2>
                  <div className="space-y-4">
                    {Object.entries(skillsByCategory || {}).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="text-xs sm:text-sm font-medium text-slate-500 mb-2">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((vs) => (
                            <span
                              key={vs.skill?.id}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm"
                            >
                              {vs.skill?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {va.languages && va.languages.length > 0 && (
                <div className="bg-white/70 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {va.languages.map((lang) => (
                      <span key={lang} className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block space-y-6">
              {/* Contact Card */}
              <div className="bg-white/70 border border-slate-200 rounded-2xl p-6 sticky top-24">
                {va.hourly_rate && (
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-[hsl(var(--primary))]">${va.hourly_rate}</div>
                    <div className="text-slate-500">per hour</div>
                  </div>
                )}

                <button 
                  onClick={handleStartConversation}
                  disabled={startingChat}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r to-[hsl(var(--secondary))] to-[hsl(var(--secondary))] text-white font-medium hover:from-emerald-600 hover:to-cyan-600 active:scale-[0.98] transition-all mb-3 disabled:opacity-50"
                >
                  {startingChat ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5" />
                      Contact {va.profile?.full_name?.split(' ')[0] || 'VA'}
                    </>
                  )}
                </button>

                <Link
                  to={`/book/${va.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-white font-medium hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  <Calendar className="h-5 w-5" />
                  Schedule Interview
                </Link>

                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Availability
                    </span>
                    <span className="text-white font-medium capitalize">
                      {va.availability?.replace('-', ' ') || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Avg Response</span>
                    <span className="text-white font-medium">Within 24 hours</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member since
                    </span>
                    <span className="text-white font-medium">
                      {new Date(va.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-600 mb-3">Verification Status</h3>
                  <VerificationBadge status={va.verification_status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 p-4 z-40">
        <div className="flex items-center gap-3">
          {va.hourly_rate && (
            <div className="min-w-0">
              <div className="text-xl font-bold text-[hsl(var(--primary))]">${va.hourly_rate}<span className="text-sm font-normal text-slate-500">/hr</span></div>
            </div>
          )}
          <button 
            onClick={handleStartConversation}
            disabled={startingChat}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r to-[hsl(var(--secondary))] to-[hsl(var(--secondary))] text-white font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {startingChat ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <MessageCircle className="h-5 w-5" />
                Contact
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  )
}
