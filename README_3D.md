# EMISCO — landing immersive 3D

Le frontend React + Vite d'origine est conservé. Les couleurs, assets, routes, formulaires, authentification et appels API sont conservés. Seule la landing est remaniée, avec une nouvelle section explicative en trois étapes.

## Démarrer

```bash
npm ci
npm run dev
```

Pour le projet complet, recopiez votre `.env` existant à la racine du frontend, ou configurez-le à partir de `.env.example`. L'archive ne contient volontairement aucun `.env` privé. Le backend d'origine n'est pas inclus ni modifié.

```bash
npm run build
npm run preview
```

## Intégrer uniquement les changements

L'archive `EMISCO-patch-3D.zip` contient un dossier `frontend/`. Copiez son contenu dans votre frontend actuel en remplaçant les fichiers du même nom, puis lancez `npm ci`. Ne remplacez pas votre `.env`.

Fichiers UI ajoutés/modifiés :

- `src/pages/accueil/Accueil.jsx` : landing, mêmes liens et cinq services avec leurs tarifs, nouvelle section parcours, vrais liens téléphone/email.
- `src/pages/accueil/SceneScolarite3D.jsx` : véritables scènes Three.js WebGL locales, documents en volume, orbites, sphères, facettes, particules et éclairages.
- `src/pages/accueil/useAnimationsAccueil.js` : GSAP ScrollTrigger, pin/scrub, reveals en perspective, parallaxe, progression du scroll et tilt à la souris.
- `src/pages/accueil/accueil3d.css` : styles isolés par préfixe `sco-`, responsive et fallback.
- `package.json` et `package-lock.json` : ajout de `three` et `gsap`.
- `design.md` : référence de la direction visuelle.

## Effets

- Documents 3D flottants avec textures dessinées localement ; aucun modèle GLB ni service externe nécessaire.
- Rotation des documents et des orbites liée au scroll, réaction douce de la caméra à la souris.
- Introduction du hero en cascade et apparitions en profondeur au défilement.
- Photos en parallaxe et perspective, surfaces flottantes, sphères et halos.
- Parcours explicatif épinglé sur desktop pendant deux hauteurs de viewport supplémentaires ; trois étapes et documents qui s'écartent et tournent.
- Cartes de services en 3D, reflet suivant la souris et icônes en relief.
- Bande de progression du scroll et décors en profondeur.
- Pas de scroll hijacking : le scroll reste natif, ainsi que les ancres et la navigation.

Les documents de la scène sont des illustrations de démonstration, pas des documents étudiants réels.

## Accessibilité et performances

- `prefers-reduced-motion` : pas de canvas animé, pas de pin ni de reveals ; tous les contenus restent lisibles.
- Si WebGL n'est pas disponible : document statique CSS. Le contenu et les liens restent utilisables.
- Sur mobile : scènes moins denses, DPR plafonné à 1,25, pas de section épinglée ; étapes affichées les unes sous les autres.
- Sur desktop : DPR plafonné à 1,75 ; pas de textures ou modèles distants.
- Rendu Three.js arrêté hors écran et lorsque l'onglet est masqué ; géométries, matériaux, textures, observers et listeners libérés au démontage.
- Code Three.js chargé en chunk séparé ; les autres pages ne chargent pas la scène.

## Vérifications effectuées

- Compilation de production : réussie.
- ESLint des trois fichiers JavaScript/JSX de la landing : réussi.
- Chrome desktop 1440×1000 et mobile 390×844 : rendu WebGL sans erreur JavaScript, pas de débordement horizontal.
- Navigation par ancres, menu mobile, bouton Commencer et redirection d'un service protégé vers la connexion : testés.
- Séquence épinglée et tilt `matrix3d` : testés.
- Préférence de mouvement réduit et WebGL indisponible : testés.

Vite affiche un avertissement non bloquant : le chunk Three.js dépasse 500 kB avant gzip (environ 136 kB compressés). Le chunk est déjà séparé et chargé à la demande.

Les opérations backend (connexion réelle, paiement, traitement des demandes) n'ont pas été testées : aucun serveur backend n'a été fourni. Les tests ont utilisé Chrome avec rendu WebGL logiciel ; la fluidité GPU n'a pas été mesurée sur un téléphone physique.

## Ajustements rapides

- Couleurs et tailles : variables `--sco-*` et règles dans `accueil3d.css`.
- Durée du parcours épinglé : `end: '+=200%'` dans `useAnimationsAccueil.js`.
- Intensité du tilt : multiplicateurs `14` et `18` dans le même fichier.
- Densité/rotation des objets et plafond DPR : `SceneScolarite3D.jsx`.
- Textes, liens et tarifs : `Accueil.jsx`.