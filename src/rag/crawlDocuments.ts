import * as cheerio from "cheerio";
import fetch from "node-fetch";
import urlModule from "url";
import cliProgress from "cli-progress";

// Note: Full Langchain document takes a very long time to download. A short documentation is provided for the course (recommended).
const MAX_PAGES = 100;
const LANGCHAIN_DOCS_HOME = "http://127.0.0.1:5500/index.html"
  // const LANGCHAIN_DOCS_HOME = "https://learn-with-amit.github.io/genai-js/langchain/";

const LANGCHAIN_DOCS_PREFIX = "";

// use following links if you want to use full langchain documentation. This can take several minutes to process.

// const LANGCHAIN_DOCS_HOME =
//   "https://js.langchain.com/docs/introduction";

// const LANGCHAIN_DOCS_PREFIX = "/docs/";

const progressBar = new cliProgress.SingleBar({
  format: "Documents Crawled: {value}",
});

export async function crawlLangchainDocsUrls(): Promise<string[]> {
  const urls = new Set<string>();

  console.log("Crawling Local Documentation...");

  progressBar.start(MAX_PAGES, 0);

  await fetchLinkedUrls(LANGCHAIN_DOCS_HOME, urls);

  progressBar.stop();

  console.log(`Total documents crawled: ${urls.size}`);

  return [...urls];
}



async function fetchLinkedUrls(
  url: string,
  downloadedUrls: Set<string>
) {
  // Remove hash fragments and query parameters
  const parsedUrl = new URL(url);

  parsedUrl.hash = "";
  parsedUrl.search = "";

  const normalizedUrl = parsedUrl.href;

  // Prevent duplicate crawling
  if (downloadedUrls.has(normalizedUrl)) return;

  // Prevent unlimited crawling
  if (downloadedUrls.size >= MAX_PAGES) return;

  // Restrict crawling to localhost
  if (parsedUrl.origin !== new URL(LANGCHAIN_DOCS_HOME).origin) {
    return;
  }

  try {
    const response = await fetch(normalizedUrl);

    if (!response.ok) return;

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) return;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Mark as visited BEFORE following links
    downloadedUrls.add(normalizedUrl);

    progressBar.update(downloadedUrls.size);

    console.log("Crawling:", normalizedUrl);

    const links = new Set<string>();

    $("a[href]").each((index, element) => {
      const href = $(element).attr("href");

      if (!href) return;

      const linkUrl = new URL(href, normalizedUrl);

      // Remove section identifiers
      linkUrl.hash = "";

      // Ignore query parameters
      linkUrl.search = "";

      // Only localhost
      if (linkUrl.origin !== parsedUrl.origin) return;

      // Ignore same-page section navigation
      if (linkUrl.pathname === parsedUrl.pathname) return;

      // Only HTML documents
      if (
        !linkUrl.pathname.endsWith(".html") &&
        !linkUrl.pathname.endsWith("/")
      ) {
        return;
      }

      links.add(linkUrl.href);
    });

    for (const link of links) {
      if (downloadedUrls.size >= MAX_PAGES) break;

      await fetchLinkedUrls(link, downloadedUrls);
    }
  } catch (error) {
    console.error(`Error downloading ${normalizedUrl}:`, error);
  }
}
