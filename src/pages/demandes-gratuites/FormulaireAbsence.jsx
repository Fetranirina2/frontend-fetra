/**
 * Fichier : FormulaireAbsence.jsx
 * Binôme 3 — Frontend (FE3)
 * Rôle : Page de demande d'absence gratuite.
 * Règles de gestion concernées : RG-11, RG-12.
 */

import { useState, useEffect, useRef } from 'react';
import {
  FormulaireDemande,
  ProfilManquant,
} from '../../components/FormulaireDemande';
import api from '../../api';
import RecuDemande from '../../components/RecuDemande';
import useProfilEtudiant from '../../hooks/useProfilEtudiant';

export default function FormulaireAbsence() {
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    matricule: '',
    parcoursNiveau: '',
    telephone: '',
    motif: '',
    dateDebut: '',
    dateFin: '',
    dateReprise: '',
  });

  const [erreurs, setErreurs] = useState({});
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreurGlobal, setErreurGlobal] = useState('');

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
        nom: profil.nom || '',
        prenoms: profil.prenoms || '',
        matricule: profil.matricule || '',
        parcoursNiveau:
          profil.code_parcours && profil.niveau
            ? `${profil.code_parcours} — ${profil.niveau}`
            : '',
        telephone: profil.telephone || '',
      }));
    }
  }, [profil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erreurs[name]) {
      setErreurs((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const valider = () => {
    const nouvellesErreurs = {};

    ['nom', 'prenoms', 'matricule', 'parcoursNiveau', 'telephone'].forEach(
      (champ) => {
        if (!formData[champ].trim()) {
          nouvellesErreurs[champ] = 'Ce champ est obligatoire.';
        }
      },
    );

    if (!formData.motif.trim()) {
      nouvellesErreurs.motif = 'Le motif est obligatoire.';
    } else if (formData.motif.trim().length < 5) {
      nouvellesErreurs.motif = 'Le motif doit contenir au moins 5 caractères.';
    }

    if (!formData.dateDebut) {
      nouvellesErreurs.dateDebut = 'La date de début est obligatoire.';
    }

    if (!formData.dateFin) {
      nouvellesErreurs.dateFin = 'La date de fin est obligatoire.';
    } else if (formData.dateDebut && formData.dateFin < formData.dateDebut) {
      nouvellesErreurs.dateFin =
        'La date de fin doit être égale ou postérieure à la date de début.';
    }

    if (!formData.dateReprise) {
      nouvellesErreurs.dateReprise = 'La date de reprise est obligatoire.';
    } else if (formData.dateFin && formData.dateReprise <= formData.dateFin) {
      nouvellesErreurs.dateReprise =
        'La date de reprise doit être postérieure à la date de fin.';
    }

    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const calculerDuree = () => {
    if (
      formData.dateDebut &&
      formData.dateFin &&
      formData.dateFin >= formData.dateDebut
    ) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      const jours = Math.ceil((fin - debut) / 86400000) + 1;
      return jours;
    }
    return null;
  };

  const dureeCalculee = calculerDuree();

  const soumettreDemande = async (e) => {
    e.preventDefault();
    setErreurGlobal('');

    if (!valider()) return;

    const token = sessionStorage.getItem('token');
    if (!token) {
      setErreurGlobal(
        "Vous devez être connecté pour soumettre une demande d'absence.",
      );
      return;
    }

    setChargement(true);

    try {
      const donnees = await api.post('/demandes-gratuites/absence', {
        nom: formData.nom.trim(),
        prenoms: formData.prenoms.trim(),
        im: formData.matricule.trim(),
        parcours_niveau: formData.parcoursNiveau.trim(),
        telephone: formData.telephone.trim(),
        motif: formData.motif.trim(),
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        date_reprise: formData.dateReprise,
        date_demande: new Date().toLocaleDateString('fr-FR'),
        beneficiaire: {
          matricule: formData.matricule.trim(),
          nom: formData.nom.trim(),
          prenoms: formData.prenoms.trim(),
          telephone: formData.telephone.trim(),
          parcours: formData.parcoursNiveau.trim(),
        },
      });

      setResultat(donnees);
    } catch (erreur) {
      const message =
        erreur?.message || 'Impossible de contacter le serveur backend.';
      if (message.includes('Token') || message.includes('expir')) {
        setErreurGlobal(
          'Votre session a expiré ou est invalide. Veuillez vous reconnecter.',
        );
      } else {
        setErreurGlobal(message);
      }
    } finally {
      setChargement(false);
    }
  };

  if (resultat) {
    const formaterDate = (date) =>
      date ? new Date(date).toLocaleDateString('fr-FR') : '';
    return (
      <RecuDemande
        reference={resultat.code_reference}
        type="Demande d'absence"
        champs={[
          { label: 'Matricule', valeur: formData.matricule },
          {
            label: 'Nom et prénoms',
            valeur: `${formData.nom} ${formData.prenoms}`,
          },
          { label: 'Parcours et niveau', valeur: formData.parcoursNiveau },
          { label: 'Téléphone', valeur: formData.telephone },
          { label: 'Motif', valeur: formData.motif },
          {
            label: 'Durée',
            valeur: `${resultat.duree_jours} jour${resultat.duree_jours > 1 ? 's' : ''}`,
          },
          {
            label: 'Période',
            valeur: `${formaterDate(resultat.date_debut)} au ${formaterDate(resultat.date_fin)}`,
          },
          {
            label: 'Date de reprise',
            valeur: formaterDate(resultat.date_reprise),
          },
        ]}
        onNouvelleDemande={() => {
          setResultat(null);
          setFormData({
            nom: profil?.nom || '',
            prenoms: profil?.prenoms || '',
            matricule: profil?.matricule || '',
            parcoursNiveau:
              profil?.code_parcours && profil?.niveau
                ? `${profil.code_parcours} — ${profil.niveau}`
                : '',
            telephone: profil?.telephone || '',
            motif: '',
            dateDebut: '',
            dateFin: '',
            dateReprise: '',
          });
        }}
      />
    );
  }

  return (
    <FormulaireDemande
      titre="Demande d’absence"
      description="Indiquez le motif et les dates de votre absence. Cette demande est gratuite."
      onSubmit={soumettreDemande}
      chargementProfil={chargementProfil}
      erreurProfil={erreurProfil}
    >
      <ProfilManquant
        champs={['nom', 'prenoms', 'matricule', 'parcoursNiveau', 'telephone']}
        profil={profil}
        valeurs={formData}
        modifier={handleChange}
        erreurs={erreurs}
      />
      {/* Motif */}
      <div>
        <label
          htmlFor="motif"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Motif de l'absence <span className="text-red-500">*</span>
        </label>
        <textarea
          id="motif"
          name="motif"
          rows={4}
          placeholder="Décrivez le motif de votre absence (raison médicale, familiale, administrative...)"
          value={formData.motif}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 bg-white border rounded-md text-slate-800 placeholder-slate-400 focus:outline-none text-sm shadow-sm transition resize-none ${
            erreurs.motif
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 focus:border-sky-500'
          }`}
        />
        {erreurs.motif && (
          <p className="text-red-500 text-xs mt-1">{erreurs.motif}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Date de début */}
        <div>
          <label
            htmlFor="dateDebut"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Date de début <span className="text-red-500">*</span>
          </label>
          <input
            id="dateDebut"
            type="date"
            name="dateDebut"
            value={formData.dateDebut}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-white border rounded-md text-slate-800 focus:outline-none text-sm shadow-sm transition ${
              erreurs.dateDebut
                ? 'border-red-400 focus:border-red-500'
                : 'border-slate-200 focus:border-sky-500'
            }`}
          />
          {erreurs.dateDebut && (
            <p className="text-red-500 text-xs mt-1">{erreurs.dateDebut}</p>
          )}
        </div>

        {/* Date de fin */}
        <div>
          <label
            htmlFor="dateFin"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Date de fin <span className="text-red-500">*</span>
          </label>
          <input
            id="dateFin"
            type="date"
            name="dateFin"
            value={formData.dateFin}
            onChange={handleChange}
            min={formData.dateDebut || undefined}
            className={`w-full px-4 py-2.5 bg-white border rounded-md text-slate-800 focus:outline-none text-sm shadow-sm transition ${
              erreurs.dateFin
                ? 'border-red-400 focus:border-red-500'
                : 'border-slate-200 focus:border-sky-500'
            }`}
          />
          {erreurs.dateFin && (
            <p className="text-red-500 text-xs mt-1">{erreurs.dateFin}</p>
          )}
        </div>
      </div>

      {/* Date de reprise */}
      <div>
        <label
          htmlFor="dateReprise"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Date de reprise des cours <span className="text-red-500">*</span>
        </label>
        <input
          id="dateReprise"
          type="date"
          name="dateReprise"
          value={formData.dateReprise}
          onChange={handleChange}
          min={formData.dateFin || undefined}
          className={`w-full sm:w-1/2 px-4 py-2.5 bg-white border rounded-md text-slate-800 focus:outline-none text-sm shadow-sm transition ${
            erreurs.dateReprise
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-200 focus:border-sky-500'
          }`}
        />
        {erreurs.dateReprise && (
          <p className="text-red-500 text-xs mt-1">{erreurs.dateReprise}</p>
        )}
      </div>

      {/* Durée calculée */}
      {dureeCalculee !== null && (
        <div className="p-4 bg-sky-100/50 border border-sky-200 rounded-md flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">
            Durée de l'absence :
          </span>
          <span className="text-xl font-bold text-sky-600">
            {dureeCalculee} jour{dureeCalculee > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Message d'erreur global */}
      {erreurGlobal && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {erreurGlobal}
        </div>
      )}

      {/* Bouton de soumission */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={chargement || chargementProfil}
          className="w-full sm:w-auto px-8 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium rounded-md shadow-sm transition duration-150 text-sm"
        >
          {chargement ? 'Traitement en cours...' : 'Soumettre la demande'}
        </button>
      </div>
    </FormulaireDemande>
  );
}

function classeChamp(erreur) {
  return `w-full px-4 py-2.5 bg-white border rounded-md text-slate-800 focus:outline-none text-sm shadow-sm transition ${
    erreur
      ? 'border-red-400 focus:border-red-500'
      : 'border-slate-200 focus:border-sky-500'
  }`;
}
