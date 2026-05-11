export interface CrawlResult {
  html: string;
  status: number;
  url: string;
  success: boolean;
  error?: string;
}

const TIMEOUT_MS = 15000;

export async function crawlUrl(url: string): Promise<CrawlResult> {
  let finalUrl = url;

  // Normalize URL
  if (!/^https?:\/\//i.test(url)) {
    finalUrl = "https://" + url;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(finalUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CRO-Analyzer/1.0; +https://cro-analyzer.dev)",
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timer);

    if (!response.ok && response.status !== 200) {
      return {
        html: "",
        status: response.status,
        url: response.url || finalUrl,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return {
        html: "",
        status: response.status,
        url: response.url || finalUrl,
        success: false,
        error: `Non-HTML content type: ${contentType}`,
      };
    }

    const html = await response.text();

    if (!html || html.trim().length < 100) {
      return {
        html,
        status: response.status,
        url: response.url || finalUrl,
        success: false,
        error: "Page returned empty or near-empty HTML",
      };
    }

    return {
      html,
      status: response.status,
      url: response.url || finalUrl,
      success: true,
    };
  } catch (err) {
    clearTimeout(timer);
    const msg =
      err instanceof Error ? err.message : "Unknown fetch error";
    return {
      html: "",
      status: 0,
      url: finalUrl,
      success: false,
      error: msg.includes("abort") ? "Request timed out after 15s" : msg,
    };
  }
}
