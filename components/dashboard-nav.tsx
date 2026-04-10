'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, LayoutDashboard, FileText, Settings } from 'lucide-react'

interface DashboardNavProps {
  userEmail: string
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const getCurrentTab = () => {
    if (pathname.includes('/logs')) return 'logs'
    if (pathname.includes('/settings')) return 'settings'
    return 'dashboard'
  }

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      router.push('/dashboard')
    } else {
      router.push(`/dashboard/${value}`)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground md:inline">
          {userEmail}
        </span>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  )
}
