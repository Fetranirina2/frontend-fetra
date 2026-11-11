import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthentification } from '../../contexts/ContexteAuthentification';
import './authentification.css';

export default function ConnexionAgent() {
  const { seConnecter, chargement } = useAuthentification();
  const navigate = useNavigate();
  const [matriculeAgent, setMatriculeAgent] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState('');
  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setErreur('');
    try {
      await seConnecter(
        { matricule: matriculeAgent, mot_de_passe: motDePasse },
        'agent',
      );
      navigate('/dashboard');
    } catch (e) {
      setErreur(e.message || 'Connexion impossible.');
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <aside className="auth-welcome">
          <img className="auth-welcome__logo" src="/logo.webp" alt="EMIT" />
          <p className="auth-welcome__brand">Bienvenue</p>
          <h1 className="auth-welcome__title">Espace agent EMIT</h1>
          <p className="auth-welcome__text">
            Gérez les demandes, les paiements et le suivi administratif depuis
            un seul espace.
          </p>
        </aside>
        <div className="auth-panel">
          <h2 className="auth-panel__heading">Connexion agent</h2>
          <p className="auth-panel__intro">
            Saisissez vos identifiants professionnels.
          </p>
          {new URLSearchParams(window.location.search).get('session') ===
            'expiree' && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900"
            >
              Votre session a expiré. Connectez-vous pour continuer.
            </p>
          )}
          <form className="auth-form" onSubmit={soumettre}>
            <div className="auth-fields">
              <div className="auth-field auth-field--full">
                <label htmlFor="matricule-agent">Matricule agent</label>
                <input
                  id="matricule-agent"
                  type="text"
                  placeholder="ex : AG001"
                  value={matriculeAgent}
                  onChange={(e) => setMatriculeAgent(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field auth-field--full">
                <label htmlFor="mot-de-passe-agent">Mot de passe</label>
                <div className="auth-password">
                  <input
                    id="mot-de-passe-agent"
                    type={motDePasseVisible ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password__toggle"
                    onClick={() => setMotDePasseVisible(!motDePasseVisible)}
                    aria-label={
                      motDePasseVisible
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                    aria-pressed={motDePasseVisible}
                  >
                    {motDePasseVisible ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {erreur && <p className="auth-error">{erreur}</p>}
            <button type="submit" disabled={chargement} className="auth-submit">
              {chargement ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>
          <nav className="auth-links" aria-label="Autres accès">
            <span>
              Vous êtes étudiant ?{' '}
              <Link to="/connexion-etudiant">Connexion étudiant</Link>
            </span>
          </nav>
        </div>
      </section>
    </main>
  );
}
