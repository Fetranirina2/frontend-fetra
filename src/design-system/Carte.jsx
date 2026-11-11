/**
 * Fichier : Carte.jsx
 * SOCLE COMMUN — Composant carte réutilisable du design system.
 * À FAIRE (tous FE) : ajouter le padding, l'ombre, et le contenu flexible.
 */

export default function Carte({ children, titre, className = '' }) {
  // TODO (tous FE) : implémenter le rendu de la carte avec un titre optionnel
  return (
    <div className={`carte ${className}`}>
      {titre && <h3 className="carte__titre">{titre}</h3>}
      <div className="carte__contenu">{children}</div>
    </div>
  );
}
