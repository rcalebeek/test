import Tesseract from 'tesseract.js'

export interface OCRResult {
  success: boolean
  rawText: string
  drawingNumber: string | null
  pipeNumber: string | null
  confidence: number
  error?: string
}

// Regex patterns for Dutch piping documentation
const DRAWING_PATTERNS = [
  /(?:DRW|TEKENING|TEK|DRAWING)[:\s-]*([A-Z0-9][-A-Z0-9_.]{3,})/i,
  /([A-Z]{2,3}[-_]?\d{3,}[-_]?[A-Z0-9]*)/,
  /([A-Z0-9]{2,}[-_.][A-Z0-9]{2,}[-_.][A-Z0-9]{2,})/,
]

const PIPE_PATTERNS = [
  /(?:PIPE|LEIDING|LINE)[:\s#-]*([A-Z0-9][-A-Z0-9_.]{2,})/i,
  /PIPE[-_]?(\d{3,})/i,
  /([A-Z]{1,3}[-_]?\d{3,}[-_]?[A-Z]{0,2}[-_]?\d{0,3})/,
  /(\d{1,2}["']\s*[-–]\s*[A-Z0-9]+[-_][A-Z0-9]+)/,
]

function extractDrawingNumber(text: string): string | null {
  for (const pattern of DRAWING_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const cleaned = match[1].trim().toUpperCase()
      if (cleaned.length >= 4) {
        return cleaned
      }
    }
  }
  return null
}

function extractPipeNumber(text: string): string | null {
  for (const pattern of PIPE_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const cleaned = match[1].trim().toUpperCase()
      if (cleaned.length >= 3) {
        return cleaned
      }
    }
  }
  return null
}

function cleanOCRText(text: string): string {
  return text
    .replace(/[^\w\s\-_.#:'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function performOCR(
  imageSource: File | Blob | string
): Promise<OCRResult> {
  try {
    // Perform OCR with Tesseract.js
    const result = await Tesseract.recognize(imageSource, 'eng+nld', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Progress can be tracked here if needed
        }
      },
    })

    const rawText = result.data.text
    const cleanedText = cleanOCRText(rawText)
    const confidence = result.data.confidence

    // Extract drawing and pipe numbers
    const drawingNumber = extractDrawingNumber(cleanedText) || extractDrawingNumber(rawText)
    const pipeNumber = extractPipeNumber(cleanedText) || extractPipeNumber(rawText)

    return {
      success: true,
      rawText: cleanedText,
      drawingNumber,
      pipeNumber,
      confidence,
    }
  } catch (error) {
    console.error('OCR Error:', error)
    return {
      success: false,
      rawText: '',
      drawingNumber: null,
      pipeNumber: null,
      confidence: 0,
      error: error instanceof Error ? error.message : 'OCR verwerking mislukt',
    }
  }
}

export async function cropAndProcessCorner(
  image: HTMLImageElement | HTMLCanvasElement,
  cornerPercent: number = 40
): Promise<OCRResult> {
  try {
    // Create a canvas to crop the bottom-right corner
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas context niet beschikbaar')
    }

    const width = image.width || (image as HTMLCanvasElement).width
    const height = image.height || (image as HTMLCanvasElement).height

    // Calculate crop area (bottom-right corner)
    const cropWidth = Math.floor(width * (cornerPercent / 100))
    const cropHeight = Math.floor(height * (cornerPercent / 100))
    const cropX = width - cropWidth
    const cropY = height - cropHeight

    canvas.width = cropWidth
    canvas.height = cropHeight

    // Draw the cropped region
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    )

    // Convert to blob for OCR
    return new Promise((resolve) => {
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const result = await performOCR(blob)
            resolve(result)
          } else {
            resolve({
              success: false,
              rawText: '',
              drawingNumber: null,
              pipeNumber: null,
              confidence: 0,
              error: 'Kon afbeelding niet verwerken',
            })
          }
        },
        'image/jpeg',
        0.9
      )
    })
  } catch (error) {
    console.error('Crop Error:', error)
    return {
      success: false,
      rawText: '',
      drawingNumber: null,
      pipeNumber: null,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Bijsnijden mislukt',
    }
  }
}

// Helper to load image from file
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Kon afbeelding niet laden'))
    }

    img.src = url
  })
}
