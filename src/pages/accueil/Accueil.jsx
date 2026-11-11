import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Award, MessageSquareWarning, CheckCircle, ArrowRight,
  ArrowUpRight, ArrowDown, Clock, GraduationCap, Phone, Mail,
  ShieldCheck, Wallet, Mouse, Layers, Send, Download, Globe,
} from 'lucide-react';
import useAnimationsAccueil from './useAnimationsAccueil';
import './accueil3d.css';

const SceneScolarite3D = lazy(() => import('./SceneScolarite3D'));

const services = [
  { titre: 'Certificat de Scolarité', desc: 'Obtenez votre certificat officiel en quelques clics.', icon: Award, couleur: '#dbeafe', montant: '1 000 Ar', route: '/demandes/certificat', code: '01' },
  { titre: 'Relevé de Notes', desc: 'Téléchargez vos relevés de notes officiels.', icon: BookOpen, couleur: '#d1fae5', montant: '2 000 Ar', route: '/demandes/releve', code: '02' },
  { titre: 'Attestation', desc: "Attestation de réussite ou de fin d'études.", icon: GraduationCap, couleur: '#fef3c7', montant: '5 000 Ar', route: '/demandes/attestation', code: '03' },
  { titre: "Demande d'Absence", desc: 'Justifiez votre absence facilement.', icon: Clock, couleur: '#fce7f3', montant: 'Gratuit', route: '/demandes/absence', code: '04' },
  { titre: 'Réclamation', desc: 'Contestez une note ou signalez un problème.', icon: MessageSquareWarning, couleur: '#fee2e2', montant: 'Gratuit', route: '/demandes/reclamation', code: '05' },
];

function Hero({ progress }) {
  return (
    <section id="accueil" className="sco-hero">
      <div className="sco-grid-bg" aria-hidden="true" />
      <div className="sco-container sco-hero-layout">
        <div className="sco-hero-copy">
          <div className="sco-eyebrow sco-hero-reveal"><span className="sco-live-dot" /> Plateforme officielle de scolarité · EMIT</div>
          <h1 className="sco-hero-reveal">La scolarité<br />numérique.<br /><span>Une nouvelle<br />dimension.</span></h1>
          <p className="sco-hero-reveal sco-hero-description">Vos démarches administratives, à portée de main. Certificats, relevés de notes, attestations : simplifiez votre vie étudiante, sans vous déplacer.</p>
          <div className="sco-actions sco-hero-reveal">
            <Link to="/connexion-etudiant" className="sco-button sco-button-primary">Commencer <ArrowUpRight size={19} /></Link>
            <Link to="/connexion-agent" className="sco-button sco-button-outline">Espace Agent <ArrowRight size={17} /></Link>
          </div>
          <div className="sco-hero-trust sco-hero-reveal"><ShieldCheck size={18} /><span>Paiement sécurisé <b>·</b> Suivi en temps réel</span></div>
        </div>
        <div className="sco-hero-visual">
          <div className="sco-visual-glow" aria-hidden="true" />
          <Suspense fallback={<div className="sco-scene-loading" aria-hidden="true">EMISCO</div>}><SceneScolarite3D progress={progress} /></Suspense>
          <div className="sco-floating-label sco-label-top"><span className="sco-icon-blue"><Layers size={20} /></span><div><strong>Tout au même endroit.</strong><span>Vos démarches, connectées.</span></div></div>
          <div className="sco-floating-label sco-label-bottom"><span className="sco-icon-green"><CheckCircle size={20} /></span><div><strong>Votre avenir prend forme.</strong><span>Une scolarité simplifiée.</span></div></div>
          <span className="sco-scene-coordinate" aria-hidden="true">EMIT / SCOLARITÉ NUMÉRIQUE</span>
        </div>
      </div>
      <div className="sco-hero-bottom sco-container"><a href="#apropos" className="sco-scroll-hint"><Mouse size={18} /><span>Explorez une nouvelle dimension</span><ArrowDown size={15} /></a><span className="sco-small-tag">CONÇU POUR VOTRE VIE ÉTUDIANTE</span></div>
    </section>
  );
}

function FeaturesBar() {
  const features = [
    { icon: BookOpen, label: 'Démarches simplifiées', desc: 'Vos demandes réunies' },
    { icon: Award, label: 'Plateforme officielle EMIT', desc: 'Une scolarité de confiance' },
    { icon: ShieldCheck, label: 'Données protégées', desc: 'Vos informations confidentielles' },
    { icon: Clock, label: 'Suivi de vos demandes', desc: 'Consultez leur avancement' },
    { icon: Wallet, label: 'Paiement et suivi', desc: 'Papi et livraison numérique' },
  ];
  return <section className="sco-features" aria-label="Les avantages de la plateforme"><div className="sco-container sco-features-grid">{features.map(({ icon: Icon, label, desc }) => <div className="sco-feature sco-reveal" key={label}><Icon size={23} strokeWidth={1.5} /><strong>{label}</strong><span>{desc}</span></div>)}</div></section>;
}

