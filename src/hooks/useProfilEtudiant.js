/**
 * Fichier : useProfilEtudiant.js
 * Rôle : Hook partagé pour charger le profil de l'étudiant connecté une seule
 *        fois et le mettre à disposition des formulaires de demande.
 * Renvoie { profil, chargement, erreur }.
 * Exporte aussi les helpers dateInput() et nomComplet().
 */

import { useState, useEffect } from 'react';
import { useAuthentification } from '../contexts/ContexteAuthentification';
import api from '../api';

/**
 * Convertit une date ISO (ex. "2003-05-14T00:00:00.000Z") en "AAAA-MM-JJ"
 * pour un input[type="date"], SANS passer par new Date() afin d'éviter tout
 * décalage de fuseau horaire.
 */
export function dateInput(dateIso) {
  if (!dateIso) return '';
  return String(dateIso).slice(0, 10);
}

/**
 * Retourne le nom complet de l'étudiant au format "NOM Prénoms".
 */
export function nomComplet(profil) {
  if (!profil) return '';
  return `${profil.nom || ''} ${profil.prenoms || ''}`.trim();
}

/**
 * Charge le profil de l'étudiant connecté depuis GET /etudiant/profil/:matricule.
 * Ne charge rien si l'utilisateur n'a pas le rôle "etudiant".
 * Inclut un drapeau d'annulation pour éviter un setState après démontage.
 */
export default function useProfilEtudiant() {
  const { utilisateurConnecte } = useAuthentification();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (
      !utilisateurConnecte?.matricule ||
      utilisateurConnecte.role !== 'etudiant'
    ) {
      return;
    }

    let annule = false;
    setChargement(true);
    setErreur(null);

    api
      .get(`/etudiant/profil/${utilisateurConnecte.matricule}`)
      .then((donnees) => {
        if (!annule) setProfil(donnees);
      })
      .catch((e) => {
        if (!annule) setErreur(e.message || 'Profil non disponible.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [utilisateurConnecte?.matricule, utilisateurConnecte?.role]);

  return { profil, chargement, erreur };
}
