# Contexte système — cv-gen

## Fichiers sources (lire TOUJOURS avant de générer)

| Fichier | Rôle |
|---------|------|
| `cv.md` | CV source — seule source de vérité |
| `modes/_profile.md` | Rôles cibles, narrative, framing par archétype |




---

## Règles de rédaction (documents candidat)

### JAMAIS

- Modifier cv.md
- Utiliser du jargon corporate creux : "synergies", "robuste", "innovant", "best practices"
- Passif quand l'actif est possible
- **Supprimer les accents** : écrire "experience" au lieu de "expérience", "Etudiant" au lieu de "Étudiant", etc. — les accents (é, è, ê, à, â, ç, ù, û, î, ï, ô, ü, ë) sont du UTF-8 valide et DOIVENT être conservés tels quels

### TOUJOURS

- Spécifique > abstrait : "Pipeline NiFi → PostgreSQL → Kafka" > "architecture data scalable"
- Keywords du JD intégrés naturellement dans les bullets existants (reformulation, pas invention)
- Conserver les accents du français exactement comme dans cv.md — é, è, ê, à, â, ç, ù, û, î, ï, ô doivent apparaître tels quels dans le HTML généré
- Normalisation ATS : generate-pdf.mjs gère uniquement les tirets (—, –), guillemets typographiques et espaces insécables — PAS les accents

---

## Outils disponibles

| Outil | Usage |
|-------|-------|
| WebFetch | Extraire le JD depuis l'URL (portails publics) |
| WebSearch | Fallback si WebFetch échoue |
| Bash `node fetch-jd.mjs <url>` | **Fallback Playwright** — utiliser si WebFetch échoue ou retourne vide (LinkedIn, Glassdoor...) |
| Read | cv.md, profile.yml, _profile.md, cv-template.html |
| Write | HTML temporaire |
| Bash `node generate-pdf.mjs <html> <pdf> --format=a4` | Génération PDF final |

## Stratégie de fetch (ordre à respecter)

1. **WebFetch** → rapide, suffisant pour WTTJ, Indeed, APEC, Cadremploi
2. Si échec ou contenu < 200 caractères → **`node fetch-jd.mjs <url>`** (Playwright headless)
3. Si les deux échouent → demander à l'utilisateur de coller le texte

**Portails nécessitant Playwright :** LinkedIn, Glassdoor, Monster (login wall)
