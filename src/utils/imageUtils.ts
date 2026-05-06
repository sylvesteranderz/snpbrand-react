/**
 * Supabase Storage image transformation utility.
 *
 * Supabase serves transformed images from the /render/image/ endpoint.
 * Non-Supabase URLs are returned unchanged so legacy external links still work.
 *
 * Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number // 1-100, default 80
  format?: 'webp' | 'avif' | 'origin'
  resize?: 'cover' | 'contain' | 'fill'
}

const STORAGE_OBJECT_PATH = '/storage/v1/object/public/'
const STORAGE_RENDER_PATH = '/storage/v1/render/image/public/'

/**
 * Returns a Supabase image transformation URL for storage assets.
 * Falls through unchanged for any URL that isn't a Supabase storage URL.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageTransformOptions = {},
): string {
  if (!url) return ''

  const storageIndex = url.indexOf(STORAGE_OBJECT_PATH)
  if (storageIndex === -1) return url

  const {
    width = 800,
    quality = 80,
    format = 'webp',
    height,
    resize = 'cover',
  } = options

  const origin = url.slice(0, storageIndex)
  const bucketAndPath = url.slice(storageIndex + STORAGE_OBJECT_PATH.length)

  const params = new URLSearchParams()
  params.set('width', String(width))
  params.set('quality', String(quality))
  params.set('format', format)
  if (height) params.set('height', String(height))
  params.set('resize', resize)

  return `${origin}${STORAGE_RENDER_PATH}${bucketAndPath}?${params.toString()}`
}

/** Preset for product card thumbnails (grid view). */
export const productCardImage = (url?: string | null) =>
  getOptimizedImageUrl(url, { width: 400, quality: 75, format: 'webp' })

/** Preset for the large product detail hero image. */
export const productDetailImage = (url?: string | null) =>
  getOptimizedImageUrl(url, { width: 900, quality: 85, format: 'webp' })

/** Preset for cart / sidebar thumbnails (small). */
export const productThumbnailImage = (url?: string | null) =>
  getOptimizedImageUrl(url, { width: 120, quality: 70, format: 'webp' })
