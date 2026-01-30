'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Input, Select, Badge } from '@/components/ui'
import { CameraCapture, PhotoPreview, type PhotoMetadata } from '@/components/camera'
import { useAuthStore } from '@/store/auth'
import {
  performOCR,
  loadImageFromFile,
  cropAndProcessCorner,
  type OCRResult,
} from '@/services/ocr'
import { uploadInspectionPhoto, compressImage } from '@/services/storage'
import {
  createDrawing,
  createPipe,
  createWeld,
  createInspection,
  createPhoto,
  getDrawingByNumber,
  getPipeByNumber,
  getWeldByNumber,
} from '@/services/database'
import {
  Camera,
  Check,
  ChevronRight,
  Edit2,
  Loader2,
  AlertCircle,
  Plus,
  ImagePlus,
} from 'lucide-react'

type Step = 'drawing' | 'confirm-ocr' | 'weld' | 'photos' | 'complete'

const componentTypes = [
  { value: 'flens', label: 'Flens' },
  { value: 'pijp', label: 'Pijp' },
  { value: 'bocht', label: 'Bocht' },
  { value: 't-stuk', label: 'T-stuk' },
  { value: 'reducer', label: 'Reducer' },
  { value: 'cap', label: 'Cap' },
  { value: 'anders', label: 'Anders' },
]

const weldPositions = [
  { value: '1G', label: '1G - Plat' },
  { value: '2G', label: '2G - Horizontaal' },
  { value: '3G', label: '3G - Verticaal' },
  { value: '4G', label: '4G - Boven hoofd' },
  { value: '5G', label: '5G - Vaste pijp horizontaal' },
  { value: '6G', label: '6G - Vaste pijp 45°' },
]

interface CapturedPhoto {
  blob: Blob
  preview: string
  metadata?: PhotoMetadata
}

