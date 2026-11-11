import { useState, useEffect, useRef } from 'react';
import {
  FormulaireDemande,
  ProfilManquant,
  ChoixParcours,
} from '../../components/FormulaireDemande';
import api from '../../api';
import RecuDemande from '../../components/RecuDemande';
import useProfilEtudiant, {
  dateInput,
  nomComplet,
} from '../../hooks/useProfilEtudiant';
import useAnneesUniversitaires from '../../hooks/useAnneesUniversitaires';

const ANNEES_VILLES = [2027, 2026, 2025, 2024, 2023, 2022];
const LIBELLES_PARCOURS = {
  CIGSI:
    'CIGSI — Conception, Intégration et Gestion des Systèmes d’Information',
};

const PARCOURS_PAR_MENTION = [
  {
    mention: 'MANAGEMENT',
    licences: ['AES'],
    masters: ['MD', 'MEDA'],
  },
  {
    mention: 'INFORMATION COMMUNICATION ET MULTIMEDIA',
    licences: ['ICM', 'IC', 'CM'],
    masters: ['IC', 'CM', 'CNMP'],
  },
  {
    mention: 'INFORMATIQUE',
    licences: ['DA2I', 'CIGSI'],
    masters: ['SIGD', 'IGTI', 'M2I', 'SDIA'],
  },
];

const TYPE_PAR_NIVEAU = {
  L2: 'REUSSITE',
  M1: 'REUSSITE',
  L3: 'FIN_ETUDES',
  M2: 'FIN_ETUDES',
};

const LIBELLE_TYPE = {
  REUSSITE: 'Réussite',
  FIN_ETUDES: "Fin d'études",
};

