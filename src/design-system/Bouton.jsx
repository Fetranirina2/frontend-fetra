/**
 * Fichier : Bouton.jsx
 * SOCLE COMMUN — Composant bouton réutilisable du design system.
 * À FAIRE (tous FE) : ajouter les variantes (primaire, secondaire, danger),
 * les tailles, et le gestionnaire de clic.
 */

export default function Bouton({
  children,
  onClick,
  variante = 'primaire',
  disabled = false,
  type = 'button',
}) {
  // TODO (tous FE) : implémenter les classes CSS selon la variante
  // Variantes attendues : primaire, secondaire, danger, succes
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bouton bouton--${variante}`}
    >
      {children}
    </button>
  );
}
