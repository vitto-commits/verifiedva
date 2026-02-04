import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import { Button, Card, CardContent, Textarea } from '../components/ui'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  timezone: string
}

interface VAInfo {
  id: string
  profile: {
    full_name: string | null
  }
}

interface ExistingInterview {
  scheduled_at: string
  duration_minutes: number
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function BookInterview() {
  const { vaId } = useParams<{ vaId: string }>()
  const navigate = useNavigate()
  const { user, profile, clientProfile, loading: authLoading } = useAuth()
  const [va, setVa] = useState<VAInfo | null>(null)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [existingInterviews, setExistingInterviews] = useState<ExistingInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Calendar state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day
    return new Date(today.setDate(diff))
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (!authLoading && profile?.user_type !== 'client') {
      navigate('/dashboard')
      return
    }
  }, [user, profile, authLoading, navigate])

  useEffect(() => {
    const fetchData = async () => {
      if (!vaId) return

      // Get VA info
      const { data: vaData } = await supabase
        .from('vas')
        .select('id, profile:profiles!vas_user_id_fkey(full_name)')
        .eq('id', vaId)
        .single()

      if (!vaData) {
        setError('VA not found')
        setLoading(false)
        return
      }
      // Handle profile being returned as array from join
      const profileData = Array.isArray(vaData.profile) ? vaData.profile[0] : vaData.profile
      setVa({
        id: vaData.id,
        profile: profileData || { full_name: null }
      })

      // Get availability
      const { data: avail } = await supabase
        .from('va_availability')
        .select('day_of_week, start_time, end_time, timezone')
        .eq('va_id', vaId)

      setAvailability(avail || [])

      // Get existing interviews (to block those slots)
      const { data: interviews } = await supabase
        .from('interviews')
        .select('scheduled_at, duration_minutes')
        .eq('va_id', vaId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())

      setExistingInterviews(interviews || [])
      setLoading(false)
    }

    if (user) {
      fetchData()
    }
  }, [vaId, user])

  const getWeekDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const prevWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    // Don't go before today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (newStart >= today || newStart.getTime() + 6 * 24 * 60 * 60 * 1000 >= today.getTime()) {
      setCurrentWeekStart(newStart)
    }
  }

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    // Limit to 4 weeks ahead
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 28)
    if (newStart <= maxDate) {
      setCurrentWeekStart(newStart)
    }
  }

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false
    return availability.some(a => a.day_of_week === dayOfWeek)
  }

  const getTimeSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    const dayAvail = availability.filter(a => a.day_of_week === dayOfWeek)
    
    const slots: string[] = []
    
    dayAvail.forEach(avail => {
      const [startHour, startMin] = avail.start_time.split(':').map(Number)
      const [endHour, endMin] = avail.end_time.split(':').map(Number)
      
      let currentHour = startHour
      let currentMin = startMin
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
        
        // Check if slot is in the past
        const slotDate = new Date(date)
        slotDate.setHours(currentHour, currentMin, 0, 0)
        if (slotDate > new Date()) {
          // Check if slot conflicts with existing interview
          const conflicts = existingInterviews.some(int => {
            const intStart = new Date(int.scheduled_at)
            const intEnd = new Date(intStart.getTime() + int.duration_minutes * 60000)
            const slotEnd = new Date(slotDate.getTime() + 30 * 60000)
            
            return (slotDate >= intStart && slotDate < intEnd) ||
                   (slotEnd > intStart && slotEnd <= intEnd)
          })
          
          if (!conflicts) {
            slots.push(timeStr)
          }
        }
        
        // Add 30 minutes
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour += 1
        }
      }
    })
    
    return slots.sort()
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:${minute} ${ampm}`
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !clientProfile || !vaId) return

    setBooking(true)
    setError('')

    const [hour, minute] = selectedTime.split(':').map(Number)
    const scheduledAt = new Date(selectedDate)
    scheduledAt.setHours(hour, minute, 0, 0)

    const { error: bookError } = await supabase
      .from('interviews')
      .insert({
        va_id: vaId,
        client_id: clientProfile.id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 30,
        notes: notes.trim() || null,
        status: 'scheduled',
      })

    if (bookError) {
      console.error('Booking error:', bookError)
      setError('Failed to book interview. The slot may no longer be available.')
      setBooking(false)
      return
    }

    setSuccess(true)
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

  if (success) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex p-4 rounded-2xl bg-[hsl(var(--primary))]/10 mb-4">
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Interview Scheduled!</h1>
            <p className="text-slate-600 mb-2">
              Your interview with {va?.profile?.full_name || 'the VA'} is confirmed.
            </p>
            <p className="text-lg font-medium text-slate-900 mb-6">
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime && formatTime(selectedTime)}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/my-interviews">
                <Button size="lg">View My Interviews</Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="outline">Browse More VAs</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const weekDates = getWeekDates()
  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : []

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link
            to={`/va/${vaId}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Book Interview with {va?.profile?.full_name || 'VA'}
            </h1>
            <p className="text-slate-600">Select a date and time for a 30-minute call</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {availability.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <h3 className="font-medium mb-2">No Availability Set</h3>
                <p className="text-slate-600 text-sm">
                  This VA hasn't set their interview availability yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Week Calendar */}
              <Card>
                <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevWeek}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="font-medium">
                    {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={nextWeek}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {weekDates.map((date, idx) => {
                    const available = isDateAvailable(date)
                    const isSelected = selectedDate?.toDateString() === date.toDateString()
                    const isToday = date.toDateString() === new Date().toDateString()

                    return (
                      <button
                        key={idx}
                        onClick={() => available && setSelectedDate(date)}
                        disabled={!available}
                        className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-[hsl(var(--primary))] text-white'
                            : available
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                            : 'bg-white/30 text-slate-500 cursor-not-allowed'
                        } ${isToday && !isSelected ? 'ring-1 ring-[hsl(var(--primary))]/30' : ''}`}
                      >
                        <span className="text-xs text-inherit opacity-70">{DAYS[idx]}</span>
                        <span className="text-lg sm:text-xl font-medium">{date.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">
                      Available times for{' '}
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>

                    {timeSlots.length === 0 ? (
                      <p className="text-slate-500 text-sm py-4 text-center">No available slots for this date</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              selectedTime === time
                                ? 'bg-[hsl(var(--primary))] text-white'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {formatTime(time)}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes & Book */}
              {selectedDate && selectedTime && (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Anything you'd like to discuss..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
                      <Clock className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-[hsl(var(--primary))]">Selected: </span>
                        <span className="text-slate-700">
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(selectedTime)}
                        </span>
                      </div>
                    </div>

                    <Button onClick={handleBook} disabled={booking} size="lg" className="w-full">
                      {booking ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-5 w-5" />
                          Confirm Interview
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
