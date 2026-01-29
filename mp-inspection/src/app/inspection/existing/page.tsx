'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Input, Badge, StatusBadge } from '@/components/ui'
import { searchPipes, getWeldsByPipe, getInspectionsByWeld } from '@/services/database'
import { Search, ChevronRight, Loader2, Plus, Layers } from 'lucide-react'
import Link from 'next/link'

export default function ExistingInspectionPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pipes, setPipes] = useState<any[]>([])
  const [selectedPipe, setSelectedPipe] = useState<any>(null)
  const [welds, setWelds] = useState<any[]>([])
  const [isLoadingWelds, setIsLoadingWelds] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true)
        const results = await searchPipes(searchQuery)
        setPipes(results)
        setIsSearching(false)
      } else {
        setPipes([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectPipe = async (pipe: any) => {
    setSelectedPipe(pipe)
    setIsLoadingWelds(true)

    try {
      const pipeWelds = await getWeldsByPipe(pipe.id)

      // Load inspection status for each weld
      const weldsWithInspections = await Promise.all(
        pipeWelds.map(async (weld) => {
          const inspections = await getInspectionsByWeld(weld.id)
          return {
            ...weld,
            inspections,
            latestStatus: inspections[0]?.status || null,
          }
        })
      )

      setWelds(weldsWithInspections)
    } catch (err) {
      console.error('Error loading welds:', err)
    } finally {
      setIsLoadingWelds(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Bestaande leiding" showBack backHref="/dashboard" />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {!selectedPipe ? (
          <>
            {/* Search */}
            <Card variant="elevated" padding="lg">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      Zoek leiding
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Voeg foto's toe aan bestaande leiding
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Zoek op leidingnummer..."
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Search results */}
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : pipes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pipes.length} leiding{pipes.length !== 1 ? 'en' : ''} gevonden
                </p>
                {pipes.map((pipe) => (
                  <button
                    key={pipe.id}
                    onClick={() => handleSelectPipe(pipe)}
                    className="w-full text-left"
                  >
                    <Card
                      variant="bordered"
                      padding="md"
                      className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {pipe.pipe_number}
                            </div>
                            {pipe.drawings?.drawing_number && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Tekening: {pipe.drawings.drawing_number}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <Card variant="bordered" padding="lg">
                <CardContent className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">
                    Geen leidingen gevonden
                  </p>
                  <Link href="/inspection/new">
                    <Button variant="primary" size="md" className="mt-4">
                      Nieuwe leiding aanmaken
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : (
          <>
            {/* Selected pipe */}
            <Card variant="bordered" padding="md">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Leiding</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {selectedPipe.pipe_number}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPipe(null)
                      setWelds([])
                    }}
                  >
                    Wijzig
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Welds */}
            <Card variant="elevated" padding="lg">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Lassen ({welds.length})
                  </h3>
                  <Link
                    href={`/inspection/new?pipeId=${selectedPipe.id}&pipeNumber=${selectedPipe.pipe_number}`}
                  >
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Nieuwe las
                    </Button>
                  </Link>
                </div>

                {isLoadingWelds ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : welds.length > 0 ? (
                  <div className="space-y-2">
                    {welds.map((weld) => (
                      <Link key={weld.id} href={`/inspection/weld/${weld.id}`}>
                        <Card
                          variant="bordered"
                          padding="md"
                          className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {weld.weld_number}
                                  </span>
                                  {weld.latestStatus && (
                                    <StatusBadge status={weld.latestStatus} />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {weld.component_type || 'N/A'}
                                  {weld.weld_position && ` • ${weld.weld_position}`}
                                </div>
                                {weld.inspections?.length > 0 && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {weld.inspections.length} inspectie
                                    {weld.inspections.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nog geen lassen voor deze leiding</p>
                    <Link
                      href={`/inspection/new?pipeId=${selectedPipe.id}&pipeNumber=${selectedPipe.pipe_number}`}
                    >
                      <Button variant="primary" size="md" className="mt-4">
                        Eerste las toevoegen
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
