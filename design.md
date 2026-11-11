# EMISCO — direction 3D

- Projet existant React/Vite conservé, sans migration ni modification du backend.
- Palette : marine #0f2a4a, bleu #1a56db, accent #1e56a0, bleu clair #60a5fa, fonds blanc/#f0f4ff. Conserver les couleurs des services.
- Typographie système existante ; grandes compositions éditoriales, titres serrés, petits repères techniques.
- Vraies scènes WebGL Three.js : documents volumétriques, orbites, sphères, particules, éclairages et caméra liés au scroll.
- GSAP ScrollTrigger : introduction, reveals en perspective, parallaxe photos, scène épinglée de trois étapes, profondeur des cartes.
- Aucun scroll hijacking ; navigation native, ancres et routes originales.
- Mobile : densité GPU réduite, pas de séquence épinglée. Mouvement réduit : contenu statique et alternative CSS. Repli si WebGL indisponible.
- Ressources GPU libérées au démontage ; animation arrêtée hors écran et onglet masqué.