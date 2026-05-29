# **FICHE SYNTHÉTIQUE — Projet cv-gen**
## Générateur de CV PDF adapté à des offres d'emploi

**Auteur :** Hamza Riabi | **Date :** 2026-05-25 | **Master :** MIAGE, Université Paris Dauphine

---

## 1. FONCTIONNALITÉS PRINCIPALES (MVP)

### Objectif
Automatiser la génération de CV PDF **personnalisés et ATS-optimisés**, adaptés en temps réel à une offre d'emploi donnée.

### Fonctionnalités du MVP

| Fonctionnalité | Description | Priorité |
|---|---|---|
| **Extraction JD** | Récupération du texte de l'offre d'emploi via URL (WebFetch/Playwright) | P0 |
| **Analyse sémantique** | Extraction de 15-20 keywords clés du JD via Claude API | P0 |
| **Détection d'archétype** | Classement automatique du rôle parmi 5 archétypes (Data Analyst, BA/MOA, Chef de Projet, Analytics Engineer, ML/IA) | P0 |
| **Adaptation CV** | Récriture sélective du CV existant pour injecter keywords du JD naturellement | P0 |
| **Génération HTML** | Construction du CV à partir d'un template HTML avec CSS personnalisé | P0 |
| **Conversion PDF** | Rendu HTML → PDF via Playwright + normalisation ATS (accents, tirets, guillemets) | P0 |
| **Optimisation une page** | Redimensionnement automatique du contenu pour tenir sur exactement 1 page A4 | P0 |
| **Aperçu texte** | Affichage du CV final en CLI avant génération PDF (validation utilisateur) | P1 |

