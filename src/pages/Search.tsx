import { useState, useEffect } from 'react'
import { IconSearch, IconSliders, IconMapPin, IconClock, IconDollar, IconLoader, IconX, IconChevronDown } from '../components/icons'
import Layout from '../components/Layout'
import AuthGuard from '../components/AuthGuard'
import VAPreviewPanel from '../components/VAPreviewPanel'
import RateHistogram from '../components/RateHistogram'
import { supabase } from '../lib/supabase'
import type { Skill } from '../types/database'

interface VAWithProfile {
  id: string
  user_id: string
  headline: string | null
  bio: string | null
  hourly_rate: number | null
  hours_per_week: number | null
  years_experience: number
  location: string | null
  timezone: string | null
  languages: string[]
  availability: string
  verification_status: string
  portfolio_url: string | null
  resume_url: string | null
  video_intro_url: string | null
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

const VerificationBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-gray-500/20', text: 'text-slate-600' },
    verified: { label: '✓ Verified', bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]' },
    pro: { label: '✓✓ Pro', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    elite: { label: '✓✓✓ Elite', bg: 'bg-[hsl(var(--secondary))]/20', text: 'text-purple-400' },
  }
  const c = config[status] || config.pending
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [vas, setVas] = useState<VAWithProfile[]>([])
  const [allRates, setAllRates] = useState<number[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVA, setSelectedVA] = useState<VAWithProfile | null>(null)
  
  // Filters
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [minExperience, setMinExperience] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [verifiedSkillsOnly, setVerifiedSkillsOnly] = useState(false)
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [selectedHoursPerWeek, setSelectedHoursPerWeek] = useState<string>('')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'relevance' | 'rate-low' | 'rate-high' | 'experience'>('relevance')

