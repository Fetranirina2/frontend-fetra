import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../api';
import StatutDemande from '../../suivi/StatutDemande';

export default function TraitementDemande() {
  const { code_reference } = useParams();
  const [demande, setDemande] = useState(null);
  const [erreur, setErreur] = useState('');
  const [decision, setDecision] = useState('ACCEPTEE');
  const [note, setNote] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState(false);
  useEffect(() => {
    let actif = true;
    setDemande(null);
    setErreur('');
    setSucces(false);
    api
      .get('/dashboard/demandes/' + encodeURIComponent(code_reference))
      .then((d) => {
        if (actif) setDemande(d);
      })
      .catch((e) => {
        if (actif) setErreur(e.message);
      });
    return () => {
      actif = false;
    };
  }, [code_reference]);
  const soumettre = async (e) => {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur('');
    try {
      const resultat = await api.post(
        '/traitement/traiter/' + encodeURIComponent(code_reference),
        { decision, note_resolution: note.trim() },
      );
      setDemande((d) => ({
        ...d,
        statut: resultat.nouveau_statut,
        note_resolution: resultat.note_resolution,
      }));
      setSucces(true);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };
  const traitable =
    demande &&
    ['ABSENCE', 'RECLAMATION'].includes(demande.type_demande) &&
    ['SOUMISE', 'EN_ATTENTE', 'EN_ATTENTE_TRAITEMENT'].includes(demande.statut);
  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8">
      <Link to="/dashboard" className="text-blue-700 inline-block mb-6">
        ← Tableau de bord agent
      </Link>
      <h1 className="text-2xl font-bold mb-6">Examen de la demande</h1>
      {erreur && (
        <p role="alert" className="bg-red-50 text-red-800 p-4 rounded-xl mb-4">
          {erreur}
        </p>
      )}
      {succes && (
        <p
          role="status"
          className="bg-green-50 text-green-800 p-4 rounded-xl mb-4"
        >
          Décision enregistrée. L’étudiant peut la consulter dans son suivi.
        </p>
      )}
      {!demande && !erreur && <p role="status">Chargement…</p>}
      {demande && (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex flex-wrap gap-3 justify-between mb-4">
              <h2 className="font-semibold break-all">
                {demande.code_reference}
              </h2>
              <StatutDemande statut={demande.statut} />
            </div>
            <p>
              {demande.etudiant.nom} {demande.etudiant.prenoms} —{' '}
              {demande.etudiant.matricule}
            </p>
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(demande.reponses_formulaire || {})
                .filter(([, v]) => v !== '' && v != null)
                .map(([cle, valeur]) => (
                  <div key={cle}>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      {cle.replaceAll('_', ' ')}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words">
                      {typeof valeur === 'object'
                        ? JSON.stringify(valeur)
                        : String(valeur)}
                    </dd>
                  </div>
                ))}
            </dl>
            {demande.note_resolution && (
              <p className="mt-6 whitespace-pre-wrap">
                <strong>Note de résolution : </strong>
                {demande.note_resolution}
              </p>
            )}
          </section>
          {traitable ? (
            <form
              onSubmit={soumettre}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <label htmlFor="decision" className="block font-semibold mb-2">
                Décision
              </label>
              <select
                id="decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full border border-slate-300 p-3 rounded-lg mb-4"
              >
                <option value="ACCEPTEE">Accepter la demande</option>
                <option value="REFUSEE">Refuser la demande</option>
              </select>
              <label htmlFor="resolution" className="block font-semibold mb-2">
                Note de résolution
              </label>
              <p id="note-aide" className="text-sm text-slate-600 mb-2">
                Expliquez votre décision à l’étudiant.
              </p>
              <textarea
                id="resolution"
                aria-describedby="note-aide"
                required
                maxLength={2000}
                rows={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-300 p-3 rounded-lg"
              />
              <button
                disabled={envoi || !note.trim()}
                className="mt-4 bg-blue-700 text-white px-5 py-3 rounded-xl disabled:opacity-50"
              >
                {envoi ? 'Enregistrement…' : 'Enregistrer la décision'}
              </button>
            </form>
          ) : (
            <p className="text-slate-600">
              Cette demande ne nécessite plus de décision depuis cet écran.
            </p>
          )}
        </>
      )}
    </main>
  );
}
