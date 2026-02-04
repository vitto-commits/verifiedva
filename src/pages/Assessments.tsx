import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconAward, IconCheckCircle, IconClock, IconLock, IconLoader, IconChevronRight, IconAlertCircle, IconStar } from '../components/icons'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface AssessmentSkill {
  id: string
  name: string
  category: string
  config?: {
    questions_per_test: number
    time_limit_minutes: number
    passing_score: number
    retry_wait_hours: number
  }
  questionCount: number
  userStatus: {
    verified: boolean
    score?: number
    canTake: boolean
    nextAvailable?: string
    lastAttempt?: string
  }
}

export default function Assessments() {
  const navigate = useNavigate()
  const { user, profile, vaProfile, loading: authLoading } = useAuth()
  const [assessments, setAssessments] = useState<AssessmentSkill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!vaProfile) return

    const fetchAssessments = async () => {
      setLoading(true)
      try {
        // Get all skills with assessment config
        const { data: configs } = await supabase
          .from('skill_assessment_config')
          .select(`
            *,
            skill:skills(*)
          `)
          .eq('is_active', true)

        if (!configs) {
          setAssessments([])
          setLoading(false)
          return
        }

        // Get question counts per skill
        const { data: questionCounts } = await supabase
          .from('skill_questions')
          .select('skill_id')
          .eq('is_active', true)

        const countMap: Record<string, number> = {}
        questionCounts?.forEach((q: any) => {
          countMap[q.skill_id] = (countMap[q.skill_id] || 0) + 1
        })

        // Get user's verified skills
        const { data: vaSkills } = await supabase
          .from('va_skills')
          .select('skill_id, verified_at, assessment_score')
          .eq('va_id', vaProfile.id)

        const verifiedMap: Record<string, { verified: boolean; score?: number }> = {}
        vaSkills?.forEach((vs: any) => {
          verifiedMap[vs.skill_id] = {
            verified: !!vs.verified_at,
            score: vs.assessment_score
          }
        })

        // Get last attempts for retry cooldown
        const { data: attempts } = await supabase
          .from('skill_attempts')
          .select('skill_id, completed_at, passed')
          .eq('va_id', vaProfile.id)
          .order('completed_at', { ascending: false })

        const attemptMap: Record<string, { lastAttempt: string; passed: boolean }> = {}
        attempts?.forEach((a: any) => {
          if (!attemptMap[a.skill_id]) {
            attemptMap[a.skill_id] = { lastAttempt: a.completed_at, passed: a.passed }
          }
        })

        // Build assessment list
        const assessmentList: AssessmentSkill[] = configs.map((cfg: any) => {
          const skill = cfg.skill
          const verified = verifiedMap[skill.id]?.verified || false
          const score = verifiedMap[skill.id]?.score
          const lastAttemptInfo = attemptMap[skill.id]
          
          let canTake = true
          let nextAvailable: string | undefined

          if (verified) {
            canTake = false
          } else if (lastAttemptInfo && !lastAttemptInfo.passed) {
            const lastTime = new Date(lastAttemptInfo.lastAttempt)
            const nextTime = new Date(lastTime.getTime() + cfg.retry_wait_hours * 60 * 60 * 1000)
            if (nextTime > new Date()) {
              canTake = false
              nextAvailable = nextTime.toISOString()
            }
          }

          return {
            id: skill.id,
            name: skill.name,
            category: skill.category,
            config: {
              questions_per_test: cfg.questions_per_test,
              time_limit_minutes: cfg.time_limit_minutes,
              passing_score: cfg.passing_score,
              retry_wait_hours: cfg.retry_wait_hours
            },
            questionCount: countMap[skill.id] || 0,
            userStatus: {
              verified,
              score,
              canTake,
              nextAvailable,
              lastAttempt: lastAttemptInfo?.lastAttempt
            }
          }
        })

        // Sort: unverified first, then by name
        assessmentList.sort((a, b) => {
          if (a.userStatus.verified !== b.userStatus.verified) {
            return a.userStatus.verified ? 1 : -1
          }
          return a.name.localeCompare(b.name)
        })

        setAssessments(assessmentList)
      } catch (err) {
        console.error('Error fetching assessments:', err)
      }
      setLoading(false)
    }

    fetchAssessments()
  }, [vaProfile])

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  if (!user || !profile || profile.user_type !== 'va') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <IconAlertCircle className="h-12 w-12 text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-2">VA Access Only</h1>
          <p className="text-gray-400 mb-6">Skill assessments are available for Virtual Assistants.</p>
          <Link
            to="/va/signup"
            className="px-6 py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 text-gray-950 font-semibold rounded-lg"
          >
            Sign Up as VA
          </Link>
        </div>
      </Layout>
    )
  }

  const formatTimeRemaining = (isoDate: string) => {
    const diff = new Date(isoDate).getTime() - Date.now()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`
    }
    return `${hours}h ${mins}m`
  }

  const verifiedCount = assessments.filter(a => a.userStatus.verified).length
  const availableCount = assessments.filter(a => a.userStatus.canTake && !a.userStatus.verified).length

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))]/20 to-cyan-500/20">
              <IconAward className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Skill Assessments</h1>
          </div>
          <p className="text-gray-400">
            Verify your skills to stand out to clients. Passing an assessment adds a verified badge to your profile.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] mb-1">
              <IconCheckCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{verifiedCount}</span>
            </div>
            <p className="text-sm text-gray-400">Skills Verified</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <IconStar className="h-5 w-5" />
              <span className="text-2xl font-bold">{availableCount}</span>
            </div>
            <p className="text-sm text-gray-400">Available to Take</p>
          </div>
        </div>

        {/* Assessment List */}
        <div className="space-y-3">
          {assessments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <IconAward className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assessments available yet.</p>
            </div>
          ) : (
            assessments.map((assessment) => (
              <div
                key={assessment.id}
                className={`bg-gray-900/50 border rounded-xl p-4 md:p-5 transition-all ${
                  assessment.userStatus.verified
                    ? 'border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5'
                    : assessment.userStatus.canTake
                    ? 'border-gray-800 hover:border-gray-700'
                    : 'border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-semibold text-gray-100">{assessment.name}</h3>
                      {assessment.userStatus.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]">
                          <IconCheckCircle className="h-3 w-3" />
                          Verified
                          {assessment.userStatus.score && ` · ${assessment.userStatus.score}%`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{assessment.category}</p>
                    
                    {assessment.config && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>{assessment.config.questions_per_test} questions</span>
                        <span>{assessment.config.time_limit_minutes} min</span>
                        <span>Pass: {assessment.config.passing_score}%</span>
                      </div>
                    )}

                    {/* Cooldown message */}
                    {!assessment.userStatus.verified && !assessment.userStatus.canTake && assessment.userStatus.nextAvailable && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-yellow-400">
                        <IconClock className="h-4 w-4" />
                        <span>Retry available in {formatTimeRemaining(assessment.userStatus.nextAvailable)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {assessment.userStatus.verified ? (
                      <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
                        <IconCheckCircle className="h-6 w-6 text-[hsl(var(--primary))]" />
                      </div>
                    ) : assessment.userStatus.canTake ? (
                      <Link
                        to={`/assessments/${assessment.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 text-gray-950 font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Start
                        <IconChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <div className="p-2 rounded-lg bg-gray-800">
                        <IconLock className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-xl p-4 md:p-5">
          <h3 className="font-semibold text-gray-100 mb-2">How Assessments Work</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-1">•</span>
              Questions are randomly selected from a large pool — each test is unique
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-1">•</span>
              You must complete the test within the time limit
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-1">•</span>
              If you don't pass, you can retry after a cooldown period
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--primary))] mt-1">•</span>
              Passing adds a verified badge that clients can see on your profile
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
