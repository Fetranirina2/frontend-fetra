import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useAnimationsAccueil(root, heroProgress, journeyProgress) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const scope = root.current;
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.sco-hero-reveal', { y: 45, rotateX: -12, opacity: 0, duration: 1.1, stagger: 0.11, ease: 'power3.out', clearProps: 'all' });
        gsap.from('.sco-hero-visual', { scale: 0.82, opacity: 0, duration: 1.5, ease: 'power3.out', clearProps: 'all' });
        gsap.to('.sco-progress-fill', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom bottom', scrub: true } });
        ScrollTrigger.create({ trigger: '.sco-hero', start: 'top top', end: 'bottom top', onUpdate: (self) => { heroProgress.current = self.progress; } });
        gsap.utils.toArray('.sco-reveal').forEach((element) => {
          gsap.from(element, { y: 65, rotateX: 13, opacity: 0, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 91%', toggleActions: 'play none none reverse' } });
        });
        gsap.utils.toArray('.sco-depth-orb').forEach((element, i) => {
          gsap.fromTo(element, { y: 90, rotate: -15 }, { y: -120 - i * 25, rotate: 50, ease: 'none', scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
        });
        gsap.fromTo('.sco-campus-image', { y: 35, scale: 1.12, rotateY: -12, rotateX: 5 }, { y: -35, scale: 1, rotateY: 7, rotateX: -3, ease: 'none', scrollTrigger: { trigger: '.sco-about', start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
        const images = scope.querySelectorAll('img');
        const refresh = () => ScrollTrigger.refresh();
        images.forEach((image) => image.addEventListener('load', refresh));
        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener('orientationchange', onResize);
        return () => {
          images.forEach((image) => image.removeEventListener('load', refresh));
          window.removeEventListener('orientationchange', onResize);
        };
      });
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray('.sco-step');
        const markers = gsap.utils.toArray('.sco-step-marker');
        gsap.set(steps.slice(1), { autoAlpha: 0, y: 50, rotateX: -12 });
        const timeline = gsap.timeline({ scrollTrigger: {
          trigger: '.sco-journey', start: 'top top', end: '+=200%', pin: true, scrub: 1,
          onUpdate: (self) => {
            journeyProgress.current = self.progress;
            const active = Math.min(2, Math.floor(self.progress * 3));
            markers.forEach((marker, i) => marker.classList.toggle('is-active', i === active));
          },
        } });
        timeline.to({}, { duration: 0.35 });
        steps.slice(1).forEach((step, i) => {
          timeline.to(steps[i], { autoAlpha: 0, y: -60, rotateX: 12, duration: 0.35 })
            .to(step, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.5 }, '<0.1')
            .to({}, { duration: 0.4 });
        });
        gsap.to('.sco-hero-copy', { y: 100, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.sco-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        const removers = [];
        scope.querySelectorAll('[data-tilt]').forEach((card) => {
          const x = gsap.quickTo(card, 'rotationX', { duration: 0.55, ease: 'power3.out' });
          const y = gsap.quickTo(card, 'rotationY', { duration: 0.55, ease: 'power3.out' });
          const move = (event) => {
            if (event.pointerType === 'touch') return;
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            x((0.5 - py) * 14); y((px - 0.5) * 18);
            card.style.setProperty('--shine-x', `${px * 100}%`);
            card.style.setProperty('--shine-y', `${py * 100}%`);
          };
          const leave = () => { x(0); y(0); };
          card.addEventListener('pointermove', move);
          card.addEventListener('pointerleave', leave);
          card.addEventListener('blur', leave);
          removers.push(() => {
            card.removeEventListener('pointermove', move);
            card.removeEventListener('pointerleave', leave);
            card.removeEventListener('blur', leave);
          });
        });
        return () => {
          removers.forEach((remove) => remove());
          markers.forEach((marker, i) => marker.classList.toggle('is-active', i === 0));
        };
      });
    }, scope);
    return () => { mm.revert(); ctx.revert(); };
  }, [root, heroProgress, journeyProgress]);
}