---
name: pdf
description: Génère un CV PDF ATS-optimisé adapté à une offre d'emploi
user_invocable: true
args: job_url
argument-hint: "<job_url>"
---

# pdf — Génération de CV adapté

Tu reçois une URL d'offre d'emploi (`{{job_url}}`).

**Exécute dans cet ordre :**

1. Lis `modes/_shared.md`
2. Lis `modes/pdf.md`
3. Exécute le pipeline complet décrit dans `modes/pdf.md` avec l'URL fournie

Ne montre pas de menu. Démarre directement le pipeline.
