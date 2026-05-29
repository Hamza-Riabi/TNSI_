# cv-gen — Générateur de CV PDF

Projet minimaliste : une seule commande, un seul résultat.

## Commande disponible

```
/pdf <job_url>
```

Génère un CV PDF adapté à l'offre d'emploi fournie.

## Structure du projet

```
cv-gen/
├── cv.md                     ← CV source (Hamza Riabi)
├── config/profile.yml        ← Identité candidat
├── modes/
│   ├── _shared.md            ← Règles communes
│   ├── _profile.md           ← Rôles cibles + narrative
│   └── pdf.md                ← Pipeline de génération PDF
├── templates/
│   └── cv-template.html      ← Template HTML du CV
├── fonts/                    ← Space Grotesk + DM Sans
├── generate-pdf.mjs          ← HTML → PDF via Playwright
└── output/                   ← PDFs générés ici
```

## Setup (première fois)

```cmd
cd cv-gen
npm install
npx playwright install chromium
```
