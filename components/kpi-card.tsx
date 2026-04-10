'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { KPIStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  status?: KPIStatus
  icon?: React.ReactNode
}

const statusColors: Record<KPIStatus, string> = {
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
}

export function KPICard({ title, value, subtitle, status, icon }: KPICardProps) {
  return (
    <Card className="relative overflow-hidden">
      {status && (
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-1',
            statusColors[status]
          )}
        />
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
