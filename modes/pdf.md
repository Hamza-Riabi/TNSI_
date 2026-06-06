.# Mode: pdf — ATS-Optimized PDF Generation

## Contrainte absolue : UNE SEULE PAGE

Le CV **doit tenir sur exactement une page**. `generate-pdf.mjs` réduit automatiquement l'échelle si le contenu déborde, mais il faut minimiser ce recours :

- Maximum **4 bullets par poste** (minimiser le nombre de bullets pours les expériences les moins pertinents par rapport l'offre de job)
- Maximum **2 projets** 
- Supprimer les bullets génériques / peu différenciants
- Ne pas répéter d'informations déjà dans d'autres sections
- Si le contenu risque encore de déborder : réduire à **1 projet**

## Full Pipeline

1. Read `cv.md` as the single source of truth
2. Ask the user for the JD if not already in context (text or URL)
3. Extract 15-20 keywords from the JD
4. Detect role archetype → adapt framing
5. Write Professional Summary using the fixed template below (§ Summary Template)
6. Select top **2** most relevant projects for the offer (maximum)
7. Reorder experience bullets by relevance to the JD — garder **3 bullets max par poste**
8. Build competency grid from JD requirements (5-7 keyword phrases)
9. Inject keywords naturally into existing achievements (NEVER invent)
10. Generate complete HTML from template + personalized content — **conserver tous les accents** (é, è, à, ç, û, etc.) : le fichier HTML est UTF-8, ne jamais les supprimer ni les remplacer par leur équivalent sans accent
11. Write HTML to `/tmp/cv-{candidate}-{company}.html`
12. **Aperçu texte complet du CV** — OBLIGATOIRE avant de générer le PDF.
    Afficher le CV entier en texte brut dans la CLI, section par section, dans cet ordre :

    ```
    ═══════════════════════════════════════════
    {NOM COMPLET}
    {téléphone} | {email} | {linkedin} | {ville}
    ═══════════════════════════════════════════

    RÉSUMÉ PROFESSIONNEL
    {summary_text}

    COMPÉTENCES CLÉS
    {tag1} · {tag2} · {tag3} · …

    EXPÉRIENCE PROFESSIONNELLE
    {Entreprise} — {Rôle} ({Période})
      • {bullet 1}
      • {bullet 2}
      • {bullet 3}
    …

    PROJETS
    {Titre} [{badge}]
      {description}
      {tech}

    FORMATION
    {Diplôme} — {École} ({Année})

    COMPÉTENCES
    {Catégorie} : {skill1}, {skill2} | {Catégorie 2} : …
    ═══════════════════════════════════════════
    ```

    Puis demander : **"Ce CV te convient ? Je génère le PDF ?"**
    - Si non → l'utilisateur précise ce qu'il veut ajuster → modifier et ré-afficher
    - Si oui → continuer à l'étape 13
13. Run: `node generate-pdf.mjs cv-gen/preview.html output/cv-{candidate}-{company}-{YYYY-MM-DD}.pdf --format={letter|a4}`
14. Report: PDF path, page count, scale used, keyword coverage %







## ATS Rules (clean parsing)

- Single-column layout (no sidebars, no parallel columns)
- Standard headers: "Professional Summary", "Work Experience", "Education", "Skills", "Certifications", "Projects"
- No text inside images/SVGs
- No critical info in PDF headers/footers (ATS ignores them)
- UTF-8, selectable text (not rasterized)
- No nested tables
- JD keywords distributed: Summary (top 5), first bullet of each role, Skills section

## PDF Design

- **Fonts**: Space Grotesk (headings, 600-700) + DM Sans (body, 400-500)
- **Fonts self-hosted**: `fonts/`
- **Header**: name in Space Grotesk 24px bold + gradient line `linear-gradient(to right, hsl(187,74%,32%), hsl(270,70%,45%))` 2px + contact row
- **Section headers**: Space Grotesk 13px, uppercase, letter-spacing 0.05em, cyan primary color
- **Body**: DM Sans 11px, line-height 1.5
- **Company names**: accent purple `hsl(270,70%,45%)`
- **Margins**: 0.6in
- **Background**: pure white

## Section Order (optimized for "6-second recruiter scan")

1. Header (large name, gradient, contact)
2. Professional Summary (3 phrases fixes — voir § Summary Template)
3. Core Competencies (5-7 keyword phrases in flex-grid)
4. Work Experience (reverse chronological)
5. Projects (top 3-4 most relevant)
6. Education & Certifications
7. Skills (languages + technical)

## Summary Template

Structure **fixe** — ne pas reformuler, ne pas réordonner les phrases :

```
Spécialiste Data avec un parcours Master {MASTER} à l'Université Paris Dauphine, disposant d’une expérience en {COMPETENCES}. Actuellement chez Renault Group en tant que Data Analyst.
```

| Variable | Règle |
|----------|-------|
| `{MASTER}` | `MIAGE` si archétype = Chef de projet IT ou Business Analyst/MOA — `Informatique` pour tous les autres rôles |
| `{COMPETENCES}` | 2-3 compétences tirées des **keywords clés du JD** (étape 3), reformulées naturellement — ex : "analyse de données, reporting PowerBI et gouvernance data" ou "pipelines big data, orchestration ETL et modélisation SQL" |





## HTML Template

Use the template at `templates/cv-template.html`. Replace `{{...}}` placeholders with personalized content:

| Placeholder | Content |
|-------------|---------|
| `{{LANG}}` | `fr` |
| `{{PAGE_WIDTH}}` | `8.5in` (letter) or `210mm` (A4) |
| `{{NAME}}` | full_name |
| `{{PHONE}}` | phone |
| `{{EMAIL}}` | email |
| `{{LINKEDIN_URL}}` | linkedin |
| `{{LINKEDIN_DISPLAY}}` |  linkedin |
| `{{PORTFOLIO_BLOCK}}` | Si portfolio est non-vide : `<span class="separator">\|</span><a href="{url}">{display}</a>` — sinon : chaîne vide (rien) |
| `{{LOCATION}}` | (from profile.yml) |
| `{{SECTION_SUMMARY}}` | Professional Summary |
| `{{SUMMARY_TEXT}}` | Tailored summary with injected keywords |
| `{{SECTION_COMPETENCIES}}` | Core Competencies |
| `{{COMPETENCIES}}` | `<span class="competency-tag">keyword</span>` × 6-8 |
| `{{SECTION_EXPERIENCE}}` | Work Experience |
| `{{EXPERIENCE}}` | HTML of each job with reordered bullets |
| `{{SECTION_PROJECTS}}` | Projects |
| `{{PROJECTS}}` | HTML of the 2 projects |
| `{{SECTION_EDUCATION}}` | Education |
| `{{EDUCATION}}` | HTML of education entries |
| `{{SECTION_SKILLS}}` | Skills |
| `{{SKILLS}}` | Catégories inline séparées par `\|` — format : `<span class="skill-category">Catégorie :</span> skill1, skill2, skill3<span class="skill-sep">\|</span><span class="skill-category">Catégorie 2 :</span> skill4, skill5` — tout sur une seule ligne, pas de `<br>` |


## Post-generation

1. Demander à l'utilisateur : **"As-tu postulé ?"**

2. Si **oui** → exécuter :
   ```
   node add-candidature.mjs \
     --entreprise="{entreprise}" \
     --poste="{intitulé exact du poste}" \
     --url="{url du JD}" \
     --statut="Postulé"
   ```
   Les champs `contact`, `relance` et `notes` restent vides — l'utilisateur les remplira manuellement.

3. Si **non** → ne rien faire.
