const origineApi = import.meta.env.DEV
  ? import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:3000'
  : import.meta.env.VITE_API_URL || 'https://scolarit-emit.onrender.com';
export const API_BASE_URL =
  origineApi.replace(/\/$/, '').replace(/\/api$/, '') + '/api';

export function lireUtilisateur() {
  try {
    const utilisateur = JSON.parse(
      sessionStorage.getItem('utilisateur') || 'null',
    );
    return utilisateur &&
      typeof utilisateur.matricule === 'string' &&
      ['agent', 'etudiant', 'ADMINISTRATEUR'].includes(utilisateur.role)
      ? utilisateur
      : null;
  } catch {
    return null;
  }
}

async function requete(method, chemin, donnees = null, format = 'json') {
  const token = sessionStorage.getItem('token');
  const options = { method, headers: {}, signal: AbortSignal.timeout(30000) };
  if (token) options.headers.Authorization = 'Bearer ' + token;
  if (donnees !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(donnees);
  }
  let reponse;
  try {
    reponse = await fetch(API_BASE_URL + chemin, options);
  } catch (erreur) {
    throw new Error(
      erreur.name === 'TimeoutError'
        ? 'Le serveur met trop de temps à répondre. Réessayez dans un instant.'
        : 'Connexion au serveur impossible. Vérifiez votre connexion puis réessayez.',
      { cause: erreur },
    );
  }
  if (!reponse.ok) {
    const erreur = await reponse.json().catch(() => ({}));
    if (
      reponse.status === 401 &&
      !chemin.startsWith('/auth/') &&
      token &&
      sessionStorage.getItem('token') === token
    ) {
      const agent = ['agent', 'ADMINISTRATEUR'].includes(
        lireUtilisateur()?.role,
      );
      ['token', 'utilisateur', 'session_id'].forEach((cle) =>
        sessionStorage.removeItem(cle),
      );
      window.location.assign(
        agent ? '/connexion-agent' : '/connexion-etudiant',
      );
    }
    const message = Array.isArray(erreur.message)
      ? erreur.message.join(' ')
      : erreur.message;
    const err = new Error(
      message || 'Erreur du serveur (' + reponse.status + ').',
    );
    err.status = reponse.status;
    throw err;
  }
  if (reponse.status === 204) return null;
  return format === 'blob' ? reponse.blob() : reponse.json();
}
export const api = {
  get: (chemin) => requete('GET', chemin),
  post: (chemin, donnees) => requete('POST', chemin, donnees),
  put: (chemin, donnees) => requete('PUT', chemin, donnees),
  delete: (chemin) => requete('DELETE', chemin),
  blob: (chemin) => requete('GET', chemin, null, 'blob'),
  uploadPdf: async (chemin, fichier) => {
    const donnees = new FormData();
    donnees.append('document', fichier);
    const token = sessionStorage.getItem('token');
    let reponse;
    try {
      reponse = await fetch(API_BASE_URL + chemin, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: donnees,
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      throw new Error(
        'Envoi impossible. Vérifiez la connexion puis réessayez.',
      );
    }
    const resultat = await reponse.json().catch(() => ({}));
    if (!reponse.ok) {
      throw new Error(
        Array.isArray(resultat.message)
          ? resultat.message.join(' ')
          : resultat.message || 'Envoi refusé.',
      );
    }
    return resultat;
  },
};
export default api;
