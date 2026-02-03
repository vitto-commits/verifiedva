import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign, Star, MessageCircle, Shield, CheckCircle, Briefcase, GraduationCap, Globe } from 'lucide-react'

export default function VAProfile() {
  const { id: _id } = useParams()

  // Mock data - in real app, fetch from API
  const va = {
    id: '1',
    name: 'Maria Santos',
    title: 'Executive Virtual Assistant',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    location: 'Manila, Philippines',
    timezone: 'UTC+8',
    rateMin: 10,
    rateMax: 15,
    availability: 'Full-time (40+ hrs/week)',
    experience: '7 years',
    verificationTier: 'pro' as const,
    rating: 4.9,
    reviewCount: 23,
    responseTime: 'Under 2 hours',
    skills: [
      { name: 'Email Management', level: 5 },
      { name: 'Calendar Management', level: 5 },
      { name: 'Travel Planning', level: 4 },
      { name: 'Research', level: 4 },
      { name: 'Data Entry', level: 5 },
      { name: 'Document Preparation', level: 4 },
    ],
    tools: ['Google Workspace', 'Slack', 'Notion', 'Calendly', 'Asana', 'Zoom', 'TripIt', 'Expensify'],
    bio: `I'm a detail-oriented Executive Assistant with 7 years of experience supporting C-suite executives at US-based companies. I specialize in calendar management, travel coordination, and inbox organization.

I pride myself on anticipating needs before they arise and maintaining clear, proactive communication. I've helped executives reclaim 15+ hours per week by streamlining their admin workflows.

Looking for a long-term partnership where I can grow with your business.`,
    verification: {
      identity: true,
      education: true,
      references: 2,
      skillTests: true,
    },
    workHistory: [
      { company: 'US Tech Startup', role: 'Executive Assistant', duration: '3 years', verified: true },
      { company: 'Marketing Agency', role: 'Admin Assistant', duration: '2 years', verified: true },
    ],
    education: {
      degree: "Bachelor of Arts, Communication",
      school: "University of the Philippines Manila",
      year: 2018,
    },
    reviews: [
      {
        id: '1',
        author: 'John D.',
        title: 'CEO at TechStartup Inc.',
        rating: 5,
        date: 'Dec 2025',
        text: 'Maria is exceptional. She has been managing my calendar and inbox for 6 months and I can\'t imagine going back. She anticipates what I need before I even ask. Highly recommend.'
      },
      {
        id: '2',
        author: 'Sarah M.',
        title: 'Founder at MarketingCo',
        rating: 5,
        date: 'Oct 2025',
        text: 'Professional and reliable. Maria helped me organize my entire business operations. Communication is always clear and on time.'
      },
    ]
  }

  const VerificationBadge = ({ tier }: { tier: 'verified' | 'pro' | 'elite' }) => {
    const config = {
      verified: { label: '✓ Verified', class: 'bg-verified-basic/10 text-verified-basic border-verified-basic/30' },
      pro: { label: '✓✓ Verified Pro', class: 'bg-verified-pro/10 text-verified-pro border-verified-pro/30' },
      elite: { label: '✓✓✓ Verified Elite', class: 'bg-verified-elite/10 text-verified-elite border-verified-elite/30' },
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config[tier].class}`}>
        {config[tier].label}
      </span>
    )
  }

  const SkillLevel = ({ level }: { level: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= level ? 'bg-primary' : 'bg-muted'}`}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            ← Back to Search
          </Link>

          {/* Header Card */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={va.photo}
                alt={va.name}
                className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{va.name}</h1>
                  <VerificationBadge tier={va.verificationTier} />
                </div>
                <p className="text-lg text-muted-foreground mb-4">{va.title}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {va.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {va.timezone}
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
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-foreground">{va.rating}</span>
                    <span className="text-muted-foreground">({va.reviewCount} reviews)</span>
                  </span>
                  <span className="text-muted-foreground">
                    Response time: <span className="text-foreground">{va.responseTime}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Message Maria
                </button>
                <button className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:border-primary hover:text-primary transition-colors">
                  ♡ Save
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* About */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground whitespace-pre-line">{va.bio}</p>
              </section>

              {/* Skills */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Skills</h2>
                <div className="grid grid-cols-2 gap-4">
                  {va.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{skill.name}</span>
                      <SkillLevel level={skill.level} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Tools */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Tools & Software</h2>
                <div className="flex flex-wrap gap-2">
                  {va.tools.map((tool) => (
                    <span key={tool} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                      {tool}
                    </span>
                  ))}
                </div>
              </section>

              {/* Work History */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </h2>
                <div className="space-y-4">
                  {va.workHistory.map((job, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{job.role}</span>
                          {job.verified && (
                            <CheckCircle className="h-4 w-4 text-verified-basic" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{job.company} • {job.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews ({va.reviewCount})
                </h2>
                <div className="space-y-4">
                  {va.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
                      <p className="text-sm font-medium text-foreground">{review.author}, {review.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verification Details */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-verified-basic" />
                    <span className="text-sm text-muted-foreground">Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-verified-basic" />
                    <span className="text-sm text-muted-foreground">Education Verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-verified-basic" />
                    <span className="text-sm text-muted-foreground">{va.verification.references} References Checked</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-verified-basic" />
                    <span className="text-sm text-muted-foreground">Skills Tests Passed</span>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </h2>
                <p className="text-sm text-foreground font-medium">{va.education.degree}</p>
                <p className="text-sm text-muted-foreground">{va.education.school}</p>
                <p className="text-sm text-muted-foreground">{va.education.year}</p>
              </section>

              {/* CTA */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Ready to work with {va.name.split(' ')[0]}?</p>
                <button className="w-full px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Message {va.name.split(' ')[0]}
                </button>
                <p className="text-xs text-muted-foreground mt-3">Typical response: {va.responseTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
