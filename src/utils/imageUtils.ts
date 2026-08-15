/**
 * Client-side image compression utility for Supabase free-tier storage.
 *
 * Supabase's /render/image/ transformation endpoint requires the Pro plan.
 * Instead, we compress images in the browser via Canvas before uploading so
 * the stored file is already small — permanently reducing Cached Egress.
 *
 * Usage in an upload handler:
 *   const compressed = await compressImageForUpload(file)
 *   await supabase.storage.from('product-images').upload(path, compressed, {
 *     cacheControl: '31536000',
 *     contentType: 'image/webp',
 *     upsert: false,
 *   })
 */

export interface CompressOptions {
  maxWidthPx?: number   // default 1200 — enough for full-bleed product shots
  maxHeightPx?: number  // default 1200
  quality?: number      // 0–1, default 0.82
  outputFormat?: 'image/webp' | 'image/jpeg'
}

/**
 * Compress a File/Blob via Canvas before uploading to Supabase Storage.
 * Returns a Blob ready to pass to supabase.storage.upload().
 *
 * WebP is preferred (smaller than JPEG at the same quality). Falls back to
 * JPEG for environments that don't support WebP encoding (rare in 2025).
 */
export async function compressImageForUpload(
  file: File | Blob,
  options: CompressOptions = {},
): Promise<Blob> {
  const {
    maxWidthPx = 1200,
    maxHeightPx = 1200,
    quality = 0.82,
    outputFormat = 'image/webp',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Scale down proportionally if either dimension exceeds the max
      const scale = Math.min(maxWidthPx / width, maxHeightPx / height, 1)
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'))

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            // Fallback: return original file untouched
            resolve(file)
          }
        },
        outputFormat,
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = objectUrl
  })
}

/**
 * Thumbnail preset — for cart sidebar / order detail thumbnails.
 * 300 px wide is more than enough; drops most product images to ~15 KB.
 */
export const compressThumbnail = (file: File | Blob) =>
  compressImageForUpload(file, { maxWidthPx: 300, maxHeightPx: 300, quality: 0.75 })

/**
 * Card preset — for product grid cards (~400 px display width).
 */
export const compressCardImage = (file: File | Blob) =>
  compressImageForUpload(file, { maxWidthPx: 800, maxHeightPx: 800, quality: 0.82 })

/**
 * Full-size preset — for product detail hero image.
 */
export const compressHeroImage = (file: File | Blob) =>
  compressImageForUpload(file, { maxWidthPx: 1200, maxHeightPx: 1200, quality: 0.88 })
