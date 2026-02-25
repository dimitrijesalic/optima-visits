import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MessageSquare,
  Star,
  Briefcase,
  FileText,
  StickyNote,
} from 'lucide-react'
import type { Visit } from '@/src/types/visit'

interface VisitCardProps {
  visit: Visit
  variant: 'upcoming' | 'previous'
}

const statusLabels: Record<string, string> = {
  PENDING: 'Na čekanju',
  DONE: 'Završeno',
  CANCELED: 'Otkazano',
}

export function VisitCard({ visit, variant }: VisitCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            {visit.businessPartner || 'Bez partnera'}
          </CardTitle>
          <Badge
            variant={visit.status === 'DONE' ? 'default' : 'secondary'}
          >
            {statusLabels[visit.status] || visit.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {visit.plannedTopic && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-muted-foreground">Planirana tema: </span>
              <span>{visit.plannedTopic}</span>
            </div>
          </div>
        )}

        {visit.plannedVisitDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{visit.plannedVisitDate}</span>
          </div>
        )}

        {visit.plannedVisitTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{visit.plannedVisitTime}</span>
            {visit.plannedVisitDuration && (
              <span className="text-muted-foreground">
                ({visit.plannedVisitDuration})
              </span>
            )}
          </div>
        )}

        {variant === 'previous' && visit.realisedTopic && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-muted-foreground">Realizovana tema: </span>
              <span>{visit.realisedTopic}</span>
            </div>
          </div>
        )}

        {variant === 'previous' && visit.note && (
          <div className="flex items-start gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-muted-foreground">Napomena: </span>
              <span>{visit.note}</span>
            </div>
          </div>
        )}

        {variant === 'previous' && visit.grade && (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>Ocena: {visit.grade}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
