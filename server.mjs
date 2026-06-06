#!/usr/bin/env node
/**
 * server.mjs — Interface web locale pour cv-gen
 * Usage: node server.mjs
 * Ouvre http://localhost:3000
 */

import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Provider abstraction ──────────────────────────────────────────────
const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

const gemini = PROVIDER === 'gemini'
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      .getGenerativeModel({ model: 'gemini-2.5-flash' }, { apiVersion: 'v1' })
  : null;

const anthropic = PROVIDER === 'claude'
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

console.log(`🤖 Provider actif : ${PROVIDER.toUpperCase()}`);

/**
 * Appelle le provider actif en streaming.
 * @param {string} prompt
 * @param {(text: string) => void} onToken  — appelé à chaque morceau reçu
 * @returns {Promise<string>}               — réponse complète
 */
async function callAI(prompt, onToken = () => {}) {
  let full = '';

  if (PROVIDER === 'gemini') {
    const result = await gemini.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      full += text;
      onToken(text);
    }

  } else if (PROVIDER === 'claude') {
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        full += chunk.delta.text;
        onToken(chunk.delta.text);
      }
    }

  } else {
    throw new Error(`Provider inconnu : "${PROVIDER}". Utilise "gemini" ou "claude" dans .env`);
  }

  return full;
}
// ─────────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(resolve(__dirname, 'public')));

// --- Lecture des fichiers contexte ---
async function readContext() {
  const [cv, shared, profile, pdfMode, template] = await Promise.all([
    readFile(resolve(__dirname, 'cv.md'), 'utf-8'),
    readFile(resolve(__dirname, 'modes/_shared.md'), 'utf-8'),
    readFile(resolve(__dirname, 'modes/_profile.md'), 'utf-8'),
    readFile(resolve(__dirname, 'modes/pdf.md'), 'utf-8'),
    readFile(resolve(__dirname, 'templates/cv-template.html'), 'utf-8'),
  ]);
  return { cv, shared, profile, pdfMode, template };
}

// --- Fetch JD : fetch natif → Playwright fallback ---
async function fetchJD(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                     .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ').trim();
    if (text.length > 300) return text.slice(0, 5000);
  } catch {}

  // Fallback Playwright
  const { stdout } = await execAsync(`node fetch-jd.mjs "${url}"`, { cwd: __dirname });
  return stdout.trim();
}

// --- SSE helper ---
function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// =====================================================================
// POST /api/generate — Génère le CV adapté (SSE stream)
// =====================================================================
app.get('/api/generate', async (req, res) => {
  const { url, jdText } = req.query;
  if (!url && !jdText) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    sse(res, 'progress', { step: 1, message: 'Lecture du CV source...' });
    const { cv, shared, profile, pdfMode, template } = await readContext();

    let jd = jdText?.trim() || '';

    if (!jd) {
      sse(res, 'progress', { step: 2, message: "Récupération de l'offre d'emploi..." });
      jd = await fetchJD(url);
    } else {
      sse(res, 'progress', { step: 2, message: "Texte de l'offre reçu." });
    }

    if (!jd || jd.length < 100) {
      sse(res, 'error', { message: "Impossible de récupérer l'offre automatiquement.", fetchFailed: true });
      return res.end();
    }

    sse(res, 'progress', { step: 3, message: 'Adaptation du CV par Claude...' });

    const systemPrompt = `${shared}\n\n---\n\n${profile}\n\n---\n\n${pdfMode}`;
    const userPrompt = `
Voici l'offre d'emploi :
<jd>${jd}</jd>

Voici le CV source :
<cv>${cv}</cv>

Voici le template HTML à utiliser :
<template>${template}</template>

Adapte le CV à cette offre en suivant toutes les règles du system prompt(n'injecte pas les mots clés du jd sans les avoir compris et intégré naturellement dans le cv, ne fais pas de copier coller du jd dans le cv, utilise les informations du jd pour réécrire le cv de manière pertinente et naturelle)
Retourne UNIQUEMENT un objet JSON valide avec exactement ces clés :
{
  "entreprise": "nom de l'entreprise",
  "poste": "intitulé du poste COPIÉ MOT POUR MOT depuis l'offre, sans reformulation ni traduction ni abréviation",
  "preview": "le CV complet en texte brut (format section par section)",
  "html": "le HTML complet du CV avec tous les placeholders remplacés"
}
Ne mets rien avant ni après le JSON.`;

    const fullResponse = await callAI(
      `${systemPrompt}\n\n---\n\n${userPrompt}`,
      text => sse(res, 'token', { text })
    );

    // Parser le JSON retourné par Gemini
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      sse(res, 'error', { message: `L'IA n'a pas retourné de JSON valide. Réponse brute :\n\n${fullResponse}` });
      return res.end();
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      sse(res, 'error', { message: `JSON malformé. Réponse brute :\n\n${fullResponse}` });
      return res.end();
    }

    // Créer le dossier output/{slug}/ et sauvegarder jd.txt
    const date = new Date().toISOString().slice(0, 10);
    const slugEntreprise = (parsed.entreprise || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slugPoste = (parsed.poste || 'poste').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    const slug = `${slugEntreprise}-${slugPoste}-${date}`;
    const folderPath = resolve(__dirname, 'output', slug);
    await mkdir(folderPath, { recursive: true });
    await writeFile(resolve(folderPath, 'jd.txt'), jd, 'utf-8');

    // Sauvegarder le HTML dans le dossier de la candidature
    const htmlPath = resolve(folderPath, 'preview.html');
    await writeFile(htmlPath, parsed.html, 'utf-8');

    sse(res, 'done', {
      entreprise: parsed.entreprise,
      poste: parsed.poste,
      preview: parsed.preview,
      htmlPath,
      folderPath,
      jobUrl: url,
    });

  } catch (err) {
    sse(res, 'error', { message: err.message });
  }

  res.end();
});

