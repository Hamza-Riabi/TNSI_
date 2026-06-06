# cv-gen — Documentation

Outil de génération de CV PDF ATS-optimisé, adapté automatiquement à une offre d'emploi via IA.
lien vers fiche synthétique:https://docs.google.com/document/d/1KurtkcmD_tyTwFV-CLHYUYdmgBf6wrPJsNeVv46qWLg/edit?tab=t.0

---

## Modes d'utilisation

### Mode Web (recommandé — tout profil)
Interface graphique guidée, accessible depuis un navigateur. Aucune commande à taper. Payante (API CLAUDE) . Gratuit (GEMINI API )le modele gratuit de gemini est moins intelligent dans l'adaptation + hallucination fréquente 
```bash
node server.mjs
# Ouvre http://localhost:3000
```

### Mode CLI — Claude Code (profil IT)
Interaction directe avec Claude dans le terminal. Plus flexible, permet de chatter librement,
modifier les instructions, itérer sans contraintes. Utilise les commandes `/pdf`, `/apply`.
Gratuit avec un abonnement Claude Pro/Gemini Pro

---

## Prérequis

- **Node.js** v18+
- **npm**
- Un compte **Google AI Studio** (Gemini, gratuit) ou **Anthropic** (Claude, ~$5 crédit)

---

## Installation

```bash
# 1. Cloner le projet
git clone https://github.com/Hamza-Riabi/TNSI_.git
cd cv-gen

# 2. Installer les dépendances
npm install

# 3. Installer le navigateur Playwright (pour la génération PDF)
npx playwright install chromium

# 4. Configurer les clés API
cp .env.example .env
# Éditer .env et renseigner les clés
```

---

## Configuration — `.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Choisir le provider IA : gemini | claude
AI_PROVIDER=gemini
```

| Provider | Coût | Obtenir la clé |
|----------|------|----------------|
| Gemini | Gratuit (quota limité) | [aistudio.google.com](https://aistudio.google.com) |
| Claude | ~€0.3/génération | [console.anthropic.com](https://console.anthropic.com) |

---

## Structure du projet

```
cv-gen/
│
├── server.mjs                  ← Serveur Express (mode Web)
├── generate-pdf.mjs            ← Génération PDF via Playwright (auto-scale 1 page)
├── fetch-jd.mjs                ← Récupération d'une offre via Playwright (fallback)
├── add-candidature.mjs         ← Ajout d'une ligne dans le tableau Excel
│
├── cv.md                       ← CV source — seule source de vérité (à personnaliser)
│
├── modes/
│   ├── _shared.md              ← Règles de rédaction communes à tous les modes
│   ├── _profile.md             ← Archetypes de postes cibles (Data Analyst, BA, etc.)
│   └── pdf.md                  ← Pipeline de génération PDF (instructions détaillées)
│
├── templates/
│   └── cv-template.html        ← Template HTML du CV (placeholders {{...}})
│
├── public/
│   └── index.html              ← Interface web (HTML/CSS/JS vanilla)
│
├── reports/
│   └── tableau-suivi.xlsx      ← Tableau de suivi des candidatures (Excel)
│
├── output/                     ← Dossiers générés par candidature
│   └── {entreprise}-{poste}-{date}/
│       ├── preview.html        ← CV HTML adapté
│       ├── cv-hamza.pdf        ← PDF final
│       └── jd.txt              ← Texte de l'offre archivé
│
├── fonts/                      ← Polices auto-hébergées (Space Grotesk, DM Sans)
│
├── .claude/
│   └── commands/
│       └── apply.md            ← Commande /apply (CLI — remplissage formulaire)
│
├── .env                        ← Clés API (ne jamais committer)
├── .env.example                ← Modèle de configuration
├── .gitignore
└── package.json
```

---

## Flux de génération (mode Web)

```
1. Coller l'URL de l'offre  →  le serveur fetch le texte de la page
   (ou coller le texte directement si l'URL est inaccessible)

2. L'IA analyse l'offre + cv.md  →  génère un CV adapté
   Contexte envoyé à l'IA :
   - _shared.md  (règles de rédaction)
   - _profile.md (archetypes)
   - pdf.md      (contraintes mise en page)
   - cv.md       (CV source)
   - cv-template.html (template HTML)
   - texte de l'offre

3. Aperçu texte affiché  →  possibilité de modifier avant PDF

4. Génération PDF  →  Playwright ouvre le HTML, capture en PDF
   Auto-scale : réduit jusqu'à scale 0.6 si le contenu déborde

5. Choix post-PDF :
   - "Postuler avec Claude" → Chrome ouvre l'offre + prompt copié dans le presse-papiers
   - "Postuler plus tard"  → statut "À envoyer" dans l'Excel
   - "J'ai postulé"        → statut "Postulé" + date mise à jour dans l'Excel
```

---

## Tableau de suivi Excel

Fichier : `reports/tableau-suivi.xlsx`
Header en ligne 8. Colonnes :

| Col | Contenu |
|-----|---------|
| 1 | N° candidature (auto) |
| 2 | Nom entreprise |
| 3 | Date candidature |
| 4 | Nom du poste (copié mot pour mot depuis l'offre) |
| 5 | URL de l'offre |
| 6 | Statut (`À envoyer` / `En cours` / `Postulé`) |
| 7 | Contact |
| 8 | Date de relance |
| 9 | Notes (chemin du dossier `output/`) |

---

## Génération PDF manuelle

```bash
node generate-pdf.mjs "output/{dossier}/preview.html" "output/{dossier}/cv-hamza.pdf" --format=a4
```

---

## Personnalisation

Pour adapter l'outil à un autre candidat :

1. **`cv.md`** — remplacer par son propre CV en Markdown
2. **`modes/_profile.md`** — adapter les archetypes aux rôles visés
3. **`modes/_shared.md`** — modifier les règles de rédaction si besoin
4. **`templates/cv-template.html`** — modifier le design du CV

---

## Commande CLI `/apply` (mode Claude Code)

Après avoir cliqué "Postuler avec Claude" dans l'interface web :

1. Le fichier `apply-task.json` est créé avec le contexte (entreprise, poste, URL, PDF)
2. Dans le terminal Claude, taper `/apply`
3. Claude lit `apply-task.json`, analyse le formulaire via un MCP browser, remplit les champs et demande confirmation avant de soumettre

> Nécessite un MCP browser configuré (`claude mcp add playwright npx @playwright/mcp@latest`)

---

## Dépendances principales

| Package | Rôle |
|---------|------|
| `express` | Serveur HTTP (mode Web) |
| `@google/generative-ai` | API Gemini |
| `@anthropic-ai/sdk` | API Claude |
| `playwright` | Génération PDF + fetch JS des offres |
| `xlsx-populate` | Écriture Excel sans détruire le formatting |
| `dotenv` | Chargement des variables d'environnement |
