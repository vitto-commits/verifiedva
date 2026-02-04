export type UserType = 'va' | 'client' | 'admin'
export type VerificationStatus = 'pending' | 'verified' | 'pro' | 'elite'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  user_type: UserType
  created_at: string
  updated_at: string
}

export interface VA {
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
  verification_status: VerificationStatus
  portfolio_url: string | null
  resume_url: string | null
  video_intro_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined data
  profile?: Profile
  skills?: Skill[]
}

export interface Client {
  id: string
  user_id: string
  company_name: string | null
  company_website: string | null
  industry: string | null
  company_size: string | null
  created_at: string
  updated_at: string
  // Joined data
  profile?: Profile
}

export interface Skill {
  id: string
  name: string
  category: string | null
  created_at: string
}

export interface VASkill {
  va_id: string
  skill_id: string
  proficiency_level: number
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Profile, 'id'>>
      }
      vas: {
        Row: VA
        Insert: Omit<VA, 'id' | 'created_at' | 'updated_at' | 'profile' | 'skills'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<VA, 'id' | 'profile' | 'skills'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'profile'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Client, 'id' | 'profile'>>
      }
      skills: {
        Row: Skill
        Insert: Omit<Skill, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Skill, 'id'>>
      }
      va_skills: {
        Row: VASkill
        Insert: VASkill
        Update: Partial<VASkill>
      }
    }
  }
}
