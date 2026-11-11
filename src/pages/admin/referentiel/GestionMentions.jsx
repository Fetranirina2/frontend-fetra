/**
 * Fichier : GestionMentions.jsx
 * Binôme 1 — Frontend (FE1)
 * Rôle : Page d'administration de la gestion des mentions académiques.
 */
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../api';

const VIDE = { code_mention: '', libelle: '' };

export default function GestionMentions() {
  const [mentions, setMentions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState(VIDE);
  const [enEdition, setEnEdition] = useState(null); // code_mention en cours d'édition, ou null = création
  const [enEnvoi, setEnEnvoi] = useState(false);

  const charger = () => {
    setErreur('');
    setChargement(true);
    api
      .get('/referentiel/mentions')
      .then(setMentions)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  };

  useEffect(charger, []);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnEnvoi(true);
    try {
      if (enEdition) {
        await api.put(`/referentiel/mentions/${enEdition}`, {
          libelle: form.libelle,
        });
      } else {
        await api.post('/referentiel/mentions', form);
      }
      setForm(VIDE);
      setEnEdition(null);
      charger();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnEnvoi(false);
    }
  };

  const modifier = (mention) => {
    setEnEdition(mention.code_mention);
    setForm({ code_mention: mention.code_mention, libelle: mention.libelle });
  };

  const annuler = () => {
    setEnEdition(null);
    setForm(VIDE);
  };

  const supprimer = async (codeMention) => {
    if (!confirm(`Supprimer la mention "${codeMention}" ?`)) return;
    setErreur('');
    try {
      await api.delete(`/referentiel/mentions/${codeMention}`);
      charger();
    } catch (e) {
      setErreur(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-block mb-6 text-blue-700">
          ← Tableau de bord
        </Link>
        <h1 className="text-2xl font-bold text-blue-700 mb-1">
          Gestion des mentions
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Référentiel académique — mentions.
        </p>

        <form
          onSubmit={soumettre}
          className="bg-white rounded-2xl shadow p-6 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Code
            </label>
            <input
              type="text"
              value={form.code_mention}
              disabled={!!enEdition}
              onChange={(e) =>
                setForm({ ...form, code_mention: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              placeholder="ex : INFO"
              required
            />
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Libellé
            </label>
            <input
              type="text"
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="ex : Informatique"
              required
            />
          </div>
          <button
            type="submit"
            disabled={enEnvoi}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {enEdition ? 'Enregistrer' : 'Ajouter'}
          </button>
          {enEdition && (
            <button
              type="button"
              onClick={annuler}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
          )}
        </form>

        {erreur && (
          <p role="alert" className="text-red-600 text-sm mb-4">
            {erreur}
          </p>
        )}

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Libellé</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargement && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Chargement…
                  </td>
                </tr>
              )}
              {!chargement && mentions.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Aucune mention enregistrée.
                  </td>
                </tr>
              )}
              {mentions.map((m) => (
                <tr key={m.code_mention} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {m.code_mention}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.libelle}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => modifier(m)}
                      className="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => supprimer(m.code_mention)}
                      className="text-red-600 hover:underline text-xs font-semibold"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
