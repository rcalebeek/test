'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Badge, StatusBadge, Select } from '@/components/ui'
import { getInspectionWithDetails, updateInspection, getPhotosByInspection } from '@/services/database'
import { getSignedUrl } from '@/services/storage'
import {
  Camera,
  Calendar,
  User,
  FileText,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [inspection, setInspection] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getInspectionWithDetails(inspectionId)
        if (!data) {
          setError('Inspectie niet gevonden')
          return
        }
        setInspection(data)

        // Load photos with signed URLs
        const photoData = await getPhotosByInspection(inspectionId)
        const photosWithUrls = await Promise.all(
          photoData.map(async (photo) => {
            if (photo.storage_path) {
              const signedUrl = await getSignedUrl(photo.storage_path)
              return { ...photo, signedUrl }
            }
            return photo
          })
        )
        setPhotos(photosWithUrls)
      } catch (err) {
        setError('Fout bij laden inspectie')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [inspectionId])

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateInspection(inspectionId, { status: newStatus as any })
      setInspection((prev: any) => ({ ...prev, status: newStatus }))
    } catch (err) {
      console.error('Status update error:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Inspectie" showBack />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen">
        <Header title="Inspectie" showBack />
        <div className="p-4 text-center">
          <p className="text-red-500">{error || 'Inspectie niet gevonden'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
            Terug
          </Button>
        </div>
      </div>
    )
  }

  const statusOptions = [
    { value: 'pending', label: 'In afwachting' },
    { value: 'ok', label: 'OK' },
    { value: 'nok', label: 'NOK' },
    { value: 'twijfel', label: 'Twijfel' },
    { value: 'herstel', label: 'Herstel' },
  ]

  return (
    <div className="min-h-screen">
      <Header
        title={`${inspection.welds?.pipes?.pipe_number || 'Inspectie'}`}
        showBack
        backHref="/inspections"
      />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Status card */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Status</h3>
              <StatusBadge status={inspection.status} />
            </div>

            <Select
              options={statusOptions}
              value={inspection.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
            />
          </CardContent>
        </Card>

        {/* Details */}
        <Card variant="bordered" padding="none">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Tekening
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {inspection.welds?.pipes?.drawings?.drawing_number || '-'}
              </div>
            </div>

            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Leiding
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {inspection.welds?.pipes?.pipe_number || '-'}
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Las
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {inspection.welds?.weld_number || '-'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Positie
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {inspection.welds?.weld_position || '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Component
                </div>
                <div className="font-medium text-gray-900 dark:text-white capitalize">
                  {inspection.welds?.component_type || '-'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </div>
                <Badge variant="info">{inspection.inspection_type}</Badge>
              </div>
            </div>

            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Datum
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {inspection.inspection_date
                  ? format(new Date(inspection.inspection_date), 'd MMMM yyyy', { locale: nl })
                  : '-'}
              </div>
            </div>

            <div className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Operator
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {inspection.operators?.name || '-'}
                {inspection.operators?.certification_level && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({inspection.operators.certification_level})
                  </span>
                )}
              </div>
            </div>

            {inspection.remarks && (
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Opmerkingen
                </div>
                <div className="text-gray-900 dark:text-white">{inspection.remarks}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Photos */}
        <Card variant="bordered" padding="lg">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Foto's ({photos.length})
              </h3>
              <Link href={`/inspection/${inspectionId}/photos`}>
                <Button variant="ghost" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Toevoegen
                </Button>
              </Link>
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity"
                  >
                    {photo.signedUrl || photo.storage_url ? (
                      <img
                        src={photo.signedUrl || photo.storage_url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <Badge
                      variant={
                        photo.photo_status === 'ok'
                          ? 'success'
                          : photo.photo_status === 'nok'
                            ? 'danger'
                            : 'warning'
                      }
                      size="sm"
                      className="absolute bottom-1 left-1"
                    >
                      {photo.photo_type}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nog geen foto's</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photo lightbox */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-white">
              {selectedPhotoIndex + 1} / {photos.length}
            </span>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={photos[selectedPhotoIndex].signedUrl || photos[selectedPhotoIndex].storage_url}
              alt={`Foto ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="p-4 bg-black/50">
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setSelectedPhotoIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                  )
                }
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="text-center">
                <Badge
                  variant={
                    photos[selectedPhotoIndex].photo_status === 'ok'
                      ? 'success'
                      : photos[selectedPhotoIndex].photo_status === 'nok'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {photos[selectedPhotoIndex].photo_type} -{' '}
                  {photos[selectedPhotoIndex].photo_status?.toUpperCase()}
                </Badge>
                {photos[selectedPhotoIndex].remarks && (
                  <p className="text-white text-sm mt-2 max-w-xs mx-auto">
                    {photos[selectedPhotoIndex].remarks}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  setSelectedPhotoIndex((prev) =>
                    prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                  )
                }
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
