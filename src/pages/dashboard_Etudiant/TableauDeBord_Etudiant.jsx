import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Plus,
  RefreshCw,
  ShieldCheck,
  Search,
} from 'lucide-react';
import api from '../../api';
import { useAuthentification } from '../../contexts/ContexteAuthentification';
import usePapiMode from '../../hooks/usePapiMode';
import StatutDemande from '../suivi/StatutDemande';

const CATALOGUE = [
  {
    type: 'CERTIFICAT',
    titre: 'Certificat de scolarité',
    description: 'Une preuve officielle de votre inscription.',
    prix: '1 000 Ar',
    route: '/demandes/certificat',
    icone: GraduationCap,
  },
  {
    type: 'RELEVE',
    titre: 'Relevé de notes',
    description: 'Vos résultats académiques officiels.',
    prix: 'À partir de 2 000 Ar',
    route: '/demandes/releve',
    icone: BookOpen,
  },
  {
    type: 'ATTESTATION',
    titre: 'Attestation',
    description: 'Attestation de réussite ou de fin d’études.',
    prix: '5 000 Ar',
    route: '/demandes/attestation',
    icone: FileCheck2,
  },
  {
    type: 'ABSENCE',
    titre: 'Demande d’absence',
    description: 'Soumettez votre demande sans déplacement.',
    prix: 'Gratuit',
    route: '/demandes/absence',
    icone: Clock3,
  },
  {
    type: 'RECLAMATION',
    titre: 'Réclamation',
    description: 'Recevez une réponse écrite de la scolarité.',
    prix: 'Gratuit',
    route: '/demandes/reclamation',
    icone: FileText,
  },
];
const NOMS = Object.fromEntries(CATALOGUE.map((d) => [d.type, d.titre]));

function explication(demande) {
  if (
    demande.statut === 'EN_ATTENTE_PAIEMENT' ||
    (demande.statut === 'SOUMISE' && demande.montant > 0 && !demande.a_paye)
  )
    return 'Paiement requis : votre demande n’a pas encore été transmise à la scolarité.';
  if (demande.statut_paiement === 'PAYEE_PAPI_SANDBOX')
    return demande.document_envoye
      ? 'Votre document de test est disponible au téléchargement. Aucun paiement réel n’a été effectué.'
      : 'Simulation confirmée, sans débit réel. Le traitement par la scolarité est possible lorsque la livraison de test est activée.';
  if (demande.statut === 'PAYEE_EN_LIGNE')
    return 'Paiement confirmé. Votre demande a été transmise à la scolarité.';
  if (demande.statut === 'EN_PREPARATION')
    return 'La scolarité prépare votre document.';
  if (demande.statut === 'DOCUMENT_ENVOYE')
    return 'Votre document est prêt. Téléchargez-le ci-dessous.';
  if (demande.type_demande === 'RECLAMATION' && demande.note_resolution)
    return 'La scolarité vous a répondu.';
  if (
    demande.type_demande === 'ABSENCE' &&
    demande.statut === 'TRAITEE_ACCEPTEE'
  )
    return 'Votre demande est acceptée. Le document sera disponible ici après son envoi.';
  return 'Votre demande a été transmise à la scolarité.';
}

