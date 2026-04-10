'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Log } from '@/lib/types'

interface RevenueChartProps {
  logs: Log[]
}

export function RevenueChart({ logs }: RevenueChartProps) {
  const chartData = logs.map((log) => ({
    date: new Date(log.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    income: Number(log.income),
    expenses: Number(log.expenses),
    profit: Number(log.income) - Number(log.expenses),
  }))

  // Chart colors computed in JS
  const incomeColor = '#0d9488'
  const expensesColor = '#ef4444'
  const gridColor = '#e5e7eb'

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
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
        <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `€${value.toFixed(2)}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Legend />
            <Bar
              dataKey="income"
              fill={incomeColor}
              radius={[4, 4, 0, 0]}
              name="Income"
            />
            <Bar
              dataKey="expenses"
              fill={expensesColor}
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
