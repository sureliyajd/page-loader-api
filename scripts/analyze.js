#!/usr/bin/env node

/*
 * Analyze a URL's performance metrics via Lighthouse and output JSON.
 *
 * Usage: node analyze.js <url>
 */

// eslint-disable-next-line no-undef
const [,, url] = process.argv;

if (!url) {
  // eslint-disable-next-line no-console
  console.error('Error: URL argument missing.');
  process.exit(1);
}

(async () => {
  const lighthouse = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse.default(url, options);
    const audits = runnerResult.lhr.audits;

    const result = {
      url,
      'First Contentful Paint': audits['first-contentful-paint']?.displayValue ?? 'N/A',
      'Fully Loaded Time': audits['speed-index']?.displayValue ?? 'N/A',
      'Time to Interactive': audits['interactive']?.displayValue ?? 'N/A',
      'Total Blocking Time': audits['total-blocking-time']?.displayValue ?? 'N/A',
      'Cumulative Layout Shift': audits['cumulative-layout-shift']?.displayValue ?? 'N/A',
      'Largest Contentful Paint': audits['largest-contentful-paint']?.displayValue ?? 'N/A',
      'Onload Time': audits['network-requests']?.displayValue ?? 'N/A',
      'Redirect Time': audits['redirects']?.displayValue ?? 'N/A',
      'Server Response Time': audits['server-response-time']?.displayValue ?? 'N/A',
      'TTFB (Time To First Byte)': audits['server-response-time']?.displayValue ?? 'N/A',
      'Main Thread Work': audits['mainthread-work-breakdown']?.displayValue ?? 'N/A',
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lighthouse analysis failed:', error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
})(); 