export default function NewInspectionPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  // Workflow state
  const [step, setStep] = useState<Step>('drawing')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null)

  // OCR state
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [drawingPhoto, setDrawingPhoto] = useState<Blob | null>(null)

  // Form data
  const [drawingNumber, setDrawingNumber] = useState('')
  const [pipeNumber, setPipeNumber] = useState('')
  const [weldNumber, setWeldNumber] = useState('')
  const [weldPosition, setWeldPosition] = useState('')
  const [componentType, setComponentType] = useState('')
  const [componentDescription, setComponentDescription] = useState('')
  const [inspectionRemarks, setInspectionRemarks] = useState('')

  // Photos
  const [inspectionPhotos, setInspectionPhotos] = useState<
    Array<CapturedPhoto & { metadata: PhotoMetadata }>
  >([])

  // Created record IDs
  const [createdIds, setCreatedIds] = useState<{
    drawingId?: string
    pipeId?: string
    weldId?: string
    inspectionId?: string
  }>({})

  // Step 1: Capture drawing corner photo
  const handleDrawingCapture = async (blob: Blob, preview: string) => {
    setShowCamera(false)
    setIsProcessing(true)
    setError(null)

    try {
      // Load image and crop corner for OCR
      const img = await loadImageFromFile(new File([blob], 'drawing.jpg', { type: 'image/jpeg' }))
      const result = await cropAndProcessCorner(img, 40) // Process bottom-right 40%

      setOcrResult(result)
      setDrawingPhoto(blob)
      setCapturedPhoto({ blob, preview })

      if (result.drawingNumber) {
        setDrawingNumber(result.drawingNumber)
      }
      if (result.pipeNumber) {
        setPipeNumber(result.pipeNumber)
      }

      setStep('confirm-ocr')
    } catch (err) {
      setError('Fout bij verwerken van foto. Probeer opnieuw.')
      console.error('OCR Error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 2: Confirm OCR results
  const handleConfirmOCR = () => {
    if (!drawingNumber.trim() || !pipeNumber.trim()) {
      setError('Vul tekeningnummer en leidingnummer in')
      return
    }
    setError(null)
    setStep('weld')
  }

  // Step 3: Submit weld info and create records
  const handleSubmitWeld = async () => {
    if (!weldNumber.trim()) {
      setError('Vul lasnummer in')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Check or create drawing
      let drawing = await getDrawingByNumber(drawingNumber)
      if (!drawing) {
        drawing = await createDrawing({ drawing_number: drawingNumber })
      }
      if (!drawing) throw new Error('Kon tekening niet aanmaken')

      // Check or create pipe
      let pipe = await getPipeByNumber(pipeNumber)
      if (!pipe) {
        pipe = await createPipe({
          pipe_number: pipeNumber,
          drawing_id: drawing.id,
        })
      }
      if (!pipe) throw new Error('Kon leiding niet aanmaken')

      // Check or create weld
      let weld = await getWeldByNumber(pipe.id, weldNumber)
      if (!weld) {
        weld = await createWeld({
          pipe_id: pipe.id,
          weld_number: weldNumber,
          weld_position: weldPosition || null,
          component_type: (componentType as any) || null,
          component_description: componentDescription || null,
        })
      }
      if (!weld) throw new Error('Kon las niet aanmaken')

      // Create inspection
      const inspection = await createInspection({
        weld_id: weld.id,
        inspection_type: 'MP',
        operator_id: user?.id || null,
        status: 'pending',
        remarks: inspectionRemarks || null,
      })
      if (!inspection) throw new Error('Kon inspectie niet aanmaken')

      setCreatedIds({
        drawingId: drawing.id,
        pipeId: pipe.id,
        weldId: weld.id,
        inspectionId: inspection.id,
      })

      setStep('photos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
      console.error('Submit error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 4: Capture inspection photos
  const handlePhotoCapture = (blob: Blob, preview: string) => {
    setShowCamera(false)
    setCapturedPhoto({ blob, preview })
    setShowPhotoPreview(true)
  }

  const handlePhotoConfirm = async (metadata: PhotoMetadata) => {
    if (!capturedPhoto || !createdIds.inspectionId || !user) return

    setIsProcessing(true)

    try {
      // Compress and upload photo
      const compressed = await compressImage(
        new File([capturedPhoto.blob], 'photo.jpg', { type: 'image/jpeg' })
      )

      const uploadResult = await uploadInspectionPhoto(
        compressed,
        pipeNumber,
        weldNumber,
        metadata.photoType,
        inspectionPhotos.length + 1,
        user.id
      )

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload mislukt')
      }

      // Create photo record
      const photo = await createPhoto({
        inspection_id: createdIds.inspectionId,
        storage_path: uploadResult.path!,
        storage_url: uploadResult.url,
        photo_type: metadata.photoType,
        photo_status: metadata.photoStatus,
        remarks: metadata.remarks || null,
        sequence_number: inspectionPhotos.length + 1,
      })

      if (!photo) throw new Error('Kon foto niet opslaan')

      // Add to local list
      setInspectionPhotos((prev) => [
        ...prev,
        {
          ...capturedPhoto,
          metadata,
        },
      ])

      setShowPhotoPreview(false)
      setCapturedPhoto(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij uploaden')
      console.error('Upload error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Complete inspection
  const handleComplete = () => {
    router.push(`/inspection/${createdIds.inspectionId}`)
  }

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'drawing':
        return (
          <div className="space-y-6">
            <Card variant="elevated" padding="lg">
              <CardContent className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Stap 1: Tekeninghoek fotograferen
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Maak een foto van de rechteronderhoek van de tekening waar het tekeningnummer en
                  leidingnummer zichtbaar zijn.
                </p>
                <Button
                  size="xl"
                  className="w-full"
                  onClick={() => setShowCamera(true)}
                  leftIcon={<Camera className="w-6 h-6" />}
                >
                  Foto maken
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              De app leest automatisch de gegevens uit de foto
            </div>
          </div>
        )

      case 'confirm-ocr':
        return (
          <div className="space-y-4">
            {/* Preview */}
            {capturedPhoto && (
              <Card variant="bordered" padding="sm">
                <img
                  src={capturedPhoto.preview}
                  alt="Tekening"
                  className="w-full h-40 object-cover rounded-xl"
                />
              </Card>
            )}

            {/* OCR Results */}
            <Card variant="elevated" padding="lg">
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Gevonden gegevens
                  </span>
                  {ocrResult && (
                    <Badge variant="info" size="sm">
                      {Math.round(ocrResult.confidence)}% betrouwbaar
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    label="Tekeningnummer"
                    value={drawingNumber}
                    onChange={(e) => setDrawingNumber(e.target.value.toUpperCase())}
                    placeholder="DRW-12345"
                  />
                  <Input
                    label="Leidingnummer"
                    value={pipeNumber}
                    onChange={(e) => setPipeNumber(e.target.value.toUpperCase())}
                    placeholder="PIPE-001"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm mt-3">{error}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setShowCamera(true)}
                    leftIcon={<Edit2 className="w-5 h-5" />}
                  >
                    Opnieuw
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleConfirmOCR}
                    leftIcon={<Check className="w-5 h-5" />}
                  >
                    Bevestigen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'weld':
        return (
          <div className="space-y-4">
            <Card variant="bordered" padding="md">
              <CardContent>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tekening & Leiding</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {drawingNumber} / {pipeNumber}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Stap 2: Las koppelen
                </h2>

                <div className="space-y-4">
                  <Input
                    label="LAS-nummer *"
                    value={weldNumber}
                    onChange={(e) => setWeldNumber(e.target.value.toUpperCase())}
                    placeholder="LAS-001"
                  />

                  <Select
                    label="Laspositie"
                    options={weldPositions}
                    value={weldPosition}
                    onChange={(e) => setWeldPosition(e.target.value)}
                    placeholder="Selecteer positie..."
                  />

                  <Select
                    label="Componenttype"
                    options={componentTypes}
                    value={componentType}
                    onChange={(e) => setComponentType(e.target.value)}
                    placeholder="Selecteer type..."
                  />

                  <Input
                    label="Omschrijving (optioneel)"
                    value={componentDescription}
                    onChange={(e) => setComponentDescription(e.target.value)}
                    placeholder="Extra details..."
                  />

                  <Input
                    label="Opmerkingen inspectie (optioneel)"
                    value={inspectionRemarks}
                    onChange={(e) => setInspectionRemarks(e.target.value)}
                    placeholder="Bijzonderheden..."
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm mt-3">{error}</p>
                )}

                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleSubmitWeld}
                  isLoading={isProcessing}
                  rightIcon={!isProcessing && <ChevronRight className="w-5 h-5" />}
                >
                  Doorgaan naar foto's
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'photos':
        return (
          <div className="space-y-4">
            <Card variant="bordered" padding="md">
              <CardContent>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Inspectie</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {pipeNumber} / Las: {weldNumber}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" padding="lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Stap 3: Inspectiefoto's maken
                </h2>

                {/* Photo grid */}
                {inspectionPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {inspectionPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={photo.preview}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Badge
                          variant={
                            photo.metadata.photoStatus === 'ok'
                              ? 'success'
                              : photo.metadata.photoStatus === 'nok'
                                ? 'danger'
                                : 'warning'
                          }
                          size="sm"
                          className="absolute bottom-1 left-1"
                        >
                          {photo.metadata.photoType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowCamera(true)}
                  leftIcon={<ImagePlus className="w-5 h-5" />}
                >
                  {inspectionPhotos.length === 0 ? 'Eerste foto maken' : 'Nog een foto toevoegen'}
                </Button>

                {inspectionPhotos.length > 0 && (
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full mt-3"
                    onClick={handleComplete}
                    leftIcon={<Check className="w-5 h-5" />}
                  >
                    Inspectie afronden ({inspectionPhotos.length} foto's)
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Nieuw MP onderzoek" showBack backHref="/dashboard" />

      {/* Progress indicator */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 max-w-lg mx-auto">
          {['drawing', 'confirm-ocr', 'weld', 'photos'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                ['drawing', 'confirm-ocr', 'weld', 'photos'].indexOf(step) >= i
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {isProcessing && step === 'drawing' ? (
          <Card variant="elevated" padding="lg">
            <CardContent className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">OCR verwerking...</p>
            </CardContent>
          </Card>
        ) : (
          renderStepContent()
        )}
      </div>

      {/* Camera overlay */}
      {showCamera && (
        <CameraCapture
          onCapture={step === 'photos' ? handlePhotoCapture : handleDrawingCapture}
          onClose={() => setShowCamera(false)}
          title={step === 'photos' ? 'Inspectiefoto' : 'Tekeninghoek'}
          showGuide={step !== 'photos'}
          guideText="Richt op tekeninghoek"
        />
      )}

      {/* Photo preview overlay */}
      {showPhotoPreview && capturedPhoto && (
        <PhotoPreview
          preview={capturedPhoto.preview}
          onConfirm={handlePhotoConfirm}
          onCancel={() => {
            setShowPhotoPreview(false)
            setCapturedPhoto(null)
          }}
          isUploading={isProcessing}
        />
      )}
    </div>
  )
}
