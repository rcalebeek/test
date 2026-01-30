'use client'

import { useState } from 'react'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Input, Select } from '@/components/ui'
import { getRecentInspections, getPhotosByInspection } from '@/services/database'
import { generateInspectionReport, downloadPDF } from '@/services/pdf'
import { FileText, Download, Loader2, Filter, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Filters
  const [pipeNumber, setPipeNumber] = useState('')
  const [drawingNumber, setDrawingNumber] = useState('')
  const [weldNumber, setWeldNumber] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [includePhotos, setIncludePhotos] = useState(true)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      // Fetch inspections
      const allInspections = await getRecentInspections(500)

      // Apply filters
      let filteredInspections = allInspections

      if (pipeNumber) {
        filteredInspections = filteredInspections.filter((i) =>
          i.pipe_number?.toLowerCase().includes(pipeNumber.toLowerCase())
        )
      }

      if (drawingNumber) {
        filteredInspections = filteredInspections.filter((i) =>
          i.drawing_number?.toLowerCase().includes(drawingNumber.toLowerCase())
        )
      }

      if (weldNumber) {
        filteredInspections = filteredInspections.filter((i) =>
          i.weld_number?.toLowerCase().includes(weldNumber.toLowerCase())
        )
      }

      if (dateFrom) {
        filteredInspections = filteredInspections.filter(
          (i) => i.inspection_date && i.inspection_date >= dateFrom
        )
      }

      if (dateTo) {
        filteredInspections = filteredInspections.filter(
          (i) => i.inspection_date && i.inspection_date <= dateTo
        )
      }

      if (filteredInspections.length === 0) {
        setError('Geen inspecties gevonden met de opgegeven filters')
        return
      }

      // Fetch photos if needed
      const photosMap: Record<string, any[]> = {}
      if (includePhotos) {
        for (const inspection of filteredInspections) {
          if (inspection.inspection_id) {
            const photos = await getPhotosByInspection(inspection.inspection_id)
            photosMap[inspection.inspection_id] = photos
          }
        }
      }

      // Generate PDF
      const pdf = await generateInspectionReport(filteredInspections, photosMap, {
        title: 'MP Inspectie Rapport',
        includePhotos,
        filterBy: {
          pipeNumber: pipeNumber || undefined,
          drawingNumber: drawingNumber || undefined,
          weldNumber: weldNumber || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      })

      // Download
      const filename = `MP-Rapport-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
      downloadPDF(pdf, filename)

      setSuccess(true)
    } catch (err) {
      console.error('Report generation error:', err)
      setError(err instanceof Error ? err.message : 'Fout bij genereren rapport')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearFilters = () => {
    setPipeNumber('')
    setDrawingNumber('')
    setWeldNumber('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="min-h-screen">
      <Header title="Rapporten" />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Info card */}
        <Card variant="elevated" padding="lg">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              PDF Rapport Genereren
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Genereer een overzichtelijk PDF rapport van je inspecties met optionele foto's.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="bordered" padding="lg">
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            </div>

            <div className="space-y-4">
              <Input
                label="Leidingnummer"
                value={pipeNumber}
                onChange={(e) => setPipeNumber(e.target.value)}
                placeholder="Bijv. PIPE-001"
              />

              <Input
                label="Tekeningnummer"
                value={drawingNumber}
                onChange={(e) => setDrawingNumber(e.target.value)}
                placeholder="Bijv. DRW-12345"
              />

              <Input
                label="Lasnummer"
                value={weldNumber}
                onChange={(e) => setWeldNumber(e.target.value)}
                placeholder="Bijv. LAS-001"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Datum vanaf"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <Input
                  label="Datum tot"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includePhotos"
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="includePhotos"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Foto's opnemen in rapport
                </label>
              </div>

              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Filters wissen
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Status messages */}
        {error && (
          <Card variant="bordered" padding="md" className="border-red-300 dark:border-red-700">
            <CardContent>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card variant="bordered" padding="md" className="border-green-300 dark:border-green-700">
            <CardContent>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Rapport succesvol gegenereerd en gedownload!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Generate button */}
        <Button
          size="xl"
          className="w-full"
          onClick={handleGenerateReport}
          isLoading={isGenerating}
          leftIcon={!isGenerating && <Download className="w-6 h-6" />}
        >
          {isGenerating ? 'Rapport genereren...' : 'Rapport downloaden'}
        </Button>

        {/* Quick reports */}
        <div className="pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Snelle rapporten
          </h3>
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-start"
              onClick={() => {
                handleClearFilters()
                setDateFrom(format(new Date(), 'yyyy-MM-dd'))
                setDateTo(format(new Date(), 'yyyy-MM-dd'))
                handleGenerateReport()
              }}
              leftIcon={<Calendar className="w-5 h-5" />}
            >
              Rapport van vandaag
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-start"
              onClick={() => {
                handleClearFilters()
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                setDateFrom(format(weekAgo, 'yyyy-MM-dd'))
                setDateTo(format(new Date(), 'yyyy-MM-dd'))
                handleGenerateReport()
              }}
              leftIcon={<Calendar className="w-5 h-5" />}
            >
              Rapport afgelopen week
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
