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

const LIBELLES_PARCOURS = {
  CIGSI:
    'CIGSI — Conception, Intégration et Gestion des Systèmes d’Information',
};

const PARCOURS_PAR_MENTION = [
  { mention: 'MANAGEMENT', licences: ['AES'], masters: ['MD', 'MEDA'] },
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

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];

const NOMBRE_PAIRES_ANNEES = 5;

function formaterDateDuJour() {
  const d = new Date();
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${jj}/${mm}/${d.getFullYear()}`;
}

const baseAnnees = () =>
  Array.from({ length: NOMBRE_PAIRES_ANNEES }, () => ({ debut: '', fin: '' }));

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

export default function FormulaireCertificatScolarite() {
  const [formData, setFormData] = useState({
    date_demande: formaterDateDuJour(),
    numero_inscription: '',
    telephone: '',
    nom_prenoms: '',
    date_naissance: '',
    lieu_naissance: '',
    adresse_etudiant: '',
    nom_pere: '',
    nom_mere: '',
    niveau: '',
    annees: baseAnnees(),
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
  // Pré-sélectionne niveau et parcours directement dans le state (sans appeler
  // choisirParcours qui est une bascule et serait décrochée par le double appel
  // des effets en mode développement React).
  useEffect(() => {
    if (profil && !dejaInitialise.current) {
      dejaInitialise.current = true;

      // Parcours : résoudre le code_parcours de la base vers la liste du formulaire.
      const resolved = resolverCodeParcours(profil.code_parcours);
      let mentionSelectionnee = '';
      let niveauFormation = '';
      let parcoursCode = '';

      if (resolved) {
        const rowMention = PARCOURS_PAR_MENTION.find((row) =>
          resolved.liste === 'licences'
            ? row.licences.includes(resolved.code)
            : row.masters.includes(resolved.code),
        );
        if (rowMention) {
          parcoursCode = resolved.code;
          mentionSelectionnee = rowMention.mention;
          niveauFormation =
            resolved.liste === 'licences' ? 'licence' : 'master';
        }
      }

      setFormData((prev) => ({
        ...prev,
        numero_inscription: profil.matricule || '',
        telephone: profil.telephone || '',
        nom_prenoms: nomComplet(profil),
        date_naissance: dateInput(profil.date_naissance),
        lieu_naissance: profil.lieu_naissance || '',
        adresse_etudiant: profil.adresse || '',
        nom_pere: profil.nom_pere || '',
        nom_mere: profil.nom_mere || '',
        // Pré-sélection niveau (modifiable par l'étudiant)
        ...(profil.niveau ? { niveau: profil.niveau } : {}),
        // Pré-sélection parcours (modifiable par l'étudiant)
        ...(parcoursCode
          ? {
              parcours: parcoursCode,
              mentionSelectionnee,
              niveauFormation,
            }
          : {}),
      }));
    }
  }, [profil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const changerAnnee = (index, champ, valeur) => {
    setFormData((prev) => {
      const annees = prev.annees.map((paire, i) =>
        i === index ? { ...paire, [champ]: valeur } : paire,
      );
      return { ...prev, annees };
    });
  };

  const choisirParcours = (code, mention, colonne) => {
    setFormData((prev) => ({
      ...prev,
      parcours: code,
      mentionSelectionnee: mention,
      niveauFormation: colonne === 'licences' ? 'licence' : 'master',
    }));
  };

  const soumettreDemande = async (e) => {
    e.preventDefault();
    setErreur('');

    const {
      numero_inscription,
      telephone,
      nom_prenoms,
      date_naissance,
      lieu_naissance,
      adresse_etudiant,
      nom_pere,
      nom_mere,
      niveau,
      annees,
      parcours,
      mentionSelectionnee,
      niveauFormation,
    } = formData;

    if (
      !numero_inscription ||
      !telephone ||
      !nom_prenoms ||
      !date_naissance ||
      !lieu_naissance ||
      !adresse_etudiant ||
      !nom_pere ||
      !nom_mere ||
      !niveau
    ) {
      setErreur(
        'Complétez les informations manquantes et sélectionnez le niveau.',
      );
      return;
    }

    const nombreAnneesAttendues = NIVEAUX.indexOf(niveau) + 1;
    const anneesParNiveau = annees.slice(0, nombreAnneesAttendues);
    if (anneesParNiveau.some((paire) => !paire.debut || !paire.fin)) {
      setErreur(
        `Renseignez l'année universitaire de chaque niveau atteint, de L1 à ${niveau}.`,
      );
      return;
    }
    const anneesRenseignees = anneesParNiveau.map(
      (paire) => `${paire.debut}/${paire.fin}`,
    );
    for (const annee of anneesRenseignees) {
      if (!/^\d{4}\/\d{4}$/.test(annee)) {
        setErreur(
          `Année universitaire invalide : "${annee}". Format attendu : 2024/2025`,
        );
        return;
      }
    }

    if (!parcours || !mentionSelectionnee || !niveauFormation) {
      setErreur('Veuillez sélectionner votre parcours.');
      return;
    }

    setChargement(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setErreur(
          'Vous devez être connecté pour soumettre une demande de certificat de scolarité.',
        );
        return;
      }

      const donnees = await api.post(
        '/demandes-payantes/certificat-scolarite',
        {
          date_demande: formData.date_demande,
          numero_inscription,
          telephone,
          nom_prenoms,
          date_naissance,
          lieu_naissance,
          adresse_etudiant,
          nom_pere,
          nom_mere,
          niveau,
          annees: anneesRenseignees,
          mention: mentionSelectionnee,
          parcours,
          niveau_formation: niveauFormation,
          beneficiaire: {
            matricule: numero_inscription,
            nom: nom_prenoms,
            telephone,
            mention: mentionSelectionnee,
            parcours,
            niveau,
            date_naissance,
            lieu_naissance,
            adresse: adresse_etudiant,
            nom_pere,
            nom_mere,
          },
        },
      );

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
        type="Demande de certificat de scolarité"
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
          { label: 'Niveau', valeur: formData.niveau },
          {
            label: 'Années universitaires',
            valeur: resultat.annees?.join(' ; '),
          },
          {
            label: 'Parcours',
            valeur: `${formData.parcours} (${formData.niveauFormation})`,
          },
        ]}
        onNouvelleDemande={() => setResultat(null)}
      />
    );
  }

  const champSelection =
    'px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-sky-500 text-sm shadow-sm transition';
  const nombreAnneesAttendues = formData.niveau
    ? NIVEAUX.indexOf(formData.niveau) + 1
    : 0;

  return (
    <FormulaireDemande
      titre="Certificat de scolarité"
      description="Indiquez les années universitaires de votre scolarité."
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
          'adresse_etudiant',
          'nom_pere',
          'nom_mere',
        ]}
        profil={profil}
        valeurs={formData}
        modifier={handleChange}
      />
      {!NIVEAUX.includes(profil?.niveau) && (
        <label className="fiche-select">
          Niveau actuel
          <select name="niveau" value={formData.niveau} onChange={handleChange}>
            <option value="">Choisir un niveau</option>
            {NIVEAUX.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      )}
      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">
          Années universitaires <span className="text-red-500">*</span>
        </span>
        <p className="text-xs text-slate-500 mb-3">
          Indiquez l’année de chaque niveau atteint. Par exemple, pour un
          étudiant en L2 : renseignez L1 et L2.
        </p>
        {formData.niveau ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.annees
              .slice(0, nombreAnneesAttendues)
              .map((paire, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3"
                >
                  <span className="w-7 font-bold text-sky-700">
                    {NIVEAUX[index]}
                  </span>
                  <select
                    value={paire.debut}
                    onChange={(e) =>
                      changerAnnee(index, 'debut', e.target.value)
                    }
                    className={champSelection}
                  >
                    <option value="">Début</option>
                    {[2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020].map(
                      (a) => (
                        <option key={`a-${index}-${a}`} value={a}>
                          {a}
                        </option>
                      ),
                    )}
                  </select>
                  <span className="text-slate-400">/</span>
                  <select
                    value={paire.fin}
                    onChange={(e) => changerAnnee(index, 'fin', e.target.value)}
                    className={champSelection}
                  >
                    <option value="">Fin</option>
                    {[2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021].map(
                      (a) => (
                        <option key={`b-${index}-${a}`} value={a}>
                          {a}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              ))}
          </div>
        ) : (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Choisissez votre niveau actuel ci-dessus pour afficher les années à
            renseigner.
          </p>
        )}
      </div>
      {!resolverCodeParcours(profil?.code_parcours) && (
        <ChoixParcours
          mentions={PARCOURS_PAR_MENTION}
          libelles={LIBELLES_PARCOURS}
          valeur={
            formData.parcours
              ? formData.niveauFormation + ':' + formData.parcours
              : ''
          }
          choisir={choisirParcours}
        />
      )}
      <div className="flex justify-between items-center bg-sky-50 border border-sky-200 rounded-md px-4 py-3 mb-4">
        <span className="text-sm font-medium text-slate-700">
          Montant à régler :
        </span>
        <span className="text-xl font-bold text-sky-600">1 000 Ar</span>
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
          {chargement
            ? 'Traitement en cours...'
            : 'Soumettre le certificat de scolarité'}
        </button>
      </div>
    </FormulaireDemande>
  );
}
