import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, Filter, MapPin, Clock, DollarSign, Star, MessageCircle, ArrowLeft } from 'lucide-react'

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
    verified: { label: '✓ Verified', class: 'bg-green-100 text-green-700' },
    pro: { label: '✓✓ Pro', class: 'bg-blue-100 text-blue-700' },
    elite: { label: '✓✓✓ Elite', class: 'bg-purple-100 text-purple-700' },
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config[tier].class}`}>
      {config[tier].label}
    </span>
  )
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const popularSkills = ['Email Management', 'Social Media', 'Bookkeeping', 'Customer Support', 'Data Entry', 'Research']

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm">VA</div>
              <span className="text-xl font-bold tracking-tight">marketplace</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/search" className="text-sm font-medium text-emerald-600">Find VAs</Link>
              <Link to="/va/signup" className="text-sm font-medium text-gray-600 hover:text-gray-900">For VAs</Link>
              <Link to="/client/signup" className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Header */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold mb-4">Find Your Perfect VA</h1>
          <div className="max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="What do you need help with?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSearchQuery(skill)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors bg-white"
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
            <div className="sticky top-24 space-y-6 p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Hourly Rate</h3>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-20 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
                  <span className="text-gray-400">-</span>
                  <input type="number" placeholder="Max" className="w-20 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Limited'].map((avail) => (
                    <label key={avail} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                      {avail}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                <div className="space-y-2">
                  {['1-2 years', '3-5 years', '5-10 years', '10+ years'].map((exp) => (
                    <label key={exp} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                      {exp}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Verification Tier</h3>
                <div className="space-y-2">
                  {['Verified', 'Verified Pro', 'Verified Elite'].map((tier) => (
                    <label key={tier} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
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
                <span className="text-gray-900 font-medium">{mockVAs.length} verified VAs found</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            <div className="space-y-4">
              {mockVAs.map((va) => (
                <div key={va.id} className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={va.photo}
                      alt={va.name}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link to={`/va/${va.id}`} className="text-lg font-semibold text-gray-900 hover:text-emerald-600">
                          {va.name}
                        </Link>
                        <VerificationBadge tier={va.verificationTier} />
                      </div>
                      <p className="text-gray-600 mb-2">{va.title}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
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
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{va.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {va.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Link
                        to={`/va/${va.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-full border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors text-center"
                      >
                        View Profile
                      </Link>
                      <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
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
