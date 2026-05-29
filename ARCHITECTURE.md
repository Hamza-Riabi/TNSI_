# Architecture cv-gen — Schémas Visuels

## 1. Diagramme de flux complet

```mermaid
graph TD
    A["🎯 Claude Code<br/>Slash Command<br/>/pdf &lt;job_url&gt;"] 
    
    B["🌐 WebFetch /<br/>Playwright<br/>JD Extraction"]
    C["📄 CV Source<br/>cv.md + profile.yml<br/>Candidate Data"]
    D["🤖 Claude API<br/>GPT-4<br/>NLP Analysis"]
    
    E["⚙️ Adaptation Pipeline"]
    E1["1️⃣ Extract<br/>Keywords"]
    E2["2️⃣ Detect<br/>Archetype"]
    E3["3️⃣ Reorder<br/>Bullets"]
    E4["4️⃣ Inject<br/>Keywords"]
    
    F["🎨 HTML Generation<br/>Template + CSS<br/>Space Grotesk/DM Sans"]
    G["🖨️ Playwright Render<br/>Binary Search Scale<br/>UTF-8 Normalization"]
    
    H["📊 PDF File<br/>1-page | ATS-safe<br/>cv-{candidate}-{company}.pdf"]
    
    A -->|URL| B
    A -->|Request| C
    A -->|Prompt| D
    
    B -->|JD Text| E
    C -->|CV Content| E
    D -->|Keywords + Archetype| E
    
    E --> E1
    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 -->|Adapted Content| F
    
    F -->|HTML| G
    G -->|Binary Search| H
    
    style A fill:#1F4E78,color:#fff,stroke:#000,stroke-width:2px
    style B fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style C fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style D fill:#dcc4ee,stroke:#6c5ce7,stroke-width:2px
    style E fill:#f0f0f0,stroke:#1F4E78,stroke-width:2px
    style E1 fill:#fff,stroke:#1F4E78,stroke-width:1px
    style E2 fill:#fff,stroke:#1F4E78,stroke-width:1px
    style E3 fill:#fff,stroke:#1F4E78,stroke-width:1px
    style E4 fill:#fff,stroke:#1F4E78,stroke-width:1px
    style F fill:#eec4a4,stroke:#e17055,stroke-width:2px
    style G fill:#eec4a4,stroke:#e17055,stroke-width:2px
    style H fill:#e8f4f8,stroke:#1F4E78,stroke-width:3px,color:#1F4E78
```

---

## 2. Architecture en couches

```mermaid
graph LR
    subgraph Input["🔵 ENTRÉES"]
        I1["Claude Code<br/>CLI Interface"]
        I2["WebFetch /<br/>Playwright"]
        I3["CV Source<br/>cv.md"]
        I4["Claude API"]
    end
    
    subgraph Processing["🟢 TRAITEMENT"]
        P1["Extract JD<br/>Keywords"]
        P2["Detect<br/>Role Archetype"]
        P3["Match with<br/>Profile Rules"]
        P4["Reorder & Inject<br/>Keywords"]
    end
    
    subgraph Generation["🟡 GÉNÉRATION"]
        G1["HTML Builder<br/>Template + CSS"]
        G2["Playwright<br/>PDF Render"]
    end
    
    subgraph Output["🔴 RÉSULTAT"]
        O1["📄 PDF File<br/>1-page ATS-safe<br/>UTF-8 + accents"]
    end
    
    Input --> Processing
    Processing --> Generation
    Generation --> Output
    
    style Input fill:#d4e9f0
    style Processing fill:#e8f4e8
    style Generation fill:#f4e8d4
    style Output fill:#f0d4e8
```

---

## 3. Détail des 5 archétypes

```mermaid
graph LR
    JD["Analyse JD<br/>Keywords détectés"]
    
    A1["📊 Data Analyst<br/>SQL, PowerBI<br/>Reporting, KPI"]
    A2["🔄 Business Analyst<br/>Besoins, MOA<br/>Fonctionnel"]
    A3["📋 Chef de Projet<br/>Agile, Scrum<br/>Livraison, Backlog"]
    A4["🔧 Analytics Eng.<br/>ETL, Kafka<br/>Pipeline, Data Warehouse"]
    A5["🤖 ML / IA<br/>Python, Modèles<br/>Embeddings, RAG"]
    
    JD --> A1
    JD --> A2
    JD --> A3
    JD --> A4
    JD --> A5
    
    A1 --> F1["Framing:<br/>Renault expertise<br/>Datalake + PowerBI"]
    A2 --> F2["Framing:<br/>3D Smartfactory<br/>Specs + Coordination"]
    A3 --> F3["Framing:<br/>3D Smartfactory<br/>Agile + Livraison"]
    A4 --> F4["Framing:<br/>Pipeline end-to-end<br/>HDFS + Kafka"]
    A5 --> F5["Framing:<br/>Modèle CV AI<br/>+30% accuracy"]
    
    style JD fill:#1F4E78,color:#fff
    style A1 fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style A2 fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style A3 fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style A4 fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style A5 fill:#c4e4ee,stroke:#1F4E78,stroke-width:2px
    style F1 fill:#dcc4ee
    style F2 fill:#dcc4ee
    style F3 fill:#dcc4ee
    style F4 fill:#dcc4ee
    style F5 fill:#dcc4ee
```

