#!/usr/bin/env node
/**
 * fetch-jd.mjs — Récupère une fiche de poste via Playwright (navigateur headless)
 *
 * Usage: node fetch-jd.mjs <url>
 *
 * Contourne les protections des portails d'emploi (LinkedIn, Glassdoor...)
 * en simulant un vrai navigateur. Affiche le texte brut sur stdout.
 */

import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node fetch-jd.mjs <url>');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();

  // Simuler un vrai navigateur pour éviter la détection bot
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

  // Cibler le conteneur le plus probable de la fiche de poste
  const text = await page.evaluate(() => {
    const selectors = [
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[class*="description"]',
      '[id*="job-description"]',
      '[data-testid*="job"]',
      'article',
      'main',
      '[role="main"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 200) return el.innerText.trim();
    }
    return document.body.innerText.trim();
  });

  // Limiter à 4000 caractères pour ne pas saturer le contexte du LLM
  console.log(text.slice(0, 4000));
} finally {
  await browser.close();
}
