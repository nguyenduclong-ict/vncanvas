import type { H3Event } from "h3";
import { aiQueueConsumer } from "./aiValues";

export const consumers: Record<
  string,
  {
    name: string;
    description: string;
    consumer: (data: any, event: H3Event) => Promise<void>;
  }
> = {
  "ai-queue": {
    name: "AI Generator",
    description: "Generates content for destinations via Gemini",
    consumer: aiQueueConsumer,
  },
};
