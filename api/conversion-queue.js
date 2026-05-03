/**
 * Local SEO & AEO Pro — Image Conversion Queue
 * Route: POST /api/conversion-queue
 *
 * Accepts a list of image URLs and processes them
 * in priority order (above-fold first).
 *
 * Returns a job ID the client can poll for status.
 */

// In production, use a real queue (e.g. Vercel KV + background functions)
// This implementation uses in-memory tracking for development/demo.

const jobStore = new Map();

function generateJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function convertSingleImage({ imageUrl, originalName, businessCity, businessService, isAboveFold, quality }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/convert-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, originalName, businessCity, businessService, isAboveFold, quality }),
  });
  if (!res.ok) throw new Error(`Conversion failed for ${imageUrl}: ${res.status}`);
  return res.json();
}

async function processQueue(jobId, images, businessCity, businessService) {
  const job = jobStore.get(jobId);
  if (!job) return;

  // Sort: above-fold images first
  const sorted = [...images].sort((a, b) => (b.isAboveFold ? 1 : 0) - (a.isAboveFold ? 1 : 0));

  for (let i = 0; i < sorted.length; i++) {
    const img = sorted[i];
    try {
      const result = await convertSingleImage({
        imageUrl: img.url,
        originalName: img.filename || img.url.split("/").pop(),
        businessCity,
        businessService,
        isAboveFold: img.isAboveFold || false,
        quality: img.quality,
      });

      job.completed.push({ ...img, result });
      job.progress = Math.round(((i + 1) / sorted.length) * 100);
    } catch (err) {
      job.failed.push({ ...img, error: err.message });
    }
    jobStore.set(jobId, job);
  }

  job.status = "complete";
  job.completedAt = new Date().toISOString();
  jobStore.set(jobId, job);
}

export default async function handler(req, res) {
  // ── POST /api/conversion-queue — start a new job ────────────────────────────
  if (req.method === "POST") {
    const { images, businessCity, businessService } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Provide an array of images to convert." });
    }

    const jobId = generateJobId();
    const job = {
      jobId,
      status: "processing",
      total: images.length,
      progress: 0,
      completed: [],
      failed: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      businessCity,
      businessService,
    };

    jobStore.set(jobId, job);

    // Start processing in background (fire and forget)
    processQueue(jobId, images, businessCity, businessService).catch(console.error);

    return res.status(202).json({
      jobId,
      message: `Queued ${images.length} images for conversion. Above-fold images will be processed first.`,
      pollUrl: `/api/conversion-queue?jobId=${jobId}`,
    });
  }

  // ── GET /api/conversion-queue?jobId=xxx — poll job status ──────────────────
  if (req.method === "GET") {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({ error: "Provide a jobId query parameter." });
    }

    const job = jobStore.get(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found. Jobs expire after 1 hour." });
    }

    const totalSavingsKB = job.completed.reduce((acc, c) => acc + (c.result?.savingsKB || 0), 0);

    return res.status(200).json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      total: job.total,
      completedCount: job.completed.length,
      failedCount: job.failed.length,
      totalSavingsKB,
      totalSavingsMB: Math.round(totalSavingsKB / 1024 * 10) / 10,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      completed: job.completed.map(c => ({
        originalName: c.result?.originalName,
        newFileName: c.result?.newFileName,
        originalSizeKB: c.result?.originalSizeKB,
        convertedSizeKB: c.result?.convertedSizeKB,
        savingsPct: c.result?.savingsPct,
        targetFormat: c.result?.targetFormat,
        isAboveFold: c.isAboveFold,
        convertedBase64: c.result?.convertedBase64, // Base64 of converted image
      })),
      failed: job.failed.map(f => ({
        url: f.url,
        filename: f.filename,
        error: f.error,
      })),
    });
  }

  return res.status(405).json({ error: "Method not allowed. Use POST to create a job or GET to poll status." });
}
