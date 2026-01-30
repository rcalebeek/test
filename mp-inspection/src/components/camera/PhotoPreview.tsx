'use client'

import { useState } from 'react'
import { X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Select, Input, Badge } from '@/components/ui'

export interface PhotoMetadata {
  photoType: 'overzicht' | 'detail' | 'indicatie' | 'afkeur' | 'herstel' | 'tekening'
  photoStatus: 'ok' | 'nok' | 'twijfel'
  remarks: string
}

interface PhotoPreviewProps {
  preview: string
  onConfirm: (metadata: PhotoMetadata) => void
  onCancel: () => void
  isUploading?: boolean
  ocrResult?: {
    drawingNumber: string | null
    pipeNumber: string | null
    confidence: number
  } | null
}

const photoTypeOptions = [
  { value: 'overzicht', label: 'Overzicht' },
  { value: 'detail', label: 'Detail' },
  { value: 'indicatie', label: 'Indicatie' },
  { value: 'afkeur', label: 'Afkeur' },
  { value: 'herstel', label: 'Herstel' },
  { value: 'tekening', label: 'Tekening' },
]

const photoStatusOptions = [
  { value: 'ok', label: 'OK' },
  { value: 'nok', label: 'NOK' },
  { value: 'twijfel', label: 'Twijfel' },
]

export function PhotoPreview({
  preview,
  onConfirm,
  onCancel,
  isUploading = false,
  ocrResult,
}: PhotoPreviewProps) {
  const [photoType, setPhotoType] = useState<PhotoMetadata['photoType']>('detail')
  const [photoStatus, setPhotoStatus] = useState<PhotoMetadata['photoStatus']>('ok')
  const [remarks, setRemarks] = useState('')

  const handleConfirm = () => {
    onConfirm({
      photoType,
      photoStatus,
      remarks,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium">Foto bevestigen</h2>
        <div className="w-10" />
      </div>

      {/* Image Preview */}
      <div className="flex-shrink-0 h-48 bg-black">
        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
      </div>

      {/* OCR Results */}
      {ocrResult && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">OCR Resultaat</span>
            <Badge variant="info" size="sm">
              {Math.round(ocrResult.confidence)}% betrouwbaar
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Tekening:</span>
              <span className="ml-2 text-white font-mono">
                {ocrResult.drawingNumber || 'Niet gevonden'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Leiding:</span>
              <span className="ml-2 text-white font-mono">
                {ocrResult.pipeNumber || 'Niet gevonden'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <Select
          label="Type foto"
          options={photoTypeOptions}
          value={photoType}
          onChange={(e) => setPhotoType(e.target.value as PhotoMetadata['photoType'])}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <div className="flex gap-2">
            {photoStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPhotoStatus(option.value as PhotoMetadata['photoStatus'])}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  photoStatus === option.value
                    ? option.value === 'ok'
                      ? 'bg-green-600 text-white'
                      : option.value === 'nok'
                        ? 'bg-red-600 text-white'
                        : 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Opmerkingen (optioneel)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Voeg opmerking toe..."
        />
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 safe-area-bottom">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onCancel}
            disabled={isUploading}
          >
            Annuleren
          </Button>
          <Button
            variant="success"
            size="lg"
            className="flex-1"
            onClick={handleConfirm}
            isLoading={isUploading}
            leftIcon={!isUploading && <Check className="w-5 h-5" />}
          >
            {isUploading ? 'Uploaden...' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
