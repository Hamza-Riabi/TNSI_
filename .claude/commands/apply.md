# /apply — Soumettre la candidature via automatisation browser

## Objectif
Lire le contexte depuis `apply-task.json`, ouvrir le formulaire dans un navigateur, le remplir et le soumettre automatiquement.

> **Note :** Cette commande nécessite un MCP browser configuré (Playwright CDP ou équivalent).
> Pour configurer : `claude mcp add playwright npx @playwright/mcp@latest`

---

## Étape 1 — Lire le contexte

Lis `apply-task.json` à la racine du projet.
Il contient :
- `entreprise` : nom de l'entreprise
- `poste` : intitulé du poste
- `url` : URL du formulaire de candidature
- `pdfPath` : chemin absolu vers le PDF du CV
- `date` : horodatage

Si le fichier est absent → afficher :
```
❌ Aucune candidature en attente.
Lance d'abord "Postuler maintenant" depuis l'interface web (http://localhost:3000).
```

---

## Étape 2 — Lire les données candidat

Lis `cv.md` pour extraire : nom complet, email, téléphone, URL LinkedIn, ville.

---

## Étape 3 — Naviguer vers le formulaire

Navigue vers l'URL du job et prends un snapshot pour analyser la page.

---

## Étape 4 — Analyser le formulaire

Identifie tous les champs : texte, upload, menus déroulants, cases à cocher, bouton de soumission.

Affiche un résumé :
```
📋 Formulaire détecté — {entreprise} / {poste}

Champs trouvés :
  ✅ Nom          → Hamza Riabi
  ✅ Email        → hamza@email.com
  ✅ Téléphone    → 06 XX XX XX XX
  ✅ CV (upload)  → {pdfPath}
  ❓ Lettre de motivation → à générer ?

Veux-tu que je génère une lettre de motivation courte ?
```

---

## Étape 5 — Lettre de motivation (si demandée)

Structure **fixe — 3 phrases max, 80 mots max** :
1. Pourquoi cette entreprise / ce poste
2. Une réalisation concrète tirée du CV, adaptée au poste
3. Disponibilité + invitation à échanger

Règles : pas de "Je me permets de...", ton direct, pas de formule longue.
Utilise `modes/_profile.md` pour le framing selon l'archétype.

---

## Étape 6 — Remplir les champs

Remplis chaque champ avec les données candidat.
Pour les champs ambigus → demander à l'utilisateur avant de remplir.

---

## Étape 7 — Vérification avant soumission

Prends un screenshot et affiche :
```
📸 Formulaire rempli — vérification :

  Nom        : Hamza Riabi       ✅
  Email      : hamza@...         ✅
  CV uploadé : cv-hamza-....pdf  ✅

Tout est correct ? Je soumets ? (oui / non / modifier X)
```

---

## Étape 8 — Soumettre

Si l'utilisateur confirme → cliquer le bouton de soumission.
Vérifier la page de confirmation.

---

## Étape 9 — Mettre à jour l'Excel

```bash
node add-candidature.mjs --entreprise="{entreprise}" --poste="{poste}" --url="{url}" --statut="Postulé"
```

Affiche :
```
✅ Candidature envoyée et enregistrée !
   Entreprise : {entreprise}
   Poste      : {poste}
   Statut     : Postulé
```

---

## Étape 10 — Nettoyer

```bash
del apply-task.json
```
