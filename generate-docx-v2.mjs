#!/usr/bin/env node

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak, Footer } from 'docx';
import fs from 'fs';

const primaryColor = "1F4E78"; // Bleu foncé
const accentColor = "D5E8F0"; // Gris clair pour tableaux
const secondaryColor = "6c5ce7"; // Violet

// Helper: créer une cellule de tableau
function createTableCell(text, isHeader = false, isBold = false) {
  const border = { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };

  return new TableCell({
    borders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    shading: {
      fill: isHeader ? accentColor : "FFFFFF",
      type: ShadingType.CLEAR
    },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({
        text: text,
        bold: isHeader || isBold,
        size: 22 // 11pt
      })],
      alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT
    })]
  });
}

// Helper: créer un titre de section
function sectionHeading(text, level = 1) {
  const size = level === 1 ? 28 : 26;
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    children: [new TextRun({
      text: text,
      bold: true,
      size: size,
      color: primaryColor,
      font: "Calibri"
    })],
    spacing: { before: 240, after: 120 },
    outlineLevel: level - 1
  });
}

// Helper: paragraphe normal
function normalParagraph(text, isBold = false) {
  return new Paragraph({
    children: [new TextRun({
      text: text,
      bold: isBold,
      size: 22, // 11pt
      font: "Calibri"
    })],
    spacing: { after: 120 }
  });
}

// Helper: liste à puces
function bulletPoint(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level: level },
    children: [new TextRun({
      text: text,
      size: 22,
      font: "Calibri"
    })],
    spacing: { after: 60 }
  });
}

// Helper: code/bloc
function codeBlock(text) {
  return new Paragraph({
    children: [new TextRun({
      text: text,
      font: "Courier New",
      size: 20,
      color: "555555"
    })],
    spacing: { before: 120, after: 120 }
  });
}

