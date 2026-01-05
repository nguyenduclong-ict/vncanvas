// Shared AI Generation Queue
// This module manages the queue for AI content generation

import { eq } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";
import { deleteDestinationImages, downloadImage } from "./image";

export interface QueueItem {
  slug: string;
  status: "queued" | "processing" | "completed" | "error";
  error?: string;
  addedAt: number;
  startedAt?: number;
  completedAt?: number;
}

interface QueueState {
  items: Map<string, QueueItem>;
  processingSlug: string | null;
  isProcessing: boolean;
}

// Global queue state (persists across requests in the same worker)
const queueState: QueueState = {
  items: new Map(),
  processingSlug: null,
  isProcessing: false,
};

// Track if processor is running
let processorRunning = false;
let dbInstance: any = null;

// Add items to queue
export function addToQueue(slugs: string[]): string[] {
  const now = Date.now();
  const added: string[] = [];

  for (const slug of slugs) {
    // Don't add if already in queue or currently processing
    const existing = queueState.items.get(slug);
    if (
      !existing ||
      (existing.status !== "queued" && existing.status !== "processing")
    ) {
      queueState.items.set(slug, {
        slug,
        status: "queued",
        addedAt: now,
      });
      added.push(slug);
    }
  }

  return added;
}

// Get next item from queue
export function getNextFromQueue(): string | null {
  for (const [slug, item] of queueState.items) {
    if (item.status === "queued") {
      return slug;
    }
  }
  return null;
}

// Update item status
export function updateQueueItem(
  slug: string,
  update: Partial<QueueItem>
): void {
  const item = queueState.items.get(slug);
  if (item) {
    Object.assign(item, update);
  }
}

// Mark item as processing
export function markProcessing(slug: string): void {
  queueState.processingSlug = slug;
  queueState.isProcessing = true;
  updateQueueItem(slug, {
    status: "processing",
    startedAt: Date.now(),
  });
}

// Mark item as completed
export function markCompleted(slug: string): void {
  updateQueueItem(slug, {
    status: "completed",
    completedAt: Date.now(),
  });
  queueState.processingSlug = null;
}

// Mark item as error
export function markError(slug: string, error: string): void {
  updateQueueItem(slug, {
    status: "error",
    error,
    completedAt: Date.now(),
  });
  queueState.processingSlug = null;
}

// Set processing state
export function setProcessing(value: boolean): void {
  queueState.isProcessing = value;
  if (!value) {
    queueState.processingSlug = null;
  }
}

// Get queue status
export function getQueueStatus() {
  const items = Array.from(queueState.items.values());

  return {
    isProcessing: queueState.isProcessing,
    processingSlug: queueState.processingSlug,
    queue: items.filter((i) => i.status === "queued").map((i) => i.slug),
    processing: items.filter((i) => i.status === "processing"),
    completed: items.filter((i) => i.status === "completed"),
    errors: items.filter((i) => i.status === "error"),
    total: items.length,
    summary: {
      queued: items.filter((i) => i.status === "queued").length,
      processing: items.filter((i) => i.status === "processing").length,
      completed: items.filter((i) => i.status === "completed").length,
      error: items.filter((i) => i.status === "error").length,
    },
  };
}

// Get item status by slug
export function getItemStatus(slug: string): QueueItem | undefined {
  return queueState.items.get(slug);
}

// Clear completed and errored items
export function clearFinished(): void {
  for (const [slug, item] of queueState.items) {
    if (item.status === "completed" || item.status === "error") {
      queueState.items.delete(slug);
    }
  }
}

// Clear all items
export function clearAll(): void {
  queueState.items.clear();
  queueState.processingSlug = null;
  queueState.isProcessing = false;
}

// Check if queue has items to process
export function hasQueuedItems(): boolean {
  for (const item of queueState.items.values()) {
    if (item.status === "queued") {
      return true;
    }
  }
  return false;
}

// Start the queue processor (call this after adding items)
export function startProcessor(db: any): void {
  dbInstance = db;
  if (!processorRunning) {
    runProcessor();
  }
}

