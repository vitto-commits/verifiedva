import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile, VA, Client } from '../types/database'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  vaProfile: VA | null
  clientProfile: Client | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userType: 'va' | 'client', fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    vaProfile: null,
    clientProfile: null,
    loading: true,
  })

  const fetchUserData = async (userId: string) => {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) return { profile: null, vaProfile: null, clientProfile: null }

    // Fetch VA or Client profile based on user_type
    let vaProfile = null
    let clientProfile = null

    if ((profile as Profile).user_type === 'va') {
      const { data } = await supabase
        .from('vas')
        .select('*')
        .eq('user_id', userId)
        .single()
      vaProfile = data
    } else if ((profile as Profile).user_type === 'client') {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single()
      clientProfile = data
    }

    return { profile: profile as Profile, vaProfile: vaProfile as VA | null, clientProfile: clientProfile as Client | null }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user.id)
        setState({
          user: session.user,
          session,
          ...userData,
          loading: false,
        })
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user.id)
        setState({
          user: session.user,
          session,
          ...userData,
          loading: false,
        })
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          vaProfile: null,
          clientProfile: null,
          loading: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userType: 'va' | 'client', fullName: string) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned from signup')

      // 2. Update profile with user_type (trigger already created the profile)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: userType, full_name: fullName })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      // 3. Create VA or Client record
      if (userType === 'va') {
        const { error: vaError } = await supabase
          .from('vas')
          .insert({ user_id: authData.user.id })

        if (vaError) throw vaError
      } else {
        const { error: clientError } = await supabase
          .from('clients')
          .insert({ user_id: authData.user.id })

        if (clientError) throw clientError
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (state.user) {
      const userData = await fetchUserData(state.user.id)
      setState(prev => ({ ...prev, ...userData }))
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