### Contraintes critiques
- **UNE PAGE** : le CV doit tenir sur une seule page (Playwright réduit automatiquement l'échelle si besoin)
- **ATS-compatible** : pas d'images, layout simple, UTF-8 pur, text sélectionnable
- **Accents français** : é, è, ê, à, â, ç, ù, û, î, ï, ô DOIVENT être conservés exactement
- **Zéro invention** : les keywords du JD ne sont jamais créés ex-nihilo, toujours intégrés dans les réalisations existantes

---

## 2. SCÉNARIOS UTILISATEURS

### Scénario 1 : Candidature en Data Analyst
**Acteur :** Hamza, candidat | **Contexte :** Renault propose un poste de "Senior Data Analyst" (SQL, PowerBI, datalake)

**Flux :**
1. Hamza exécute : `/pdf https://renault.jobs/offers/1234`
2. Le système :
   - Extrait le JD (mots clés : SQL, PowerBI, datalake, KPI, reporting, gouvernance)
   - Détecte l'archétype → **Data Analyst**
   - Récupère le CV source (cv.md)
   - Réordonne les expériences : Renault + 3D Smartfactory en avant
   - Injecte "datalake", "PowerBI", "contrôle qualité" dans les bullets de Renault
   - Génère un HTML personnalisé
3. Hamza valide l'aperçu texte : ✅
4. Génère `/output/cv-hamza-renault-2026-05-25.pdf` (1 page, ~45 KB)
5. Hamza postule directement via le portail

**Valeur créée :** CV taillé sur mesure en <2 min, mots clés du JD visibles aux ATS et recruteurs.

---

### Scénario 2 : Candidature en Chef de Projet IT
**Acteur :** Hamza, candidat | **Contexte :** Startup propose un poste de "PM Data Engineering" (Agile, Scrum, livraison, backlog)

**Flux :**
1. Hamza exécute : `/pdf https://startup.apply.com/pm-data-eng`
2. Le système :
   - Extrait le JD (mots clés : Agile, Scrum, backlog, sprint, livraison, gestion budgétaire)
   - Détecte l'archétype → **Chef de Projet IT**
   - Met en avant 3D Smartfactory (2 projets livrés en production, Agile Scrum)
   - Intègre "user stories", "backlog", "sprint" dans les bullets de management
   - Supprime les bullets trop techniques (HDFS, Hive)
   - Ajoute lien vers teethseg.vercel.app (preuve de livraison)
3. Aperçu texte validé
4. Génère PDF avec framing orienté gestion / livraison
5. Hamza envoie sa candidature

**Valeur créée :** Montre une capacité à livrer dans les délais, soft skills mis en avant, CV aligné management.

---

### Scénario 3 : Candidature en Analytics Engineer
**Acteur :** Hamza, candidat | **Contexte :** DataOps propose un poste de "Data Pipeline Engineer" (ETL, Kafka, PostgreSQL, Hive)

**Flux :**
1. Hamza exécute : `/pdf https://dataops.career/pipeline-engineer`
2. Le système :
   - Extrait le JD (mots clés : NiFi, Kafka, PostgreSQL, HDFS, Hive, ETL, data warehouse)
   - Détecte l'archétype → **Analytics Engineer**
   - Met en avant le projet "Pipeline end-to-end" (API → NiFi → PostgreSQL → Kafka) et "HDFS & Hive"
   - Réduit Renault (moins pertinent pour ce rôle très technique)
   - Intègre "orchestration ETL", "data quality", "modélisation SQL"
3. Validation
4. Génère PDF avec forte tonalité technique Data Engineering
5. Postulation

**Valeur créée :** Profil data technique mis en lumière, keywords d'infrastructure data positionnés, CV technique sans jargon métier.

---

## 3. ARCHITECTURE LOGICIELLE

### 3.1 Schéma d'architecture (simplifié)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Claude Code (Frontend)                      │
│                   /pdf <job_url> command                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────────┐  ┌────────────┐   ┌──────────────┐
  │  WebFetch /  │  │ Claude API │   │ CV Source    │
  │  Playwright  │  │ (GPT-4)    │   │ (cv.md)      │
  └──────┬───────┘  └──────┬─────┘   └──────┬───────┘
         │                 │                 │
         │ JD text         │ keywords        │ content
         │                 │ archetype       │
         └─────────┬───────┴────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  Adaptation Pipeline    │
        │ ─────────────────────── │
        │ 1. Extract JD keywords  │
        │ 2. Detect archetype     │
        │ 3. Match with profile   │
        │ 4. Reorder bullets      │
        │ 5. Inject keywords      │
        │ 6. Trim for 1 page      │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │   HTML Generation       │
        │ ─────────────────────── │
        │ Template: cv-template   │
        │ CSS: Space Grotesk,     │
        │      DM Sans            │
        │ Fonts: embedded base64  │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │  Playwright PDF Render  │
        │ ─────────────────────── │
        │ Binary search: scale    │
        │ Normalize: UTF-8, ATS   │
        │ Output: 1-page PDF      │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │   PDF File              │
        │  /output/cv-*.pdf       │
        └─────────────────────────┘
```

### 3.2 Composants clés

| Composant | Rôle | Stack |
|-----------|------|-------|
| **Extraction JD** | Récupère texte depuis URL (portails publics ou Playwright pour login walls) | WebFetch, Playwright, Node.js |
| **Analyse Sémantique** | Extrait keywords, détecte archétype, score pertinence bullets | Claude API (GPT-4) |
| **Profile Adapter** | Applique regles de rédaction, intègre keywords naturellement | Rules engine (markdown) |
| **HTML Builder** | Construit CV HTML à partir de template | Handlebar/EJS ou vanilla JS |
| **PDF Renderer** | Convertit HTML → PDF, optimise échelle pour 1 page | Playwright (Chromium) |
| **ATS Normalizer** | Nettoie Unicode (tirets, guillemets, espaces insécables) | generate-pdf.mjs |
| **CLI Interface** | Slash command `/pdf <url>`, validation UI | Claude Code Skill |

---

## 4. CHOIX TECHNOLOGIQUES ET JUSTIFICATIONS

| Choix | Alternative | Justification |
|-------|-------------|---------------|
| **Claude API (GPT-4)** pour l'analyse JD | OpenAI, Gemini | ✅ Excellent en NLP et détection de pattern métier ; coût raisonnable ; déjà intégré Claude Code |
| **Playwright + Chromium** pour PDF | Puppeteer, wkhtmltopdf, LibreOffice | ✅ Headless, support font embedding, contrôle précis de l'échelle ; multi-navigateur testé |
| **HTML/CSS pur** vs template engine | Handlebars, Nunjucks, Pug | ✅ Zéro dépendance supplémentaire ; facile à déboguer ; CSS natif pour styling précis |
| **Base64 font embedding** vs fichiers externes | CDN, @font-face file:// | ✅ Évite problèmes CORS et file:// cross-origin ; PDF hermétique, transportable |
| **Node.js** pour orchestration | Python, Go | ✅ Déjà dans l'stack (Playwright) ; JS natif ; npm packages de qualité |
| **ATS normalization** avant PDF | Après PDF | ✅ Plus fiable : normalise le HTML source, pas le binaire PDF |
| **Une seule page** (contrainte) | Multi-page flexible | ✅ ATS + recruteurs lisent 6 secondes max ; force la concision ; différenciant |
| **UTF-8 + accents français** vs ASCII | Supprimer accents | ✅ Moderne ; respect du français ; Google indexe mieux ; recruiter voit "Étudiant" vs "Etudiant" |

---

## 5. RÉPARTITION DES TÂCHES POUR LA SUITE

### Phase 1 : Consolidation MVP (1-2 semaines)

| Tâche | Propriétaire | Durée | Dépendances | État |
|-------|-------------|-------|-------------|------|
| **T1.1** Finaliser template HTML (cv-template.html) | Dev | 3j | - | ⏳ TODO |
| **T1.2** Intégrer fonts Space Grotesk + DM Sans en base64 | Dev | 1j | T1.1 | ⏳ TODO |
| **T1.3** Tester generate-pdf.mjs sur exemples (a4, letter) | QA | 1j | T1.2 | ⏳ TODO |
| **T1.4** Implémenter détection d'archétype (5 règles) | AI/Dev | 2j | - | ⏳ TODO |
| **T1.5** Écrire rules de récriture CV par archétype | Domain Expert (toi) | 1j | T1.4 | ⏳ TODO |
| **T1.6** Créer Skill `/pdf <url>` dans Claude Code | Dev | 2j | T1.1-T1.5 | ⏳ TODO |
| **T1.7** Tester sur 3 vraies offres (Data, PM, Pipeline) | QA/Hamza | 1j | T1.6 | ⏳ TODO |

### Phase 2 : Enhancement & Polish (1 semaine)

| Tâche | Propriétaire | Durée | Dépendances |
|-------|-------------|-------|-------------|
| **T2.1** Ajouter tracking des candidatures (excel/DB) | Dev | 2j | T1.7 |
| **T2.2** Système de feedback : noter CV généré (1-5 étoiles) | Dev | 1j | T1.6 |
| **T2.3** Template emails de relance pré-remplis | Hamza | 1j | T1.7 |
| **T2.4** Documentation utilisateur (README.md) | Tech Writer | 1j | T2.3 |

### Phase 3 : Itération & Productivité (optionnel)

- Intégration LinkedIn (auto-sync CV source depuis profile)
- A/B testing : tester 2 versions de summary, mesurer taux de réponse
- Mobile app (web responsive pour consulter PDFs générés)

---

## 6. QUESTIONS À CLARIFIER

### Avec le professeur :
1. **Scope de ce qui doit être fait maintenant** : Template HTML seulement, ou whole pipeline ?
2. **Évaluation** : basée sur le MVP fonctionnel ou la fiche synthétique + prototype ?
3. **Contrainte d'une page** : vraiment critique, ou c'est une optimisation future ?

### Avec le groupe (si projet en équipe) :
1. Qui gère le template HTML (design + CSS) ?
2. Qui teste les archétypes (nécessite domaine expertise) ?
3. Qui rédige la documentation utilisateur ?

---

## 7. CONCEPTS VUS EN COURS — APPLICATION DANS CE PROJET

### Intelligence Artificielle
- ✅ **Claude API** pour extraction semantique de keywords et détection d'archétype (NLP)
- ✅ **Few-shot prompting** : fournis exemples des 5 archétypes pour guider la classification
- ✅ **Prompt engineering** : règles JAMAIS + TOUJOURS dans _shared.md pour contraindre la rédaction

### Architecture Logicielle (Clean Code)
- ✅ **Séparation des responsabilités** : JD extraction, archétype detection, CV adaptation, PDF rendering = 4 composants distincts
- ✅ **Single Responsibility** : chaque fichier (cv.md, _profile.md, pdf.md) a une responsabilité unique
- ✅ **DRY (Don't Repeat Yourself)** : règles communes dans _shared.md, réutilisables par tous les archétypes
- ✅ **Configuration as Code** : archétypes définis en YAML/markdown (profile.yml, _profile.md), pas hardcodés

### Base de Données
- ⏳ **Optionnel Phase 2** : tracker Excel/SQLite pour log des candidatures (date, entreprise, rôle, statut, relance)

### Clean Code
- ✅ Noms explicites : `normalizeTextForATS`, `detect_role_archetype`, `injectKeywordsNaturally`
- ✅ Pas de magic numbers : échelle PDF calculée en binary search (clair pourquoi)
- ✅ Commentaires justes : explique le POURQUOI (ex : ATS ne parse pas em-dashes → conversion en tirets)
- ✅ Code readable > clever

---

## 8. RÉSUMÉ EXÉCUTIF

**cv-gen** est un **système intelligent de personnalisation de CV** qui répond à un besoin réel : adapter son profil à chaque offre sans effort manuel répétitif.

### Valeur clé
- **Pour le candidat** : CV taillé sur mesure en <2 min, mots clés ATS injectés naturellement
- **Pour les recruteurs** : CV 1 page clean + ATS-compatible, parcourez en 6 secondes
- **Pour le processus** : zéro copier-coller, audit trail des candidatures

### Risques identifiés & mitigations
| Risque | Mitigation |
|--------|-----------|
| JD non accessible (login) | Fallback Playwright (fetch-jd.mjs) |
| Mots clés mal intégrés | Règle : JAMAIS inventer, toujours reformuler bullets existantes |
| PDF déborde 1 page | Binary search automatique réduit échelle |
| Accents corrompus en PDF | UTF-8 native, normalisation ATS préserve accents, tests sur exemples |

### Succès = 
✅ MVP fonctionnel fin juin | ✅ 3 archétypes testés | ✅ 10+ CVs générés sans erreur ATS

---

**Prêt à discuter et proposer des améliorations ? 🚀**