function formaterDateDuJour() {
  const d = new Date();
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${jj}/${mm}/${d.getFullYear()}`;
}

/**
 * Résout un code_parcours issu de la base de données vers
 * { liste: 'licences'|'masters', code: string } compatible avec PARCOURS_PAR_MENTION.
 * Gère la correspondance IC-M → IC et CM-M → CM (codes master en base).
 * Retourne null si le code est inconnu.
 */
function resolverCodeParcours(codeBD) {
  if (!codeBD) return null;
  const TABLE = {
    'IC-M': { liste: 'masters', code: 'IC' },
    'CM-M': { liste: 'masters', code: 'CM' },
  };
  if (TABLE[codeBD]) return TABLE[codeBD];
  for (const row of PARCOURS_PAR_MENTION) {
    if (row.licences.includes(codeBD))
      return { liste: 'licences', code: codeBD };
    if (row.masters.includes(codeBD)) return { liste: 'masters', code: codeBD };
  }
  return null;
}

export default function FormulaireAttestation() {
  const { annees: ANNEES_CODES } = useAnneesUniversitaires();
  const [formData, setFormData] = useState({
    date_demande: formaterDateDuJour(),
    numero_inscription: '',
    telephone: '',
    nom_prenoms: '',
    date_naissance: '',
    lieu_naissance: '',
    type_attestation: '',
    niveau: '',
    annee_reussite_debut: '',
    annee_reussite_fin: '',
    annee_fin_etudes_debut: '',
    annee_fin_etudes_fin: '',
    licences: [],
    masters: [],
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
  // Pré-sélectionne niveau et parcours directement dans le state (sans appeler
  // choisirNiveau / choisirParcours qui sont des bascules et seraient décocochées
  // par le double appel des effets en mode développement React).
  useEffect(() => {
    if (profil && !dejaInitialise.current) {
      dejaInitialise.current = true;

      // Niveau : pré-sélectionner seulement si présent dans TYPE_PAR_NIVEAU (L2, L3, M1, M2).
      const niveauValide = TYPE_PAR_NIVEAU[profil.niveau] ? profil.niveau : '';

      // Parcours : résoudre le code_parcours de la base vers la liste du formulaire.
      const resolved = resolverCodeParcours(profil.code_parcours);

      setFormData((prev) => ({
        ...prev,
        numero_inscription: profil.matricule || '',
        telephone: profil.telephone || '',
        nom_prenoms: nomComplet(profil),
        date_naissance: dateInput(profil.date_naissance),
        lieu_naissance: profil.lieu_naissance || '',
        // Pré-sélection niveau et type (modifiables par l'étudiant)
        ...(niveauValide
          ? {
              niveau: niveauValide,
              type_attestation: TYPE_PAR_NIVEAU[niveauValide],
            }
          : {}),
        // Pré-sélection parcours (modifiable par l'étudiant)
        ...(resolved
          ? {
              licences: resolved.liste === 'licences' ? [resolved.code] : [],
              masters: resolved.liste === 'masters' ? [resolved.code] : [],
            }
          : {}),
      }));
    }
  }, [profil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const choisirNiveau = (niveau) => {
    setFormData((prev) => ({
      ...prev,
      type_attestation: TYPE_PAR_NIVEAU[niveau] || '',
      niveau: prev.niveau === niveau ? '' : niveau,
    }));
  };

  const choisirParcours = (liste, code) => {
    setFormData((prev) => ({
      ...prev,
      licences: liste === 'licences' ? [code] : [],
      masters: liste === 'masters' ? [code] : [],
    }));
  };

  const mentionDe = (licences, masters) => {
    const codes = [...licences, ...masters];
    const rows = PARCOURS_PAR_MENTION.filter((row) =>
      codes.some((c) => row.licences.includes(c) || row.masters.includes(c)),
    );
    if (rows.length === 0) return '';
    return rows.map((r) => r.mention).join(' + ');
  };

  const soumettreDemande = async (e) => {
    e.preventDefault();
    setErreur('');

    const {
      date_demande,
      numero_inscription,
      telephone,
      nom_prenoms,
      date_naissance,
      lieu_naissance,
      type_attestation,
      niveau,
      annee_reussite_debut,
      annee_reussite_fin,
      annee_fin_etudes_debut,
      annee_fin_etudes_fin,
      licences,
      masters,
    } = formData;

    if (
      !numero_inscription ||
      !telephone ||
      !nom_prenoms ||
      !date_naissance ||
      !lieu_naissance ||
      !type_attestation ||
      !niveau
    ) {
      setErreur(
        'Complétez les informations manquantes et choisissez une attestation.',
      );
      return;
    }

    const anneeDebut =
      type_attestation === 'REUSSITE'
        ? annee_reussite_debut
        : annee_fin_etudes_debut;
    const anneeFin =
      type_attestation === 'REUSSITE'
        ? annee_reussite_fin
        : annee_fin_etudes_fin;

    if (!anneeDebut || !anneeFin) {
      setErreur(
        `Veuillez renseigner l'année universitaire (${LIBELLE_TYPE[type_attestation]}).`,
      );
      return;
    }

    const code_annee = `${anneeDebut}-${anneeFin}`;
    // Liste vide (API injoignable) : contrôle laissé au backend.
    if (ANNEES_CODES.length > 0 && !ANNEES_CODES.includes(code_annee)) {
      setErreur(
        "La combinaison d'année universitaire est invalide (exemple : 2024 / 2025).",
      );
      return;
    }

    if (licences.length === 0 && masters.length === 0) {
      setErreur('Veuillez sélectionner un seul parcours (Licence ou Master).');
      return;
    }

    const parcours = {
      mention: mentionDe(licences, masters),
      licences,
      masters,
    };

    setChargement(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setErreur(
          "Vous devez être connecté pour soumettre une demande d'attestation.",
        );
        return;
      }

      const donnees = await api.post('/demandes-payantes/attestation', {
        date_demande,
        numero_inscription,
        telephone,
        nom_prenoms,
        date_naissance,
        lieu_naissance,
        type_attestation,
        niveau,
        annee_reussite_debut,
        annee_reussite_fin,
        annee_fin_etudes_debut,
        annee_fin_etudes_fin,
        code_annee,
        parcours,
        beneficiaire: {
          matricule: numero_inscription,
          nom: nom_prenoms,
          telephone,
          mention: parcours.mention,
          parcours: [...licences, ...masters].join(', '),
          niveau,
          date_naissance,
          lieu_naissance,
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
    const parcours = [
      formData.licences?.join(', '),
      formData.masters?.join(', '),
    ]
      .filter(Boolean)
      .join(' / ');
    const anneeUniversitaire =
      formData.type_attestation === 'REUSSITE'
        ? `${formData.annee_reussite_debut}-${formData.annee_reussite_fin}`
        : `${formData.annee_fin_etudes_debut}-${formData.annee_fin_etudes_fin}`;
    return (
      <RecuDemande
        reference={resultat.code_reference}
        type="Demande d'attestation"
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
            label: 'Attestation demandée',
            valeur: `${formData.niveau} (${LIBELLE_TYPE[formData.type_attestation]})`,
          },
          {
            label: 'Année universitaire',
            valeur: resultat.annee_universitaire || anneeUniversitaire,
          },
          { label: 'Parcours', valeur: parcours },
        ]}
        onNouvelleDemande={() => setResultat(null)}
      />
    );
  }

  const champSelection =
    'px-4 py-2.5 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-sky-500 text-sm shadow-sm transition';

  return (
    <FormulaireDemande
      titre="Attestation"
      description="Précisez l’année universitaire de l’attestation demandée."
      onSubmit={soumettreDemande}
      chargementProfil={chargementProfil}
      erreurProfil={erreurProfil}
    >
      <ProfilManquant
        champs={[
          'numero_inscription',
          'telephone',
          'nom_prenoms',
          'date_naissance',
          'lieu_naissance',
        ]}
        profil={profil}
        valeurs={formData}
        modifier={handleChange}
      />
      <label className="fiche-select">
        Attestation demandée
        <select
          value={formData.niveau}
          onChange={(e) => choisirNiveau(e.target.value)}
        >
          <option value="">Choisir une attestation</option>
          {Object.entries(TYPE_PAR_NIVEAU).map(([niveau, type]) => (
            <option key={niveau} value={niveau}>
              {LIBELLE_TYPE[type]} · {niveau}
            </option>
          ))}
        </select>
      </label>
      {formData.type_attestation && (
        <div className="mt-6 max-w-md">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Année universitaire — {LIBELLE_TYPE[formData.type_attestation]}{' '}
            <span className="text-slate-400">début / fin</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              name={
                formData.type_attestation === 'REUSSITE'
                  ? 'annee_reussite_debut'
                  : 'annee_fin_etudes_debut'
              }
              value={
                formData.type_attestation === 'REUSSITE'
                  ? formData.annee_reussite_debut
                  : formData.annee_fin_etudes_debut
              }
              onChange={handleChange}
              className={champSelection}
            >
              <option value="">Début</option>
              {ANNEES_VILLES.map((a) => (
                <option key={`debut-${a}`} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <span className="text-slate-400">/</span>
            <select
              name={
                formData.type_attestation === 'REUSSITE'
                  ? 'annee_reussite_fin'
                  : 'annee_fin_etudes_fin'
              }
              value={
                formData.type_attestation === 'REUSSITE'
                  ? formData.annee_reussite_fin
                  : formData.annee_fin_etudes_fin
              }
              onChange={handleChange}
              className={champSelection}
            >
              <option value="">Fin</option>
              {ANNEES_VILLES.map((a) => (
                <option key={`fin-${a}`} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {!resolverCodeParcours(profil?.code_parcours) && (
        <ChoixParcours
          mentions={PARCOURS_PAR_MENTION}
          libelles={LIBELLES_PARCOURS}
          valeur={
            formData.licences.length
              ? 'licence:' + formData.licences[0]
              : formData.masters.length
                ? 'master:' + formData.masters[0]
                : ''
          }
          choisir={(code, mention, liste) => choisirParcours(liste, code)}
        />
      )}
      <div className="flex justify-between items-center bg-sky-50 border border-sky-200 rounded-md px-4 py-3 mb-4">
        <span className="text-sm font-medium text-slate-700">
          Montant à régler :
        </span>
        <span className="text-xl font-bold text-sky-600">5 000 Ar</span>
      </div>

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
          {chargement ? 'Traitement en cours...' : "Soumettre l'attestation"}
        </button>
      </div>
    </FormulaireDemande>
  );
}
