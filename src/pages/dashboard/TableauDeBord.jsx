import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import api, { API_BASE_URL } from '../../api';
import usePapiMode from '../../hooks/usePapiMode';
import StatutDemande from '../suivi/StatutDemande';

const TYPES = {
  CERTIFICAT: 'Certificat de scolarité',
  RELEVE: 'Relevé de notes',
  ATTESTATION: 'Attestation',
  ABSENCE: 'Demande d’absence',
  RECLAMATION: 'Réclamation',
};
const ONGLETS = [
  { id: 'action', label: 'À traiter' },
  { id: 'livrees', label: 'Documents livrés' },
  { id: 'terminees', label: 'Terminées' },
  { id: 'toutes', label: 'Toutes' },
];
const STATUTS = [
  { id: '', label: 'Tous les états' },
  { id: 'SOUMISE', label: 'Soumise' },
  { id: 'EN_ATTENTE_PAIEMENT', label: 'En attente de paiement' },
  { id: 'PAYEE_EN_LIGNE', label: 'Paiement confirmé' },
  { id: 'EN_PREPARATION', label: 'En préparation' },
  { id: 'TRAITEE_ACCEPTEE', label: 'Acceptée' },
  { id: 'TRAITEE_REFUSEE', label: 'Refusée' },
  { id: 'DOCUMENT_ENVOYE', label: 'Document envoyé' },
];

function actionPour(demande) {
  if (
    demande.type_demande === 'RECLAMATION' &&
    ['SOUMISE', 'EN_ATTENTE', 'EN_ATTENTE_TRAITEMENT'].includes(demande.statut)
  )
    return {
      label: 'Répondre',
      chemin: `/agent/traitement/${encodeURIComponent(demande.code_reference)}`,
    };
  if (
    demande.type_demande === 'ABSENCE' &&
    ['SOUMISE', 'EN_ATTENTE', 'EN_ATTENTE_TRAITEMENT'].includes(demande.statut)
  )
    return {
      label: 'Examiner',
      chemin: `/agent/traitement/${encodeURIComponent(demande.code_reference)}`,
    };
  if (
    demande.type_demande === 'ABSENCE' &&
    demande.statut === 'TRAITEE_ACCEPTEE'
  )
    return {
      label: 'Envoyer le PDF',
      chemin: `/agent/documents/${encodeURIComponent(demande.code_reference)}`,
    };
  if (
    demande.livraison_autorisee &&
    ['PAYEE_EN_LIGNE', 'EN_PREPARATION'].includes(demande.statut)
  )
    return {
      label: 'Préparer et envoyer',
      chemin: `/agent/documents/${encodeURIComponent(demande.code_reference)}`,
    };
  return null;
}

