import { load } from "cheerio";

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

    // Extract text from main content areas usually
    const title = $("title").text() || $("h1").first().text();

    // Try to find main content, fallback to body
    let contentEl = $("article");
    if (contentEl.length === 0) contentEl = $("main");
    if (contentEl.length === 0) contentEl = $(".content");
    if (contentEl.length === 0) contentEl = $("body");

    const text = contentEl.text().replace(/\s+/g, " ").trim();

    // Extract images
    const images: string[] = [];
    contentEl.find("img").each((_, el) => {
      let src = $(el).attr("src");
      if (src) {
        if (src.startsWith("//")) src = "https:" + src;
        if (src.startsWith("/")) {
          const u = new URL(url);
          src = u.origin + src;
        }
        if (src.startsWith("http")) {
          images.push(src);
        }
      }
    });

    return {
      title,
      text,
      images: [...new Set(images)], // Dedup
    };
  } catch (e) {
    console.error(`Failed to crawl ${url}:`, e);
    return { title: "", text: "", images: [] };
  }
};
