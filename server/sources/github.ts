import * as cheerio from "cheerio";
import type { NewsItem } from "@shared/types";

// Assuming myFetch and defineSource are globally available or imported
// declare function myFetch(url: string): Promise<string>;
// declare function defineSource(fn: any): any; // Simplified type for this example

interface TrendingOptions {
  since?: "daily" | "weekly" | "monthly";
  language?: string; // e.g., "python", "java"
}

const trending = defineSource(async (options?: TrendingOptions) => {
  const baseURL = "https://github.com";
  let trendingPath = "/trending";

  // Add language to the path if provided
  if (options?.language) {
    trendingPath += `/${options.language.toLowerCase()}`; // Ensure language is lowercase
  }

  const queryParams = new URLSearchParams();

  // Add 'since' query parameter if provided
  if (options?.since) {
    queryParams.set("since", options.since);
  }

  // GitHub uses spoken_language_code. If a programming language is specified,
  // it often also sets spoken_language_code to that language.
  // If no programming language, it's usually an empty string.
  queryParams.set("spoken_language_code", options?.language?.toLowerCase() || "");

  let fetchURL = `${baseURL}${trendingPath}`;
  const queryString = queryParams.toString();

  if (queryString) {
    fetchURL += `?${queryString}`;
  }

  // Log the URL for debugging (optional)
  // console.log(`Fetching: ${fetchURL}`);

  const html: string = await myFetch(fetchURL); // Ensure myFetch returns string
  const $ = cheerio.load(html);
  // GitHub's structure for trending items: articles with class Box-row
  const $main = $("article.Box-row");
  const news: NewsItem[] = [];

  $main.each((_, el) => {
    const $article = $(el);
    // Title is in an h2 (or sometimes h1) element containing an <a> tag
    const $titleLink = $article.find("h2 a, h1 a"); // Accommodate potential variations

    // Text from the link, remove newlines, collapse multiple spaces, then trim
    const title = $titleLink.text().replace(/\n/g, "").replace(/\s\s+/g, " ").trim();
    const url = $titleLink.attr("href");

    // Star count is in a link whose href ends with /stargazers
    const $starLink = $article.find("a[href$='/stargazers']");
    // Remove spaces and commas from star count, then trim
    const star = $starLink.text().replace(/[\s,]+/g, "").trim();

    // Description is usually in a <p> tag, often with class col-9
    const desc = $article.find("p.col-9").text().replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();

    if (url && title) {
      news.push({
        url: `${baseURL}${url}`,
        title,
        id: url, // Relative URL like /user/repo makes a good unique ID
        extra: {
          info: `✰ ${star || "0"}`, // Default to '0' if star count not found
          hover: desc,
        },
      });
    }
  });
  return news;
});


export default defineSource({
  // Original default (GitHub's default: daily, all languages)
  "github-trending": () => trending(), 
  // Note: GitHub's default for /trending is daily.
  // Explicitly "today" for all languages
  "github-trending-today-sub": () => trending({ since: "daily" }),

  // Python
  "github-trending-python-daily-sub": () => trending({ language: "python", since: "daily" }),
  "github-trending-python-weekly-sub": () => trending({ language: "python", since: "weekly" }),
  "github-trending-python-monthly-sub": () => trending({ language: "python", since: "monthly" }),

  // Java
  "github-trending-java-daily-sub": () => trending({ language: "java", since: "daily" }),
  "github-trending-java-weekly-sub": () => trending({ language: "java", since: "weekly" }),
  "github-trending-java-monthly-sub": () => trending({ language: "java", since: "monthly" }),

  // You can add more languages or combinations as needed
  // Example: All languages for weekly/monthly
  "github-trending-weekly-sub": () => trending({ since: "weekly" }),
  "github-trending-monthly-sub": () => trending({ since: "monthly" }),
});