import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, AlertCircle, ChevronLeft, ChevronRight, Loader2, CheckCircle, X, Award, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Question {
  question_id: string
  question: string
  options: string[]
  difficulty: string
  category: string
}

interface AssessmentConfig {
  skill_name: string
  skill_id: string
  questions_per_test: number
  time_limit_minutes: number
  passing_score: number
}

type Phase = 'loading' | 'intro' | 'quiz' | 'submitting' | 'results'

interface Results {
  score: number
  passed: boolean
  correct_count: number
  total_questions: number
}

export default function TakeAssessment() {
  const { skillId } = useParams<{ skillId: string }>()
  const navigate = useNavigate()
  const { user, vaProfile, loading: authLoading } = useAuth()

  const [phase, setPhase] = useState<Phase>('loading')
  const [config, setConfig] = useState<AssessmentConfig | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check eligibility and load config
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (!vaProfile || !skillId) return

    const checkEligibility = async () => {
      try {
        // Check if can take assessment
        const { data: eligibility, error: eligErr } = await supabase
          .rpc('can_take_assessment', {
            p_va_id: vaProfile.id,
            p_skill_id: skillId
          })

        if (eligErr) throw eligErr

        if (!eligibility?.[0]?.can_take) {
          setError(eligibility?.[0]?.reason || 'Cannot take this assessment')
          setPhase('intro')
          return
        }

        // Get config
        const { data: configData, error: configErr } = await supabase
          .from('skill_assessment_config')
          .select(`
            *,
            skill:skills(name)
          `)
          .eq('skill_id', skillId)
          .single()

        if (configErr || !configData) {
          setError('Assessment not found')
          setPhase('intro')
          return
        }

        setConfig({
          skill_name: configData.skill.name,
          skill_id: skillId,
          questions_per_test: configData.questions_per_test,
          time_limit_minutes: configData.time_limit_minutes,
          passing_score: configData.passing_score
        })
        setPhase('intro')
      } catch (err) {
        console.error(err)
        setError('Failed to load assessment')
        setPhase('intro')
      }
    }

    checkEligibility()
  }, [authLoading, user, vaProfile, skillId, navigate])

  // Start assessment
  const startAssessment = async () => {
    if (!vaProfile || !skillId || !config) return

    setPhase('loading')
    try {
      // Get questions
      const { data: questionData, error: qErr } = await supabase
        .rpc('get_assessment_questions', {
          p_skill_id: skillId,
          p_va_id: vaProfile.id
        })

      if (qErr) throw qErr
      if (!questionData || questionData.length === 0) {
        setError('No questions available for this assessment')
        setPhase('intro')
        return
      }

      // Parse options from JSONB
      const parsedQuestions: Question[] = questionData.map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))

      // Shuffle questions
      const shuffled = parsedQuestions.sort(() => Math.random() - 0.5)

      // Create attempt record
      const { data: attempt, error: attemptErr } = await supabase
        .from('skill_attempts')
        .insert({
          va_id: vaProfile.id,
          skill_id: skillId,
          questions_data: shuffled.map(q => ({ question_id: q.question_id }))
        })
        .select('id')
        .single()

      if (attemptErr) throw attemptErr

      setQuestions(shuffled)
      setAttemptId(attempt.id)
      setTimeRemaining(config.time_limit_minutes * 60)
      setAnswers({})
      setCurrentIndex(0)
      setPhase('quiz')
    } catch (err) {
      console.error(err)
      setError('Failed to start assessment')
      setPhase('intro')
    }
  }

  // Timer
  useEffect(() => {
    if (phase !== 'quiz' || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          submitAssessment()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, timeRemaining])

  // Submit assessment
  const submitAssessment = useCallback(async () => {
    if (!attemptId || phase === 'submitting' || phase === 'results') return

    setPhase('submitting')
    try {
      const answerArray = questions.map(q => ({
        question_id: q.question_id,
        selected_answer: answers[q.question_id] ?? -1
      }))

      const { data, error } = await supabase
        .rpc('submit_assessment', {
          p_attempt_id: attemptId,
          p_answers: answerArray
        })

      if (error) throw error

      setResults(data[0])
      setPhase('results')
    } catch (err) {
      console.error(err)
      setError('Failed to submit assessment')
      setPhase('quiz')
    }
  }, [attemptId, answers, questions, phase])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Select answer
  const selectAnswer = (optionIndex: number) => {
    if (phase !== 'quiz') return
    const qId = questions[currentIndex].question_id
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }))
  }

  // Navigation
  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentIndex(index)
  }

  // Render loading
  if (phase === 'loading') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  // Render intro / error
  if (phase === 'intro') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
          <Link
            to="/assessments"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assessments
          </Link>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Cannot Take Assessment</h2>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : config ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))]/20 to-cyan-500/20 mb-4">
                  <Award className="h-8 w-8 text-[hsl(var(--primary))]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">
                  {config.skill_name}
                </h1>
                <p className="text-gray-400">Skill Assessment</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-100">{config.questions_per_test}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-100">{config.time_limit_minutes}</div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-100">{config.passing_score}%</div>
                  <div className="text-xs text-gray-500">To Pass</div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200/80">
                    <p className="font-medium mb-1">Before you begin:</p>
                    <ul className="space-y-1 text-yellow-200/70">
                      <li>• Ensure you have a stable internet connection</li>
                      <li>• The timer starts immediately and cannot be paused</li>
                      <li>• You can navigate between questions before submitting</li>
                      <li>• Unanswered questions count as incorrect</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={startAssessment}
                className="w-full py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 text-gray-950 font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Start Assessment
              </button>
            </div>
          ) : null}
        </div>
      </Layout>
    )
  }

  // Render results
  if (phase === 'results' && results) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 md:p-8 text-center">
            <div className={`inline-flex p-4 rounded-full mb-6 ${
              results.passed 
                ? 'bg-[hsl(var(--primary))]/20' 
                : 'bg-red-500/20'
            }`}>
              {results.passed ? (
                <CheckCircle className="h-12 w-12 text-[hsl(var(--primary))]" />
              ) : (
                <X className="h-12 w-12 text-red-400" />
              )}
            </div>

            <h1 className={`text-3xl font-bold mb-2 ${
              results.passed ? 'text-[hsl(var(--primary))]' : 'text-red-400'
            }`}>
              {results.passed ? 'Congratulations!' : 'Not Quite'}
            </h1>
            
            <p className="text-gray-400 mb-8">
              {results.passed 
                ? 'You passed the assessment and earned a verified badge!'
                : 'You can retry after the cooldown period.'}
            </p>

            <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
              <div className="text-5xl font-bold text-gray-100 mb-2">{results.score}%</div>
              <div className="text-gray-500">
                {results.correct_count} of {results.total_questions} correct
              </div>
              {config && (
                <div className="mt-2 text-sm text-gray-500">
                  Passing score: {config.passing_score}%
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/assessments"
                className="flex-1 py-3 bg-gray-800 text-gray-100 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Assessments
              </Link>
              {results.passed && (
                <Link
                  to="/dashboard"
                  className="flex-1 py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 text-gray-950 font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Render submitting
  if (phase === 'submitting') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))] mb-4" />
          <p className="text-gray-400">Submitting your answers...</p>
        </div>
      </Layout>
    )
  }

  // Render quiz
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isUrgent = timeRemaining <= 60
  const currentAnswer = answers[currentQuestion?.question_id]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header with timer */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {config?.skill_name}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-semibold ${
            isUrgent 
              ? 'bg-red-500/20 text-red-400 animate-pulse' 
              : 'bg-gray-800 text-gray-100'
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              currentQuestion?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              currentQuestion?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {currentQuestion?.difficulty}
            </span>
            {currentQuestion?.category && (
              <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400">
                {currentQuestion.category}
              </span>
            )}
          </div>

          <h2 className="text-lg md:text-xl font-semibold text-gray-100 mb-6">
            {currentQuestion?.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  currentAnswer === idx
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium ${
                    currentAnswer === idx
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-gray-950'
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-gray-200">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={submitAssessment}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-cyan-500 text-gray-950 font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Assessment
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-8 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 mb-3">Jump to question:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.question_id] !== undefined
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={q.question_id}
                  onClick={() => goToQuestion(idx)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-[hsl(var(--primary))] text-gray-950'
                      : isAnswered
                      ? 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
