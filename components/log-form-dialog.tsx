'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Log } from '@/lib/types'

interface LogFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  maxGuests: number
  log?: Log
}

export function LogFormDialog({
  open,
  onOpenChange,
  userId,
  maxGuests,
  log,
}: LogFormDialogProps) {
  const isEditing = !!log

  const [date, setDate] = useState(log?.date || new Date().toISOString().split('T')[0])
  const [guests, setGuests] = useState(log?.guests?.toString() || '0')
  const [income, setIncome] = useState(log?.income?.toString() || '0')
  const [expenses, setExpenses] = useState(log?.expenses?.toString() || '0')
  const [rating, setRating] = useState(log?.rating?.toString() || '')
  const [notes, setNotes] = useState(log?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    const logData = {
      user_id: userId,
      date,
      guests: parseInt(guests, 10),
      income: parseFloat(income),
      expenses: parseFloat(expenses),
      rating: rating ? parseFloat(rating) : null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (isEditing && log) {
        const { error } = await supabase
          .from('logs')
          .update(logData)
          .eq('id', log.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('logs')
          .insert(logData)

        if (error) throw error
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Log' : 'Add New Log'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details for this log entry.'
              : 'Record your daily activity data.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guests">Number of Guests (max: {maxGuests})</Label>
              <Input
                id="guests"
                type="number"
                min="0"
                max={maxGuests}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="income">Income (EUR)</Label>
                <Input
                  id="income"
                  type="number"
                  min="0"
                  step="0.01"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expenses">Expenses (EUR)</Label>
                <Input
                  id="expenses"
                  type="number"
                  min="0"
                  step="0.01"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating (1-5, optional)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g., 4.5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add Log'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
