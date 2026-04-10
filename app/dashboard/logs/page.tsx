import { createClient } from '@/lib/supabase/server'
import { LogsContent } from '@/components/logs-content'
import type { Log, Settings } from '@/lib/types'

export default async function LogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch settings for max_guests
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch all logs ordered by date
  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <LogsContent
      initialLogs={(logs as Log[]) || []}
      settings={settings as Settings | null}
      userId={user.id}
    />
  )
}