  // Prevent body scroll when filter modal is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showFilters])

  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase.from('skills').select('*').order('name')
      if (data) setSkills(data)
    }
    fetchSkills()
    
    // Fetch all rates for histogram (unfiltered)
    const fetchAllRates = async () => {
      const { data } = await supabase
        .from('vas')
        .select('hourly_rate')
        .eq('is_active', true)
        .not('hourly_rate', 'is', null)
      if (data) {
        setAllRates(data.map(v => v.hourly_rate).filter((r): r is number => r !== null))
      }
    }
    fetchAllRates()
  }, [])

  useEffect(() => {
    const fetchVAs = async () => {
      setLoading(true)
      
      let query = supabase
        .from('vas')
        .select(`
          *,
          profile:profiles(full_name, avatar_url),
          va_skills(skill:skills(*), proficiency_level, verified_at, assessment_score)
        `)
        .eq('is_active', true)

      if (minRate) query = query.gte('hourly_rate', parseFloat(minRate))
      if (maxRate) query = query.lte('hourly_rate', parseFloat(maxRate))
      if (minExperience) query = query.gte('years_experience', parseInt(minExperience))
      if (selectedAvailability.length > 0) query = query.in('availability', selectedAvailability)
      if (selectedTiers.length > 0) query = query.in('verification_status', selectedTiers)

      const { data } = await query

      if (data) {
        let filtered = data as VAWithProfile[]
        
        // Filter by selected skills
        if (selectedSkills.length > 0) {
          filtered = filtered.filter(va => {
            const vaSkillIds = va.va_skills?.map(vs => vs.skill?.id) || []
            return selectedSkills.some(skillId => vaSkillIds.includes(skillId))
          })
        }
        
        // Filter by verified skills only
        if (verifiedSkillsOnly) {
          filtered = filtered.filter(va => {
            return va.va_skills?.some(vs => vs.verified_at) || false
          })
        }
        
        // Filter by location
        if (locationQuery) {
          const locQ = locationQuery.toLowerCase()
          filtered = filtered.filter(va => {
            const location = va.location?.toLowerCase() || ''
            const timezone = va.timezone?.toLowerCase() || ''
            return location.includes(locQ) || timezone.includes(locQ)
          })
        }
        
        // Filter by hours per week
        if (selectedHoursPerWeek) {
          const minHours = parseInt(selectedHoursPerWeek)
          filtered = filtered.filter(va => {
            if (!va.hours_per_week) return true // flexible/any hours
            return va.hours_per_week >= minHours
          })
        }
        
        // Filter and score by search query
        const q = searchQuery?.toLowerCase() || ''
        if (q) {
          filtered = filtered.filter((va) => {
            const name = va.profile?.full_name?.toLowerCase() || ''
            const headline = va.headline?.toLowerCase() || ''
            const bio = va.bio?.toLowerCase() || ''
            const skillNames = va.va_skills?.map(vs => vs.skill?.name?.toLowerCase() || '').join(' ') || ''
            return name.includes(q) || headline.includes(q) || bio.includes(q) || skillNames.includes(q)
          })
        }
        
        // Calculate relevance score for sorting
        const scoreVA = (va: VAWithProfile): number => {
          let score = 0
          
          // Verification tier bonus
          if (va.verification_status === 'elite') score += 100
          else if (va.verification_status === 'pro') score += 75
          else if (va.verification_status === 'verified') score += 50
          
          // Verified skills bonus (10 points each, max 50)
          const verifiedSkillCount = va.va_skills?.filter(vs => vs.verified_at)?.length || 0
          score += Math.min(verifiedSkillCount * 10, 50)
          
          // Experience bonus (2 points per year, max 20)
          score += Math.min((va.years_experience || 0) * 2, 20)
          
          // Search match bonuses (if searching)
          if (q) {
            const name = va.profile?.full_name?.toLowerCase() || ''
            const headline = va.headline?.toLowerCase() || ''
            const skillNames = va.va_skills?.map(vs => vs.skill?.name?.toLowerCase() || '').join(' ') || ''
            
            // Exact name match = huge bonus
            if (name === q) score += 200
            else if (name.includes(q)) score += 50
            
            // Headline match = good bonus
            if (headline.includes(q)) score += 30
            
            // Skill match = moderate bonus
            if (skillNames.includes(q)) score += 25
          }
          
          // Completed profile bonus
          if (va.headline) score += 5
          if (va.bio && va.bio.length > 100) score += 5
          if (va.portfolio_url) score += 5
          
          return score
        }
        
        // Sort results
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'rate-low':
              return (a.hourly_rate || 0) - (b.hourly_rate || 0)
            case 'rate-high':
              return (b.hourly_rate || 0) - (a.hourly_rate || 0)
            case 'experience':
              return (b.years_experience || 0) - (a.years_experience || 0)
            case 'relevance':
            default:
              return scoreVA(b) - scoreVA(a)
          }
        })
        
        setVas(filtered)
      }
      setLoading(false)
    }

    const debounce = setTimeout(fetchVAs, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, minRate, maxRate, minExperience, locationQuery, verifiedSkillsOnly, selectedAvailability, selectedHoursPerWeek, selectedTiers, selectedSkills, sortBy])

  const toggleFilter = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value))
    } else {
      setter([...current, value])
    }
  }

  const hasFilters = selectedAvailability.length > 0 || selectedTiers.length > 0 || selectedSkills.length > 0 || minRate || maxRate || minExperience || locationQuery || verifiedSkillsOnly || selectedHoursPerWeek
  const filterCount = selectedAvailability.length + selectedTiers.length + selectedSkills.length + (minRate ? 1 : 0) + (maxRate ? 1 : 0) + (minExperience ? 1 : 0) + (locationQuery ? 1 : 0) + (verifiedSkillsOnly ? 1 : 0) + (selectedHoursPerWeek ? 1 : 0)
  const popularSkills = skills.slice(0, 5)

  const clearFilters = () => {
    setSelectedAvailability([])
    setSelectedTiers([])
    setSelectedSkills([])
    setMinRate('')
    setMaxRate('')
    setMinExperience('')
    setLocationQuery('')
    setSelectedHoursPerWeek('')
    setVerifiedSkillsOnly(false)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Skills Filter */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Skills</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {skills.map((skill) => (
            <label key={skill.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-white active:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill.id)}
                onChange={() => toggleFilter(skill.id, selectedSkills, setSelectedSkills)}
                className="w-5 h-5 rounded border-slate-300 bg-white text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]/20 focus:ring-offset-0"
              />
              {skill.name}
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Hourly Rate</h3>
        <RateHistogram
          rates={allRates}
          minRate={minRate}
          maxRate={maxRate}
          onRangeChange={(min, max) => {
            setMinRate(min)
            setMaxRate(max)
          }}
        />
      </div>

      {/* Experience Filter */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Min. Experience</h3>
        <select
          value={minExperience}
          onChange={(e) => setMinExperience(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]"
        >
          <option value="">Any experience</option>
          <option value="1">1+ year</option>
          <option value="2">2+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Location</h3>
        <input
          type="text"
          placeholder="e.g. Philippines, Manila, PST..."
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]"
        />
      </div>

      {/* Verified Skills Toggle */}
      <div>
        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 cursor-pointer hover:bg-white active:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={verifiedSkillsOnly}
            onChange={(e) => setVerifiedSkillsOnly(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 bg-white text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]/20 focus:ring-offset-0"
          />
          <span className="font-medium">Has verified skills only</span>
        </label>
        <p className="text-xs text-slate-500 mt-1 px-3">Show only VAs who passed skill assessments</p>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Availability Type</h3>
        <div className="space-y-1">
          {['full-time', 'part-time', 'contract'].map((avail) => (
            <label key={avail} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-white active:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={selectedAvailability.includes(avail)}
                onChange={() => toggleFilter(avail, selectedAvailability, setSelectedAvailability)}
                className="w-5 h-5 rounded border-slate-300 bg-white text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]/20 focus:ring-offset-0"
              />
              {avail.charAt(0).toUpperCase() + avail.slice(1).replace('-', ' ')}
            </label>
          ))}
        </div>
      </div>

      {/* Hours Per Week Filter */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Hours per Week</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'Any' },
            { value: '10', label: '10+' },
            { value: '20', label: '20+' },
            { value: '30', label: '30+' },
            { value: '40', label: '40+' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedHoursPerWeek(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                selectedHoursPerWeek === opt.value
                  ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 px-1">Filter by minimum available hours</p>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Verification Tier</h3>
        <div className="space-y-1">
          {[
            { value: 'verified', label: '✓ Verified', color: 'text-[hsl(var(--primary))]' },
            { value: 'pro', label: '✓✓ Pro', color: 'text-blue-400' },
            { value: 'elite', label: '✓✓✓ Elite', color: 'text-purple-400' },
          ].map((tier) => (
            <label key={tier.value} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-white active:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={selectedTiers.includes(tier.value)}
                onChange={() => toggleFilter(tier.value, selectedTiers, setSelectedTiers)}
                className="w-5 h-5 rounded border-slate-300 bg-white text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]/20 focus:ring-offset-0"
              />
              <span className={tier.color}>{tier.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <AuthGuard>
    <Layout>
      {/* Search Header */}
      <div className="sticky top-14 sm:top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search skills, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                hasFilters 
                  ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <IconSliders className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
              {filterCount > 0 && (
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[hsl(var(--primary))] text-white text-xs">
                  {filterCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Quick skill tags */}
          {popularSkills.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {popularSkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSearchQuery(skill.name)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border whitespace-nowrap transition-colors ${
                    searchQuery === skill.name
                      ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Sidebar + Results */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-36 p-4 bg-white/70 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-[hsl(var(--primary))] hover:opacity-80">
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                {loading ? (
                  <span className="text-slate-600 text-sm">Searching...</span>
                ) : (
                  <span className="text-slate-700 text-sm">{vas.length} VA{vas.length !== 1 ? 's' : ''} found</span>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="relevance">Best Match</option>
                <option value="rate-low">Rate: Low to High</option>
                <option value="rate-high">Rate: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            {/* Active filters chips (mobile) */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
                {selectedSkills.map(skillId => {
                  const skill = skills.find(s => s.id === skillId)
                  return skill ? (
                    <button
                      key={skillId}
                      onClick={() => toggleFilter(skillId, selectedSkills, setSelectedSkills)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20"
                    >
                      {skill.name}
                      <IconX className="h-3 w-3" />
                    </button>
                  ) : null
                })}
                {selectedAvailability.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleFilter(a, selectedAvailability, setSelectedAvailability)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-white text-slate-700 border border-slate-200"
                  >
                    {a.replace('-', ' ')}
                    <IconX className="h-3 w-3" />
                  </button>
                ))}
                {selectedTiers.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleFilter(t, selectedTiers, setSelectedTiers)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-white text-slate-700 border border-slate-200"
                  >
                    {t}
                    <IconX className="h-3 w-3" />
                  </button>
                ))}
                {(minRate || maxRate) && (
                  <button
                    onClick={() => { setMinRate(''); setMaxRate('') }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-white text-slate-700 border border-slate-200"
                  >
                    ${minRate || '0'}-${maxRate || '∞'}
                    <IconX className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
              </div>
            ) : vas.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-slate-600 mb-4">No VAs found matching your criteria</div>
                <button
                  onClick={() => { setSearchQuery(''); clearFilters() }}
                  className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {vas.map((va) => (
                  <div
                    key={va.id}
                    onClick={() => setSelectedVA(va)}
                    className="block p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 hover:border-[hsl(var(--primary))]/40 active:bg-white transition-all cursor-pointer"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0">
                        {va.profile?.full_name?.[0]?.toUpperCase() || 'V'}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <span className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                            {va.profile?.full_name || 'VA'}
                          </span>
                          <VerificationBadge status={va.verification_status} />
                        </div>
                        
                        {va.headline && (
                          <p className="text-slate-600 text-sm mb-2 line-clamp-1">{va.headline}</p>
                        )}
                        
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500 mb-2">
                          {va.hourly_rate && (
                            <span className="flex items-center gap-1 text-[hsl(var(--primary))] font-medium">
                              <IconDollar className="h-3.5 w-3.5" />
                              ${va.hourly_rate}/hr
                            </span>
                          )}
                          {va.location && (
                            <span className="flex items-center gap-1">
                              <IconMapPin className="h-3.5 w-3.5" />
                              {va.location}
                            </span>
                          )}
                          {va.availability && (
                            <span className="flex items-center gap-1">
                              <IconClock className="h-3.5 w-3.5" />
                              {va.availability.replace('-', ' ')}
                              {va.hours_per_week && ` · ${va.hours_per_week}h/wk`}
                            </span>
                          )}
                        </div>
                        
                        {/* Skills */}
                        {va.va_skills && va.va_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {va.va_skills.slice(0, 4).map((vs) => (
                              <span 
                                key={vs.skill?.id} 
                                className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${
                                  vs.verified_at 
                                    ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]' 
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {vs.verified_at && <span className="text-[10px]">✓</span>}
                                {vs.skill?.name}
                              </span>
                            ))}
                            {va.va_skills.length > 4 && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-500">
                                +{va.va_skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Desktop: Action buttons */}
                      <div className="hidden sm:flex flex-col gap-2 items-end justify-center">
                        <span className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 group-hover:border-[hsl(var(--primary))]/40">
                          View Profile
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile: chevron hint */}
                    <div className="sm:hidden flex justify-end mt-2 -mb-1">
                      <IconChevronDown className="h-4 w-4 text-slate-500 rotate-[-90deg]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-slate-100" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="flex items-center gap-4">
                {hasFilters && (
                  <button onClick={clearFilters} className="text-sm text-[hsl(var(--primary))]">
                    Clear all
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-1 -mr-1"
                >
                  <IconX className="h-6 w-6 text-slate-600" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-4 py-4 overflow-y-auto max-h-[60vh]">
              <FilterContent />
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3.5 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold active:scale-[0.98] transition-transform"
              >
                Show {vas.length} result{vas.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VA Preview Panel */}
      <VAPreviewPanel 
        va={selectedVA} 
        onClose={() => setSelectedVA(null)} 
      />
    </Layout>
    </AuthGuard>
  )
}
