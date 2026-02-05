import { supabase } from './supabase'

export type AuditAction = 
  | 'va.verify'
  | 'va.reject'
  | 'va.set_pending'
  | 'user.grant_admin'
  | 'user.revoke_admin'
  | 'job.delete'
  | 'user.ban'
  | 'user.unban'

interface AuditLogEntry {
  action: AuditAction
  targetType: 'va' | 'user' | 'job' | 'client'
  targetId: string
  details?: Record<string, any>
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      details: entry.details || null,
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Audit log error:', error)
  }
}

export async function getAuditLogs(limit = 100): Promise<any[]> {
  const { data } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles!actor_id(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}
