import type { Visit, VisitsResponse } from '@/src/types/visit'

export async function fetchVisits(params: {
  status?: string
  plannedVisitDate?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'asc' | 'desc'
  page?: number
}): Promise<VisitsResponse> {
  const searchParams = new URLSearchParams()

  if (params.status) searchParams.set('status', params.status)
  if (params.plannedVisitDate)
    searchParams.set('plannedVisitDate', params.plannedVisitDate)
  if (params.dateFrom) searchParams.set('dateFrom', params.dateFrom)
  if (params.dateTo) searchParams.set('dateTo', params.dateTo)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.page) searchParams.set('page', params.page.toString())

  const response = await fetch(`/api/visits?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch visits')
  }

  return response.json()
}

export async function updateVisit(
  id: string,
  data: {
    status?: string
    realisedTopic?: string
    note?: string
    grade?: string
  }
): Promise<Visit> {
  const response = await fetch(`/api/visits/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to update visit')
  }

  return response.json()
}