// =====================================================================
// GET /api/modify — Applique des modifications au CV (SSE stream)
// =====================================================================
app.get('/api/modify', async (req, res) => {
  const { instruction, preview, url, folderPath } = req.query;
  if (!instruction || !preview) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    sse(res, 'progress', { message: 'Application des modifications...' });

    const { cv, shared, profile } = await readContext();
    const template = await readFile(resolve(__dirname, 'templates/cv-template.html'), 'utf-8');

    const prompt = `
${shared}

${profile}

Tu as déjà généré un CV adapté. Voici l'aperçu texte actuel :
<cv_actuel>${preview}</cv_actuel>

Le CV source original :
<cv_source>${cv}</cv_source>

Template HTML :
<template>${template}</template>

L'utilisateur demande la modification suivante :
<modification>${instruction}</modification>

Applique uniquement cette modification, garde le RESTE IDENTIQUE.
Retourne UNIQUEMENT un objet JSON valide avec exactement ces clés :
{
  "entreprise": "nom de l'entreprise",
  "poste": "intitulé du poste COPIÉ MOT POUR MOT depuis l'offre, sans reformulation ni traduction ni abréviation",
  "preview": "le CV complet mis à jour en texte brut",
  "html": "le HTML complet mis à jour"
}
Ne mets rien avant ni après le JSON.`;

    const fullResponse = await callAI(prompt);

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Réponse invalide');
    const parsed = JSON.parse(jsonMatch[0]);

    const htmlPath = folderPath
      ? resolve(folderPath, 'preview.html')
      : resolve(__dirname, 'preview.html');
    await writeFile(htmlPath, parsed.html, 'utf-8');

    sse(res, 'done', {
      preview: parsed.preview,
      entreprise: parsed.entreprise,
      poste: parsed.poste,
    });

  } catch (err) {
    sse(res, 'error', { message: err.message });
  }

  res.end();
});

