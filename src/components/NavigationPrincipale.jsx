import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  UserRound,
  X,
} from 'lucide-react';
import { useAuthentification } from '../contexts/ContexteAuthentification';

export default function NavigationPrincipale() {
  const { utilisateurConnecte, seDeconnecter } = useAuthentification();
  const { pathname, hash } = useLocation();
  const [ouvert, setOuvert] = useState(false);
  const agent = utilisateurConnecte?.role === 'agent';
  const accueil = pathname === '/';

  useEffect(() => setOuvert(false), [pathname, hash]);
  useEffect(() => {
    if (pathname === '/' && hash) {
      let essais = 0;
      const timer = setInterval(() => {
        const cible = document.getElementById(hash.slice(1));
        if (cible) cible.scrollIntoView({ behavior: 'smooth' });
        if (cible || ++essais >= 20) clearInterval(timer);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [pathname, hash]);

  const liens = utilisateurConnecte
    ? agent
      ? [
          { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          {
            to: '/admin/referentiel/mentions',
            label: 'Référentiel',
            icon: BookOpen,
          },
        ]
      : [
          {
            to: '/etudiant/dashboard',
            label: 'Mes demandes',
            icon: LayoutDashboard,
          },
          {
            to: '/etudiant/dashboard?onglet=nouvelle',
            label: 'Nouvelle demande',
            icon: Plus,
          },
          { to: '/profil', label: 'Mon profil', icon: UserRound },
        ]
    : [
        { to: '/#accueil', label: 'Accueil' },
        { to: '/#formations', label: 'Services' },
        { to: '/#apropos', label: 'À propos' },
      ];

  const lien = ({ to, label, icon: Icon }) => (
    <Link
      key={to}
      to={to}
      onClick={() => {
        setOuvert(false);
        if (pathname === '/' && to.startsWith('/#'))
          document
            .getElementById(to.slice(2))
            ?.scrollIntoView({ behavior: 'smooth' });
      }}
      aria-current={
        pathname === to.split(/[?#]/)[0] &&
        !to.includes('?') &&
        !to.includes('#')
          ? 'page'
          : undefined
      }
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#e8eef8] hover:text-[#0f2a4a]"
    >
      {Icon && <Icon size={16} strokeWidth={1.9} aria-hidden="true" />}
      {label}
    </Link>
  );

  return (
    <nav
      aria-label="Navigation principale"
      className={`${accueil ? 'fixed left-1/2 top-4 -translate-x-1/2' : 'relative mx-auto'} z-50 w-[95%] max-w-6xl border border-blue-100 bg-white/90 shadow-lg backdrop-blur-xl ${ouvert ? 'rounded-2xl' : 'rounded-full'}`}
    >
      <div className="flex h-14 items-center justify-between px-5">
        <Link
          to="/"
          onClick={() => setOuvert(false)}
          className="flex items-center gap-2"
          aria-label="EmiSCOL, accueil"
        >
          <img
            src="/logo.webp"
            alt="EmiSCOL"
            className="h-16 w-auto object-contain"
          />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {liens.map(lien)}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {utilisateurConnecte ? (
            <button
              type="button"
              onClick={seDeconnecter}
              className="flex items-center gap-2 rounded-full border border-blue-100 px-4 py-2 text-sm font-semibold text-[#0f2a4a] hover:bg-blue-50"
            >
              <LogOut size={16} aria-hidden="true" /> Déconnexion
            </button>
          ) : (
            <>
              <Link
                to="/connexion-etudiant"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
              >
                Se connecter
              </Link>
              <Link
                to="/inscription"
                className="rounded-full bg-[#0f2a4a] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#1a56db]"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={ouvert}
          onClick={() => setOuvert(!ouvert)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#0f2a4a] hover:bg-blue-50 md:hidden"
        >
          {ouvert ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {ouvert && (
        <div className="space-y-1 rounded-b-2xl border-t border-blue-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {liens.map(lien)}
          <div className="flex flex-wrap gap-2 border-t border-blue-100 pt-3">
            {utilisateurConnecte ? (
              <button
                type="button"
                onClick={seDeconnecter}
                className="flex items-center gap-2 rounded-full border border-blue-100 px-4 py-2 text-sm font-semibold text-[#0f2a4a]"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <>
                <Link
                  to="/connexion-etudiant"
                  className="rounded-full border border-blue-100 px-4 py-2 text-sm font-semibold text-[#0f2a4a]"
                >
                  Se connecter
                </Link>
                <Link
                  to="/inscription"
                  className="rounded-full bg-[#0f2a4a] px-4 py-2 text-sm font-semibold text-white"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
