import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard-content'
import type { Log, Settings } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch settings
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch logs from the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  return (
    <DashboardContent
      initialSettings={settings as Settings | null}
      initialLogs={(logs as Log[]) || []}
      userId={user.id}
    />
  )
}
