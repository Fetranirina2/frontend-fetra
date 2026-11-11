import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileClock,
  ShieldCheck,
} from 'lucide-react';
import api from '../api';
import usePapiMode from '../hooks/usePapiMode';

export default function RecuDemande({
  reference,
  type,
  montant = 0,
  champs = [],
  onNouvelleDemande,
}) {
  const papi = usePapiMode();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const payante = Number(montant) > 0;

  const payer = async () => {
    if (chargement) return;
    setChargement(true);
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
      ) {
        throw new Error('Adresse de paiement Papi inattendue.');
      }
      window.location.assign(lien.href);
    } catch (e) {
      setErreur(e.message);
      setChargement(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/etudiant/dashboard"
          className="text-sm font-semibold text-blue-700"
        >
          ← Mon espace
        </Link>
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-950 to-blue-800 px-7 py-8 text-white sm:px-10">
            <div className="flex items-center gap-3 text-sm font-semibold text-blue-100">
              {payante ? <FileClock size={20} /> : <CheckCircle2 size={20} />}
              {payante
                ? 'Étape 2 sur 2 · Paiement requis'
                : 'Demande transmise'}
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              {payante
                ? 'Terminez le paiement pour transmettre votre demande'
                : 'Votre demande a été envoyée à la scolarité'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              {payante
                ? 'Votre dossier est enregistré, mais aucun agent ne le reçoit avant la confirmation du paiement par Papi. Vous pourrez reprendre le paiement depuis votre espace.'
                : 'Vous pouvez suivre son traitement en ligne. La scolarité vous répondra dans votre espace.'}
            </p>
          </div>

          <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_270px]">
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Récapitulatif
              </p>
              <h2 className="mt-2 text-xl font-semibold">{type}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Référence :{' '}
                <strong className="text-slate-800">{reference}</strong>
              </p>
              <dl className="mt-6 divide-y divide-slate-100 text-sm">
                {champs
                  .filter(
                    ({ valeur }) =>
                      valeur !== undefined && valeur !== null && valeur !== '',
                  )
                  .map(({ label, valeur }) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 py-3"
                    >
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="max-w-[60%] break-words text-right font-medium">
                        {String(valeur)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </section>

            <aside className="rounded-2xl border border-blue-100 bg-blue-50 p-5 self-start">
              <p className="text-sm text-slate-600">Montant à payer</p>
              <p className="mt-1 text-3xl font-bold text-blue-950">
                {payante
                  ? `${Number(montant).toLocaleString('fr-FR')} Ar`
                  : 'Gratuit'}
              </p>
              {payante && papi.mode === 'sandbox' && (
                <p className="mt-3 rounded-lg bg-amber-100 p-3 text-xs leading-5 text-amber-900">
                  Mode de démonstration : aucun argent réel n’est débité et
                  aucun document officiel n’est livré.
                </p>
              )}
              {payante && papi.disponible && (
                <button
                  type="button"
                  onClick={payer}
                  disabled={chargement}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  <CreditCard size={18} />{' '}
                  {chargement
                    ? 'Ouverture de Papi…'
                    : papi.mode === 'production'
                      ? 'Payer avec Papi'
                      : 'Tester le paiement'}
                </button>
              )}
              {payante && !papi.disponible && (
                <p className="mt-4 text-sm text-amber-900">
                  Le paiement en ligne est indisponible pour le moment. Votre
                  dossier reste enregistré dans votre espace.
                </p>
              )}
              {erreur && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {erreur}
                </p>
              )}
              <Link
                to="/etudiant/dashboard?onglet=demandes"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-800"
              >
                Suivre ma demande <ArrowRight size={16} />
              </Link>
              {payante && (
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <ShieldCheck size={16} className="shrink-0" /> Seule la
                  confirmation de Papi déclenche le traitement par la scolarité.
                </p>
              )}
            </aside>
          </div>
        </div>
        {!payante && onNouvelleDemande && (
          <button
            type="button"
            onClick={onNouvelleDemande}
            className="mt-5 text-sm font-semibold text-blue-700 underline"
          >
            Faire une autre demande
          </button>
        )}
      </div>
    </main>
  );
}
