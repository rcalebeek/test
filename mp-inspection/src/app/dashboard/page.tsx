'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Badge, StatusBadge } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import { getRecentInspections } from '@/services/database'
import {
  Camera,
  Plus,
  FileSearch,
  ClipboardList,
  ChevronRight,
  Activity,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [recentInspections, setRecentInspections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const inspections = await getRecentInspections(5)
      setRecentInspections(inspections)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const quickActions = [
    {
      href: '/inspection/new',
      icon: Camera,
      label: 'Nieuw MP onderzoek',
      description: 'Start een nieuwe inspectie',
      color: 'bg-blue-600',
    },
    {
      href: '/inspection/existing',
      icon: Plus,
      label: 'Bestaande aanvullen',
      description: 'Voeg toe aan bestaande leiding',
      color: 'bg-green-600',
    },
    {
      href: '/inspections',
      icon: ClipboardList,
      label: 'Overzicht',
      description: 'Bekijk alle inspecties',
      color: 'bg-purple-600',
    },
    {
      href: '/reports',
      icon: FileSearch,
      label: 'Rapporten',
      description: 'Genereer PDF rapporten',
      color: 'bg-orange-600',
    },
  ]

  return (
    <div className="min-h-screen">
      <Header title="MP Inspectie" />

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Welcome */}
        <div className="pt-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welkom{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: nl })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card
                  variant="elevated"
                  padding="md"
                  className="h-full hover:scale-[1.02] transition-transform active:scale-[0.98]"
                >
                  <CardContent>
                    <div
                      className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {action.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Recent Inspections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recente inspecties
            </h3>
            <Link
              href="/inspections"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Alles bekijken
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="bordered" padding="md">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : recentInspections.length > 0 ? (
            <div className="space-y-3">
              {recentInspections.map((inspection) => (
                <Link
                  key={inspection.inspection_id}
                  href={`/inspection/${inspection.inspection_id}`}
                >
                  <Card
                    variant="bordered"
                    padding="md"
                    className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <CardContent>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {inspection.pipe_number}
                            </span>
                            <StatusBadge status={inspection.inspection_status} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Las: {inspection.weld_number} • {inspection.component_type || 'N/A'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {inspection.inspection_date
                              ? format(new Date(inspection.inspection_date), 'd MMM yyyy', {
                                  locale: nl,
                                })
                              : 'Geen datum'}
                            {inspection.photo_count > 0 && (
                              <Badge variant="default" size="sm">
                                {inspection.photo_count} foto's
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card variant="bordered" padding="lg">
              <CardContent className="text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nog geen inspecties</p>
                <Link href="/inspection/new">
                  <Button variant="primary" size="md" className="mt-4">
                    Start eerste inspectie
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats placeholder */}
        <Card variant="elevated" padding="md">
          <CardContent>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Vandaag
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-xs text-gray-500">Inspecties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-xs text-gray-500">OK</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-xs text-gray-500">NOK</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