// =====================================================================
// POST /api/pdf — Génère le PDF depuis preview.html
// =====================================================================
app.post('/api/pdf', async (req, res) => {
  const { entreprise, poste, folderPath } = req.body;
  const date = new Date().toISOString().slice(0, 10);
  const slugEntreprise = (entreprise || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slugPoste = (poste || 'poste').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  const slug = folderPath ? basename(folderPath) : `${slugEntreprise}-${slugPoste}-${date}`;
  const folder = folderPath || resolve(__dirname, 'output');
  await mkdir(folder, { recursive: true });
  const pdfPath = resolve(folder, 'cv-hamza.pdf');
  const previewHtmlPath = resolve(folder, 'preview.html');

  try {
    await execAsync(`node generate-pdf.mjs "${previewHtmlPath}" "${pdfPath}" --format=a4`, { cwd: __dirname });
    res.json({ ok: true, pdfPath, folderPath: folder });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// =====================================================================
// POST /api/candidature — Ajoute une ligne dans le tableau de suivi
// =====================================================================
app.post('/api/candidature', async (req, res) => {
  const { entreprise, poste, url, statut = 'Postulé', folderPath = '' } = req.body;
  try {
    await execAsync(
      `node add-candidature.mjs --entreprise="${entreprise}" --poste="${poste}" --url="${url}" --statut="${statut}" --notes="${folderPath}"`,
      { cwd: __dirname }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// =====================================================================
// POST /api/open-tracker — Ouvre le fichier Excel avec l'app par défaut
// =====================================================================
app.post('/api/open-tracker', async (req, res) => {
  const filePath = resolve(__dirname, 'reports/tableau-suivi.xlsx');
  try {
    await execAsync(`start "" "${filePath}"`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// =====================================================================
// POST /api/apply — Ouvre Chrome sur l'offre + enregistre "En cours"
// =====================================================================
app.post('/api/apply', async (req, res) => {
  const { entreprise, poste, url, pdfPath, folderPath = '' } = req.body;
  try {
    // Sauvegarder le contexte pour future automatisation browser
    const task = { entreprise, poste, url, pdfPath: pdfPath || '', folderPath, date: new Date().toISOString() };
    await writeFile(resolve(__dirname, 'apply-task.json'), JSON.stringify(task, null, 2), 'utf-8');

    // Ouvrir Chrome sur l'offre
    await execAsync(`start chrome "${url}"`);

    // Upsert dans l'Excel : mettre à jour si ligne existante, sinon ajouter
    const FILE = resolve(__dirname, 'reports/tableau-suivi.xlsx');
    const HEADER_ROW = 8;
    const XlsxPopulate = (await import('xlsx-populate')).default;
    const workbook = await XlsxPopulate.fromFileAsync(FILE);
    const sheet = workbook.sheet(0);
    const now = new Date().toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    let found = false;
    let row = HEADER_ROW + 1;
    while (sheet.cell(row, 1).value() != null) {
      if (sheet.cell(row, 2).value() === entreprise && sheet.cell(row, 4).value() === poste) {
        sheet.cell(row, 6).value('En cours');
        sheet.cell(row, 3).value(now);
        if (folderPath) sheet.cell(row, 9).value(folderPath);
        found = true;
        break;
      }
      row++;
    }

    if (!found) {
      await execAsync(
        `node add-candidature.mjs --entreprise="${entreprise}" --poste="${poste}" --url="${url}" --statut="En cours" --notes="${folderPath}"`,
        { cwd: __dirname }
      );
    } else {
      await workbook.toFileAsync(FILE);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// =====================================================================
// POST /api/mark-posted — Met à jour le statut d'une candidature → "Postulé"
// =====================================================================
app.post('/api/mark-posted', async (req, res) => {
  const { entreprise, poste } = req.body;
  const FILE = resolve(__dirname, 'reports/tableau-suivi.xlsx');
  const HEADER_ROW = 8;

  try {
    const XlsxPopulate = (await import('xlsx-populate')).default;
    const workbook = await XlsxPopulate.fromFileAsync(FILE);
    const sheet = workbook.sheet(0);

    // Chercher la ligne correspondante (col 2 = entreprise, col 4 = poste)
    let found = false;
    let row = HEADER_ROW + 1;
    while (sheet.cell(row, 1).value() != null) {
      const ent = sheet.cell(row, 2).value();
      const pos = sheet.cell(row, 4).value();
      if (ent === entreprise && pos === poste) {
        sheet.cell(row, 6).value('Postulé'); // col 6 = Statut
        const now = new Date().toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        sheet.cell(row, 3).value(now);        // col 3 = Date candidature
        found = true;
        break;
      }
      row++;
    }

    if (!found) {
      return res.status(404).json({ ok: false, message: 'Candidature introuvable dans le tableau.' });
    }

    await workbook.toFileAsync(FILE);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// --- Démarrage ---
const PORT = 3000;
if (PROVIDER === 'gemini' && !process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY manquante dans .env');
  process.exit(1);
}
if (PROVIDER === 'claude' && !process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY manquante dans .env');
  process.exit(1);
}
app.listen(PORT, () => {
  console.log(`\n🚀 cv-gen UI lancée → http://localhost:${PORT}\n`);
});
