import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Tout est construit localement : aucun modèle, CDN ou texture à télécharger.
function documentTexture(index) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, 768, 1024);
  ctx.fillStyle = '#1a56db';
  ctx.fillRect(0, 0, 768, 14);
  ctx.fillStyle = '#0f2a4a';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('EMISCO', 60, 100);
  ctx.fillStyle = '#6b7280';
  ctx.font = '18px sans-serif';
  ctx.fillText('SCOLARITÉ NUMÉRIQUE · EMIT', 60, 137);
  ctx.fillStyle = '#0f2a4a';
  ctx.font = 'bold 32px sans-serif';
  const labels = ['CERTIFICAT', 'RELEVÉ DE NOTES', 'ATTESTATION'];
  ctx.fillText(labels[index], 60, 244);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#1e56a0';
  ctx.fillText('Votre avenir prend forme.', 60, 285);
  ctx.fillStyle = '#dce6f2';
  [348, 384, 420, 496, 532, 568, 604].forEach((y, i) => {
    ctx.fillRect(60, y, i % 3 === 2 ? 390 : 645, 9);
  });
  ctx.strokeStyle = '#1a56db';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(595, 814, 71, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(595, 814, 62, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#1a56db';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('EMIT', 567, 820);
  ctx.font = '14px sans-serif';
  ctx.fillText('SCOLARITÉ', 557, 843);
  ctx.fillStyle = '#0f2a4a';
  ctx.font = 'italic 26px serif';
  ctx.fillText('Emisco', 60, 828);
  ctx.fillStyle = '#dce6f2'; ctx.fillRect(60, 860, 220, 2);
  ctx.fillStyle = '#6b7280'; ctx.font = '14px sans-serif';
  ctx.fillText('ILLUSTRATION · DOCUMENT DE DÉMONSTRATION', 60, 970);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function SceneScolarite3D({ variant = 'hero', progress }) {
  const host = useRef(null);

  useEffect(() => {
    const element = host.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};
    const setup = () => {
      stop();
      element.classList.remove('scene-ready');
      if (media.matches) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch {
        return; // Le document CSS reste visible si WebGL n'est pas disponible.
      }
      const mobile = window.innerWidth < 768;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
      camera.position.set(0, 0.1, 12.5);
      scene.add(new THREE.HemisphereLight(0xeaf3ff, 0x345b94, 3));
      const key = new THREE.DirectionalLight(0xffffff, 4);
      key.position.set(-3, 5, 8); scene.add(key);
      const blue = new THREE.PointLight(0x60a5fa, 32, 20);
      blue.position.set(4, 2, 4); scene.add(blue);
      const rig = new THREE.Group(); scene.add(rig);
      const papers = [];
      const textures = [];
      for (let i = 0; i < 3; i++) {
        const group = new THREE.Group();
        const texture = documentTexture(i); textures.push(texture);
        const paper = new THREE.Mesh(
          new THREE.BoxGeometry(2.7, 3.6, 0.075),
          new THREE.MeshStandardMaterial({ color: i ? '#e4eeff' : '#ffffff', roughness: 0.33, metalness: 0.08 }),
        );
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(2.68, 3.58),
          new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
        );
        face.position.z = 0.04;
        group.add(paper, face); rig.add(group); papers.push(group);
      }
      const orbits = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(2.7 + i * 0.4, i === 0 ? 0.018 : 0.009, 8, mobile ? 90 : 160),
          new THREE.MeshStandardMaterial({ color: i === 0 ? '#1a56db' : '#60a5fa', metalness: 0.6, roughness: 0.2, transparent: true, opacity: i === 0 ? 0.75 : 0.35 }),
        );
        ring.rotation.set(0.5 + i * 0.6, 0.45 + i * 0.5, i * 0.3);
        rig.add(ring); orbits.push(ring);
      }
      const satellites = [];
      for (let i = 0; i < (mobile ? 5 : 9); i++) {
        const mesh = new THREE.Mesh(
          i % 3 === 0 ? new THREE.OctahedronGeometry(0.17) : new THREE.SphereGeometry(i === 1 ? 0.34 : 0.12, 20, 16),
          new THREE.MeshPhysicalMaterial({ color: i % 2 ? '#1a56db' : '#60a5fa', metalness: 0.5, roughness: 0.12, clearcoat: 1 }),
        );
        rig.add(mesh); satellites.push(mesh);
      }
      // Distribution déterministe : aucune allocation aléatoire à chaque frame.
      const points = new Float32Array((mobile ? 45 : 110) * 3);
      for (let i = 0; i < points.length; i++) points[i] = Math.sin(i * 127.1 + 23.7) * (i % 3 === 2 ? 3 : 6);
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#60a5fa', size: 0.025, transparent: true, opacity: 0.55 }));
      scene.add(particles);
      const pointer = { x: 0, y: 0 };
      const move = (event) => {
        pointer.x = event.clientX / window.innerWidth * 2 - 1;
        pointer.y = event.clientY / window.innerHeight * 2 - 1;
      };
      window.addEventListener('pointermove', move, { passive: true });
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(Math.max(width, 1), Math.max(height, 1));
        camera.aspect = width / Math.max(height, 1);
        camera.position.z = camera.aspect < 0.85 ? 16 : 12.5;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize); observer.observe(element); resize();
      let visible = false;
      let first = true;
      const startTime = performance.now();
      const draw = (now) => {
        const t = (now - startTime) / 1000;
        const p = progress?.current || 0;
        const spread = variant === 'journey' ? Math.sin(p * Math.PI) * 1.45 : 0.3 + p * 0.75;
        rig.rotation.y += ((variant === 'journey' ? -0.35 + p * Math.PI * 2 : -0.35 + p * 0.8) + pointer.x * 0.15 - rig.rotation.y) * 0.055;
        rig.rotation.x += (0.12 + pointer.y * 0.08 - rig.rotation.x) * 0.05;
        rig.position.y = Math.sin(t * 0.6) * 0.1;
        papers.forEach((paper, i) => {
          paper.position.set((i - 1) * spread * 0.8, (1 - i) * spread * 0.28, -i * (0.22 + spread * 0.6));
          paper.rotation.set(Math.sin(t * 0.5 + i) * 0.04, (i - 1) * spread * 0.2, (i - 1) * spread * -0.12);
        });
        orbits.forEach((ring, i) => { ring.rotation.z = t * (0.07 + i * 0.015) + p * (i + 1); });
        satellites.forEach((mesh, i) => {
          const a = i * 2.399 + t * (i % 2 ? 0.08 : -0.07) + p * 1.2;
          mesh.position.set(Math.cos(a) * (2.8 + i * 0.07), Math.sin(a) * 2.5, Math.sin(a * 1.3) * 1.7);
          mesh.rotation.x = t * 0.3 + i;
          mesh.rotation.y = t * 0.4;
        });
        particles.rotation.y = t * 0.025;
        camera.position.x += (pointer.x * 0.2 - camera.position.x) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (first) { element.classList.add('scene-ready'); first = false; }
      };
      const run = () => renderer.setAnimationLoop(visible && !document.hidden ? draw : null);
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); }, { rootMargin: '80px' });
      intersection.observe(element);
      document.addEventListener('visibilitychange', run);
      const contextLost = (event) => {
        event.preventDefault(); renderer.setAnimationLoop(null); element.classList.remove('scene-ready');
      };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      const contextRestored = () => { first = true; run(); };
      renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
      stop = () => {
        renderer.setAnimationLoop(null);
        observer.disconnect(); intersection.disconnect();
        window.removeEventListener('pointermove', move);
        document.removeEventListener('visibilitychange', run);
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
        scene.traverse((object) => {
          object.geometry?.dispose();
          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
        textures.forEach((texture) => texture.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
    };
    setup(); media.addEventListener('change', setup);
    return () => { media.removeEventListener('change', setup); stop(); };
  }, [variant, progress]);

  return (
    <div ref={host} className={`sco-scene sco-scene--${variant}`} aria-hidden="true">
      <div className="sco-scene-fallback">
        <div className="sco-fallback-orbit" />
        <div className="sco-fallback-paper"><b>EMISCO</b><span>SCOLARITÉ NUMÉRIQUE</span><strong>CERTIFICAT</strong><i /><i /><i /><i /><em>EMIT</em></div>
      </div>
    </div>
  );
}