'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LogFormDialog } from '@/components/log-form-dialog'
import { DeleteLogDialog } from '@/components/delete-log-dialog'
import type { Log, Settings } from '@/lib/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface LogsContentProps {
  initialLogs: Log[]
  settings: Settings | null
  userId: string
}

export function LogsContent({ initialLogs, settings, userId }: LogsContentProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [deletingLog, setDeletingLog] = useState<Log | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const maxGuests = settings?.max_guests ?? 10

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('logs-list-changes')
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
            setLogs((prev) => [payload.new as Log, ...prev].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
          <p className="text-muted-foreground">
            Record and manage your daily activity
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Log
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No logs yet. Click &quot;Add Log&quot; to create your first entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Guests</TableHead>
                    <TableHead className="text-right">Income</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const profit = Number(log.income) - Number(log.expenses)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {formatDate(log.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {log.guests}/{maxGuests}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(log.income))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(log.expenses))}
                        </TableCell>
                        <TableCell className={`text-right ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {log.rating !== null ? log.rating.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                          {log.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingLog(log)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingLog(log)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <LogFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        userId={userId}
        maxGuests={maxGuests}
      />

      {/* Edit Dialog */}
      {editingLog && (
        <LogFormDialog
          open={!!editingLog}
          onOpenChange={(open) => !open && setEditingLog(null)}
          userId={userId}
          maxGuests={maxGuests}
          log={editingLog}
        />
      )}

      {/* Delete Dialog */}
      {deletingLog && (
        <DeleteLogDialog
          open={!!deletingLog}
          onOpenChange={(open) => !open && setDeletingLog(null)}
          log={deletingLog}
        />
      )}
    </div>
  )
}
