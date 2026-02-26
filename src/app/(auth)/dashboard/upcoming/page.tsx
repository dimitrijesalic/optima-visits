'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarClock } from 'lucide-react'
import { fetchVisits } from '@/src/app/(auth)/dashboard/actions'
import { getCurrentUser } from '@/components/change-password-modal/actions'
import { VisitCard } from '@/components/visit-card'
import { VisitUpdateSheet } from '@/components/visit-update-sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Visit } from '@/src/types/visit'

export default function UpcomingVisitsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['visits', 'upcoming', dateFrom, dateTo],
    queryFn: () =>
      fetchVisits({
        status: 'PENDING',
        dateFrom,
        dateTo,
        sort: 'asc',
      }),
  })

  const canEditVisit = (visit: Visit) => {
    if (!currentUser) return false
    if (visit.status !== 'PENDING') return false
    if (visit.plannedVisitDate !== today) return false
    if (visit.userId !== currentUser.id) return false
    return true
  }

  const handleEdit = (visit: Visit) => {
    setSelectedVisit(visit)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Predstojeće posete</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="date-from" className="whitespace-nowrap">
              Od:
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="date-to" className="whitespace-nowrap">
              Do:
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          Greška pri učitavanju poseta. Pokušajte ponovo.
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nema predstojećih poseta za izabrani period.
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.data.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              variant="upcoming"
              onClick={canEditVisit(visit) ? handleEdit : undefined}
            />
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-sm text-muted-foreground">
          Ukupno: {data.total}
        </p>
      )}

      <VisitUpdateSheet
        visit={selectedVisit}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
