import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './formulaireDemande.css';

export function FormulaireDemande({
  titre,
  description,
  children,
  onSubmit,
  chargementProfil,
  erreurProfil,
}) {
  return (
    <main className="fiche-demande">
      <div className="fiche-contenu">
        <Link to="/etudiant/dashboard?onglet=nouvelle" className="fiche-retour">
          <ChevronLeft size={16} aria-hidden="true" /> Nouvelle demande
        </Link>
        <header>
          <h1>{titre}</h1>
          <p>{description}</p>
        </header>
        <form onSubmit={onSubmit} noValidate>
          {chargementProfil ? (
            <p role="status">Chargement de votre dossier…</p>
          ) : (
            <>
              {erreurProfil && (
                <p role="status">
                  Votre profil est indisponible. Complétez les informations
                  ci-dessous.
                </p>
              )}
              {children}
            </>
          )}
        </form>
      </div>
    </main>
  );
}

const champsProfil = {
  nom: ['Nom'],
  prenoms: ['Prénoms'],
  nom_prenoms: [
    'Nom et prénoms',
    (p) => [p.nom, p.prenoms].filter(Boolean).join(' '),
  ],
  telephone: [
    'Téléphone',
    (p) => /^[0-9+\s()-]{7,20}$/.test(p.telephone || '') && p.telephone,
  ],
  im: ['Matricule', (p) => p.matricule],
  matricule: ['Matricule'],
  numero_inscription: ['Matricule', (p) => p.matricule],
  date_naissance: ['Date de naissance'],
  lieu_naissance: ['Lieu de naissance'],
  nom_pere: ['Nom du père'],
  nom_mere: ['Nom de la mère'],
  adresse_etudiant: ['Adresse', (p) => p.adresse],
  parcoursNiveau: ['Parcours et niveau', (p) => p.code_parcours && p.niveau],
  parcours: ['Parcours', (p) => p.code_parcours],
  niveau: ['Niveau'],
};

export function ProfilManquant({
  champs,
  profil,
  valeurs,
  modifier,
  erreurs = {},
}) {
  const manquants = champs.filter((nom) => {
    const lire = champsProfil[nom][1];
    const valeur = profil && (lire ? lire(profil) : profil[nom]);
    return !String(valeur || '').trim();
  });
  if (!manquants.length) return null;
  return (
    <fieldset className="fiche-identite">
      <legend>Informations à compléter</legend>
      {manquants.map((nom) => (
        <label key={nom}>
          {champsProfil[nom][0]}
          {nom === 'niveau' ? (
            <select name={nom} value={valeurs[nom]} onChange={modifier}>
              <option value="">Choisir un niveau</option>
              {['L1', 'L2', 'L3', 'M1', 'M2'].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          ) : (
            <input
              type={
                nom === 'date_naissance'
                  ? 'date'
                  : nom === 'telephone'
                    ? 'tel'
                    : 'text'
              }
              name={nom}
              value={valeurs[nom]}
              onChange={modifier}
            />
          )}
          {erreurs[nom] && <small role="alert">{erreurs[nom]}</small>}
        </label>
      ))}
    </fieldset>
  );
}

export function ChoixParcours({ mentions, libelles, valeur, choisir }) {
  return (
    <label className="fiche-select">
      Parcours
      <select
        value={valeur}
        onChange={(event) => {
          const option = event.target.selectedOptions[0];
          choisir(
            option.dataset.code,
            option.dataset.mention,
            option.dataset.liste,
          );
        }}
      >
        <option value="" disabled>
          Choisir un parcours
        </option>
        {mentions.map((row) => (
          <optgroup key={row.mention} label={row.mention}>
            {['licences', 'masters'].flatMap((liste) =>
              row[liste].map((code) => {
                const cycle = liste === 'licences' ? 'licence' : 'master';
                return (
                  <option
                    key={cycle + code}
                    value={cycle + ':' + code}
                    data-code={code}
                    data-liste={liste}
                    data-mention={row.mention}
                  >
                    {cycle === 'licence' ? 'Licence' : 'Master'} ·{' '}
                    {libelles[code] || code}
                  </option>
                );
              }),
            )}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
