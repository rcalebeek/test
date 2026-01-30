import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

const BUCKET_NAME = 'inspection-photos'

export interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
}

function generateFileName(
  pipeNumber: string,
  weldNumber: string,
  photoType: string,
  index: number
): string {
  const date = format(new Date(), 'yyyyMMdd')
  const timestamp = Date.now()
  const cleanPipe = pipeNumber.replace(/[^a-zA-Z0-9-_]/g, '')
  const cleanWeld = weldNumber.replace(/[^a-zA-Z0-9-_]/g, '')
  const cleanType = photoType.replace(/[^a-zA-Z0-9-_]/g, '')

  return `${cleanPipe}-${cleanWeld}-${date}-${cleanType}-${index}-${timestamp}.jpg`
}

export async function uploadInspectionPhoto(
  file: File | Blob,
  pipeNumber: string,
  weldNumber: string,
  photoType: string,
  index: number = 1,
  userId: string
): Promise<UploadResult> {
  const supabase = createClient()

  try {
    const fileName = generateFileName(pipeNumber, weldNumber, photoType, index)
    const filePath = `${userId}/${fileName}`

    // Convert Blob to File if necessary
    const fileToUpload =
      file instanceof File ? file : new File([file], fileName, { type: 'image/jpeg' })

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload mislukt',
    }
  }
}

export async function deletePhoto(path: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete exception:', error)
    return false
  }
}

export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL exception:', error)
    return null
  }
}

// Compress image before upload for better performance
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
