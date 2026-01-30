'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, SwitchCamera, X, Check, RotateCcw, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui'

interface CameraCaptureProps {
  onCapture: (blob: Blob, preview: string) => void
  onClose: () => void
  title?: string
  showGuide?: boolean
  guideText?: string
}

export function CameraCapture({
  onCapture,
  onClose,
  title = 'Maak foto',
  showGuide = false,
  guideText = 'Richt op de tekeninghoek',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(
        'Kon camera niet openen. Controleer of je toestemming hebt gegeven voor cameragebruik.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [facingMode, stream])

  useEffect(() => {
    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, []) // Only run on mount

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
    startCamera()
  }

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0)

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob)
          setCapturedImage(canvas.toDataURL('image/jpeg', 0.9))
        }
      },
      'image/jpeg',
      0.9
    )
  }, [])

  const retake = () => {
    setCapturedImage(null)
    setCapturedBlob(null)
  }

  const confirmPhoto = () => {
    if (capturedBlob && capturedImage) {
      onCapture(capturedBlob, capturedImage)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCapturedImage(reader.result as string)
      setCapturedBlob(file)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium">{title}</h2>
        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <SwitchCamera className="w-6 h-6" />
        </button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-white mb-4">{error}</p>
              <Button onClick={startCamera}>Probeer opnieuw</Button>
              <div className="mt-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="text-blue-400 underline">Of kies een foto uit galerij</span>
                </label>
              </div>
            </div>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white">Camera laden...</div>
              </div>
            )}
            {showGuide && !isLoading && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner guide overlay */}
                <div className="absolute bottom-4 right-4 w-32 h-32 border-2 border-yellow-400 border-dashed rounded-lg">
                  <div className="absolute -top-8 right-0 text-yellow-400 text-xs text-right whitespace-nowrap">
                    {guideText}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50 absolute bottom-0 left-0 right-0 safe-area-bottom">
        {capturedImage ? (
          <div className="flex justify-center gap-8">
            <button
              onClick={retake}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <RotateCcw className="w-8 h-8" />
            </button>
            <button
              onClick={confirmPhoto}
              className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <Check className="w-8 h-8" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-center gap-6">
            <label className="cursor-pointer p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <ImageIcon className="w-6 h-6" />
            </label>
            <button
              onClick={capturePhoto}
              disabled={isLoading || !!error}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:border-blue-400 transition-colors disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-white mx-auto" />
            </button>
            <div className="w-12" /> {/* Spacer for balance */}
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
