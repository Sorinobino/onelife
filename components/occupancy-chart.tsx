'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Log } from '@/lib/types'

interface OccupancyChartProps {
  logs: Log[]
  maxGuests: number
  targetOccupancy: number
}

export function OccupancyChart({ logs, maxGuests, targetOccupancy }: OccupancyChartProps) {
  const chartData = logs.map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    occupancy: maxGuests > 0 ? (log.guests / maxGuests) * 100 : 0,
    guests: log.guests,
  }))

  // Chart colors computed in JS (not CSS variables)
  const primaryColor = '#0d9488'
  const targetColor = '#f97316'
  const gridColor = '#e5e7eb'

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupancy Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available. Add logs to see the chart.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Occupancy Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                name === 'occupancy' ? `${value.toFixed(1)}%` : value,
                name === 'occupancy' ? 'Occupancy' : 'Guests',
              ]}
            />
            <ReferenceLine
              y={targetOccupancy}
              stroke={targetColor}
              strokeDasharray="5 5"
              label={{
                value: `Target ${targetOccupancy}%`,
                position: 'right',
                fill: targetColor,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="occupancy"
              stroke={primaryColor}
              strokeWidth={2}
              dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
