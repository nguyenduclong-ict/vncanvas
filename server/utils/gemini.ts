import { GoogleGenAI } from "@google/genai";
import { getNextGeminiKey, updateKeyUsage } from "./keyRotator";

export const generateDestinationContent = async (
  db: any,
  contextText: string,
  destName: string,
  allImages?: string[]
) => {
  const apiKey = await getNextGeminiKey(db);
  if (!apiKey) throw new Error("Missing Gemini API Key");

  console.log(`Using key ...${apiKey.slice(-6)}`);

  const ai = new GoogleGenAI({ apiKey });

  const countResult = await ai.models.countTokens({
    model: "gemini-2.5-flash",
    contents: [{ parts: [{ text: contextText }] }],
  });

  const totalTokens = countResult.totalTokens || 0;
  const MAX_TOKENS = 125000;

  let truncatedText = contextText;
  if (totalTokens > MAX_TOKENS) {
    const ratio = MAX_TOKENS / totalTokens;
    const safeCharLimit = Math.floor(contextText.length * ratio * 0.95);
    truncatedText = contextText.slice(0, safeCharLimit) + "...[TRUNCATED]";
  }

  console.log("Total input tokens: ", totalTokens);
  console.log("Images count: ", allImages?.length);
  console.log(allImages);

  const prompt = `
    You are an expert travel editor for a high-end travel website about Vietnam ("Vietnam Canvas").
    Your style is cinematic, emotional, inspiring, yet informative and practical.
    
    Based on the following Markdown content crawled from the internet, create a comprehensive article for a destination: "${destName}".
    The content contains text with embedded images in Markdown format like ![alt](url). Use these images in your response.
    
    Crawled Content:
    """${truncatedText}"""

    TASKS:
    1. Synthesize the info into a structured JSON for this destination.
    2. Select the best 5-10 images from the embedded images that are high quality and relevant.
    3. Generate content in TWO languages: Vietnamese (vi) and English (en).
    4. For 'sections' in detail_json: Create 5-20 distinct sections that form the main body of the article. Each section must have substantial content. Assign relevant images from the crawled content to sections.
    5. Ensure that images assigned to sections are UNIQUE. Do not use the same image in multiple sections.
    6. FORMATTING RULES for 'bestTime', 'transport', 'tips':
       - Use line breaks (\n) to separate distinct ideas.
       - You can use **bold text** for emphasis or key phrases.
       - IMPORTANT: If you use **bold text**, DO NOT use bullet points (-). Just use newlines.
       - If NOT using bold text, you may use Markdown bullet points (-) for lists.
       - Keep it clean, easy to read, and neat.

    OUTPUT JSON FORMAT:
    {
      "selected_images": ["url1", "url2", ...],
      "vi": {
        "title": "...",
        "short_desc": "...",
        "long_desc": "...",
        "detail_json": {
           "bestTime": "...",
           "transport": "...",
           "tips": "...",
           "sections": [
              {
                "type": "paragraph",
                "content": "Detailed paragraph content...",
                "image": "URL_from_available_list_if_relevant"
              }
           ]
        }
      },
      "en": {
        "title": "...",
        "short_desc": "...",
        "long_desc": "...",
        "detail_json": {
           "bestTime": "...",
           "transport": "...",
           "tips": "...",
           "sections": [
              {
                "type": "paragraph",
                "content": "Detailed paragraph content...",
                "image": "URL_from_available_list_if_relevant"
              }
           ]
        }
      }
    }
    
    IMPORTANT:
    - Return ONLY valid JSON.
    - Do not use Markdown code blocks.
  `;

  // Update key usage stats
  await updateKeyUsage(db, apiKey);

  // New SDK generateContent
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  // Docs say response.text is directly accessible property
  const text = response.text || JSON.stringify(response);

  // Cleanup
  const cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanText);
};
