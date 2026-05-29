# cv-gen — Générateur de CV PDF (Gemini CLI)

> Ce fichier est auto-chargé par Gemini CLI comme contexte persistant.
> C'est l'équivalent Gemini de CLAUDE.md.

## Commande disponible

| Commande | Description |
|----------|-------------|
| `/pdf <job_url>` | Génère un CV PDF adapté à l'offre |

## Fichiers sources (lire TOUJOURS avant de générer)

| Fichier | Rôle |
|---------|------|
| `cv.md` | CV source — seule source de vérité |
| `config/profile.yml` | Identité candidat (nom, email, LinkedIn) |
| `modes/_profile.md` | Rôles cibles, narrative, framing |
| `modes/_shared.md` | Règles de génération |
| `modes/pdf.md` | Pipeline complet de génération PDF |
| `templates/cv-template.html` | Template HTML du CV |

## Règle absolue

Ne jamais inventer d'expériences, compétences ou métriques absentes de `cv.md`.
Reformuler l'existant avec les mots-clés du JD — jamais créer du nouveau.

## Script de génération PDF

```bash
node generate-pdf.mjs <input.html> <output.pdf> --format=a4
```

Les PDFs sont générés dans `output/`.
