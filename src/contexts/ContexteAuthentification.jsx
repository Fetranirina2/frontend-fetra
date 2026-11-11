/**
 * Fichier : ContexteAuthentification.jsx
 * Binôme 1 — Frontend (FE1)
 * Rôle : Contexte React pour gérer l'état d'authentification global.
 * Fournit utilisateurConnecte, seConnecter, seDeconnecter, inscriptionEtudiant
 * à tous les composants.
 * Règles de gestion concernées : RG-01, RG-02, RG-04.
 */

import { createContext, useState, useContext, useEffect } from 'react';
import api, { lireUtilisateur } from '../api';

const ContexteAuthentification = createContext(null);

export function FournisseurAuthentification({ children }) {
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(() =>
    sessionStorage.getItem('token') ? lireUtilisateur() : null,
  );
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!token) return;
    let expiration;
    try {
      expiration =
        JSON.parse(
          atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
        ).exp * 1000;
    } catch {
      expiration = 0;
    }
    let derniereActivite =
      Number(sessionStorage.getItem('derniere_activite')) || Date.now();
    const verifier = () => {
      if (
        !Number.isFinite(expiration) ||
        Date.now() >= expiration ||
        Date.now() - derniereActivite >= 30 * 60 * 1000
      ) {
        const connexion = ['agent', 'ADMINISTRATEUR'].includes(
          lireUtilisateur()?.role,
        )
          ? '/connexion-agent'
          : '/connexion-etudiant';
        ['token', 'utilisateur', 'session_id', 'derniere_activite'].forEach(
          (cle) => sessionStorage.removeItem(cle),
        );
        setToken(null);
        setUtilisateurConnecte(null);
        window.location.assign(connexion + '?session=expiree');
        return false;
      }
      return true;
    };
    const activite = () => {
      if (!verifier()) return;
      derniereActivite = Date.now();
      sessionStorage.setItem('derniere_activite', String(derniereActivite));
    };
    verifier();
    const timer = setInterval(verifier, 10000);
    window.addEventListener('pointerdown', activite);
    window.addEventListener('keydown', activite);
    window.addEventListener('focus', verifier);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pointerdown', activite);
      window.removeEventListener('keydown', activite);
      window.removeEventListener('focus', verifier);
    };
  }, [token]);

  useEffect(() => {
    const synchroniser = () => {
      setToken(sessionStorage.getItem('token'));
      setUtilisateurConnecte(
        sessionStorage.getItem('token') ? lireUtilisateur() : null,
      );
    };
    window.addEventListener('storage', synchroniser);
    return () => window.removeEventListener('storage', synchroniser);
  }, []);

  const seConnecter = async (identifiants, type = 'etudiant') => {
    setChargement(true);
    try {
      const chemin =
        type === 'agent' ? '/auth/connexion-agent' : '/auth/connexion-etudiant';

      const donnees =
        type === 'agent'
          ? {
              matricule_agent: identifiants.matricule,
              mot_de_passe: identifiants.mot_de_passe,
            }
          : {
              matricule: identifiants.matricule,
              mot_de_passe: identifiants.mot_de_passe,
            };

      const resultat = await api.post(chemin, donnees);

      const tokenRecu = resultat.token;
      if (!tokenRecu) {
        throw new Error('Aucun token reçu du serveur');
      }
      const utilisateur = resultat.utilisateur || resultat;

      sessionStorage.setItem('token', tokenRecu);
      sessionStorage.setItem('derniere_activite', String(Date.now()));
      sessionStorage.setItem('utilisateur', JSON.stringify(utilisateur));
      if (resultat.session_id) {
        sessionStorage.setItem('session_id', resultat.session_id);
      }
      setToken(tokenRecu);
      setUtilisateurConnecte(utilisateur);

      return resultat;
    } finally {
      setChargement(false);
    }
  };

  const inscriptionEtudiant = async (matricule, motDePasse, dateNaissance) => {
    setChargement(true);
    try {
      const resultat = await api.post('/auth/inscription-etudiant', {
        matricule,
        motDePasse,
        dateNaissance,
      });

      const tokenRecu = resultat.token;
      const utilisateur = resultat.utilisateur || resultat;

      sessionStorage.setItem('token', tokenRecu);
      if (resultat.session_id) {
        sessionStorage.setItem('session_id', resultat.session_id);
      }
      sessionStorage.setItem('derniere_activite', String(Date.now()));
      sessionStorage.setItem('utilisateur', JSON.stringify(utilisateur));
      setToken(tokenRecu);
      setUtilisateurConnecte(utilisateur);

      return resultat;
    } finally {
      setChargement(false);
    }
  };

  const seDeconnecter = async () => {
    const role = utilisateurConnecte?.role;
    const sessionId = sessionStorage.getItem('session_id');
    if (sessionId) {
      try {
        await api.delete(
          '/sessions/deconnecter/' + encodeURIComponent(sessionId),
        );
      } catch {
        /* La fermeture locale reste possible hors connexion. */
      }
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('utilisateur');
    sessionStorage.removeItem('session_id');
    sessionStorage.removeItem('derniere_activite');
    setUtilisateurConnecte(null);
    setToken(null);
    window.location.assign(
      role === 'agent' ? '/connexion-agent' : '/connexion-etudiant',
    );
  };

  return (
    <ContexteAuthentification.Provider
      value={{
        utilisateurConnecte,
        token,
        seConnecter,
        seDeconnecter,
        inscriptionEtudiant,
        chargement,
      }}
    >
      {children}
    </ContexteAuthentification.Provider>
  );
}

export function useAuthentification() {
  return useContext(ContexteAuthentification);
}
