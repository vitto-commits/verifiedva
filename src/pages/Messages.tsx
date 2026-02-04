import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconMessage, IconSearch, IconLoader } from '../components/icons'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  other_user: {
    id: string
    full_name: string | null
    avatar_url: string | null
    user_type: string
  }
  last_message?: {
    content: string
    sender_id: string
    created_at: string
    read_at: string | null
  }
  unread_count: number
}

export default function Messages() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      // Get all conversations for this user
      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (!convos) {
        setLoading(false)
        return
      }

      // For each conversation, get the other user's profile and last message
      const conversationsWithDetails = await Promise.all(
        convos.map(async (conv) => {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1

          // Get other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, user_type')
            .eq('id', otherUserId)
            .single()

          // Get last message
          const { data: messages } = await supabase
            .from('messages')
            .select('content, sender_id, created_at, read_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null)

          return {
            ...conv,
            other_user: profile || { id: otherUserId, full_name: null, avatar_url: null, user_type: 'unknown' },
            last_message: messages?.[0] || undefined,
            unread_count: count || 0,
          }
        })
      )

      setConversations(conversationsWithDetails)
      setLoading(false)
    }

    if (user) {
      fetchConversations()

      // Subscribe to new messages
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
          fetchConversations()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const name = conv.other_user.full_name?.toLowerCase() || ''
    return name.includes(searchQuery.toLowerCase())
  })

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <IconLoader className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
            <p className="text-sm text-slate-600">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>

          {/* Conversations List */}
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-white/70 mb-4">
                <IconMessage className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-slate-600 text-sm mb-6">
                Start a conversation by messaging a VA or client
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:bg-[hsl(var(--primary))]/90"
              >
                Browse VAs
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/messages/${conv.id}`}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl hover:bg-white/70 active:bg-white transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-lg font-bold">
                      {conv.other_user.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`font-medium truncate ${conv.unread_count > 0 ? 'text-slate-900' : 'text-slate-800'}`}>
                        {conv.other_user.full_name || 'User'}
                      </span>
                      {conv.last_message && (
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatTime(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 capitalize">
                        {conv.other_user.user_type === 'va' ? 'VA' : conv.other_user.user_type}
                      </span>
                      {conv.last_message && (
                        <>
                          <span className="text-slate-500">·</span>
                          <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                            {conv.last_message.sender_id === user?.id ? 'You: ' : ''}
                            {conv.last_message.content}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
