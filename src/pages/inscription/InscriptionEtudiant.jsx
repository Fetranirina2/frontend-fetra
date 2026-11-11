import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthentification } from '../../contexts/ContexteAuthentification';
import '../connexion/authentification.css';

export default function InscriptionEtudiant() {
  const { inscriptionEtudiant, chargement } = useAuthentification();
  const navigate = useNavigate();
  const [matricule, setMatricule] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setErreur('');
    if (motDePasse !== confirmationMotDePasse) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (motDePasse.length < 10) {
      setErreur('Le mot de passe doit comporter au moins 10 caractères.');
      return;
    }
    try {
      await inscriptionEtudiant(
        matricule.trim().toUpperCase(),
        motDePasse,
        dateNaissance,
      );
      navigate('/profil');
    } catch (e) {
      setErreur(e.message || 'Inscription impossible.');
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <aside className="auth-welcome">
          <img className="auth-welcome__logo" src="/logo.webp" alt="EMIT" />
          <p className="auth-welcome__brand">Bienvenue</p>
          <h1 className="auth-welcome__title">Créer votre compte</h1>
          <p className="auth-welcome__text">
            Votre profil sera retrouvé à partir de votre matricule. Il ne reste
            qu’à sécuriser votre accès.
          </p>
        </aside>
        <div className="auth-panel">
          <h2 className="auth-panel__heading">Inscription étudiant</h2>
          <p className="auth-panel__intro">
            Complétez les champs ci-dessous pour commencer.
          </p>
          <form className="auth-form" onSubmit={soumettre}>
            <div className="auth-fields">
              <div className="auth-field">
                <label htmlFor="matricule-inscription">Matricule</label>
                <input
                  id="matricule-inscription"
                  type="text"
                  maxLength={6}
                  placeholder="ex : 24015A"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="date-naissance-inscription">
                  Date de naissance
                </label>
                <input
                  id="date-naissance-inscription"
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="mot-de-passe-inscription">Mot de passe</label>
                <input
                  id="mot-de-passe-inscription"
                  type="password"
                  placeholder="10 caractères minimum"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field auth-field--full">
                <label htmlFor="confirmation-mot-de-passe">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmation-mot-de-passe"
                  type="password"
                  placeholder="••••••••"
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                  required
                />
              </div>
            </div>
            {erreur && <p className="auth-error">{erreur}</p>}
            <button type="submit" disabled={chargement} className="auth-submit">
              {chargement ? 'Inscription en cours…' : 'Créer mon compte'}
            </button>
          </form>
          <nav className="auth-links" aria-label="Connexion">
            <span>
              Déjà inscrit ? <Link to="/connexion-etudiant">Se connecter</Link>
            </span>
          </nav>
        </div>
      </section>
    </main>
  );
}
