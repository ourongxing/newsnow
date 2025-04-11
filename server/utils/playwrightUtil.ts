import type { Browser, Page } from "playwright"
import { chromium } from "playwright"

export async function fetchHtmlContent(url: string): Promise<string> {
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const page: Page = await browser.newPage()
    await page.goto(url, { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle")
    const htmlContent = await page.content()
    return htmlContent
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
