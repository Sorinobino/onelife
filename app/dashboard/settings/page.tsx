import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from '@/components/settings-content'
import type { Settings } from '@/lib/types'

export default async function SettingsPage() {
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

  return (
    <SettingsContent
      initialSettings={settings as Settings | null}
      userId={user.id}
      userEmail={user.email || ''}
    />
  )
}
