// GET endpoint to retrieve queue status
// This allows frontend to poll for AI generation progress

import {
  getQueueStatus,
  getItemStatus,
  clearFinished,
  clearAll,
} from "../../utils/aiQueue";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const action = query.action as string;
  const slug = query.slug as string;

  // Get status for specific slug
  if (slug) {
    const item = getItemStatus(slug);
    return {
      slug,
      status: item?.status || "not_in_queue",
      error: item?.error,
      addedAt: item?.addedAt,
      startedAt: item?.startedAt,
      completedAt: item?.completedAt,
    };
  }

  // Clear finished items
  if (action === "clear-finished") {
    clearFinished();
    return { success: true, message: "Cleared finished items" };
  }

  // Clear all items
  if (action === "clear-all") {
    clearAll();
    return { success: true, message: "Cleared all items" };
  }

  // Return full queue status
  return getQueueStatus();
});
