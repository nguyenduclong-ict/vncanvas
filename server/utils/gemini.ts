import { GoogleGenAI } from "@google/genai";
import { MOOD_TAGS } from "../../shared/constants/moods";
import { getNextGeminiKey, updateKeyUsage } from "./keyRotator";

export const generateDestinationContent = async (
  db: any,
  contextText: string,
  imageUrls: string[]
) => {
  const apiKey = await getNextGeminiKey(db);
  if (!apiKey) throw new Error("Missing Gemini API Key");

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

  const allowedMoods = MOOD_TAGS.map((m) => `"${m.key}"`).join(", ");

  const prompt = `
    You are an expert travel editor for a high-end travel website about Vietnam ("Vietnam Canvas").
    Your style is cinematic, emotional, inspiring, yet informative and practical.
    
    Based on the following raw text crawled from the internet, create a comprehensive article for a destination.
    Raw Text:
    """${truncatedText}"""

    Available Image URLs:
    ${JSON.stringify(imageUrls)}

    TASKS:
    1. Synthesize the info into a structured JSON for this destination.
    2. Select the best 5-10 images from the provided list that are high quality and relevant.
    3. Generate content in TWO languages: Vietnamese (vi) and English (en).
    4. For 'sections' in detail_json: Create 5-20 distinct sections that form the main body of the article. Each section must have substantial content. Assign a relevant image from the selected list to sections where appropriate.
    5. Select 3-5 mood tags strictly from this list: [${allowedMoods}].
    6. FORMATTING RULES for 'bestTime', 'transport', 'tips':
       - Use line breaks (\n) to separate distinct ideas.
       - You can use **bold text** for emphasis or key phrases.
       - IMPORTANT: If you use **bold text**, DO NOT use bullet points (-). Just use newlines.
       - If NOT using bold text, you may use Markdown bullet points (-) for lists.
       - Keep it clean, easy to read, and neat.

    OUTPUT JSON FORMAT:
    {
      "mood_tags": ["tag1", "tag2"],
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

  // Update key usage stats
  await updateKeyUsage(db, apiKey);

  return JSON.parse(cleanText);
};