async function generateDocument() {
  // Page de titre
  const titlePage = [
    new Paragraph({ children: [new TextRun("")], spacing: { after: 720 } }),
    new Paragraph({ children: [new TextRun("")], spacing: { after: 720 } }),
    new Paragraph({ children: [new TextRun("")], spacing: { after: 720 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "FICHE SYNTHÉTIQUE",
        bold: true,
        size: 32,
        color: primaryColor,
        font: "Calibri"
      })],
      spacing: { after: 120 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Projet cv-gen",
        bold: true,
        size: 32,
        color: primaryColor,
        font: "Calibri"
      })],
      spacing: { after: 240 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Générateur de CV PDF adapté à des offres d'emploi",
        italic: true,
        size: 26,
        font: "Calibri"
      })],
      spacing: { after: 720 }
    }),
    new Paragraph({ children: [new TextRun("")], spacing: { after: 360 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Auteur : Hamza Riabi",
        size: 24,
        font: "Calibri"
      })],
      spacing: { after: 60 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Date : 2026-05-25",
        size: 24,
        font: "Calibri"
      })],
      spacing: { after: 60 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Master MIAGE • Université Paris Dauphine",
        size: 24,
        font: "Calibri"
      })],
      spacing: { after: 720 }
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];

  // Contenu principal
  const content = [
    // 1. FONCTIONNALITÉS
    sectionHeading("1. FONCTIONNALITÉS PRINCIPALES (MVP)"),
    normalParagraph("Objectif", true),
    normalParagraph("Automatiser la génération de CV PDF personnalisés et ATS-optimisés, adaptés en temps réel à une offre d'emploi donnée."),
    normalParagraph("Fonctionnalités du MVP", true),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell("Fonctionnalité", true),
            createTableCell("Description", true),
            createTableCell("Priorité", true)
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Extraction JD"),
            createTableCell("Récupération du texte de l'offre d'emploi via URL (WebFetch/Playwright)"),
            createTableCell("P0")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Analyse sémantique"),
            createTableCell("Extraction de 15-20 keywords clés du JD via Claude API"),
            createTableCell("P0")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Détection d'archétype"),
            createTableCell("Classement automatique du rôle parmi 5 archétypes"),
            createTableCell("P0")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Adaptation CV"),
            createTableCell("Récriture sélective du CV existant pour injecter keywords du JD naturellement"),
            createTableCell("P0")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Génération HTML"),
            createTableCell("Construction du CV à partir d'un template HTML avec CSS personnalisé"),
            createTableCell("P0")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Conversion PDF"),
            createTableCell("Rendu HTML → PDF via Playwright + normalisation ATS"),
            createTableCell("P0")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Optimisation une page"),
            createTableCell("Redimensionnement automatique du contenu pour tenir sur exactement 1 page A4"),
            createTableCell("P0")
          ]
        })
      ]
    }),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 240 } }),

    normalParagraph("Contraintes critiques", true),
    bulletPoint("UNE PAGE : le CV doit tenir sur une seule page (Playwright réduit automatiquement l'échelle si besoin)"),
    bulletPoint("ATS-compatible : pas d'images, layout simple, UTF-8 pur, text sélectionnable"),
    bulletPoint("Accents français : é, è, ê, à, â, ç, ù, û, î, ï, ô DOIVENT être conservés exactement"),
    bulletPoint("Zéro invention : les keywords du JD ne sont jamais créés ex-nihilo, toujours intégrés dans les réalisations existantes"),

    new Paragraph({ children: [new PageBreak()] }),

    // 3. ARCHITECTURE (NOUVELLE SECTION AVEC SCHÉMAS)
    sectionHeading("2. ARCHITECTURE LOGICIELLE"),

    normalParagraph("Architecture en couches", true),
    normalParagraph("Le système cv-gen fonctionne selon 4 couches distinctes :"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),
    normalParagraph("🔵 COUCHE 1 — ENTRÉES (Input Layer)", true),
    bulletPoint("Claude Code CLI : interface utilisateur, commande /pdf <url>"),
    bulletPoint("WebFetch / Playwright : extraction du texte de l'offre d'emploi"),
    bulletPoint("CV Source (cv.md) : données candidat existantes"),
    bulletPoint("Claude API (GPT-4) : analyse sémantique et détection d'archétype"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),
    normalParagraph("🟢 COUCHE 2 — TRAITEMENT (Processing Layer)", true),
    bulletPoint("1. Extract JD Keywords : extraction de 15-20 mots clés du JD"),
    bulletPoint("2. Detect Role Archetype : classification en 5 archétypes possibles"),
    bulletPoint("3. Match with Profile Rules : application des règles de reformulation"),
    bulletPoint("4. Reorder & Inject Keywords : récriture sélective des bullets d'expérience"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),
    normalParagraph("🟡 COUCHE 3 — GÉNÉRATION (Generation Layer)", true),
    bulletPoint("HTML Builder : construction du CV à partir du template avec CSS personnalisé"),
    bulletPoint("Playwright + Chromium : rendu HTML en PDF avec binary search pour l'échelle optimale"),
    bulletPoint("ATS Normalizer : nettoyage Unicode (tirets, guillemets, espaces insécables)"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),
    normalParagraph("🔴 COUCHE 4 — RÉSULTAT (Output Layer)", true),
    bulletPoint("PDF File : /output/cv-{candidate}-{company}-{date}.pdf"),
    bulletPoint("Propriétés : 1 page, ATS-compatible, UTF-8 avec accents, ~40-50 KB"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 240 } }),

    normalParagraph("Flux d'exécution simplifié", true),
    codeBlock("URL → Extraction JD → Analyse Claude → Adaptation CV → HTML → PDF"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 240 } }),

    normalParagraph("Composants clés", true),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell("Composant", true),
            createTableCell("Rôle", true),
            createTableCell("Stack", true)
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Extraction JD"),
            createTableCell("Récupère texte depuis URL (portails publics ou Playwright pour login walls)"),
            createTableCell("WebFetch, Playwright, Node.js")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Analyse Sémantique"),
            createTableCell("Extrait keywords, détecte archétype, score pertinence bullets"),
            createTableCell("Claude API (GPT-4)")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Profile Adapter"),
            createTableCell("Applique règles de rédaction, intègre keywords naturellement"),
            createTableCell("Rules engine (markdown)")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("HTML Builder"),
            createTableCell("Construit CV HTML à partir de template"),
            createTableCell("Vanilla JS")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("PDF Renderer"),
            createTableCell("Convertit HTML → PDF, optimise échelle pour 1 page"),
            createTableCell("Playwright (Chromium)")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("ATS Normalizer"),
            createTableCell("Nettoie Unicode (tirets, guillemets, espaces insécables)"),
            createTableCell("generate-pdf.mjs")
          ]
        })
      ]
    }),

    new Paragraph({ children: [new PageBreak()] }),

    // Les 5 archétypes
    normalParagraph("Les 5 archétypes de rôles", true),
    bulletPoint("📊 Data Analyst : focus reporting, PowerBI, datalake, KPI"),
    bulletPoint("🔄 Business Analyst / MOA : focus recueil besoins, fonctionnel, spécifications"),
    bulletPoint("📋 Chef de Projet IT/Data : focus Agile, livraison, backlog, planning"),
    bulletPoint("🔧 Analytics Engineer : focus ETL, pipeline, data warehouse, Kafka"),
    bulletPoint("🤖 ML / IA : focus modèles, Python, embeddings, RAG, déploiement"),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 240 } }),

    normalParagraph("Chaque archétype possède :", true),
    bulletPoint("Signaux de détection : keywords qui révèlent le rôle dans le JD"),
    bulletPoint("Framing de présentation : quelle expérience mettre en avant"),
    bulletPoint("Compétences à valoriser : skills clés pour ce rôle"),

    new Paragraph({ children: [new PageBreak()] }),

    // 2. SCÉNARIOS UTILISATEURS
    sectionHeading("3. SCÉNARIOS UTILISATEURS"),

    sectionHeading("Scénario 1 : Candidature Data Analyst (Renault)", 2),
    normalParagraph("Contexte : offre Senior Data Analyst — SQL, PowerBI, datalake, KPI"),
    normalParagraph("Étapes :", true),
    bulletPoint("Hamza exécute : /pdf https://renault.jobs/123"),
    bulletPoint("Système détecte : archétype « Data Analyst »"),
    bulletPoint("Récriture : met en avant Renault (datalake, PowerBI, gouvernance data)"),
    bulletPoint("Résultat : PDF optimisé pour ce rôle"),
    normalParagraph("Valeur : CV sur mesure en <2 min, mots clés ATS visibles.", true),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),

    sectionHeading("Scénario 2 : Chef de Projet IT (Startup)", 2),
    normalParagraph("Contexte : offre PM Data Engineering — Agile, Scrum, livraison"),
    normalParagraph("Étapes :", true),
    bulletPoint("Hamza exécute : /pdf https://startup.apply.com/pm-data-eng"),
    bulletPoint("Système détecte : archétype « Chef de Projet IT »"),
    bulletPoint("Récriture : met en avant 3D Smartfactory (2 projets en production)"),
    bulletPoint("Résultat : PDF avec focus gestion + livrables"),
    normalParagraph("Valeur : soft skills et capacité à livrer mis en avant.", true),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } }),

    sectionHeading("Scénario 3 : Analytics Engineer (DataOps)", 2),
    normalParagraph("Contexte : offre Data Pipeline Engineer — Kafka, Hive, ETL"),
    normalParagraph("Étapes :", true),
    bulletPoint("Hamza exécute : /pdf https://dataops.career/pipeline-engineer"),
    bulletPoint("Système détecte : archétype « Analytics Engineer »"),
    bulletPoint("Récriture : met en avant projet Pipeline et HDFS/Hive"),
    bulletPoint("Résultat : PDF avec tonalité technique data engineering"),
    normalParagraph("Valeur : profil technique mis en lumière, infrastructure data en avant.", true),

    new Paragraph({ children: [new PageBreak()] }),

    // 4. CHOIX TECHNOLOGIQUES
    sectionHeading("4. CHOIX TECHNOLOGIQUES ET JUSTIFICATIONS"),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell("Choix", true),
            createTableCell("Alternative", true),
            createTableCell("Justification", true)
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Claude API (GPT-4)"),
            createTableCell("OpenAI, Gemini"),
            createTableCell("Excellent en NLP et détection de pattern métier ; coût raisonnable ; déjà intégré Claude Code")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Playwright + Chromium"),
            createTableCell("Puppeteer, wkhtmltopdf"),
            createTableCell("Headless, support font embedding, contrôle précis de l'échelle ; multi-navigateur testé")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("HTML/CSS pur"),
            createTableCell("Handlebars, Nunjucks"),
            createTableCell("Zéro dépendance supplémentaire ; facile à déboguer ; CSS natif pour styling précis")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Base64 font embedding"),
            createTableCell("CDN, fichiers externes"),
            createTableCell("Évite problèmes CORS ; PDF hermétique, transportable")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Node.js"),
            createTableCell("Python, Go"),
            createTableCell("Déjà dans l'stack (Playwright) ; JS natif ; npm packages de qualité")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("Une seule page"),
            createTableCell("Multi-page flexible"),
            createTableCell("ATS + recruteurs lisent 6 secondes max ; force la concision ; différenciant")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("UTF-8 + accents français"),
            createTableCell("ASCII (supprimer accents)"),
            createTableCell("Moderne ; respect du français ; Google indexe mieux")
          ]
        })
      ]
    }),

    new Paragraph({ children: [new PageBreak()] }),

    // 5. RÉPARTITION DES TÂCHES
    sectionHeading("5. RÉPARTITION DES TÂCHES POUR LA SUITE"),

    sectionHeading("Phase 1 : Consolidation MVP (1-2 semaines)", 2),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell("Tâche", true),
            createTableCell("Propriétaire", true),
            createTableCell("Durée", true),
            createTableCell("État", true)
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.1 Finaliser template HTML"),
            createTableCell("Dev"),
            createTableCell("3j"),
            createTableCell("⏳ TODO")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.2 Intégrer fonts en base64"),
            createTableCell("Dev"),
            createTableCell("1j"),
            createTableCell("⏳ TODO")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.3 Tester generate-pdf.mjs"),
            createTableCell("QA"),
            createTableCell("1j"),
            createTableCell("⏳ TODO")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.4 Détection d'archétype"),
            createTableCell("AI/Dev"),
            createTableCell("2j"),
            createTableCell("⏳ TODO")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.5 Rules de récriture CV"),
            createTableCell("Hamza"),
            createTableCell("1j"),
            createTableCell("⏳ TODO")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.6 Skill /pdf <url>"),
            createTableCell("Dev"),
            createTableCell("2j"),
            createTableCell("⏳ TODO")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T1.7 Tests sur 3 offres"),
            createTableCell("QA/Hamza"),
            createTableCell("1j"),
            createTableCell("⏳ TODO")
          ]
        })
      ]
    }),

    new Paragraph({ children: [new TextRun("")], spacing: { after: 240 } }),

    sectionHeading("Phase 2 : Enhancement & Polish (1 semaine)", 2),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createTableCell("Tâche", true),
            createTableCell("Propriétaire", true),
            createTableCell("Durée", true)
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T2.1 Tracking candidatures"),
            createTableCell("Dev"),
            createTableCell("2j")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T2.2 Système feedback CV"),
            createTableCell("Dev"),
            createTableCell("1j")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T2.3 Templates emails relance"),
            createTableCell("Hamza"),
            createTableCell("1j")
          ]
        }),
        new TableRow({
          children: [
            createTableCell("T2.4 Documentation utilisateur"),
            createTableCell("Tech Writer"),
            createTableCell("1j")
          ]
        })
      ]
    }),

    new Paragraph({ children: [new PageBreak()] }),

    // 6. QUESTIONS
    sectionHeading("6. QUESTIONS À CLARIFIER"),

    normalParagraph("Avec le professeur :", true),
    bulletPoint("Scope de ce qui doit être fait maintenant : Template HTML seulement, ou whole pipeline ?"),
    bulletPoint("Évaluation : basée sur le MVP fonctionnel ou la fiche synthétique + prototype ?"),
    bulletPoint("Contrainte d'une page : vraiment critique, ou c'est une optimisation future ?"),

    normalParagraph("Avec le groupe (si projet en équipe) :", true),
    bulletPoint("Qui gère le template HTML (design + CSS) ?"),
    bulletPoint("Qui teste les archétypes (nécessite domaine expertise) ?"),
    bulletPoint("Qui rédige la documentation utilisateur ?"),

    new Paragraph({ children: [new PageBreak()] }),

    // 7. CONCEPTS DU COURS
    sectionHeading("7. CONCEPTS VUS EN COURS — APPLICATION DANS CE PROJET"),

    normalParagraph("Intelligence Artificielle", true),
    bulletPoint("Claude API pour extraction sémantique de keywords et détection d'archétype (NLP)"),
    bulletPoint("Few-shot prompting : fournis exemples des 5 archétypes pour guider la classification"),
    bulletPoint("Prompt engineering : règles JAMAIS + TOUJOURS dans _shared.md pour contraindre la rédaction"),

    normalParagraph("Architecture Logicielle (Clean Code)", true),
    bulletPoint("Séparation des responsabilités : JD extraction, archétype detection, CV adaptation, PDF rendering"),
    bulletPoint("Single Responsibility : chaque fichier a une responsabilité unique"),
    bulletPoint("DRY (Don't Repeat Yourself) : règles communes dans _shared.md, réutilisables par tous"),
    bulletPoint("Configuration as Code : archétypes définis en YAML/markdown, pas hardcodés"),

    normalParagraph("Base de Données", true),
    bulletPoint("Optionnel Phase 2 : tracker Excel/SQLite pour log des candidatures"),

    normalParagraph("Clean Code", true),
    bulletPoint("Noms explicites : normalizeTextForATS, detect_role_archetype, injectKeywordsNaturally"),
    bulletPoint("Pas de magic numbers : échelle PDF calculée en binary search"),
    bulletPoint("Commentaires justes : explique le POURQUOI, pas le QUOI"),
    bulletPoint("Code readable > clever"),

    new Paragraph({ children: [new PageBreak()] }),

    // 8. RÉSUMÉ EXÉCUTIF
    sectionHeading("8. RÉSUMÉ EXÉCUTIF"),

    normalParagraph("cv-gen est un système intelligent de personnalisation de CV qui répond à un besoin réel : adapter son profil à chaque offre sans effort manuel répétitif.", true),

    normalParagraph("Valeur clé", true),
    bulletPoint("Pour le candidat : CV taillé sur mesure en <2 min, mots clés ATS injectés naturellement"),
    bulletPoint("Pour les recruteurs : CV 1 page clean + ATS-compatible, parcouru en 6 secondes"),
    bulletPoint("Pour le processus : zéro copier-coller, audit trail des candidatures"),

    normalParagraph("Risques identifiés & mitigations", true),
    bulletPoint("JD non accessible (login) → Fallback Playwright (fetch-jd.mjs)"),
    bulletPoint("Mots clés mal intégrés → Règle : JAMAIS inventer, toujours reformuler bullets existantes"),
    bulletPoint("PDF déborde 1 page → Binary search automatique réduit échelle"),
    bulletPoint("Accents corrompus en PDF → UTF-8 native, tests sur exemples"),

    normalParagraph("Critères de succès", true),
    bulletPoint("MVP fonctionnel fin juin"),
    bulletPoint("3 archétypes testés (Data, PM, Engineering)"),
    bulletPoint("10+ CVs générés sans erreur ATS"),

    new Paragraph({
      children: [new TextRun("Prêt à discuter et proposer des améliorations ! 🚀")],
      spacing: { before: 240, after: 120 },
      alignment: AlignmentType.CENTER
    }),

    new Paragraph({
      children: [new TextRun("Fichiers de référence :")],
      spacing: { before: 120, after: 60 },
      alignment: AlignmentType.CENTER
    }),

    new Paragraph({
      children: [new TextRun("• Schéma d'architecture : architecture-diagram.svg")],
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 }
    }),

    new Paragraph({
      children: [new TextRun("• Diagrammes détaillés : ARCHITECTURE.md (5 vues Mermaid)")],
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 }
    })
  ];

  // Document complet
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 }
        }
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Calibri", color: primaryColor },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: "Calibri", color: primaryColor },
          paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
        }
      ]
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "•",
              alignment: "left",
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 }
                }
              }
            },
            {
              level: 1,
              format: "bullet",
              text: "○",
              alignment: "left",
              style: {
                paragraph: {
                  indent: { left: 1440, hanging: 360 }
                }
              }
            }
          ]
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Page ",
                  size: 22
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 22
                })
              ]
            })
          ]
        })
      },
      children: [
        ...titlePage,
        ...content
      ]
    }]
  });

  // Générer le fichier
  try {
    const buffer = await Packer.toBuffer(doc);
    const outputPath = 'FICHE_SYNTHÉTIQUE.docx';
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Document v2 généré : ${outputPath}`);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

// Exécuter la fonction
generateDocument();
