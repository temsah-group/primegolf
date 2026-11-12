import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import landDots from '../data/land-dots.json';

const DEG = Math.PI / 180;
const R = 1;
const DUBAI = [25.2, 55.3];
// Major business hubs that arcs fly in from
const CITIES = [
  [51.5, -0.1], [48.9, 2.35], [52.5, 13.4], [55.75, 37.6], [41.0, 28.9], [30.0, 31.2],
  [24.7, 46.7], [19.1, 72.9], [1.35, 103.8], [39.9, 116.4], [6.5, 3.4], [-26.2, 28.0],
  [40.7, -74.0], [43.65, -79.4], [-33.9, 151.2],
];
const NAVY = new THREE.Color('#4a1424');
const TEAL = new THREE.Color('#b8913f');

function toVec(lat, lon, r = R) {
  const phi = (90 - lat) * DEG;
  const th = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(th),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(th),
  );
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const arcVertex = /* glsl */`
  varying float vU;
  void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const arcFragment = /* glsl */`
  uniform float uTime; uniform float uOffset; uniform vec3 uColor;
  varying float vU;
  void main() {
    float head = fract(uTime * 0.22 + uOffset) * 1.5;   // travels past the end so the tail can leave
    float d = head - vU;
    float trail = d >= 0.0 ? smoothstep(0.45, 0.0, d) : 0.0;
    float glow = smoothstep(0.03, 0.0, abs(d)) * 0.6;   // bright head
    float a = max(0.10, trail * 0.9 + glow);
    gl_FragColor = vec4(uColor + glow * 0.35, a);
  }
`;

export default function Globe() {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 4.7);

    // Outer group = tilt (x), inner group = spin (y)
    const tilt = new THREE.Group();
    const spin = new THREE.Group();
    tilt.add(spin);
    scene.add(tilt);

    const disposables = [];
    const track = (...items) => { disposables.push(...items); return items[0]; };

    // Base sphere with a soft rim shading so it reads as 3D on a light page
    const baseMat = track(new THREE.ShaderMaterial({
      uniforms: { uCenter: { value: new THREE.Color('#fcf8f7') }, uRim: { value: new THREE.Color('#ecdcdd') } },
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform vec3 uCenter; uniform vec3 uRim; varying vec3 vN; void main(){ float f = pow(1. - max(dot(vN, vec3(0.,0.,1.)), 0.), 2.); gl_FragColor = vec4(mix(uCenter, uRim, f), 1.); }',
    }));
    spin.add(new THREE.Mesh(track(new THREE.SphereGeometry(R * 0.995, 64, 64)), baseMat));

    // Teal atmosphere halo
    const haloMat = track(new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.66 - dot(vN, vec3(0.,0.,1.)), 3.2); gl_FragColor = vec4(0.79, 0.63, 0.29, clamp(i, 0., 1.) * 0.32); }',
    }));
    tilt.add(new THREE.Mesh(track(new THREE.SphereGeometry(R * 1.12, 64, 64)), haloMat));

    // Land dots
    const pos = new Float32Array((landDots.length / 2) * 3);
    for (let i = 0; i < landDots.length; i += 2) {
      const v = toVec(landDots[i], landDots[i + 1], R * 1.002);
      pos.set([v.x, v.y, v.z], (i / 2) * 3);
    }
    const dotGeo = track(new THREE.BufferGeometry());
    dotGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const tex = track(dotTexture());
    const dotMat = track(new THREE.PointsMaterial({
      size: 0.03, sizeAttenuation: true, color: NAVY, map: tex, transparent: true, opacity: 0.78, alphaTest: 0.2, depthWrite: false,
    }));
    spin.add(new THREE.Points(dotGeo, dotMat));

    // Arcs from each city into Dubai
    const dubai = toVec(...DUBAI);
    const arcMats = [];
    const cityGeo = track(new THREE.SphereGeometry(0.012, 12, 12));
    const cityMat = track(new THREE.MeshBasicMaterial({ color: TEAL }));
    CITIES.forEach(([lat, lon], i) => {
      const start = toVec(lat, lon);
      const dist = start.distanceTo(dubai);
      const mid = start.clone().add(dubai).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.32);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, dubai);
      const mat = track(new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOffset: { value: (i * 0.137) % 1 }, uColor: { value: TEAL } },
        vertexShader: arcVertex, fragmentShader: arcFragment, transparent: true, depthWrite: false,
      }));
      arcMats.push(mat);
      spin.add(new THREE.Mesh(track(new THREE.TubeGeometry(curve, 80, 0.0042, 8, false)), mat));
      const city = new THREE.Mesh(cityGeo, cityMat);
      city.position.copy(start);
      spin.add(city);
    });

    // Dubai: bright dot + pulsing rings
    const dubaiDot = new THREE.Mesh(track(new THREE.SphereGeometry(0.026, 20, 20)), track(new THREE.MeshBasicMaterial({ color: TEAL })));
    dubaiDot.position.copy(dubai);
    spin.add(dubaiDot);
    const ringGeo = track(new THREE.RingGeometry(0.03, 0.04, 48));
    const rings = [0, 0.5].map((phase) => {
      const mat = track(new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      const ring = new THREE.Mesh(ringGeo, mat);
      ring.position.copy(dubai.clone().multiplyScalar(1.003));
      ring.lookAt(dubai.clone().multiplyScalar(2));
      spin.add(ring);
      return { ring, mat, phase };
    });

    // Face Dubai toward the camera, then let it sway gently
    const baseY = -Math.atan2(dubai.x, dubai.z);
    const baseX = DUBAI[0] * DEG * 0.75;
    const drag = { active: false, x: 0, y: 0, vx: 0, vy: 0, offY: 0, offX: 0 };

    const onDown = (e) => { drag.active = true; drag.x = e.clientX; drag.y = e.clientY; el.setPointerCapture?.(e.pointerId); el.classList.add('is-dragging'); };
    const onMove = (e) => {
      if (!drag.active) return;
      drag.vx = (e.clientX - drag.x) * 0.006; drag.vy = (e.clientY - drag.y) * 0.004;
      drag.offY += drag.vx; drag.offX = THREE.MathUtils.clamp(drag.offX + drag.vy, -0.5, 0.5);
      drag.x = e.clientX; drag.y = e.clientY;
    };
    const onUp = () => { drag.active = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = reduce ? 2 : clock.getElapsedTime();
      if (!drag.active) { drag.vx *= 0.94; drag.offY += drag.vx; drag.offX *= 0.97; }
      spin.rotation.y = baseY + (reduce ? 0 : Math.sin(t * 0.18) * 0.5) + drag.offY;
      tilt.rotation.x = baseX + drag.offX;
      arcMats.forEach((m) => { m.uniforms.uTime.value = t; });
      rings.forEach(({ ring, mat, phase }) => {
        const p = (t * 0.6 + phase) % 1;
        ring.scale.setScalar(1 + p * 2.6);
        mat.opacity = (1 - p) * 0.8;
      });
      renderer.render(scene, camera);
      if (reduce) cancelAnimationFrame(raf);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="globe" ref={mount} aria-hidden="true" />;
}
