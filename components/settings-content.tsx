'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Settings } from '@/lib/types'
import { Save, User } from 'lucide-react'

interface SettingsContentProps {
  initialSettings: Settings | null
  userId: string
  userEmail: string
}

const DEFAULT_SETTINGS = {
  max_guests: 10,
  cost_per_guest: 50,
  target_occupancy: 70,
  target_rating: 4.5,
}

export function SettingsContent({
  initialSettings,
  userId,
  userEmail,
}: SettingsContentProps) {
  const [maxGuests, setMaxGuests] = useState(
    initialSettings?.max_guests?.toString() || DEFAULT_SETTINGS.max_guests.toString()
  )
  const [costPerGuest, setCostPerGuest] = useState(
    initialSettings?.cost_per_guest?.toString() || DEFAULT_SETTINGS.cost_per_guest.toString()
  )
  const [targetOccupancy, setTargetOccupancy] = useState(
    initialSettings?.target_occupancy?.toString() || DEFAULT_SETTINGS.target_occupancy.toString()
  )
  const [targetRating, setTargetRating] = useState(
    initialSettings?.target_rating?.toString() || DEFAULT_SETTINGS.target_rating.toString()
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const settingsData = {
      user_id: userId,
      max_guests: parseInt(maxGuests, 10),
      cost_per_guest: parseFloat(costPerGuest),
      target_occupancy: parseFloat(targetOccupancy),
      target_rating: parseFloat(targetRating),
      updated_at: new Date().toISOString(),
    }

    try {
      if (initialSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', initialSettings.id)

        if (error) throw error
      } else {
        // Insert new settings
        const { error } = await supabase.from('settings').insert(settingsData)

        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your KPI targets and business parameters
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userEmail} disabled />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Settings</CardTitle>
            <CardDescription>
              Configure your accommodation capacity and costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="maxGuests">Maximum Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Total capacity of your accommodation
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costPerGuest">Cost per Guest (EUR)</Label>
                <Input
                  id="costPerGuest"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPerGuest}
                  onChange={(e) => setCostPerGuest(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Average cost per guest for calculations
                </p>
              </div>
              <Button type="submit" disabled={isSaving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Business Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* KPI Targets */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">KPI Targets</CardTitle>
            <CardDescription>
              Set your performance targets for dashboard alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="targetOccupancy">Target Occupancy (%)</Label>
                  <Input
                    id="targetOccupancy"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={targetOccupancy}
                    onChange={(e) => setTargetOccupancy(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Occupancy rate below this will trigger warnings
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetRating">Target Rating (1-5)</Label>
                  <Input
                    id="targetRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={targetRating}
                    onChange={(e) => setTargetRating(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Average rating below this will trigger warnings
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">Settings saved successfully!</p>
              )}

              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save KPI Targets'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
