import { load, type CheerioAPI, type Cheerio } from "cheerio";

function resolveImageUrl(src: string, baseUrl: string): string {
  if (!src) return "";
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) {
    const u = new URL(baseUrl);
    return u.origin + src;
  }
  // handle special case
  // https://www.vietnamairlines.com/ae/vi/useful-information/travel-guide
  if (
    baseUrl.startsWith(
      "https://www.vietnamairlines.com/ae/vi/useful-information/travel-guide"
    ) &&
    (src.startsWith("/") || src.startsWith("~"))
  ) {
    src =
      "https://www.vietnamairlines.com/ae/vi/useful-information/travel-guide/" +
      src;
  }
  // Handle relative paths
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return "";
  }
}

function extractContentWithImages(
  $: CheerioAPI,
  el: Cheerio<any>,
  baseUrl: string,
  images: string[]
): string {
  let result = "";

  el.contents().each((_, node) => {
    if (node.type === "text") {
      const text = (node as any).data?.replace(/\s+/g, " ") || "";
      result += text;
    } else if (node.type === "tag") {
      const tagName = (node as any).tagName?.toLowerCase();
      const $node = $(node);

      // Skip unwanted tags
      if (
        ["script", "style", "nav", "footer", "header", "aside"].includes(
          tagName
        )
      ) {
        return;
      }

      if (tagName === "img") {
        const src = $node.attr("src");
        const alt = $node.attr("alt") || "";
        const resolvedSrc = resolveImageUrl(src || "", baseUrl);
        if (resolvedSrc) {
          images.push(resolvedSrc);
          result += `\n\n![${alt}](${resolvedSrc})\n\n`;
        }
      } else if (["p", "div", "article", "section"].includes(tagName)) {
        result += "\n\n";
        result += extractContentWithImages($, $node, baseUrl, images);
        result += "\n\n";
      } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
        const level = parseInt(tagName[1]);
        result += "\n\n" + "#".repeat(level) + " ";
        result += extractContentWithImages($, $node, baseUrl, images);
        result += "\n\n";
      } else if (tagName === "br") {
        result += "\n";
      } else if (tagName === "li") {
        result += "\n- ";
        result += extractContentWithImages($, $node, baseUrl, images);
      } else if (["ul", "ol"].includes(tagName)) {
        result += "\n";
        result += extractContentWithImages($, $node, baseUrl, images);
        result += "\n";
      } else {
        // Recurse into other tags
        result += extractContentWithImages($, $node, baseUrl, images);
      }
    }
  });

  return result;
}

export const crawlUrl = async (url: string) => {
  try {
    const html = await $fetch<string>(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = load(html);

    // Remove scripts, styles, navs, footers
    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("footer").remove();
    $("header").remove();
    $(".ads").remove();

    // Extract title
    const title = $("title").text() || $("h1").first().text();

    // Try to find main content, fallback to body
    let contentEl = $("article");
    if (contentEl.length === 0) contentEl = $("main");
    if (contentEl.length === 0) contentEl = $(".content");
    if (contentEl.length === 0) contentEl = $("body");

    const images: string[] = [];
    const markdown = extractContentWithImages($, contentEl, url, images)
      .replace(/\n{3,}/g, "\n\n") // Normalize multiple newlines
      .trim();

    return {
      title,
      text: markdown, // Keep same property name for compatibility
      images: [...new Set(images)], // Dedup
    };
  } catch (e) {
    console.error(`Failed to crawl ${url}:`, e);
    return { title: "", text: "", images: [] };
  }
};
