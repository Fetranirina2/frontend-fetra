/**
 * Fichier : Routeur.jsx
 * SOCLE COMMUN — Routeur principal de l'application.
 * Déclare toutes les routes vers les pages du frontend.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import RoutePrivee, { RoutePriveeAgent } from '../components/RoutePrivee';
import NavigationPrincipale from '../components/NavigationPrincipale';

const ConnexionEtudiant = lazy(
  () => import('../pages/connexion/ConnexionEtudiant'),
);
const ConnexionAgent = lazy(() => import('../pages/connexion/ConnexionAgent'));
const InscriptionEtudiant = lazy(
  () => import('../pages/inscription/InscriptionEtudiant'),
);
const MonProfil = lazy(() => import('../pages/profil/MonProfil'));
const GestionMentions = lazy(
  () => import('../pages/admin/referentiel/GestionMentions'),
);
const GestionParcours = lazy(
  () => import('../pages/admin/referentiel/GestionParcours'),
);
const GestionAnneesUniversitaires = lazy(
  () => import('../pages/admin/referentiel/GestionAnneesUniversitaires'),
);

const FormulaireCertificatScolarite = lazy(
  () => import('../pages/demandes-payantes/FormulaireCertificatScolarite'),
);
const FormulaireReleveNotes = lazy(
  () => import('../pages/demandes-payantes/FormulaireReleveNotes'),
);
const FormulaireAttestation = lazy(
  () => import('../pages/demandes-payantes/FormulaireAttestation'),
);
const RetourPaiement = lazy(() => import('../pages/suivi/RetourPaiement'));

const FormulaireAbsence = lazy(
  () => import('../pages/demandes-gratuites/FormulaireAbsence'),
);
const FormulaireReclamation = lazy(
  () => import('../pages/demandes-gratuites/FormulaireReclamation'),
);
const TraitementDemande = lazy(
  () => import('../pages/agent/traitement/TraitementDemande'),
);
const LivraisonDocument = lazy(
  () => import('../pages/agent/traitement/LivraisonDocument'),
);
const TableauDeBord = lazy(() => import('../pages/dashboard/TableauDeBord'));
const TableauDeBordEtudiant = lazy(
  () => import('../pages/dashboard_Etudiant/TableauDeBord_Etudiant'),
);
const Accueil = lazy(() => import('../pages/accueil/Accueil'));

export default function Routeur() {
  const { pathname } = useLocation();
  const pageAuthentification = [
    '/connexion-etudiant',
    '/connexion-agent',
    '/inscription',
  ].includes(pathname);
  return (
    <>
      {!pageAuthentification &&
        (pathname === '/' ? (
          <NavigationPrincipale />
        ) : (
          <header className="sticky top-0 z-50 bg-[#f5f9ff]/90 pt-4 backdrop-blur-md">
            <NavigationPrincipale />
          </header>
        ))}
      <div
        className={
          pathname === '/' || pageAuthentification
            ? ''
            : 'min-h-screen bg-[#f5f9ff] pt-4'
        }
      >
        <Suspense
          fallback={
            <div className="p-8 text-center" role="status">
              Chargement de la page…
            </div>
          }
        >
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Accueil />} />
            <Route path="/connexion-etudiant" element={<ConnexionEtudiant />} />
            <Route path="/connexion-agent" element={<ConnexionAgent />} />
            <Route path="/inscription" element={<InscriptionEtudiant />} />

            {/* Routes étudiant protégées */}
            <Route
              path="/etudiant/dashboard"
              element={
                <RoutePrivee>
                  <TableauDeBordEtudiant />
                </RoutePrivee>
              }
            />
            <Route
              path="/demandes/certificat"
              element={
                <RoutePrivee>
                  <FormulaireCertificatScolarite />
                </RoutePrivee>
              }
            />
            <Route
              path="/demandes/releve"
              element={
                <RoutePrivee>
                  <FormulaireReleveNotes />
                </RoutePrivee>
              }
            />
            <Route
              path="/demandes/attestation"
              element={
                <RoutePrivee>
                  <FormulaireAttestation />
                </RoutePrivee>
              }
            />
            <Route
              path="/demandes/absence"
              element={
                <RoutePrivee>
                  <FormulaireAbsence />
                </RoutePrivee>
              }
            />
            <Route
              path="/demandes/reclamation"
              element={
                <RoutePrivee>
                  <FormulaireReclamation />
                </RoutePrivee>
              }
            />
            <Route
              path="/suivi"
              element={
                <RoutePrivee>
                  <Navigate to="/etudiant/dashboard?onglet=demandes" replace />
                </RoutePrivee>
              }
            />
            <Route
              path="/paiement/retour"
              element={
                <RoutePrivee>
                  <RetourPaiement />
                </RoutePrivee>
              }
            />
            <Route
              path="/profil"
              element={
                <RoutePrivee>
                  <MonProfil />
                </RoutePrivee>
              }
            />

            {/* Routes agent protégées */}
            <Route
              path="/dashboard"
              element={
                <RoutePriveeAgent>
                  <TableauDeBord />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="/agent/traitement"
              element={
                <RoutePriveeAgent>
                  <Navigate to="/dashboard" replace />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="/agent/traitement/:code_reference"
              element={
                <RoutePriveeAgent>
                  <TraitementDemande />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="/agent/documents/:code_reference"
              element={
                <RoutePriveeAgent>
                  <LivraisonDocument />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="/admin/referentiel/mentions"
              element={
                <RoutePriveeAgent>
                  <GestionMentions />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="/admin/referentiel/parcours"
              element={
                <RoutePriveeAgent>
                  <GestionParcours />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="/admin/referentiel/annees"
              element={
                <RoutePriveeAgent>
                  <GestionAnneesUniversitaires />
                </RoutePriveeAgent>
              }
            />
            <Route
              path="*"
              element={
                <main className="max-w-xl mx-auto px-6 py-20 text-center">
                  <p className="text-blue-600 font-semibold mb-3">Erreur 404</p>
                  <h1 className="text-3xl font-bold mb-4">Page introuvable</h1>
                  <p className="text-slate-600 mb-8">
                    Le lien utilisé ne correspond à aucune page.
                  </p>
                  <Link
                    className="inline-block bg-blue-700 text-white rounded-xl px-6 py-3"
                    to="/"
                  >
                    Retour à l’accueil
                  </Link>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}
