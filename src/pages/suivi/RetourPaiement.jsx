import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api';
import usePapiMode from '../../hooks/usePapiMode';

export default function RetourPaiement() {
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const [etat, setEtat] = useState('VERIFICATION');
  const [erreur, setErreur] = useState('');
  const papi = usePapiMode();
  const [modePaiement, setModePaiement] = useState(null);

  useEffect(() => {
    if (!reference) {
      setErreur('Référence de demande manquante.');
      return;
    }
    let actif = true;
    let essais = 0;
    const verifier = async () => {
      try {
        const resultat = await api.get(
          '/paiement-papi/etat/' + encodeURIComponent(reference),
        );
        if (!actif) return;
        setEtat(resultat.statut);
        setModePaiement(resultat.mode);
        if (!['SUCCESS', 'EXPIRE'].includes(resultat.statut) && essais++ < 12) {
          setTimeout(verifier, 5000);
        }
      } catch (error) {
        if (actif) setErreur(error.message);
      }
    };
    verifier();
    return () => {
      actif = false;
    };
  }, [reference]);

  const texte =
    etat === 'SUCCESS'
      ? modePaiement === 'SANDBOX'
        ? 'Simulation confirmée. Aucun document officiel payant ne sera livré pour ce test.'
        : 'Paiement confirmé. Votre demande a été transmise à la scolarité.'
      : etat === 'FAILED'
        ? 'Le dernier essai a échoué. Vous pouvez réessayer depuis le suivi.'
        : etat === 'EXPIRE'
          ? 'Le lien de paiement a expiré. Vous pouvez en créer un autre.'
          : 'Confirmation du paiement en cours. Le retour sur cette page ne vaut pas preuve de paiement.';
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Résultat du paiement Papi</h1>
        {(modePaiement === 'SANDBOX' ||
          (!modePaiement && papi.mode === 'sandbox')) && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-amber-900">
            Mode de démonstration : aucune somme réelle n’est débitée.
          </p>
        )}
        {erreur ? (
          <p role="alert" className="text-red-700">
            {erreur}
          </p>
        ) : (
          <p role="status">{texte}</p>
        )}
        <Link
          to="/etudiant/dashboard?onglet=demandes"
          className="inline-block mt-6 text-blue-700 underline"
        >
          Voir mes demandes
        </Link>
      </div>
    </main>
  );
}
