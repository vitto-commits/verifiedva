import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, SlidersHorizontal, MapPin, Clock, DollarSign, Loader2, X, ChevronDown } from 'lucide-react'
import Layout from '../components/Layout'
import AuthGuard from '../components/AuthGuard'
import { supabase } from '../lib/supabase'
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
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: { full_name: string | null; avatar_url: string | null }
  va_skills?: { skill: Skill | null }[]
}

const VerificationBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-gray-500/20', text: 'text-slate-600' },
    verified: { label: '✓ Verified', bg: 'bg-[hsl(var(--primary))]/20', text: 'text-[hsl(var(--primary))]' },
    pro: { label: '✓✓ Pro', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    elite: { label: '✓✓✓ Elite', bg: 'bg-purple-500/20', text: 'text-purple-400' },
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
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [minRate, setMinRate] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])

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
  }, [])

  useEffect(() => {
    const fetchVAs = async () => {
      setLoading(true)
      
      let query = supabase
        .from('vas')
        .select(`
          *,
          profile:profiles(full_name, avatar_url),
          va_skills(skill:skills(*))
        `)
        .eq('is_active', true)

      if (minRate) query = query.gte('hourly_rate', parseFloat(minRate))
      if (maxRate) query = query.lte('hourly_rate', parseFloat(maxRate))
      if (selectedAvailability.length > 0) query = query.in('availability', selectedAvailability)
      if (selectedTiers.length > 0) query = query.in('verification_status', selectedTiers)

      const { data } = await query.order('created_at', { ascending: false })

      if (data) {
        let filtered = data as VAWithProfile[]
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter((va) => {
            const name = va.profile?.full_name?.toLowerCase() || ''
            const headline = va.headline?.toLowerCase() || ''
            const bio = va.bio?.toLowerCase() || ''
            const skillNames = va.va_skills?.map(vs => vs.skill?.name?.toLowerCase() || '').join(' ') || ''
            return name.includes(q) || headline.includes(q) || bio.includes(q) || skillNames.includes(q)
          })
        }
        setVas(filtered)
      }
      setLoading(false)
    }

    const debounce = setTimeout(fetchVAs, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, minRate, maxRate, selectedAvailability, selectedTiers])

  const toggleFilter = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value))
    } else {
      setter([...current, value])
    }
  }

  const hasFilters = selectedAvailability.length > 0 || selectedTiers.length > 0 || minRate || maxRate
  const filterCount = selectedAvailability.length + selectedTiers.length + (minRate ? 1 : 0) + (maxRate ? 1 : 0)
  const popularSkills = skills.slice(0, 5)

  const clearFilters = () => {
    setSelectedAvailability([])
    setSelectedTiers([])
    setMinRate('')
    setMaxRate('')
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Hourly Rate</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              placeholder="Min"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]"
            />
          </div>
          <span className="text-slate-500">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              placeholder="Max"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Availability</h3>
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
              <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
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
              <SlidersHorizontal className="h-5 w-5" />
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
            {/* Results count */}
            <div className="mb-4">
              {loading ? (
                <span className="text-slate-600 text-sm">Searching...</span>
              ) : (
                <span className="text-slate-700 text-sm">{vas.length} VA{vas.length !== 1 ? 's' : ''} found</span>
              )}
            </div>

            {/* Active filters chips (mobile) */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
                {selectedAvailability.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleFilter(a, selectedAvailability, setSelectedAvailability)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-white text-slate-700 border border-slate-200"
                  >
                    {a.replace('-', ' ')}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {selectedTiers.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleFilter(t, selectedTiers, setSelectedTiers)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-white text-slate-700 border border-slate-200"
                  >
                    {t}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {(minRate || maxRate) && (
                  <button
                    onClick={() => { setMinRate(''); setMaxRate('') }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-white text-slate-700 border border-slate-200"
                  >
                    ${minRate || '0'}-${maxRate || '∞'}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
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
                  <Link
                    key={va.id}
                    to={`/va/${va.id}`}
                    className="block p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white/70 hover:border-[hsl(var(--primary))]/40 active:bg-white transition-all"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0">
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
                              <DollarSign className="h-3.5 w-3.5" />
                              ${va.hourly_rate}/hr
                            </span>
                          )}
                          {va.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {va.location}
                            </span>
                          )}
                          {va.availability && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {va.availability.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                        
                        {/* Skills */}
                        {va.va_skills && va.va_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {va.va_skills.slice(0, 3).map((vs) => (
                              <span key={vs.skill?.id} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                                {vs.skill?.name}
                              </span>
                            ))}
                            {va.va_skills.length > 3 && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-500">
                                +{va.va_skills.length - 3}
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
                      <ChevronDown className="h-4 w-4 text-slate-500 rotate-[-90deg]" />
                    </div>
                  </Link>
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
                  <X className="h-6 w-6 text-slate-600" />
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r to-[hsl(var(--secondary))] to-[hsl(var(--secondary))] text-white font-semibold active:scale-[0.98] transition-transform"
              >
                Show {vas.length} result{vas.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </AuthGuard>
  )
}
