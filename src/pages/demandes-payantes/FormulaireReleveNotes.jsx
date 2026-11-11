import { useState, useEffect, useRef } from 'react';
import {
  FormulaireDemande,
  ProfilManquant,
} from '../../components/FormulaireDemande';
import api from '../../api';
import RecuDemande from '../../components/RecuDemande';
import useProfilEtudiant, { nomComplet } from '../../hooks/useProfilEtudiant';
import useAnneesUniversitaires from '../../hooks/useAnneesUniversitaires';

const RESULTATS = [
  { code: 'SN', label: 'SN (Session normale)' },
  { code: 'SR', label: 'SR (Session de rattrapage)' },
  { code: 'MISABAKA', label: 'Misabaka' },
  { code: 'REDOUBLANT', label: 'Redoublant' },
];
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];
const TARIF_PAR_EXEMPLAIRE = 2000;

function formaterDateDuJour() {
  const d = new Date();
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${jj}/${mm}/${d.getFullYear()}`;
}

export default function FormulaireReleveNotes() {
  const { annees: ANNEES_CODES } = useAnneesUniversitaires();
  const [formData, setFormData] = useState({
    date_demande: formaterDateDuJour(),
    resultat_a_encadrer: '',
    numero_inscription: '',
    telephone: '',
    nom_prenoms: '',
    releve_notes_a_demander: '',
    nombre: 1,
    annee_universitaire: '',
    parcours: '',
  });

  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');

  const {
    profil,
    chargement: chargementProfil,
    erreur: erreurProfil,
  } = useProfilEtudiant();
  const dejaInitialise = useRef(false);

  // Fusionne les champs automatiques dans le state existant, une seule fois.
  useEffect(() => {
    if (profil && !dejaInitialise.current) {
      dejaInitialise.current = true;
      setFormData((prev) => ({
        ...prev,
        numero_inscription: profil.matricule || '',
        telephone: profil.telephone || '',
        nom_prenoms: nomComplet(profil),
        parcours: profil.code_parcours || '',
      }));
    }
  }, [profil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const soumettreDemande = async (e) => {
    e.preventDefault();
    setErreur('');

    const {
      resultat_a_encadrer,
      numero_inscription,
      telephone,
      nom_prenoms,
      releve_notes_a_demander,
      nombre,
      annee_universitaire,
      parcours,
    } = formData;

    if (!resultat_a_encadrer) {
      setErreur(
        'Veuillez choisir le résultat à encadrer (SN, SR, Misabaka ou Redoublant).',
      );
      return;
    }

    if (
      !numero_inscription ||
      !telephone ||
      !nom_prenoms ||
      !releve_notes_a_demander ||
      !nombre ||
      !annee_universitaire ||
      !parcours
    ) {
      setErreur('Veuillez remplir tous les champs du formulaire.');
      return;
    }

    // Liste chargée depuis le référentiel ; si elle est vide (API injoignable),
    // le contrôle est laissé au backend.
    if (
      ANNEES_CODES.length > 0 &&
      !ANNEES_CODES.includes(annee_universitaire)
    ) {
      setErreur(
        `L'année universitaire est invalide. Années disponibles : ${ANNEES_CODES.join(', ')}`,
      );
      return;
    }

    setChargement(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setErreur(
          'Vous devez être connecté pour soumettre une demande de relevé de notes.',
        );
        return;
      }

      const donnees = await api.post('/demandes-payantes/releve-notes', {
        date_demande: formData.date_demande,
        resultat_a_encadrer,
        numero_inscription,
        telephone,
        nom_prenoms,
        releve_notes_a_demander,
        nombre_exemplaires: Number(nombre),
        annee_universitaire,
        parcours,
        beneficiaire: {
          matricule: numero_inscription,
          nom: nom_prenoms,
          telephone,
          parcours,
        },
      });

      setResultat(donnees);
    } catch (errApi) {
      const message =
        errApi?.message || 'Impossible de contacter le serveur backend.';
      setErreur(
        message.includes('Token')
          ? 'Votre session a expiré ou est invalide. Veuillez vous reconnecter.'
          : message,
      );
    } finally {
      setChargement(false);
    }
  };

  if (resultat) {
    return (
      <RecuDemande
        reference={resultat.code_reference}
        type="Demande de relevé de notes"
        montant={resultat.montant}
        champs={[
          {
            label: 'Matricule',
            valeur: resultat.etudiant?.matricule || formData.numero_inscription,
          },
          {
            label: 'Nom et prénoms',
            valeur: resultat.etudiant
              ? `${resultat.etudiant.nom} ${resultat.etudiant.prenoms || ''}`
              : formData.nom_prenoms,
          },
          {
            label: 'Résultat à encadrer',
            valeur: formData.resultat_a_encadrer,
          },
          { label: 'Relevé demandé', valeur: formData.releve_notes_a_demander },
          {
            label: 'Année universitaire',
            valeur:
              resultat.annees_concernees?.join(', ') ||
              formData.annee_universitaire,
          },
          {
            label: 'Nombre d’exemplaires',
            valeur: resultat.nombre_exemplaires || formData.nombre,
          },
          { label: 'Parcours', valeur: formData.parcours },
        ]}
        onNouvelleDemande={() => setResultat(null)}
      />
    );
  }

  const champTexte =
    'w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm shadow-sm transition';

  return (
    <FormulaireDemande
      titre="Relevé de notes"
      description="Choisissez le niveau, l’année et le nombre d’exemplaires."
      onSubmit={soumettreDemande}
      chargementProfil={chargementProfil}
      erreurProfil={erreurProfil}
    >
      <ProfilManquant
        champs={['numero_inscription', 'telephone', 'nom_prenoms', 'parcours']}
        profil={profil}
        valeurs={formData}
        modifier={handleChange}
      />
      {/* Résultat à encadrer (SN / SR / Misabaka / Redoublant) */}
      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">
          Session ou résultat <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {RESULTATS.map((r) => (
            <label
              key={r.code}
              className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
            >
              <input
                type="radio"
                name="resultat_a_encadrer"
                value={r.code}
                checked={formData.resultat_a_encadrer === r.code}
                onChange={handleChange}
                className="accent-sky-500"
              />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="releve_notes_a_demander"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Relevé de notes à demander <span className="text-red-500">*</span>
        </label>
        <select
          id="releve_notes_a_demander"
          name="releve_notes_a_demander"
          value={formData.releve_notes_a_demander}
          onChange={handleChange}
          className={champTexte}
        >
          <option value="">Choisir le niveau</option>
          {NIVEAUX.map((n) => (
            <option key={n} value={n}>
              Relevé de {n}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-xs">
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Nombre d’exemplaires <span className="text-red-500">*</span>
        </label>
        <select
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-sky-500 text-sm shadow-sm transition"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Année universitaire <span className="text-red-500">*</span>
        </label>
        {ANNEES_CODES.length > 0 ? (
          <select
            name="annee_universitaire"
            value={formData.annee_universitaire}
            onChange={handleChange}
            className={champTexte}
          >
            <option value="">Choisir l’année universitaire</option>
            {ANNEES_CODES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            name="annee_universitaire"
            placeholder="Ex : 2025-2026"
            value={formData.annee_universitaire}
            onChange={handleChange}
            className={champTexte}
          />
        )}
        {ANNEES_CODES.length === 0 && (
          <p className="text-xs text-slate-400 mt-1">
            Format AAAA-AAAA (ex : 2025-2026)
          </p>
        )}
      </div>
      <p className="fiche-tarif">
        Montant à régler{' '}
        <strong>
          {(Number(formData.nombre) * TARIF_PAR_EXEMPLAIRE).toLocaleString(
            'fr-FR',
          )}{' '}
          Ar
        </strong>
      </p>
      {erreur && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm mb-4">
          {erreur}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={chargement || chargementProfil}
          className="w-full sm:w-auto px-8 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium rounded-md shadow-sm transition duration-150 text-sm"
        >
          {chargement
            ? 'Traitement en cours...'
            : 'Soumettre le relevé de notes'}
        </button>
      </div>
    </FormulaireDemande>
  );
}
