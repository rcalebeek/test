'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Card, CardContent, Input, Badge, StatusBadge, Button } from '@/components/ui'
import { getRecentInspections } from '@/services/database'
import { Search, Filter, ChevronRight, Calendar, Camera as CameraIcon } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([])
  const [filteredInspections, setFilteredInspections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    async function loadData() {
      const data = await getRecentInspections(100)
      setInspections(data)
      setFilteredInspections(data)
      setIsLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = inspections

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.pipe_number?.toLowerCase().includes(query) ||
          i.weld_number?.toLowerCase().includes(query) ||
          i.drawing_number?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.inspection_status === statusFilter)
    }

    setFilteredInspections(filtered)
  }, [searchQuery, statusFilter, inspections])

  const statusOptions = [
    { value: 'all', label: 'Alles' },
    { value: 'ok', label: 'OK' },
    { value: 'nok', label: 'NOK' },
    { value: 'twijfel', label: 'Twijfel' },
    { value: 'pending', label: 'In afwachting' },
    { value: 'herstel', label: 'Herstel' },
  ]

  return (
    <div className="min-h-screen">
      <Header title="Inspecties" />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek op leiding, las of tekening..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredInspections.length} inspectie{filteredInspections.length !== 1 ? 's' : ''} gevonden
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} variant="bordered" padding="md">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredInspections.length > 0 ? (
          <div className="space-y-3">
            {filteredInspections.map((inspection) => (
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {inspection.pipe_number}
                          </span>
                          <StatusBadge status={inspection.inspection_status} />
                          <Badge variant="default" size="sm">
                            {inspection.inspection_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Las: {inspection.weld_number}
                          {inspection.component_type && ` • ${inspection.component_type}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Tekening: {inspection.drawing_number || 'N/A'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {inspection.inspection_date
                              ? format(new Date(inspection.inspection_date), 'd MMM yyyy', {
                                  locale: nl,
                                })
                              : 'Geen datum'}
                          </span>
                          {inspection.photo_count > 0 && (
                            <span className="flex items-center gap-1">
                              <CameraIcon className="w-3 h-3" />
                              {inspection.photo_count}
                            </span>
                          )}
                          {inspection.operator_name && (
                            <span>{inspection.operator_name}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="bordered" padding="lg">
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'Geen resultaten gevonden'
                  : 'Nog geen inspecties'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/inspection/new">
                  <Button variant="primary" className="mt-4">
                    Start eerste inspectie
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
