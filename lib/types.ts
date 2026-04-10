// OneLife Cloud KPI Types

export interface Settings {
  id: string
  user_id: string
  max_guests: number
  cost_per_guest: number
  target_occupancy: number
  target_rating: number
  created_at: string
  updated_at: string
}

export interface Log {
  id: string
  user_id: string
  date: string
  guests: number
  income: number
  expenses: number
  rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface KPIMetrics {
  occupancyRate: number
  totalIncome: number
  totalExpenses: number
  netProfit: number
  averageRating: number | null
  profitMargin: number
}

export type KPIStatus = 'success' | 'warning' | 'danger'

export interface KPIThresholds {
  occupancy: { warning: number; danger: number }
  profitMargin: { warning: number; danger: number }
  rating: { warning: number; danger: number }
}

export const DEFAULT_THRESHOLDS: KPIThresholds = {
  occupancy: { warning: 60, danger: 40 },
  profitMargin: { warning: 20, danger: 10 },
  rating: { warning: 4.0, danger: 3.5 },
}

export function getKPIStatus(
  value: number,
  target: number,
  thresholds: { warning: number; danger: number }
): KPIStatus {
  const percentage = (value / target) * 100
  if (percentage >= thresholds.warning) return 'success'
  if (percentage >= thresholds.danger) return 'warning'
  return 'danger'
}

export function getOccupancyStatus(rate: number, target: number): KPIStatus {
  if (rate >= target) return 'success'
  if (rate >= target * 0.8) return 'warning'
  return 'danger'
}

export function getProfitStatus(margin: number): KPIStatus {
  if (margin >= 20) return 'success'
  if (margin >= 10) return 'warning'
  return 'danger'
}

export function getRatingStatus(rating: number | null, target: number): KPIStatus {
  if (rating === null) return 'warning'
  if (rating >= target) return 'success'
  if (rating >= target * 0.9) return 'warning'
  return 'danger'
}
