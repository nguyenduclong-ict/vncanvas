import { desc, eq } from "drizzle-orm";
import { useDb } from "~~/server/utils/db";
import { jobs } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queueName = query.queue as string | undefined;

  const db = useDb(event);

  let jobsList;
  if (queueName) {
    jobsList = await db
      .select()
      .from(jobs)
      .where(eq(jobs.queue, queueName))
      .orderBy(desc(jobs.createdAt))
      .limit(100);
  } else {
    jobsList = await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt))
      .limit(100);
  }

  return {
    data: jobsList,
    total: jobsList.length,
  };
});
