import type { VisitsResponse } from '@/src/types/visit'

export async function fetchVisits(params: {
  status?: string
  plannedVisitDate?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}): Promise<VisitsResponse> {
  const searchParams = new URLSearchParams()

  if (params.status) searchParams.set('status', params.status)
  if (params.plannedVisitDate)
    searchParams.set('plannedVisitDate', params.plannedVisitDate)
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom)
  if (params.dateTo) searchParams.set('dateTo', params.dateTo)
  if (params.page) searchParams.set('page', params.page.toString())

  const response = await fetch(`/api/visits?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch visits')
  }

  return response.json()
}
