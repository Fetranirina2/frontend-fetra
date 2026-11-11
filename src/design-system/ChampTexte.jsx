/**
 * Fichier : ChampTexte.jsx
 * SOCLE COMMUN — Composant champ de texte réutilisable du design system.
 * À FAIRE (tous FE) : ajouter la validation, les messages d'erreur,
 * et le support des différents types (texte, mot de passe, date, etc.).
 */

export default function ChampTexte({
  label,
  nom,
  type = 'text',
  valeur,
  onChange,
  erreur,
  obligatoire = false,
  placeholder = '',
}) {
  // TODO (tous FE) : implémenter le rendu du champ avec label, input, et message d'erreur
  return (
    <div className="champ-texte">
      <label htmlFor={nom}>
        {label} {obligatoire && <span className="obligatoire">*</span>}
      </label>
      <input
        type={type}
        required={obligatoire}
        aria-invalid={!!erreur}
        aria-describedby={erreur ? `${nom}-erreur` : undefined}
        id={nom}
        name={nom}
        value={valeur}
        onChange={onChange}
        placeholder={placeholder}
        className={erreur ? 'champ-texte--erreur' : ''}
      />
      {erreur && (
        <span id={`${nom}-erreur`} role="alert" className="champ-texte__erreur">
          {erreur}
        </span>
      )}
    </div>
  );
}
