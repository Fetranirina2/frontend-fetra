import { useState, useEffect, useRef } from 'react';
import {
  FormulaireDemande,
  ProfilManquant,
} from '../../components/FormulaireDemande';
import api from '../../api';
import RecuDemande from '../../components/RecuDemande';
import useProfilEtudiant from '../../hooks/useProfilEtudiant';

const INITIAL_FORM = {
  nom: '',
  prenoms: '',
  anneeUniversitaire: '',
  parcours: '',
  niveau: '',
  im: '',
  telephone: '',
  motif: '',
  elementConstitutif: '',
};
const dateDuJour = () => new Date().toLocaleDateString('fr-FR');

export default function FormulaireReclamation() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [erreurs, setErreurs] = useState({});
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreurApi, setErreurApi] = useState('');

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
      setForm((prev) => ({
        ...prev,
        nom: profil.nom || '',
        prenoms: profil.prenoms || '',
        im: profil.matricule || '',
        parcours: profil.code_parcours || '',
        niveau: profil.niveau || '',
        telephone: profil.telephone || '',
      }));
    }
  }, [profil]);

  const modifierChamp = ({ target: { name, value } }) => {
    setForm((precedent) => ({ ...precedent, [name]: value }));
    setErreurs((precedent) => ({ ...precedent, [name]: '' }));
  };

  function valider() {
    const erreursFormulaire = {};
    const obligatoires = {
      nom: 'Le nom est obligatoire.',
      prenoms: 'Les prénoms sont obligatoires.',
      anneeUniversitaire: "L'année universitaire est obligatoire.",
      parcours: 'Le parcours est obligatoire.',
      niveau: 'Le niveau est obligatoire.',
      im: "L'IM est obligatoire.",
      telephone: 'Le numéro de téléphone est obligatoire.',
      motif: 'Le motif de la réclamation est obligatoire.',
      elementConstitutif: "L'élément constitutif à réclamer est obligatoire.",
    };
    Object.entries(obligatoires).forEach(([cle, message]) => {
      if (!form[cle].trim()) erreursFormulaire[cle] = message;
    });
    if (
      form.anneeUniversitaire &&
      !/^\d{4}-\d{4}$/.test(form.anneeUniversitaire)
    )
      erreursFormulaire.anneeUniversitaire = 'Utilisez le format 2025-2026.';
    if (form.telephone && !/^[0-9+\s()-]{7,20}$/.test(form.telephone))
      erreursFormulaire.telephone = 'Le numéro de téléphone est invalide.';
    if (form.motif.trim() && form.motif.trim().length < 10)
      erreursFormulaire.motif =
        'Le motif doit contenir au moins 10 caractères.';
    setErreurs(erreursFormulaire);
    return Object.keys(erreursFormulaire).length === 0;
  }

  async function soumettre(event) {
    event.preventDefault();
    setErreurApi('');
    if (!valider()) return;
    setChargement(true);
    try {
      const donnees = await api.post('/demandes-gratuites/reclamation', {
        nom: form.nom.trim(),
        prenoms: form.prenoms.trim(),
        annee_universitaire: form.anneeUniversitaire.trim(),
        parcours: form.parcours.trim(),
        niveau: form.niveau,
        im: form.im.trim(),
        telephone: form.telephone.trim(),
        motif: form.motif.trim(),
        element_constitutif: form.elementConstitutif.trim(),
        date_reclamation: dateDuJour(),
        beneficiaire: {
          matricule: form.im.trim(),
          nom: form.nom.trim(),
          prenoms: form.prenoms.trim(),
          telephone: form.telephone.trim(),
          parcours: form.parcours.trim(),
          niveau: form.niveau,
        },
      });
      setResultat(donnees);
    } catch (erreur) {
      setErreurApi(
        erreur?.message || "Impossible d'enregistrer la réclamation.",
      );
    } finally {
      setChargement(false);
    }
  }

  const champ = (cle) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition sm:px-4 sm:py-3 ${erreurs[cle] ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100'}`;

  // Classe pour les champs verrouillés (fond gris, curseur not-allowed)

  if (resultat) {
    return (
      <RecuDemande
        reference={resultat.code_reference}
        type="Fiche de réclamation"
        champs={[
          { label: 'Nom et prénoms', valeur: `${form.nom} ${form.prenoms}` },
          { label: 'Année universitaire', valeur: form.anneeUniversitaire },
          { label: 'Parcours', valeur: form.parcours },
          { label: 'Niveau', valeur: form.niveau },
          { label: 'IM', valeur: form.im },
          { label: 'Téléphone', valeur: form.telephone },
          { label: 'Motif de réclamation', valeur: form.motif },
          {
            label: 'Élément constitutif à réclamer',
            valeur: form.elementConstitutif,
          },
        ]}
        onNouvelleDemande={() => {
          setResultat(null);
          setForm({
            ...INITIAL_FORM,
            nom: profil?.nom || '',
            prenoms: profil?.prenoms || '',
            im: profil?.matricule || '',
            parcours: profil?.code_parcours || '',
            niveau: profil?.niveau || '',
            telephone: profil?.telephone || '',
          });
        }}
      />
    );
  }

  return (
    <FormulaireDemande
      titre="Réclamation"
      description="Précisez le résultat concerné et le motif de votre réclamation. Cette démarche est gratuite."
      onSubmit={soumettre}
      chargementProfil={chargementProfil}
      erreurProfil={erreurProfil}
    >
      <ProfilManquant
        champs={['nom', 'prenoms', 'im', 'parcours', 'niveau', 'telephone']}
        profil={profil}
        valeurs={form}
        modifier={modifierChamp}
        erreurs={erreurs}
      />
      <Champ label="Année universitaire" erreur={erreurs.anneeUniversitaire}>
        <input
          name="anneeUniversitaire"
          placeholder="2025-2026"
          value={form.anneeUniversitaire}
          onChange={modifierChamp}
          className={champ('anneeUniversitaire')}
        />
      </Champ>
      <Champ label="Motif de réclamation" erreur={erreurs.motif}>
        <textarea
          name="motif"
          rows="3"
          value={form.motif}
          onChange={modifierChamp}
          className={champ('motif')}
        />
      </Champ>
      <Champ
        label="Élément constitutif à réclamer"
        erreur={erreurs.elementConstitutif}
      >
        <textarea
          name="elementConstitutif"
          rows="5"
          placeholder="Indiquez les éléments concernés, un par ligne si nécessaire."
          value={form.elementConstitutif}
          onChange={modifierChamp}
          className={champ('elementConstitutif')}
        />
      </Champ>
      {erreurApi && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erreurApi}
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() =>
            setForm({
              ...INITIAL_FORM,
              ...(profil
                ? {
                    nom: profil.nom || '',
                    prenoms: profil.prenoms || '',
                    im: profil.matricule || '',
                    parcours: profil.code_parcours || '',
                    niveau: profil.niveau || '',
                    telephone: profil.telephone || '',
                  }
                : {}),
            })
          }
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Réinitialiser
        </button>
        <button
          type="submit"
          disabled={chargement || chargementProfil}
          className="rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {chargement ? 'Envoi en cours…' : 'Soumettre la réclamation'}
        </button>
      </div>
    </FormulaireDemande>
  );
}
function Champ({ label, erreur, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label} <span className="text-red-600">*</span>
      <div className="mt-2">{children}</div>
      {erreur && (
        <p className="mt-1 text-xs font-normal text-red-600">{erreur}</p>
      )}
    </label>
  );
}