export default function TableauDeBord() {
  const papi = usePapiMode();
  const [vue, setVue] = useState('action');
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [type, setType] = useState('');
  const [statut, setStatut] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [revision, setRevision] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [resultat, setResultat] = useState({
    demandes: [],
    pagination: { total: 0, pages: 0 },
    comptages: {},
  });
  const [detail, setDetail] = useState(null);
  const [detailCharge, setDetailCharge] = useState(false);

  useEffect(() => {
    let actif = true;
    const timer = setTimeout(
      () => {
        setChargement(true);
        const params = new URLSearchParams({
          vue: vue === 'livrees' ? 'toutes' : vue,
          page: String(page),
          limit: '20',
        });
        if (recherche.trim()) params.set('recherche', recherche.trim());
        if (type) params.set('type_demande', type);
        if (vue === 'livrees' || statut)
          params.set('statut', vue === 'livrees' ? 'DOCUMENT_ENVOYE' : statut);
        if (dateDebut) params.set('date_debut', dateDebut);
        if (dateFin) params.set('date_fin', dateFin);
        api
          .get('/dashboard/demandes?' + params.toString())
          .then((data) => {
            if (actif) {
              setResultat(data);
              setErreur('');
            }
          })
          .catch((e) => {
            if (actif) {
              setErreur(e.message);
              setResultat((precedent) => ({
                ...precedent,
                demandes: [],
                pagination: { total: 0, pages: 0 },
              }));
            }
          })
          .finally(() => {
            if (actif) setChargement(false);
          });
      },
      recherche ? 250 : 0,
    );
    return () => {
      actif = false;
      clearTimeout(timer);
    };
  }, [vue, page, recherche, type, statut, dateDebut, dateFin, revision]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return undefined;
    const socket = io(API_BASE_URL.replace(/\/api$/, '') + '/demandes', {
      auth: { token },
      transports: ['websocket'],
    });
    const actualiser = () => setRevision((v) => v + 1);
    socket.on('demande:nouvelle', actualiser);
    socket.on('demande:mise-a-jour', actualiser);
    return () => socket.disconnect();
  }, []);

  const voirDetail = async (code) => {
    if (detail?.code_reference === code) {
      setDetail(null);
      return;
    }
    setDetailCharge(true);
    try {
      setDetail(
        await api.get('/dashboard/demandes/' + encodeURIComponent(code)),
      );
      setErreur('');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setDetailCharge(false);
    }
  };

  const compte = resultat.comptages || {};
  const compteParType = resultat.comptages_par_type || {};
  const filtreActif = Boolean(
    type || statut || dateDebut || dateFin || recherche,
  );
  return (
    <main className="espace-scolarite min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Demandes administratives numériques
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#0f2a4a]">
              Centre de traitement
            </h1>
            <p className="mt-2 text-slate-600">
              Les demandes payantes arrivent ici après confirmation du paiement
              réel. Les absences et réclamations sont gratuites.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRevision((v) => v + 1)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
              <ClipboardList size={22} strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-3xl font-bold">
              {resultat.pagination.total}
            </p>
            <p className="text-sm text-slate-600">Dossiers affichés</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
              <CheckCircle2 size={22} strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-3xl font-bold">
              {compte.PAYEE_EN_LIGNE || 0}
            </p>
            <p className="text-sm text-slate-600">Paiements confirmés</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
              <FileText size={22} strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-3xl font-bold">
              {compte.DOCUMENT_ENVOYE || 0}
            </p>
            <p className="text-sm text-slate-600">Documents livrés</p>
          </div>
        </div>

        {papi.mode === 'sandbox' && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"
          >
            <ShieldAlert
              size={20}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p>
              <strong>Mode test Papi.</strong> Aucun argent réel n’est débité.
              Les dossiers marqués « Paiement simulé » permettent de tester le
              traitement et l’envoi d’un PDF lorsque la livraison de test est
              activée.
            </p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white/95 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div
              role="tablist"
              aria-label="Filtrer les dossiers"
              className="flex flex-wrap gap-2"
            >
              {ONGLETS.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={vue === item.id}
                  onClick={() => {
                    setVue(item.id);
                    setStatut('');
                    setPage(1);
                    setDetail(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${vue === item.id ? 'bg-[#0f2a4a] text-white shadow-sm' : 'bg-[#e8eef8] text-[#0f2a4a] hover:bg-blue-100'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <span className="sr-only">Rechercher</span>
              <input
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setPage(1);
                }}
                placeholder="Référence, étudiant…"
                className="w-48 outline-none"
              />
            </label>
          </div>
          <div className="grid gap-3 border-b border-blue-100 bg-[#f8fbff] px-5 py-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-semibold text-[#0f2a4a]">
              Type de demande
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setVue((actuelle) =>
                    actuelle === 'action' ? 'toutes' : actuelle,
                  );
                  setPage(1);
                  setDetail(null);
                }}
                className="mt-1 block w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"
              >
                <option value="">Tous les types</option>
                {Object.entries(TYPES).map(([code, nom]) => (
                  <option key={code} value={code}>
                    {nom} ({compteParType[code] || 0})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#0f2a4a]">
              État du dossier
              <select
                value={vue === 'livrees' ? 'DOCUMENT_ENVOYE' : statut}
                disabled={vue === 'livrees'}
                onChange={(e) => {
                  setStatut(e.target.value);
                  if (e.target.value) setVue('toutes');
                  setPage(1);
                }}
                className="mt-1 block w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 disabled:bg-slate-100"
              >
                {STATUTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#0f2a4a]">
              Depuis le
              <input
                type="date"
                value={dateDebut}
                max={dateFin || undefined}
                onChange={(e) => {
                  setDateDebut(e.target.value);
                  setPage(1);
                }}
                className="mt-1 block w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"
              />
            </label>
            <label className="text-xs font-semibold text-[#0f2a4a]">
              Jusqu’au
              <input
                type="date"
                value={dateFin}
                min={dateDebut || undefined}
                onChange={(e) => {
                  setDateFin(e.target.value);
                  setPage(1);
                }}
                className="mt-1 block w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-normal text-slate-800"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setType('');
                setStatut('');
                setDateDebut('');
                setDateFin('');
                setRecherche('');
                setVue('action');
                setPage(1);
              }}
              className="self-end rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#0f2a4a] hover:bg-blue-50"
            >
              Réinitialiser les filtres
            </button>
          </div>
          {erreur && (
            <p
              role="alert"
              className="m-5 rounded-lg bg-red-50 p-3 text-red-700"
            >
              {erreur}
            </p>
          )}
          {chargement ? (
            <p className="p-8 text-slate-600">Chargement des dossiers…</p>
          ) : resultat.demandes.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList size={32} className="mx-auto text-slate-400" />
              <h3 className="mt-3 font-semibold">
                Aucun dossier correspondant
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {filtreActif
                  ? 'Modifiez les filtres ou réinitialisez-les pour retrouver tous les dossiers.'
                  : 'Les nouvelles demandes apparaîtront après transmission ou paiement confirmé.'}
              </p>
              {filtreActif && (
                <button
                  type="button"
                  onClick={() => {
                    setType('');
                    setStatut('');
                    setDateDebut('');
                    setDateFin('');
                    setRecherche('');
                    setVue('toutes');
                    setPage(1);
                  }}
                  className="mt-5 rounded-xl bg-[#0f2a4a] px-4 py-2 text-sm font-semibold text-white"
                >
                  Voir toutes les demandes
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resultat.demandes.map((d) => {
                const action = actionPour(d);
                return (
                  <article
                    key={d.code_reference}
                    className="flex flex-wrap items-center gap-4 px-5 py-5 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-blue-700">
                        {d.code_reference}
                      </p>
                      <h3 className="mt-1 font-semibold">
                        {TYPES[d.type_demande] || d.type_demande}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {d.etudiant?.nom} {d.etudiant?.prenoms} ·{' '}
                        {d.etudiant?.matricule}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatutDemande statut={d.statut} />
                      {d.statut_paiement === 'PAYEE_PAPI_SANDBOX' && (
                        <StatutDemande statut="SIMULATION" />
                      )}
                      {action && (
                        <Link
                          to={action.chemin}
                          className="flex items-center gap-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                          {action.label}
                          <ArrowRight size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => voirDetail(d.code_reference)}
                        className="text-sm font-semibold text-blue-700 underline"
                      >
                        Détails
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
            <span>{resultat.pagination.total} dossier(s)</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="px-2 py-2">
                {page} / {Math.max(1, resultat.pagination.pages)}
              </span>
              <button
                disabled={page >= resultat.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </section>

        {detailCharge && <p className="mt-6">Chargement du détail…</p>}
        {detail && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Dossier {detail.code_reference}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {TYPES[detail.type_demande]}
                </h2>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-sm font-semibold text-blue-700"
              >
                Fermer
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Étudiant : {detail.etudiant?.nom} {detail.etudiant?.prenoms} ·{' '}
              {detail.etudiant?.matricule}
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries(detail.reponses_formulaire || {})
                .filter(([, v]) => v != null && v !== '')
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
            {detail.note_resolution && (
              <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm">
                <strong>Réponse :</strong> {detail.note_resolution}
              </p>
            )}
          </section>
        )}

        <div className="mt-9 flex flex-wrap gap-5 text-sm font-semibold text-blue-700">
          <Link to="/admin/referentiel/mentions">Mentions</Link>
          <Link to="/admin/referentiel/parcours">Parcours</Link>
          <Link to="/admin/referentiel/annees">Années universitaires</Link>
        </div>
      </div>
    </main>
  );
}