export default function TableauDeBordEtudiant() {
  const { utilisateurConnecte } = useAuthentification();
  const papi = usePapiMode();
  const [params, setParams] = useSearchParams();
  const onglet = ['demandes', 'nouvelle'].includes(params.get('onglet'))
    ? params.get('onglet')
    : 'demandes';
  const [demandes, setDemandes] = useState([]);
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [compteurs, setCompteurs] = useState({ a_payer: 0, disponibles: 0 });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [paiementEnCours, setPaiementEnCours] = useState(null);
  const [telechargement, setTelechargement] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!utilisateurConnecte?.matricule) return undefined;
    let actif = true;
    setChargement(true);
    const timer = setTimeout(
      () =>
        api
          .get(
            '/dashboard/mes-demandes/' +
              encodeURIComponent(utilisateurConnecte.matricule) +
              '?page=' +
              page +
              '&limit=20' +
              (recherche.trim()
                ? '&recherche=' + encodeURIComponent(recherche.trim())
                : ''),
          )
          .then((data) => {
            if (actif) {
              setDemandes(data.demandes);
              setPagination(data.pagination);
              setCompteurs(data.compteurs);
              setErreur('');
            }
          })
          .catch((e) => {
            if (actif) setErreur(e.message);
          })
          .finally(() => {
            if (actif) setChargement(false);
          }),
      recherche ? 250 : 0,
    );
    return () => {
      actif = false;
      clearTimeout(timer);
    };
  }, [utilisateurConnecte?.matricule, revision, page, recherche]);

  useEffect(() => {
    const actualiser = () => {
      if (document.visibilityState === 'visible') setRevision((v) => v + 1);
    };
    window.addEventListener('focus', actualiser);
    return () => window.removeEventListener('focus', actualiser);
  }, []);

  const payer = async (reference) => {
    setPaiementEnCours(reference);
    setErreur('');
    try {
      const resultat = await api.post(
        '/paiement-papi/initier/' + encodeURIComponent(reference),
        {},
      );
      const lien = new URL(resultat.lien_paiement);
      if (
        lien.protocol !== 'https:' ||
        lien.hostname !== 'payment-form.papi.mg'
      )
        throw new Error('Adresse de paiement Papi inattendue.');
      window.location.assign(lien.href);
    } catch (e) {
      setErreur(e.message);
      setPaiementEnCours(null);
    }
  };

  const telecharger = async (reference) => {
    setTelechargement(reference);
    setErreur('');
    try {
      const blob = await api.blob(
        '/documents/' + encodeURIComponent(reference),
      );
      const url = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `document-${reference}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setTelechargement(null);
    }
  };

  const aPayer = compteurs.a_payer;
  const disponibles = compteurs.disponibles;
  return (
    <main className="espace-scolarite min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Espace étudiant
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              Bonjour{' '}
              {utilisateurConnecte?.prenoms ||
                utilisateurConnecte?.nom ||
                'étudiant'}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Demandez, payez et recevez vos documents administratifs sans vous
              déplacer.
            </p>
          </div>
          <button
            onClick={() => setRevision((v) => v + 1)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
          >
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
              <FileText size={23} strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-3xl font-bold">{pagination.total}</p>
            <p className="text-sm text-slate-600">Mes demandes</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
              <CreditCard size={23} strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-3xl font-bold">{aPayer}</p>
            <p className="text-sm text-slate-600">Paiements à terminer</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
              <Download size={23} strokeWidth={1.8} />
            </span>
            <p className="mt-3 text-3xl font-bold">{disponibles}</p>
            <p className="text-sm text-slate-600">Documents disponibles</p>
          </div>
        </div>
        {papi.mode === 'sandbox' && (
          <div
            role="status"
            className="mb-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <strong>Plateforme en démonstration :</strong> les paiements Papi
            sont simulés. Aucun argent réel n’est débité. Si la livraison de
            test est activée, la scolarité peut vous envoyer un PDF de test.
          </div>
        )}
        {erreur && (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {erreur}
          </p>
        )}
        <nav
          aria-label="Espace étudiant"
          className="mb-6 flex gap-2 border-b border-slate-200"
        >
          <button
            onClick={() => setParams({ onglet: 'demandes' })}
            className={`border-b-2 px-4 py-3 font-semibold ${onglet === 'demandes' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600'}`}
          >
            Mes demandes
          </button>
          <button
            onClick={() => setParams({ onglet: 'nouvelle' })}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-semibold ${onglet === 'nouvelle' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600'}`}
          >
            <Plus size={17} /> Nouvelle demande
          </button>
        </nav>

        {onglet === 'nouvelle' ? (
          <section>
            <h2 className="text-2xl font-bold">
              Quel document souhaitez-vous demander ?
            </h2>
            <p className="mt-2 text-slate-600">
              Les documents payants sont transmis à la scolarité après
              confirmation du paiement. Les démarches gratuites sont transmises
              immédiatement.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {CATALOGUE.map(
                ({ type, titre, description, prix, route, icone: Icone }) => (
                  <Link
                    key={type}
                    to={route}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f2a4a] to-[#1a56db] text-white shadow-sm">
                      <Icone size={25} strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{titre}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">
                      {description}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <strong className="text-blue-900">{prix}</strong>
                      <span className="flex items-center gap-1 text-sm font-semibold text-blue-700">
                        Commencer <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Suivi de mes demandes</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Chaque étape est visible ici, du paiement à la livraison.
                </p>
              </div>
              <Link
                to="/etudiant/dashboard?onglet=nouvelle"
                className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"
              >
                <Plus size={17} /> Faire une demande
              </Link>
            </div>
            <label className="mb-5 flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm">
              <Search size={18} className="text-slate-400" />
              <span className="sr-only">Rechercher par référence</span>
              <input
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setPage(1);
                }}
                placeholder="Rechercher une référence"
                className="w-full outline-none"
              />
            </label>
            {chargement ? (
              <p className="rounded-xl bg-white p-7">Chargement…</p>
            ) : demandes.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <FileText size={32} className="mx-auto text-slate-400" />
                <h3 className="mt-3 font-semibold">
                  Aucune demande pour le moment
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Commencez une démarche pour la suivre ici.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandes.map((d) => {
                  const attentePaiement =
                    d.montant > 0 &&
                    !d.a_paye &&
                    ['SOUMISE', 'EN_ATTENTE_PAIEMENT'].includes(d.statut);
                  return (
                    <article
                      key={d.code_reference}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                            {d.code_reference}
                          </p>
                          <h3 className="mt-1 text-lg font-bold">
                            {NOMS[d.type_demande] || d.type_demande}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Créée le{' '}
                            {new Date(d.date_soumission).toLocaleDateString(
                              'fr-FR',
                            )}
                          </p>
                        </div>
                        <StatutDemande statut={d.statut} />
                        {d.statut_paiement === 'PAYEE_PAPI_SANDBOX' && (
                          <StatutDemande statut="SIMULATION" />
                        )}
                      </div>
                      <p className="mt-4 text-sm text-slate-700">
                        {explication(d)}
                      </p>
                      {d.note_resolution && (
                        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                          <strong>Réponse de la scolarité :</strong>{' '}
                          {d.note_resolution}
                        </div>
                      )}
                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                        {attentePaiement && papi.disponible && (
                          <button
                            type="button"
                            onClick={() => payer(d.code_reference)}
                            disabled={paiementEnCours !== null}
                            className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            <CreditCard size={17} />{' '}
                            {paiementEnCours === d.code_reference
                              ? 'Ouverture de Papi…'
                              : papi.mode === 'production'
                                ? `Payer ${Number(d.montant).toLocaleString('fr-FR')} Ar`
                                : 'Tester le paiement'}
                          </button>
                        )}
                        {attentePaiement && !papi.disponible && (
                          <span className="text-sm text-amber-800">
                            Paiement indisponible, réessayez plus tard.
                          </span>
                        )}
                        {d.document_envoye && (
                          <button
                            type="button"
                            onClick={() => telecharger(d.code_reference)}
                            disabled={telechargement === d.code_reference}
                            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            <Download size={17} />{' '}
                            {telechargement === d.code_reference
                              ? 'Téléchargement…'
                              : 'Télécharger mon document PDF'}
                          </button>
                        )}
                        {!attentePaiement && !d.document_envoye && (
                          <span className="flex items-center gap-2 text-xs text-slate-500">
                            <ShieldCheck size={16} /> Suivi en ligne
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <span>
                  {pagination.total} demandes · page {page} sur{' '}
                  {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
