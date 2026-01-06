import { clearPendingQueue } from "../../utils/aiQueue";

export default defineEventHandler(async () => {
  const count = clearPendingQueue();
  return { success: true, clearedCount: count };
});
