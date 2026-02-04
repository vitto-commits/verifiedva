import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
}

interface OtherUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  user_type: string
  va_id?: string
}

export default function Conversation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    const fetchConversation = async () => {
      if (!id || !user) return

      // Get conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single()

      if (!conv) {
        navigate('/messages')
        return
      }

      // Get other user's profile
      const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .eq('id', otherUserId)
        .single()

      // If they're a VA, get their VA id for linking
      let vaId
      if (profile?.user_type === 'va') {
        const { data: va } = await supabase
          .from('vas')
          .select('id')
          .eq('user_id', otherUserId)
          .single()
        vaId = va?.id
      }

      setOtherUser(profile ? { ...profile, va_id: vaId } : null)

      // Get messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])
      setLoading(false)

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', id)
        .neq('sender_id', user.id)
        .is('read_at', null)
    }

    if (user && id) {
      fetchConversation()

      // Subscribe to new messages
      const subscription = supabase
        .channel(`conversation:${id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        }, (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])

          // Mark as read if from other user
          if (newMsg.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMsg.id)
          }
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [id, user, navigate])

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !id || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content,
    })

    if (error) {
      setNewMessage(content) // Restore message on error
      console.error('Failed to send:', error)
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {} as Record<string, Message[]>)

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
      <div className="flex flex-col h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)]">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Link
              to="/messages"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-50 text-slate-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center font-bold flex-shrink-0">
              {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{otherUser?.full_name || 'User'}</div>
              <div className="text-xs text-slate-500 capitalize">
                {otherUser?.user_type === 'va' ? 'Virtual Assistant' : otherUser?.user_type}
              </div>
            </div>

            {otherUser?.va_id && (
              <Link
                to={`/va/${otherUser.va_id}`}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-600"
                title="View Profile"
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-500">{formatDate(msgs[0].created_at)}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Messages for this date */}
                <div className="space-y-2">
                  {msgs.map((msg, idx) => {
                    const isMe = msg.sender_id === user?.id
                    const showAvatar = idx === 0 || msgs[idx - 1].sender_id !== msg.sender_id

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && showAvatar && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div className="w-8" />}

                        <div
                          className={`max-w-[75%] sm:max-w-[65%] px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-[hsl(var(--primary))] text-white rounded-br-md'
                              : 'bg-white text-slate-900 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`text-xs mt-1 ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No messages yet. Say hello! 👋</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white/90 backdrop-blur p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 resize-none text-base"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
