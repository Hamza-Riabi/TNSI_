#!/usr/bin/env node
/**
 * add-candidature.mjs — Ajoute une ligne dans reports/tableau-suivi.xlsx
 * Utilise xlsx-populate pour préserver charts, styles et mise en page.
 *
 * Usage:
 *   node add-candidature.mjs \
 *     --entreprise="FDJ United" \
 *     --poste="Chef de Projet Data" \
 *     --url="https://..." \
 *     --statut="Postulé" \
 *     [--contact=""] \
 *     [--notes=""]
 */

import XlsxPopulate from 'xlsx-populate';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, 'reports/tableau-suivi.xlsx');

const HEADER_ROW = 8; // ligne Excel du header (1-indexé)

function parseArgs(args) {
  const result = {};
  for (const arg of args) {
    const m = arg.match(/^--([^=]+)=(.*)$/s);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

const params = parseArgs(process.argv.slice(2));
const today = new Date().toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const workbook = await XlsxPopulate.fromFileAsync(FILE);
const sheet = workbook.sheet(0);

// Trouver la dernière ligne utilisée après le header
let lastDataRow = HEADER_ROW;
let row = HEADER_ROW + 1;
while (sheet.cell(row, 1).value() != null) {
  lastDataRow = row;
  row++;
}

const nextRow   = lastDataRow + 1;
const nextNum   = lastDataRow - HEADER_ROW + 1; // numéro auto-incrémenté

const values = [
  nextNum,
  params.entreprise || '',
  params.date       || today,
  params.poste      || '',
  params.url        || '',
  params.statut     || 'En attente',
  params.contact    || '',
  params.relance    || '',
  params.notes      || '',
];

values.forEach((val, i) => sheet.cell(nextRow, i + 1).value(val));

await workbook.toFileAsync(FILE);

console.log(`✅ Candidature #${nextNum} ajoutée : ${params.entreprise} — ${params.poste} (${today})`);