// Background queue processor
async function runProcessor() {
  if (processorRunning || !dbInstance) return;

  processorRunning = true;
  setProcessing(true);

  while (hasQueuedItems()) {
    const slug = getNextFromQueue();
    if (!slug) break;

    markProcessing(slug);

    try {
      await processDestination(dbInstance, slug);
      markCompleted(slug);
      console.log(`[AI Queue] Completed: ${slug}`);
    } catch (error: any) {
      console.error(`[AI Queue] Error processing ${slug}:`, error);
      markError(slug, error.message || "Unknown error");
    }

    // Small delay between processing to avoid API rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  processorRunning = false;
  setProcessing(false);
}

// Process a single destination
async function processDestination(db: any, slug: string) {
  // Get destination with sourceUrls
  const dest = await db.query.destinations.findFirst({
    where: eq(destinations.slug, slug),
  });

  if (!dest || !dest.sourceUrls || dest.sourceUrls.length === 0) {
    throw new Error("No source URLs");
  }

  // 1. Crawl
  console.log(
    `[AI Queue] Crawling ${dest.sourceUrls.length} URLs for ${slug}...`
  );
  let fullText = "";
  let allImages: string[] = [];

  for (const url of dest.sourceUrls) {
    const res = await crawlUrl(url);
    fullText += `\n\n--- Source: ${url} ---\n${res.title}\n${res.text}`;
    allImages = [...allImages, ...res.images];
  }

  // 2. Generate with Gemini
  console.log(`[AI Queue] Generating content with Gemini for ${slug}...`);
  const aiResult = await generateDestinationContent(db, fullText, allImages);

  // 3. Download Images
  console.log(
    `[AI Queue] Downloading ${aiResult.selected_images?.length} images for ${slug}...`
  );
  await deleteDestinationImages(slug);

  const localImageMap: Record<string, string> = {};
  let imageCount = 1;

  if (aiResult.selected_images) {
    for (const imgUrl of aiResult.selected_images) {
      const customName = `image-${imageCount}`;
      const localPath = await downloadImage(imgUrl, slug, customName);
      if (localPath) {
        localImageMap[imgUrl] = localPath;
        imageCount++;
      }
    }
  }

  // Process sections to link local images
  const langs = ["vi", "en"];
  for (const lang of langs) {
    if (aiResult[lang]?.detail_json?.sections) {
      for (const section of aiResult[lang].detail_json.sections) {
        if (section.image) {
          if (localImageMap[section.image]) {
            section.image = localImageMap[section.image];
          } else {
            try {
              const customName = `image-${imageCount}`;
              const newPath = await downloadImage(
                section.image,
                slug,
                customName
              );
              if (newPath) {
                section.image = newPath;
                imageCount++;
              }
            } catch (e) {
              console.error("Failed to download section image:", section.image);
            }
          }
        }
      }
    }
  }

  const thumbnail = Object.values(localImageMap)[0] || "";
  const coverImage = Object.values(localImageMap)[1] || thumbnail;

  // 4. Update Database
  console.log(`[AI Queue] Updating database for ${slug}...`);

  await db
    .update(destinations)
    .set({
      thumbnail: thumbnail,
      coverImage: coverImage,
    })
    .where(eq(destinations.id, dest.id));

  for (const lang of langs) {
    const content = aiResult[lang];
    if (content) {
      await db
        .insert(destinationTranslations)
        .values({
          destinationId: dest.id,
          languageCode: lang,
          title: content.title,
          shortDesc: content.short_desc,
          longDesc: content.long_desc,
          detailJson: JSON.stringify(content.detail_json),
        })
        .onConflictDoUpdate({
          target: [
            destinationTranslations.destinationId,
            destinationTranslations.languageCode,
          ],
          set: {
            title: content.title,
            shortDesc: content.short_desc,
            longDesc: content.long_desc,
            detailJson: JSON.stringify(content.detail_json),
          },
        });
    }
  }
}
