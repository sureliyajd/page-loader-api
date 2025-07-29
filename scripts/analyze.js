#!/usr/bin/env node

/**
 * Analyze a URL's performance metrics using Lighthouse and output JSON.
 * 
 * This script launches a headless Chrome instance, runs Lighthouse performance audits,
 * and returns key metrics like First Contentful Paint, Time to Interactive, etc.
 * 
 * Usage: node analyze.js <url>
 */

const [,, url] = process.argv;

if (!url) {
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

    // Extract key performance metrics from Lighthouse results
    const result = {
      url,
      'First Contentful Paint': audits['first-contentful-paint']?.displayValue ?? 'N/A',
      'Time to Interactive': audits['interactive']?.displayValue ?? 'N/A', 
      'Total Blocking Time': audits['total-blocking-time']?.displayValue ?? 'N/A',
      'Cumulative Layout Shift': audits['cumulative-layout-shift']?.displayValue ?? 'N/A',
      'Largest Contentful Paint': audits['largest-contentful-paint']?.displayValue ?? 'N/A',
      'Server Response Time': audits['server-response-time']?.displayValue ?? 'N/A',
      'Main Thread Work': audits['mainthread-work-breakdown']?.displayValue ?? 'N/A',
    };

    console.log(JSON.stringify(result));
  } catch (error) {
    console.error('Lighthouse analysis failed:', error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
})();