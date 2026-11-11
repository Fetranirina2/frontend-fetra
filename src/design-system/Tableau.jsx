/**
 * Fichier : Tableau.jsx
 * SOCLE COMMUN — Composant tableau réutilisable du design system.
 * À FAIRE (tous FE) : ajouter le tri, la pagination, et le rendu dynamique des colonnes.
 */

export default function Tableau({ colonnes, donnees }) {
  // TODO (tous FE) : implémenter le rendu du tableau avec en-têtes et lignes
  return (
    <table className="tableau">
      <thead>
        <tr>
          {colonnes.map((colonne, index) => (
            <th key={index}>{colonne.titre}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {donnees.map((ligne, indexLigne) => (
          <tr key={indexLigne}>
            {colonnes.map((colonne, indexCol) => (
              <td key={indexCol}>{ligne[colonne.cle]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
