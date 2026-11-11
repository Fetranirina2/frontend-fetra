/**
 * Fichier : MonProfil.jsx
 * Binôme 1 — Frontend (FE1)
 * Rôle : Page de consultation et modification du profil étudiant.
 * Règle de gestion concernée : RG-03.
 */
import { useEffect, useState } from 'react';
import { useAuthentification } from '../../contexts/ContexteAuthentification';
import api from '../../api';

export default function MonProfil() {
  const { utilisateurConnecte } = useAuthentification();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enEdition, setEnEdition] = useState(false);
  const [form, setForm] = useState({ adresse: '', telephone: '' });
  const [enregistrement, setEnregistrement] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');

  const chargerProfil = () => {
    if (!utilisateurConnecte?.matricule) {
      setChargement(false);
      return;
    }
    setChargement(true);
    api
      .get(`/etudiant/profil/${utilisateurConnecte.matricule}`)
      .then((donnees) => {
        setProfil(donnees);
        setForm({
          adresse: donnees.adresse || '',
          telephone: donnees.telephone || '',
        });
      })
      .catch((e) => setErreur(e.message || 'Impossible de charger le profil.'))
      .finally(() => setChargement(false));
  };

  useEffect(chargerProfil, [utilisateurConnecte?.matricule]);

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnregistrement(true);
    setErreur('');
    setMessageSucces('');
    try {
      const donnees = await api.put(
        `/etudiant/profil/${utilisateurConnecte.matricule}`,
        form,
      );
      setProfil(donnees);
      setEnEdition(false);
      setMessageSucces('Profil mis à jour avec succès.');
    } catch (e) {
      setErreur(e.message || 'La mise à jour a échoué.');
    } finally {
      setEnregistrement(false);
    }
  };

  if (!utilisateurConnecte) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-600">
          Connectez-vous en tant qu'étudiant pour voir votre profil.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-1">Mon profil</h1>
        <p className="text-sm text-slate-500 mb-6">
          Vos informations personnelles.
        </p>

        {chargement && <p className="text-slate-500">Chargement…</p>}
        {erreur && <p className="text-red-600 text-sm mb-4">{erreur}</p>}
        {messageSucces && (
          <p className="text-green-600 text-sm mb-4">{messageSucces}</p>
        )}

        {profil && !chargement && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <Champ label="Matricule" valeur={profil.matricule} />
              <Champ
                label="Nom"
                valeur={`${profil.nom} ${profil.prenoms || ''}`}
              />
              <Champ label="Niveau" valeur={profil.niveau} />
              <Champ label="Mention" valeur={profil.mention} />
              <Champ label="Parcours" valeur={profil.parcours} />
              <Champ
                label="Date de naissance"
                valeur={
                  profil.date_naissance
                    ? new Date(profil.date_naissance).toLocaleDateString(
                        'fr-FR',
                      )
                    : '—'
                }
              />
              <Champ label="Lieu de naissance" valeur={profil.lieu_naissance} />
              <Champ label="Nom du père" valeur={profil.nom_pere || '—'} />
              <Champ label="Nom de la mère" valeur={profil.nom_mere || '—'} />
            </div>

            <hr className="my-4 border-slate-200" />

            {!enEdition ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Champ label="Adresse" valeur={profil.adresse} />
                <Champ label="Téléphone" valeur={profil.telephone} />
                <div className="col-span-2 mt-2">
                  <button
                    onClick={() => setEnEdition(true)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Modifier mon adresse / téléphone
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={enregistrer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) =>
                      setForm({ ...form, adresse: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={enregistrement}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnEdition(false);
                      setForm({
                        adresse: profil.adresse,
                        telephone: profil.telephone,
                      });
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Champ({ label, valeur }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-slate-800 mt-0.5">{valeur || '—'}</p>
    </div>
  );
}
