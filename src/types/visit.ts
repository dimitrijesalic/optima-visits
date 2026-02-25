export interface VisitUser {
  id: string
  firstName: string
  lastName: string | null
  email: string
  role: 'ADMIN' | 'USER'
}

export interface Visit {
  id: string
  createdAt: string
  updatedAt: string
  status: 'PENDING' | 'CANCELED' | 'DONE'
  plannedTopic: string | null
  realisedTopic: string | null
  plannedVisitDate: string | null
  plannedVisitTime: string | null
  businessPartner: string | null
  plannedVisitDuration: string | null
  note: string | null
  grade: string | null
  userId: string
  user: VisitUser
}

export interface VisitsResponse {
  total: number
  data: Visit[]
}
