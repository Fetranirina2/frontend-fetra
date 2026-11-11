import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../api';
import StatutDemande from '../../suivi/StatutDemande';

export default function LivraisonDocument() {
  const { code_reference: reference } = useParams();
  const [demande, setDemande] = useState(null);
  const [fichier, setFichier] = useState(null);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState('');
  const [verifie, setVerifie] = useState(false);
  const [apercu, setApercu] = useState('');

  useEffect(() => {
    if (!fichier) {
      setApercu('');
      return undefined;
    }
    const url = URL.createObjectURL(fichier);
    setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [fichier]);

  useEffect(() => {
    api
      .get('/dashboard/demandes/' + encodeURIComponent(reference))
      .then(setDemande)
      .catch((e) => setErreur(e.message));
  }, [reference]);

  const preparer = async () => {
    setErreur('');
    setEnvoi(true);
    try {
      await api.put(
        '/dashboard/demandes/' + encodeURIComponent(reference) + '/preparer',
      );
      setDemande((actuelle) => ({ ...actuelle, statut: 'EN_PREPARATION' }));
      setSucces(
        'Traitement commencé. Préparez et vérifiez le document avant l’envoi.',
      );
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  const envoyer = async (e) => {
    e.preventDefault();
    if (!fichier || !verifie || envoi) return;
    if (fichier.type !== 'application/pdf' || fichier.size > 2 * 1024 * 1024) {
      setErreur('Choisissez un PDF de 2 Mo maximum.');
      return;
    }
    setErreur('');
    setEnvoi(true);
    try {
      await api.uploadPdf(
        '/documents/' + encodeURIComponent(reference),
        fichier,
      );
      setDemande((actuelle) => ({
        ...actuelle,
        statut: 'DOCUMENT_ENVOYE',
        document_envoye: true,
      }));
      setSucces(
        'Document envoyé. L’étudiant peut maintenant le télécharger dans son espace.',
      );
      setFichier(null);
      setVerifie(false);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  const payante = ['CERTIFICAT', 'RELEVE', 'ATTESTATION'].includes(
    demande?.type_demande,
  );
  const peutEnvoyer =
    demande &&
    !demande.document_envoye &&
    (payante
      ? demande.livraison_autorisee &&
        ['PAYEE_EN_LIGNE', 'EN_PREPARATION', 'A_VERIFIER'].includes(
          demande.statut,
        )
      : demande.type_demande === 'ABSENCE' &&
        demande.statut === 'TRAITEE_ACCEPTEE');

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/dashboard" className="text-blue-700 underline">
          ← Tableau de bord agent
        </Link>
        <h1 className="mt-6 mb-2 text-3xl font-bold">
          Préparer et livrer le document
        </h1>
        <p className="mb-6 text-slate-600">
          Vérifiez le dossier et le PDF avant sa mise à disposition de
          l’étudiant.
        </p>
        {erreur && (
          <p role="alert" className="p-3 mb-4 bg-red-50 text-red-800 rounded">
            {erreur}
          </p>
        )}
        {succes && (
          <p
            role="status"
            className="p-3 mb-4 bg-green-50 text-green-800 rounded"
          >
            {succes}
          </p>
        )}
        {!demande && !erreur && <p>Chargement…</p>}
        {demande && (
          <section className="bg-white border rounded-xl p-5 mb-5">
            <p>
              <strong>Référence :</strong> {demande.code_reference}
            </p>
            <p>
              <strong>Étudiant :</strong> {demande.etudiant.nom}{' '}
              {demande.etudiant.prenoms} · {demande.etudiant.matricule}
            </p>
            <p>
              <strong>Type :</strong> {demande.type_demande}
            </p>
            <div className="mt-2">
              <StatutDemande statut={demande.statut} />
            </div>
            {payante && (
              <p className="mt-2">
                Paiement :{' '}
                {demande.statut_paiement === 'PAYEE_PAPI_SANDBOX'
                  ? 'simulation confirmée'
                  : demande.a_paye
                    ? 'confirmé'
                    : 'en attente'}
              </p>
            )}
          </section>
        )}
        {demande && (
          <section className="mb-5 rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Informations de la demande
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(demande.reponses_formulaire || {})
                .filter(
                  ([, valeur]) =>
                    valeur !== null && valeur !== undefined && valeur !== '',
                )
                .map(([cle, valeur]) => (
                  <div key={cle} className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      {cle.replaceAll('_', ' ')}
                    </dt>
                    <dd className="mt-1 break-words text-sm">
                      {typeof valeur === 'object'
                        ? JSON.stringify(valeur)
                        : String(valeur)}
                    </dd>
                  </div>
                ))}
            </dl>
            {demande.annees_concernees?.length > 0 && (
              <p className="mt-4 text-sm">
                <strong>Années concernées :</strong>{' '}
                {demande.annees_concernees
                  .map((item) => item.annee?.libelle)
                  .join(', ')}
              </p>
            )}
          </section>
        )}
        {demande?.type_demande === 'RECLAMATION' && (
          <p>
            Une réclamation reçoit une réponse écrite.{' '}
            <Link
              className="text-blue-700 underline"
              to={'/agent/traitement/' + encodeURIComponent(reference)}
            >
              Répondre à la réclamation
            </Link>
            .
          </p>
        )}
        {payante &&
          demande?.statut_paiement === 'PAYEE_PAPI_SANDBOX' &&
          !demande.livraison_autorisee && (
            <p className="text-amber-800 mb-4">
              Cette transaction est un test. Aucun document officiel ne peut
              être envoyé.
            </p>
          )}
        {payante &&
          demande?.livraison_autorisee &&
          demande?.statut === 'PAYEE_EN_LIGNE' && (
            <button
              type="button"
              onClick={preparer}
              disabled={envoi}
              className="bg-blue-700 text-white px-4 py-2 rounded mb-5 disabled:opacity-50"
            >
              Commencer le traitement
            </button>
          )}
        {peutEnvoyer && (
          <form onSubmit={envoyer} className="bg-white border rounded-xl p-5">
            <label htmlFor="document-pdf" className="block font-semibold mb-2">
              Document officiel vérifié (PDF, 2 Mo maximum)
            </label>
            <input
              id="document-pdf"
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(e) => setFichier(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-slate-600 mt-2">
              Vérifiez le nom, le matricule et le contenu avant d’envoyer.
              L’envoi est définitif.
            </p>
            {apercu && fichier?.type === 'application/pdf' && (
              <iframe
                title="Aperçu du document à envoyer"
                src={apercu}
                className="mt-4 h-96 w-full rounded-lg border"
              />
            )}
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={verifie}
                onChange={(e) => setVerifie(e.target.checked)}
                className="mt-1"
              />
              <span>
                J’ai vérifié le PDF et son destinataire. Je confirme sa mise à
                disposition définitive.
              </span>
            </label>
            <button
              disabled={!fichier || !verifie || envoi}
              className="block mt-4 bg-emerald-700 text-white px-5 py-2 rounded disabled:opacity-50"
            >
              {envoi ? 'Envoi…' : 'Envoyer le document à l’étudiant'}
            </button>
          </form>
        )}
        {demande?.document_envoye && (
          <p>Le document est déjà disponible dans l’espace de l’étudiant.</p>
        )}
      </div>
    </main>
  );
}
