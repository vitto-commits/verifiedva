import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import { Button, Card, CardContent } from '../components/ui'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface AvailabilitySlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  timezone: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

export default function Availability() {
  const navigate = useNavigate()
  const { user, profile, vaProfile, loading: authLoading } = useAuth()
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // New slot form
  const [newDay, setNewDay] = useState(1) // Monday
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('17:00')

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
    const fetchSlots = async () => {
      if (!vaProfile) return

      const { data } = await supabase
        .from('va_availability')
        .select('*')
        .eq('va_id', vaProfile.id)
        .order('day_of_week')
        .order('start_time')

      if (data) {
        setSlots(data)
        if (data.length > 0) {
          setTimezone(data[0].timezone)
        }
      }
      setLoading(false)
    }

    if (vaProfile) {
      fetchSlots()
    }
  }, [vaProfile])

  const addSlot = async () => {
    if (!vaProfile) return

    // Validate times
    if (newStart >= newEnd) {
      alert('End time must be after start time')
      return
    }

    // Check for overlaps
    const overlaps = slots.some(
      s => s.day_of_week === newDay && 
           ((newStart >= s.start_time && newStart < s.end_time) ||
            (newEnd > s.start_time && newEnd <= s.end_time) ||
            (newStart <= s.start_time && newEnd >= s.end_time))
    )

    if (overlaps) {
      alert('This time slot overlaps with an existing slot')
      return
    }

    setSaving(true)
    const { data } = await supabase
      .from('va_availability')
      .insert({
        va_id: vaProfile.id,
        day_of_week: newDay,
        start_time: newStart,
        end_time: newEnd,
        timezone,
      })
      .select()
      .single()

    if (data) {
      setSlots([...slots, data].sort((a, b) => 
        a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
      ))
    }
    setSaving(false)
  }

  const removeSlot = async (id: string) => {
    setSaving(true)
    await supabase.from('va_availability').delete().eq('id', id)
    setSlots(slots.filter(s => s.id !== id))
    setSaving(false)
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:${minute} ${ampm}`
  }

  // Group slots by day
  const slotsByDay = DAYS.map((day, idx) => ({
    day,
    dayIndex: idx,
    slots: slots.filter(s => s.day_of_week === idx),
  }))

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Interview Availability</h1>
            <p className="text-slate-600">
              Set your available times for client interviews
            </p>
          </div>

          {/* Timezone */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              >
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Add New Slot */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Add Available Time</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(parseInt(e.target.value))}
                  className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
                <select
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>

                <Button onClick={addSlot} disabled={saving} className="rounded-lg">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Availability */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Your Weekly Availability</h2>
            
            {slots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No availability set yet</p>
                <p className="text-sm">Add your available times above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slotsByDay.filter(d => d.slots.length > 0).map(({ day, slots: daySlots }) => (
                  <div key={day}>
                    <div className="text-sm font-medium text-slate-600 mb-2">{day}</div>
                    <div className="space-y-2">
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[hsl(var(--primary))]" />
                            <span>
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                          </div>
                          <button
                            onClick={() => removeSlot(slot.id)}
                            disabled={saving}
                            className="p-2 text-slate-600 hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>

          {/* Info */}
          <p className="mt-4 text-sm text-slate-500 text-center">
            Clients will be able to book 30-minute interview slots within your available times
          </p>
        </div>
      </div>
    </Layout>
  )
}