function APropos() {
  return (
    <section id="apropos" className="sco-about sco-section">
      <div className="sco-container sco-two-columns">
        <div className="sco-campus-stage sco-reveal">
          <div className="sco-campus-back" aria-hidden="true" />
          <div className="sco-campus-image"><img src="/accueil-campus.webp" alt="Étudiante de l'EMIT" width="1000" height="1000" loading="lazy" /></div>
          <div className="sco-campus-caption"><span>01 / LA COMMUNAUTÉ EMIT</span><strong>Votre vie étudiante, simplifiée <ArrowUpRight size={19} /></strong></div>
          <div className="sco-student-chip" data-tilt><img src="/accueil-etudiante.webp" alt="Étudiante EMIT" width="1000" height="1339" loading="lazy" /><div><strong>Moins de démarches.</strong><span>Plus de possibilités.</span></div></div>
          <span className="sco-depth-orb sco-orb-about" aria-hidden="true" />
        </div>
        <div className="sco-about-copy">
          <div className="sco-eyebrow sco-reveal">À propos de nous</div>
          <h2 className="sco-reveal">Votre vie étudiante.<br /><span>En plus simple.</span></h2>
          <p className="sco-body sco-reveal">EMISCO est la plateforme officielle de la scolarité de l'École de Management et d'Innovation Technologique de Fianarantsoa. Gérez toutes vos demandes administratives sans vous déplacer.</p>
          <ul className="sco-checklist sco-reveal">{['Demande de certificat de scolarité en ligne', 'Relevés de notes officiels', 'Attestations de réussite', 'Suivi en temps réel de vos demandes'].map((item) => <li key={item}><CheckCircle size={18} />{item}</li>)}</ul>
          <Link to="/connexion-etudiant" className="sco-text-link sco-reveal">Découvrez votre espace étudiant <ArrowUpRight size={19} /></Link>
        </div>
      </div>
    </section>
  );
}

