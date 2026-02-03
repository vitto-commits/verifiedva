import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, Filter, MapPin, Clock, DollarSign, Star, MessageCircle } from 'lucide-react'

interface VA {
  id: string
  name: string
  title: string
  photo: string
  location: string
  timezone: string
  rateMin: number
  rateMax: number
  availability: string
  experience: string
  verificationTier: 'verified' | 'pro' | 'elite'
  rating: number
  reviewCount: number
  skills: string[]
  bio: string
}

const mockVAs: VA[] = [
  {
    id: '1',
    name: 'Maria Santos',
    title: 'Executive Virtual Assistant',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    location: 'Manila, Philippines',
    timezone: 'UTC+8',
    rateMin: 10,
    rateMax: 15,
    availability: 'Full-time',
    experience: '5-10 years',
    verificationTier: 'pro',
    rating: 4.9,
    reviewCount: 23,
    skills: ['Email Management', 'Calendar', 'Travel Planning', 'Research'],
    bio: 'Detail-oriented EA with 7 years supporting C-suite executives. Expert in calendar management and inbox organization.'
  },
  {
    id: '2',
    name: 'John Reyes',
    title: 'Customer Support Specialist',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    location: 'Cebu, Philippines',
    timezone: 'UTC+8',
    rateMin: 8,
    rateMax: 12,
    availability: 'Full-time',
    experience: '3-5 years',
    verificationTier: 'verified',
    rating: 4.7,
    reviewCount: 15,
    skills: ['Customer Support', 'Live Chat', 'Email', 'CRM'],
    bio: 'Experienced customer support professional with background in SaaS and ecommerce companies.'
  },
  {
    id: '3',
    name: 'Anna Lopez',
    title: 'Social Media Manager',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    location: 'Davao, Philippines',
    timezone: 'UTC+8',
    rateMin: 12,
    rateMax: 18,
    availability: 'Part-time',
    experience: '3-5 years',
    verificationTier: 'elite',
    rating: 5.0,
    reviewCount: 31,
    skills: ['Social Media', 'Content Creation', 'Canva', 'Analytics'],
    bio: 'Creative social media manager who has grown accounts from 0 to 100K followers. Specializing in B2B brands.'
  },
  {
    id: '4',
    name: 'Carlos Mendoza',
    title: 'Bookkeeper & Admin',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    location: 'Manila, Philippines',
    timezone: 'UTC+8',
    rateMin: 10,
    rateMax: 14,
    availability: 'Full-time',
    experience: '5-10 years',
    verificationTier: 'pro',
    rating: 4.8,
    reviewCount: 19,
    skills: ['QuickBooks', 'Bookkeeping', 'Invoicing', 'Data Entry'],
    bio: 'CPA-trained bookkeeper with 8 years experience in US accounting standards. QuickBooks certified.'
  },
]

const VerificationBadge = ({ tier }: { tier: 'verified' | 'pro' | 'elite' }) => {
  const config = {
    verified: { label: '✓ Verified', class: 'bg-verified-basic/10 text-verified-basic' },
    pro: { label: '✓✓ Pro', class: 'bg-verified-pro/10 text-verified-pro' },
    elite: { label: '✓✓✓ Elite', class: 'bg-verified-elite/10 text-verified-elite' },
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config[tier].class}`}>
      {config[tier].label}
    </span>
  )
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const popularSkills = ['Email Management', 'Social Media', 'Bookkeeping', 'Customer Support', 'Data Entry', 'Research']

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="What do you need help with?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSearchQuery(skill)}
                  className="px-3 py-1 text-sm rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Hourly Rate</h3>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-20 px-2 py-1 rounded border border-border bg-background text-sm" />
                  <span className="text-muted-foreground">-</span>
                  <input type="number" placeholder="Max" className="w-20 px-2 py-1 rounded border border-border bg-background text-sm" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Availability</h3>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Limited'].map((avail) => (
                    <label key={avail} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-border" />
                      {avail}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Experience</h3>
                <div className="space-y-2">
                  {['1-2 years', '3-5 years', '5-10 years', '10+ years'].map((exp) => (
                    <label key={exp} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-border" />
                      {exp}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Verification Tier</h3>
                <div className="space-y-2">
                  {['Verified', 'Verified Pro', 'Verified Elite'].map((tier) => (
                    <label key={tier} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-border" />
                      {tier}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-foreground font-medium">{mockVAs.length} verified VAs found</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            <div className="space-y-4">
              {mockVAs.map((va) => (
                <div key={va.id} className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={va.photo}
                      alt={va.name}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link to={`/va/${va.id}`} className="text-lg font-semibold text-foreground hover:text-primary">
                          {va.name}
                        </Link>
                        <VerificationBadge tier={va.verificationTier} />
                      </div>
                      <p className="text-muted-foreground mb-2">{va.title}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {va.rating} ({va.reviewCount})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {va.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${va.rateMin}-{va.rateMax}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {va.availability}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{va.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {va.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Link
                        to={`/va/${va.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary hover:text-primary transition-colors text-center"
                      >
                        View Profile
                      </Link>
                      <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
