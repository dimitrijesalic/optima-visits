'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { History } from 'lucide-react'
import { fetchVisits } from '@/src/app/(auth)/dashboard/actions'
import { VisitCard } from '@/components/visit-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PreviousVisitsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState(today)

  const { data, isLoading, error } = useQuery({
    queryKey: ['visits', 'previous', page, dateFrom, dateTo],
    queryFn: () =>
      fetchVisits({
        status: 'DONE,CANCELED',
        page,
        dateFrom,
        dateTo,
        sort: 'desc',
      }),
  })

  const totalPages = data ? Math.ceil(data.total / 10) : 0

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Prethodne posete</h1>
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
              onChange={(e) => handleDateFromChange(e.target.value)}
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
              onChange={(e) => handleDateToChange(e.target.value)}
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
          Nema prethodnih poseta.
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.data.map((visit) => (
            <VisitCard key={visit.id} visit={visit} variant="previous" />
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-sm text-muted-foreground">
          Ukupno: {data.total}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prethodna
          </Button>
          <span className="text-sm text-muted-foreground">
            Strana {page} od {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sledeća
          </Button>
        </div>
      )}
    </div>
  )
}
