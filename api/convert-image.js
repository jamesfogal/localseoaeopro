/**
 * LocalRank Pro — Image Conversion API
 * Route: POST /api/convert-image
 *
 * Takes an image URL, converts it to the optimal modern format,
 * and returns the converted file as a buffer + metadata.
 *
 * Supported conversions:
 *   JPEG / JPG  →  AVIF  (best compression for photos)
 *   PNG         →  WebP  (preserves transparency)
 *   GIF         →  WebP  (animated WebP for short GIFs)
 *   BMP / TIFF  →  AVIF
 *   SVG         →  pass-through (minify only, no raster conversion)
 */

import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',  // max image size we'll accept
    },
    responseLimit: '20mb',
  },
};

// ─── Format selection logic ───────────────────────────────────────────────────

function selectTargetFormat(originalFormat, hasTransparency) {
  const fmt = originalFormat.toLowerCase().replace('.', '');

  if (fmt === 'svg') return 'svg';           // never rasterize SVGs
  if (fmt === 'gif') return 'webp';          // animated WebP for GIFs
  if (fmt === 'png' && hasTransparency) return 'webp';  // WebP keeps alpha
  if (fmt === 'png') return 'avif';          // no alpha? AVIF wins on size
  if (fmt === 'jpg' || fmt === 'jpeg') return 'avif';
  if (fmt === 'bmp' || fmt === 'tiff') return 'avif';
  if (fmt === 'webp') return 'avif';         // already modern, upgrade to AVIF
  return 'webp';                             // safe fallback
}

// ─── SEO file name generator ──────────────────────────────────────────────────

function generateSeoFileName(originalName, targetFormat, businessCity, businessService) {
  // Strip extension and clean the original name
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')               // remove extension
    .replace(/[^a-zA-Z0-9\s-]/g, '')       // remove special chars
    .replace(/\s+/g, '-')                   // spaces to hyphens
    .replace(/-+/g, '-')                    // collapse multiple hyphens
    .toLowerCase()
    .trim();

  // If it's a generic name (img_001, photo, image, DSC, etc.), build a local SEO name
  const genericPatterns = /^(img|image|photo|dsc|pic|file|upload|banner|hero|bg|background|thumb|thumbnail|screenshot|\d+)[\d_-]*/i;

  if (genericPatterns.test(baseName) && businessCity && businessService) {
    const city = businessCity.toLowerCase().replace(/\s+/g, '-').replace(/,.*$/, '');
    const service = businessService.toLowerCase().replace(/\s+/g, '-');
    return `${service}-${city}.${targetFormat}`;
  }

  // Otherwise keep the cleaned original name with new extension
  return `${baseName}.${targetFormat}`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const {
    imageUrl,        // URL of the image to convert (required)
    imageBase64,     // OR base64 string of the image (alternative to URL)
    originalName,    // original filename e.g. "hero-banner.jpg"
    businessCity,    // e.g. "St. Charles"   — used for SEO naming
    businessService, // e.g. "fire-alarm-installation" — used for SEO naming
    targetFormat,    // override format selection (optional)
    quality,         // 1–100, defaults to 80 for AVIF, 82 for WebP
    isAboveFold,     // boolean — above-fold gets processed first (handled by queue)
  } = req.body;

  if (!imageUrl && !imageBase64) {
    return res.status(400).json({ error: 'Provide either imageUrl or imageBase64.' });
  }

  try {
    // 1. Get the image as a buffer
    let inputBuffer;
    let detectedName = originalName || 'image.jpg';

    if (imageUrl) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(400).json({ error: `Could not fetch image: ${response.status} ${response.statusText}` });
      }
      inputBuffer = Buffer.from(await response.arrayBuffer());
      // Try to get filename from URL if not provided
      if (!originalName) {
        detectedName = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
      }
    } else {
      inputBuffer = Buffer.from(imageBase64, 'base64');
    }

    // 2. Inspect the image with Sharp to get metadata
    const metadata = await sharp(inputBuffer).metadata();
    const originalFormat = metadata.format || 'jpeg';
    const originalSizeKB = Math.round(inputBuffer.length / 1024);
    const hasTransparency = metadata.hasAlpha || false;

    // 3. SVG pass-through — we don't rasterize SVGs
    if (originalFormat === 'svg') {
      return res.status(200).json({
        skipped: true,
        reason: 'SVG files are not converted — they are already optimal as vector format.',
        originalName: detectedName,
        originalFormat: 'svg',
        originalSizeKB,
      });
    }

    // 4. Select the target format
    const format = targetFormat || selectTargetFormat(originalFormat, hasTransparency);

    // 5. Set quality based on format
    const outputQuality = quality || (format === 'avif' ? 72 : 82);

    // 6. Run the conversion
    let sharpInstance = sharp(inputBuffer);

    // Preserve animation for GIFs converted to WebP
    if (originalFormat === 'gif') {
      sharpInstance = sharp(inputBuffer, { animated: true });
    }

    let outputBuffer;

    if (format === 'avif') {
      outputBuffer = await sharpInstance
        .avif({
          quality: outputQuality,
          effort: 4,        // 0 (fastest) – 9 (smallest). 4 is a good balance.
          chromaSubsampling: '4:2:0',
        })
        .toBuffer();
    } else if (format === 'webp') {
      outputBuffer = await sharpInstance
        .webp({
          quality: outputQuality,
          effort: 4,
          smartSubsample: true,
        })
        .toBuffer();
    } else {
      // Fallback — shouldn't hit this but just in case
      outputBuffer = await sharpInstance.webp({ quality: outputQuality }).toBuffer();
    }

    // 7. Generate the SEO file name
    const newFileName = generateSeoFileName(
      detectedName,
      format,
      businessCity,
      businessService
    );

    const convertedSizeKB = Math.round(outputBuffer.length / 1024);
    const savingsKB = originalSizeKB - convertedSizeKB;
    const savingsPct = Math.round((savingsKB / originalSizeKB) * 100);

    // 8. Return the converted image + metadata
    return res.status(200).json({
      success: true,
      originalName: detectedName,
      originalFormat,
      originalSizeKB,
      newFileName,
      targetFormat: format,
      convertedSizeKB,
      savingsKB,
      savingsPct,
      width: metadata.width,
      height: metadata.height,
      hasTransparency,
      isAboveFold: isAboveFold || false,
      convertedBase64: outputBuffer.toString('base64'),
    });

  } catch (err) {
    console.error('[convert-image] Error:', err);
    return res.status(500).json({
      error: 'Conversion failed.',
      detail: err.message,
    });
  }
}
