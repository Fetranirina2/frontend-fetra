/**
 * Fichier : GestionParcours.jsx
 * Binôme 1 — Frontend (FE1)
 * Rôle : Page d'administration de la gestion des parcours académiques.
 * Règle de gestion concernée : RG-05 (un parcours est toujours rattaché à une mention).
 */
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../api';

const VIDE = { code_parcours: '', libelle: '', code_mention: '' };

export default function GestionParcours() {
  const [parcours, setParcours] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState(VIDE);
  const [enEdition, setEnEdition] = useState(null);
  const [enEnvoi, setEnEnvoi] = useState(false);

  const charger = () => {
    setErreur('');
    setChargement(true);
    Promise.all([
      api.get('/referentiel/parcours'),
      api.get('/referentiel/mentions'),
    ])
      .then(([p, m]) => {
        setParcours(p);
        setMentions(m);
      })
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
        await api.put(`/referentiel/parcours/${enEdition}`, {
          libelle: form.libelle,
          code_mention: form.code_mention,
        });
      } else {
        await api.post('/referentiel/parcours', form);
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

  const modifier = (p) => {
    setEnEdition(p.code_parcours);
    setForm({
      code_parcours: p.code_parcours,
      libelle: p.libelle,
      code_mention: p.code_mention,
    });
  };

  const annuler = () => {
    setEnEdition(null);
    setForm(VIDE);
  };

  const supprimer = async (codeParcours) => {
    if (!confirm(`Supprimer le parcours "${codeParcours}" ?`)) return;
    setErreur('');
    try {
      await api.delete(`/referentiel/parcours/${codeParcours}`);
      charger();
    } catch (e) {
      setErreur(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f9ff] to-[#e8f2ff] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-1">
          Gestion des parcours
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Référentiel académique — parcours rattachés à une mention.
        </p>

        <form
          onSubmit={soumettre}
          className="bg-white rounded-2xl shadow p-6 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Code
            </label>
            <input
              type="text"
              value={form.code_parcours}
              disabled={!!enEdition}
              onChange={(e) =>
                setForm({ ...form, code_parcours: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              placeholder="ex : DA2I"
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
              placeholder="ex : Développement Applications"
              required
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mention
            </label>
            <select
              value={form.code_mention}
              onChange={(e) =>
                setForm({ ...form, code_mention: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
              required
            >
              <option value="" disabled>
                Choisir…
              </option>
              {mentions.map((m) => (
                <option key={m.code_mention} value={m.code_mention}>
                  {m.libelle}
                </option>
              ))}
            </select>
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
                <th className="text-left px-4 py-3">Mention</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargement && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Chargement…
                  </td>
                </tr>
              )}
              {!chargement && parcours.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    Aucun parcours enregistré.
                  </td>
                </tr>
              )}
              {parcours.map((p) => (
                <tr key={p.code_parcours} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {p.code_parcours}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.libelle}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.mention?.libelle}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => modifier(p)}
                      className="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => supprimer(p.code_parcours)}
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
