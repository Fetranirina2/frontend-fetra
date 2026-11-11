import { Navigate } from 'react-router-dom';
import { useAuthentification } from '../contexts/ContexteAuthentification';

export default function RoutePrivee({ children }) {
  const { token, utilisateurConnecte } = useAuthentification();
  if (!token || !utilisateurConnecte)
    return <Navigate to="/connexion-etudiant" replace />;
  if (utilisateurConnecte.role !== 'etudiant')
    return <Navigate to="/dashboard" replace />;
  return children;
}
export function RoutePriveeAgent({ children }) {
  const { token, utilisateurConnecte } = useAuthentification();
  if (!token || !utilisateurConnecte)
    return <Navigate to="/connexion-agent" replace />;
  if (!['agent', 'ADMINISTRATEUR'].includes(utilisateurConnecte.role))
    return <Navigate to="/etudiant/dashboard" replace />;
  return children;
}
