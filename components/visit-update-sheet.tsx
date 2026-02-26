'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateVisit } from '@/src/app/(auth)/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { Visit } from '@/src/types/visit'

interface VisitUpdateSheetProps {
  visit: Visit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VisitUpdateSheet({
  visit,
  open,
  onOpenChange,
}: VisitUpdateSheetProps) {
  const queryClient = useQueryClient()

  const [happened, setHappened] = useState(true)
  const [realisedTopic, setRealisedTopic] = useState('')
  const [grade, setGrade] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (visit && open) {
      setHappened(true)
      setRealisedTopic(visit.realisedTopic || '')
      setGrade(visit.grade || '')
      setNote(visit.note || '')
      setError('')
    }
  }, [visit, open])

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateVisit>[1]) =>
      updateVisit(visit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      onOpenChange(false)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (happened) {
      if (grade) {
        const gradeNum = Number(grade)
        if (gradeNum < 1 || gradeNum > 10) {
          setError('Ocena mora biti između 1 i 10')
          return
        }
      }

      mutation.mutate({
        status: 'DONE',
        realisedTopic: realisedTopic || undefined,
        grade: grade || undefined,
      })
    } else {
      if (!note.trim()) {
        setError('Napomena je obavezna kada poseta nije realizovana')
        return
      }

      mutation.mutate({
        status: 'CANCELED',
        note: note.trim(),
      })
    }
  }

  if (!visit) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ažuriraj posetu</SheetTitle>
          <SheetDescription>
            {visit.businessPartner || 'Bez partnera'} &mdash;{' '}
            {visit.plannedVisitDate}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-4">
          <div className="flex flex-col gap-2">
            <Label>Da li je poseta realizovana?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={happened ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setHappened(true)}
              >
                Da
              </Button>
              <Button
                type="button"
                variant={!happened ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setHappened(false)}
              >
                Ne
              </Button>
            </div>
          </div>

          {happened && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="realisedTopic">Realizovana tema</Label>
                <textarea
                  id="realisedTopic"
                  value={realisedTopic}
                  onChange={(e) => setRealisedTopic(e.target.value)}
                  placeholder="Unesite realizovanu temu"
                  rows={4}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="grade">Ocena (1-10)</Label>
                <Input
                  id="grade"
                  type="number"
                  min={1}
                  max={10}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="1-10"
                  className="w-24"
                />
              </div>
            </>
          )}

          {!happened && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="note">Napomena *</Label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Razlog otkazivanja posete"
                rows={3}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" isLoading={mutation.isPending}>
            Sačuvaj
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