---

## 4. Flux d'une candidature (scénario utilisateur)

```mermaid
sequenceDiagram
    actor User as Hamza
    participant CLI as Claude Code
    participant WebScrape as WebFetch/PW
    participant AI as Claude API
    participant Render as Playwright
    participant FS as File System
    
    User->>CLI: /pdf https://renault.jobs/123
    
    CLI->>WebScrape: Fetch JD from URL
    WebScrape-->>CLI: JD text (2000 words)
    
    CLI->>AI: Analyze JD + detect archetype
    AI-->>CLI: Keywords (15-20) + "Data Analyst"
    
    CLI->>CLI: Load cv.md + reorder bullets
    CLI->>CLI: Inject keywords naturally
    CLI->>CLI: Trim to 1 page max
    
    CLI->>Render: Generate HTML with template
    Render->>Render: Binary search for optimal scale
    Render->>FS: Render to PDF
    
    FS-->>CLI: ✅ cv-hamza-renault-2026-05-25.pdf
    CLI-->>User: 📄 PDF ready! (45 KB, 1 page)
    
    User->>User: Review & Apply
```

---

## 5. Composants & Technologies

| Composant | Technologie | Rôle |
|-----------|-----------|------|
| **Frontend** | Claude Code Skill | Interface utilisateur, commande `/pdf` |
| **JD Extraction** | WebFetch + Playwright | Scraping portails d'emploi |
| **AI Analysis** | Claude API (GPT-4) | NLP: keywords + archétype |
| **CV Adaptation** | JavaScript Rules Engine | Récriture sélective, reformulation |
| **HTML Generation** | Vanilla JS + Template | Création du CV stylisé |
| **PDF Rendering** | Playwright + Chromium | Conversion HTML → PDF 1-page |
| **ATS Normalization** | generate-pdf.mjs | UTF-8 cleanup, accents preserved |
| **Storage** | File System | `/output/cv-*.pdf` |

---

## 6. Optimisations clés

### ✅ Une seule page
- **Binary search** pour trouver l'échelle optimale (0.6x à 1.0x)
- Contenu trimmé : max 4 bullets/poste, max 2 projets
- Recruteur lit en 6 secondes → force de la concision

### ✅ ATS-compatible
- Layout simple (1 colonne, pas de sidebars)
- UTF-8 natif avec accents français préservés
- Normalization: tirets, guillemets, espaces insécables
- Texte sélectionnable (pas d'images)

### ✅ Personnalisation intelligente
- 5 archétypes → 5 framings différents
- Keywords du JD injectés naturellement (jamais inventés)
- Expériences réordonnées par pertinence
- Bullets reformulées, pas copiées

---

## 7. Déploiement & Performance

```
Input: URL (job posting)
  ↓
Extraction JD: ~0.5 sec (WebFetch) ou ~3 sec (Playwright)
  ↓
AI Analysis: ~2 sec (Claude API)
  ↓
Adaptation: ~0.5 sec (local rules)
  ↓
HTML Generation: ~0.2 sec
  ↓
PDF Render: ~1-2 sec (binary search + Playwright)
  ↓
Output: PDF file (40-50 KB)
━━━━━━━━━━━━━━━━━━━━
Total: ~5-8 sec (sans Playwright) | ~7-12 sec (avec Playwright)

⚡ Optimisation future: caching des JD analysés (même poste = résultat réutilisable)
```

---

## 8. Contraintes & Cas limites

| Cas | Mitigation |
|-----|-----------|
| **JD derrière login** (LinkedIn) | Fallback Playwright avec headless browser |
| **JD trop court** (< 200 chars) | Demander à l'user de coller le texte |
| **Keywords mal détectés** | Few-shot prompting avec exemples |
| **PDF déborde 1 page** | Binary search réduit automat. l'échelle |
| **Accents corrompus** | UTF-8 native, normalisation avant PDF |
| **CV très long** | Réduction automatique bullets + projets |

---

## 9. Roadmap (après MVP)

### Phase 1 (Actuel) — MVP Minimal Viable
- ✅ 3 archétypes testés (Data, PM, Eng)
- ✅ Extraction JD + CV adaptation
- ✅ PDF 1-page + ATS-safe

### Phase 2 — Polish
- 📅 Tracking candidatures (Excel/DB)
- 📅 Feedback system (1-5 étoiles CV)
- 📅 Email templates (relance pré-remplie)

### Phase 3 — Growth (optionnel)
- 🚀 LinkedIn sync (auto-update CV source)
- 🚀 A/B testing (2 versions de summary)
- 🚀 Mobile app (consultation PDFs)

---

**Schéma SVG détaillé disponible:** `architecture-diagram.svg`
