const textes = {
  SOUMISE: 'Demande soumise',
  A_VERIFIER: 'Informations en cours de vérification',
  EN_PREPARATION: 'Document en préparation',
  PRET_A_RETIRER: 'Document prêt à retirer',
  PAYEE_ET_REMISE: 'Document remis',
  PAYEE_EN_LIGNE: 'Paiement en ligne confirmé',
  SIMULATION: 'Paiement simulé',
  DOCUMENT_ENVOYE: 'Document envoyé, disponible au téléchargement',
  EN_ATTENTE: 'En attente',
  EN_ATTENTE_TRAITEMENT: 'En attente de traitement',
  EN_ATTENTE_PAIEMENT: 'Paiement requis · non transmise',
  PRET: 'Prêt',
  TRAITEE_ACCEPTEE: 'Demande acceptée',
  TRAITEE_REFUSEE: 'Demande refusée',
  ANNULEE: 'Demande annulée',
  EXPIREE: 'Demande expirée',
};

const couleurs = {
  SOUMISE: 'bg-blue-100 text-blue-800',
  A_VERIFIER: 'bg-yellow-100 text-yellow-800',
  EN_PREPARATION: 'bg-orange-100 text-orange-800',
  PRET_A_RETIRER: 'bg-green-100 text-green-800',
  PAYEE_ET_REMISE: 'bg-emerald-100 text-emerald-800',
  PAYEE_EN_LIGNE: 'bg-emerald-100 text-emerald-800',
  SIMULATION: 'bg-amber-100 text-amber-800',
  DOCUMENT_ENVOYE: 'bg-emerald-100 text-emerald-800',
  EN_ATTENTE: 'bg-gray-100 text-gray-800',
  EN_ATTENTE_TRAITEMENT: 'bg-violet-100 text-violet-800',
  EN_ATTENTE_PAIEMENT: 'bg-amber-100 text-amber-800',
  PRET: 'bg-green-100 text-green-800',
  TRAITEE_ACCEPTEE: 'bg-green-100 text-green-800',
  TRAITEE_REFUSEE: 'bg-red-100 text-red-800',
  ANNULEE: 'bg-gray-100 text-gray-800',
  EXPIREE: 'bg-gray-100 text-gray-800',
};

export default function StatutDemande({ statut }) {
  const texte = textes[statut] ?? statut;
  const couleur = couleurs[statut] ?? 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${couleur}`}
    >
      {texte}
    </span>
  );
}