function Parcours3D({ progress }) {
  const steps = [
    { number: '01', label: 'CHOISISSEZ', title: 'Votre demande.\nEn quelques clics.', desc: "Connectez-vous à votre espace étudiant et choisissez le document dont vous avez besoin. Toutes vos démarches commencent ici.", icon: Send },
    { number: '02', label: 'SUIVEZ', title: 'Chaque étape.\nEn toute confiance.', desc: "Effectuez votre paiement sécurisé si nécessaire et consultez l'avancement de votre demande depuis votre espace personnel.", icon: ShieldCheck },
    { number: '03', label: 'RECEVEZ', title: 'Vos documents.\nÀ portée de main.', desc: 'Une fois votre demande traitée, retrouvez vos documents officiels dans votre espace étudiant. Simple, pratique et numérique.', icon: Download },
  ];
  return (
    <section className="sco-journey" aria-labelledby="parcours-titre">
      <div className="sco-journey-grid" aria-hidden="true" />
      <div className="sco-container sco-journey-inner">
        <header className="sco-journey-header"><div className="sco-eyebrow">Du premier clic au document final</div><h2 id="parcours-titre">Vos démarches prennent vie.</h2><span>LE PARCOURS EMISCO</span></header>
        <div className="sco-journey-layout">
          <div className="sco-steps">{steps.map(({ number, label, title, desc, icon: Icon }) => <article className="sco-step" key={number}><div className="sco-step-kicker"><span>{number}</span><Icon size={18} />{label}</div><h3>{title.split('\n').map((line, i) => <span key={line} className={i ? 'sco-light-blue' : ''}>{line}<br /></span>)}</h3><p>{desc}</p><Link to="/connexion-etudiant" className="sco-text-link sco-text-link-white">Accéder à mon espace <ArrowUpRight size={18} /></Link></article>)}</div>
          <div className="sco-journey-visual"><div className="sco-journey-halo" aria-hidden="true" /><Suspense fallback={<div className="sco-scene-loading" aria-hidden="true">EMISCO</div>}><SceneScolarite3D variant="journey" progress={progress} /></Suspense><span className="sco-demo-label">Visualisation illustrative · documents de démonstration</span></div>
        </div>
        <div className="sco-journey-bottom"><div className="sco-step-markers" aria-hidden="true">{steps.map(({ number, label }, i) => <span key={number} className={`sco-step-marker ${i === 0 ? 'is-active' : ''}`}><b>{number}</b>{label}</span>)}</div><span className="sco-journey-scroll" aria-hidden="true">CONTINUEZ À DÉFILER <ArrowDown size={15} /></span></div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="formations" className="sco-services sco-section">
      <div className="sco-container">
        <div className="sco-section-heading"><div><div className="sco-eyebrow sco-reveal">Nos services</div><h2 className="sco-reveal">Tout ce qu'il vous faut.<br /><span>Rien de compliqué.</span></h2></div><p className="sco-body sco-reveal">Choisissez votre démarche.<br />Nous vous accompagnons pour la suite.</p></div>
        <div className="sco-services-grid">{services.map(({ titre, desc, icon: Icon, couleur, montant, route, code }) => <div className="sco-service-reveal sco-reveal" key={titre}><Link to={route} className="sco-service" data-tilt><div className="sco-service-top"><span className="sco-service-icon" style={{ '--service-color': couleur }}><Icon size={29} strokeWidth={1.5} /></span><span className="sco-service-code">/{code}</span></div><h3>{titre}</h3><p>{desc}</p><div className="sco-service-bottom"><span>{montant}</span><span className="sco-service-arrow"><ArrowUpRight size={19} /></span></div></Link></div>)}</div>
        <div className="sco-services-note sco-reveal"><ShieldCheck size={17} /><span>Des démarches officielles. Des données protégées. Un suivi depuis votre espace.</span></div>
      </div>
      <span className="sco-depth-orb sco-orb-services" aria-hidden="true" />
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="sco-contact">
      <div className="sco-contact-rings" aria-hidden="true"><i /><i /><i /></div>
      <div className="sco-container sco-contact-inner"><div className="sco-eyebrow sco-reveal">Toujours à vos côtés</div><h2 className="sco-reveal">Une question ?<br /><span>Restons connectés.</span></h2><p className="sco-reveal">Contactez la scolarité de l'EMIT pour toute question<br className="sco-desktop-break" /> relative à vos demandes administratives.</p><div className="sco-contact-links sco-reveal"><a href="tel:+261337047000" data-tilt><Phone size={22} /><div><span>TÉLÉPHONE</span><strong>+261 33 70 470 00</strong></div><ArrowUpRight size={20} /></a><a href="mailto:renseignement@emit.mg" data-tilt><Mail size={22} /><div><span>EMAIL</span><strong>renseignement@emit.mg</strong></div><ArrowUpRight size={20} /></a></div></div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="sco-footer"><div className="sco-container"><div className="sco-footer-grid"><div className="sco-footer-brand"><Link to="/" aria-label="EmiSCOL, accueil"><img src="/logo.webp" alt="EmiSCOL" width="500" height="500" loading="lazy" /></Link><p>La scolarité numérique,<br />une nouvelle dimension.</p><div className="sco-socials"><a href="https://www.facebook.com/emitfianarantsoa" target="_blank" rel="noopener noreferrer">Facebook <ArrowUpRight size={12} /></a><a href="https://www.linkedin.com/company/ecole-de-management-et-d-innovation-technologique-emit/posts/?feedView=all" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={12} /></a><a href="https://www.tiktok.com/@emit.fianarantsoa" target="_blank" rel="noopener noreferrer">TikTok <ArrowUpRight size={12} /></a></div></div><div><h3>Navigation</h3><a href="#accueil">Accueil</a><a href="#formations">Services</a><a href="#apropos">À propos</a><a href="#contact">Contact</a></div><div><h3>Services</h3>{services.map(({ titre, route }) => <Link to={route} key={route}>{titre}</Link>)}</div><div><h3>Liens utiles</h3><a href="https://www.emit.mg/" target="_blank" rel="noopener noreferrer">EMIT — Fianarantsoa <ArrowUpRight size={13} /></a><Link to="/connexion-agent">Espace Agent</Link><Link to="/dashboard">Tableau de bord</Link></div></div><div className="sco-footer-bottom"><span>© 2026 EMIT Fianarantsoa. Tous droits réservés.</span><span><Globe size={13} /> Fianarantsoa, Madagascar</span></div></div></footer>
  );
}

export default function Accueil() {
  const root = useRef(null);
  const heroProgress = useRef(0);
  const journeyProgress = useRef(0);
  useAnimationsAccueil(root, heroProgress, journeyProgress);
  return (
    <main ref={root} className="sco-landing">
      <div className="sco-progress" aria-hidden="true"><div className="sco-progress-fill" /></div>
      <Hero progress={heroProgress} /><FeaturesBar /><APropos /><Parcours3D progress={journeyProgress} /><ServicesSection /><Contact /><Footer />
    </main>
  );
}