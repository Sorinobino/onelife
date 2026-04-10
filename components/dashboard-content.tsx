'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KPICard } from '@/components/kpi-card'
import { OccupancyChart } from '@/components/occupancy-chart'
import { RevenueChart } from '@/components/revenue-chart'
import type { Log, Settings, KPIMetrics } from '@/lib/types'
import { getOccupancyStatus, getProfitStatus, getRatingStatus } from '@/lib/types'
import { Users, DollarSign, TrendingUp, Star } from 'lucide-react'

interface DashboardContentProps {
  initialSettings: Settings | null
  initialLogs: Log[]
  userId: string
}

const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  max_guests: 10,
  cost_per_guest: 50,
  target_occupancy: 70,
  target_rating: 4.5,
}

export function DashboardContent({
  initialSettings,
  initialLogs,
  userId,
}: DashboardContentProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [settings, setSettings] = useState<Settings | null>(initialSettings)

  const effectiveSettings = useMemo(() => ({
    ...DEFAULT_SETTINGS,
    ...settings,
  }), [settings])

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClient()

    const logsChannel = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLogs((prev) => [...prev, payload.new as Log].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            ))
          } else if (payload.eventType === 'UPDATE') {
            setLogs((prev) =>
              prev.map((log) => (log.id === payload.new.id ? payload.new as Log : log))
            )
          } else if (payload.eventType === 'DELETE') {
            setLogs((prev) => prev.filter((log) => log.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    const settingsChannel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSettings(payload.new as Settings)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(logsChannel)
      supabase.removeChannel(settingsChannel)
    }
  }, [userId])

  // Calculate KPIs
  const metrics: KPIMetrics = useMemo(() => {
    if (logs.length === 0) {
      return {
        occupancyRate: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageRating: null,
        profitMargin: 0,
      }
    }

    const totalGuests = logs.reduce((sum, log) => sum + log.guests, 0)
    const totalPossibleGuests = logs.length * effectiveSettings.max_guests
    const occupancyRate = totalPossibleGuests > 0
      ? (totalGuests / totalPossibleGuests) * 100
      : 0

    const totalIncome = logs.reduce((sum, log) => sum + Number(log.income), 0)
    const totalExpenses = logs.reduce((sum, log) => sum + Number(log.expenses), 0)
    const netProfit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    const logsWithRating = logs.filter((log) => log.rating !== null)
    const averageRating = logsWithRating.length > 0
      ? logsWithRating.reduce((sum, log) => sum + (log.rating || 0), 0) / logsWithRating.length
      : null

    return {
      occupancyRate,
      totalIncome,
      totalExpenses,
      netProfit,
      averageRating,
      profitMargin,
    }
  }, [logs, effectiveSettings])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Your KPI overview for the last 30 days
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate.toFixed(1)}%`}
          subtitle={`Target: ${effectiveSettings.target_occupancy}%`}
          status={getOccupancyStatus(metrics.occupancyRate, effectiveSettings.target_occupancy)}
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(metrics.totalIncome)}
          subtitle={`${logs.length} days recorded`}
          status="success"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Net Profit"
          value={formatCurrency(metrics.netProfit)}
          subtitle={`Margin: ${metrics.profitMargin.toFixed(1)}%`}
          status={getProfitStatus(metrics.profitMargin)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          title="Average Rating"
          value={metrics.averageRating !== null ? metrics.averageRating.toFixed(2) : 'N/A'}
          subtitle={`Target: ${effectiveSettings.target_rating}`}
          status={getRatingStatus(metrics.averageRating, effectiveSettings.target_rating)}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OccupancyChart
          logs={logs}
          maxGuests={effectiveSettings.max_guests}
          targetOccupancy={effectiveSettings.target_occupancy}
        />
        <RevenueChart logs={logs} />
      </div>
    </div>
  )
}
