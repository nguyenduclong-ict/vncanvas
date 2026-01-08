import { eq } from "drizzle-orm";
import { destinations, destinationTranslations } from "~~/db/schema";
import { deleteDestinationImages, downloadImage } from "~~/server/utils/image";
// Auto-imports for utils should work in Nitro/Nuxt server context
// but if not, explicit imports might be needed for crawler/gemini if not exported properly or if outside context.
// Assuming server/utils/* are auto-imported.

export const aiQueueConsumer = async (data: { slug: string }, event: any) => {
  const { slug } = data;
  if (!slug) throw new Error("Slug is required");

  // We can access db via useDb if we had the event context, but consumers are called from trigger.post.ts
  // which might not pass event implicitly to utils unless we use contexts.
  // HOWEVER, the consumer function in trigger.post.ts receives `data`.
  // It does NOT receive `db` instance currently.
  // trigger.post.ts uses `useDb(event)` but consumer logic usually needs DB.
  // We can use `useDb` if we have access to the event, or we pass db to consumer.

  // WAIT: server/utils/queue.ts and trigger.post.ts structure:
  // trigger.post.ts calls: await consumerEntry.consumer(pickedJob.data)
  // It is running inside defineEventHandler, so `useEvent()` might work if AsyncLocalStorage is enabled?
  // But safest is to instantiate DB here or pass it.

  // Standard Nitro way often relies on event context.
  // But we can create a new DB instance if needed, or rely on global context.
  // Let's assume we can get event from context or use a helper that doesn't need event if D1 is global.
  // But D1 binding is on `event.context.cloudflare.env.DB`.

  // This is a tricky part of background workers in Nitro/CF.
  // The `trigger.post.ts` has the event. It can pass it to consumer?
  // Or we change consumer signature to `(data, event)`.
  // But for now, let's try to capture the event via `useEvent()`? No, that's experimental/unstable.

  // Better approach: modifying trigger.post.ts to pass context to consumer?
  // Or just instantiate DB here if we can get the bindings.
  // But bindings are on the event.

  // Let's modify consumers Signature in index.ts to acceptance (data, context?).
  // But let's first write the logic assuming we can get DB.
  // In `aiQueue.ts`, it accepted `db` in `startProcessor(db)`.

  // I will use `useDb(event)` as the event is now passed.
  // Actually, let's look at `server/utils/db.ts`. It takes `event`.

  // I'll update `consumers/index.ts` to `consumer: (data: any, event?: H3Event)` and `trigger.post.ts` to pass it.
  // But wait, `aiQueueConsumer` needs to be defined first.

  // Let's define the logic.

  // Use passed event to initialize DB
  const db = useDb(event);

  // 1. Update status to 'processing'
  // Note: trigger.post.ts already sets job status to running.
  // But here we update destination status.
  await db
    .update(destinations)
    .set({ aiGenStatus: "processing" })
    .where(eq(destinations.slug, slug));

  try {
    // Logic from processDestination
    const dest = await db.query.destinations.findFirst({
      where: eq(destinations.slug, slug),
    });

    if (!dest || !dest.sourceUrls || dest.sourceUrls.length === 0) {
      throw new Error("No source URLs");
    }

    console.log(
      `[AI Queue] Crawling ${dest.sourceUrls.length} URLs for ${slug}...`
    );
    let fullText = "";
    let allImages: string[] = [];

    for (const url of dest.sourceUrls) {
      try {
        const res = await crawlUrl(url);
        fullText += `\n\n--- Source: ${url} ---\n${res.title}\n${res.text}`;
        allImages = [...allImages, ...res.images];
      } catch (e) {
        console.error(`Error crawling ${url}:`, e);
      }
    }

    // 2. Generate with Gemini
    console.log(`[AI Queue] Generating content with Gemini for ${slug}...`);
    const aiResult = await generateDestinationContent(
      db, // gemini utility needs db to check settings?
      fullText,
      dest.name || slug,
      allImages
    );

    // 3. Download Images
    console.log(
      `[AI Queue] Downloading ${aiResult.selected_images?.length} images for ${slug}...`
    );
    await deleteDestinationImages(event, slug);

    const localImageMap: Record<string, string> = {};
    let imageCount = 1;

    if (aiResult.selected_images) {
      for (const imgUrl of aiResult.selected_images) {
        const localPath = await downloadImage(event, imgUrl, slug);
        if (localPath) {
          localImageMap[imgUrl] = localPath;
          imageCount++;
        }
      }
    }

    // Process sections
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
                  event,
                  section.image,
                  slug,
                  customName
                );
                if (newPath) {
                  section.image = newPath;
                  imageCount++;
                } else {
                  section.image = "";
                }
              } catch (e) {
                console.error(
                  "Failed to download section image:",
                  section.image
                );
                section.image = "";
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
        aiGenStatus: "done",
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
    console.log(`[AI Queue] Completed: ${slug}`);
  } catch (error: any) {
    console.error(`[AI Queue] Error processing ${slug}:`, error);
    await db
      .update(destinations)
      .set({ aiGenStatus: "error" }) // Store error message if schema supports it?
      .where(eq(destinations.slug, slug));
    throw error; // Re-throw to let queue handler know it failed (though we catch it there)
  }
};
