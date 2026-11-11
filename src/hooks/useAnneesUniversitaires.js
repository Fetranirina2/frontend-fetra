import { useEffect, useState } from 'react';
import api from '../api';

/**
 * Charge la liste des années universitaires depuis le référentiel du backend
 * (au lieu d'une liste codée en dur qu'il faudrait modifier chaque année).
 * Si l'API est injoignable, la liste reste vide et le contrôle est laissé
 * au backend, qui valide de toute façon l'année.
 */
export default function useAnneesUniversitaires() {
  const [annees, setAnnees] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    api
      .get('/referentiel/annees-universitaires')
      .then((donnees) => {
        if (annule) return;
        setAnnees(
          Array.isArray(donnees)
            ? donnees.map((a) => a.code_annee).filter(Boolean)
            : [],
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, []);

  return { annees, chargement };
}
