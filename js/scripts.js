import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('scene');
const labelsLayer = document.getElementById('labels');
const planetList = document.getElementById('planet-list');
const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');
const motionButton = document.getElementById('toggle-motion');
const selectedKicker = document.getElementById('selected-kicker');
const selectedName = document.getElementById('selected-name');
const selectedSummary = document.getElementById('selected-summary');
const selectedDistance = document.getElementById('selected-distance');
const selectedRadius = document.getElementById('selected-radius');
const selectedOrbit = document.getElementById('selected-orbit');
const selectedVelocity = document.getElementById('selected-velocity');
const scaleModeReadout = document.getElementById('scale-mode-readout');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();
const worldPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();

const planetData = [
  {
    slug: 'sun',
    name: 'Sun',
    kind: 'Star',
    radiusKm: 696340,
    distanceAu: 0,
    orbitalDays: 0,
    velocity: '0 km/h',
    texture: 'img/sun.png',
    color: 0xffb24a,
    summary: 'The central star and light source for every body in the scene.'
  },
  {
    slug: 'mercury',
    name: 'Mercury',
    kind: 'Planet',
    radiusKm: 2440,
    distanceAu: 0.39,
    orbitalDays: 88,
    velocity: '170,503 km/h',
    texture: 'img/p-mercury.png',
    color: 0xb8aea0,
    summary: 'A compact iron-rich world racing through the innermost orbit.'
  },
  {
    slug: 'venus',
    name: 'Venus',
    kind: 'Planet',
    radiusKm: 6052,
    distanceAu: 0.72,
    orbitalDays: 224.7,
    velocity: '126,074 km/h',
    texture: 'img/p-venus.png',
    color: 0xe0b06e,
    summary: 'A dense golden planet with a slow spin and intense atmosphere.'
  },
  {
    slug: 'earth',
    name: 'Earth',
    kind: 'Planet',
    radiusKm: 6371,
    distanceAu: 1,
    orbitalDays: 365.2,
    velocity: '107,218 km/h',
    texture: 'img/p-earth.png',
    color: 0x6bb6ff,
    summary: 'Blue world with a single moon and the reference point for this model.'
  },
  {
    slug: 'mars',
    name: 'Mars',
    kind: 'Planet',
    radiusKm: 3390,
    distanceAu: 1.52,
    orbitalDays: 687,
    velocity: '86,677 km/h',
    texture: 'img/p-mars.png',
    color: 0xd56d4a,
    summary: 'A smaller rust-colored world with thin atmosphere and polar caps.'
  },
  {
    slug: 'jupiter',
    name: 'Jupiter',
    kind: 'Gas giant',
    radiusKm: 69911,
    distanceAu: 5.2,
    orbitalDays: 4333,
    velocity: '47,002 km/h',
    texture: 'img/p-jupiter.png',
    color: 0xd8b383,
    summary: 'The largest planet, rendered with broad banding and heavy presence.'
  },
  {
    slug: 'saturn',
    name: 'Saturn',
    kind: 'Gas giant',
    radiusKm: 58232,
    distanceAu: 9.58,
    orbitalDays: 10759,
    velocity: '34,701 km/h',
    texture: 'img/p-saturn.png',
    color: 0xd8c08d,
    summary: 'A pale giant surrounded by a wide tilted ring system.'
  },
  {
    slug: 'uranus',
    name: 'Uranus',
    kind: 'Ice giant',
    radiusKm: 25362,
    distanceAu: 19.2,
    orbitalDays: 30687,
    velocity: '24,477 km/h',
    texture: 'img/p-uranus.png',
    color: 0x8fe5d8,
    summary: 'A cool cyan ice giant with a distant, measured orbit.'
  },
  {
    slug: 'neptune',
    name: 'Neptune',
    kind: 'Ice giant',
    radiusKm: 24622,
    distanceAu: 30.05,
    orbitalDays: 60190,
    velocity: '19,566 km/h',
    texture: 'img/p-neptune.png',
    color: 0x4f7dff,
    summary: 'The outermost planet, deep blue and slow across the edge of the map.'
  }
];

const scaleProfiles = {
  balanced: {
    label: 'Balanced',
    orbitRadius(body, index) {
      return body.slug === 'sun' ? 0 : 7 + index * 4.7;
    },
    bodyRadius(body) {
      if (body.slug === 'sun') return 3.9;
      return 0.36 + Math.sqrt(body.radiusKm / 6371) * 0.54;
    }
  },
  distance: {
    label: 'Distance',
    orbitRadius(body) {
      return body.slug === 'sun' ? 0 : 5.4 + Math.sqrt(body.distanceAu) * 11.8;
    },
    bodyRadius(body) {
      if (body.slug === 'sun') return 3.15;
      return 0.3 + Math.sqrt(body.radiusKm / 6371) * 0.36;
    }
  },
  size: {
    label: 'Size',
    orbitRadius(body, index) {
      return body.slug === 'sun' ? 0 : 8.5 + index * 5;
    },
    bodyRadius(body) {
      if (body.slug === 'sun') return 5.8;
      return 0.28 + Math.sqrt(body.radiusKm / 6371) * 0.82;
    }
  }
};

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070b, 0.011);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const camera = new THREE.PerspectiveCamera(
  54,
  window.innerWidth / window.innerHeight,
  0.1,
  900
);
camera.position.set(-34, 25, 44);
desiredTarget.set(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 12;
controls.maxDistance = 128;
controls.maxPolarAngle = Math.PI * 0.62;
controls.target.copy(desiredTarget);

const solarRoot = new THREE.Group();
const orbitRoot = new THREE.Group();
scene.add(orbitRoot, solarRoot);

const ambientLight = new THREE.AmbientLight(0x7b86a0, 0.22);
const sunLight = new THREE.PointLight(0xffd09a, 8, 240, 1.45);
sunLight.position.set(0, 0, 0);
scene.add(ambientLight, sunLight);

const bodies = new Map();
const pickables = [];
let selectedSlug = 'earth';
let currentScale = 'balanced';
let speedMultiplier = prefersReducedMotion ? 0.45 : 1;
let paused = false;

speedRange.value = String(speedMultiplier);
speedValue.value = `${speedMultiplier.toFixed(1)}x`;
speedValue.textContent = `${speedMultiplier.toFixed(1)}x`;

buildStars();
buildPlanets();
buildPlanetList();
applyScale(currentScale);
selectBody(selectedSlug);
setCameraPreset('overview');
animate();

function createBodyTexture(body) {
  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 512;
  canvasTexture.height = 256;
  const ctx = canvasTexture.getContext('2d');
  const rng = seededRandom(hashString(body.slug));

  drawBaseTexture(ctx, body, rng, canvasTexture.width, canvasTexture.height);

  const generated = new THREE.CanvasTexture(canvasTexture);
  generated.colorSpace = THREE.SRGBColorSpace;
  generated.wrapS = THREE.RepeatWrapping;
  generated.wrapT = THREE.ClampToEdgeWrapping;
  generated.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return generated;
}

function drawBaseTexture(ctx, body, rng, width, height) {
  ctx.fillStyle = colorCss(body.color);
  ctx.fillRect(0, 0, width, height);

  if (body.slug === 'sun') {
    drawSunTexture(ctx, rng, width, height);
    return;
  }

  if (body.slug === 'earth') {
    drawEarthTexture(ctx, rng, width, height);
    return;
  }

  if (body.slug === 'jupiter' || body.slug === 'saturn') {
    drawBandTexture(ctx, body, rng, width, height);
    return;
  }

  if (body.slug === 'uranus' || body.slug === 'neptune') {
    drawIceTexture(ctx, body, rng, width, height);
    return;
  }

  drawRockTexture(ctx, body, rng, width, height);
}

function drawSunTexture(ctx, rng, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ffd36f');
  gradient.addColorStop(0.48, '#ffac39');
  gradient.addColorStop(1, '#f46b22');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 900; i += 1) {
    const x = rng() * width;
    const y = rng() * height;
    const radius = 1 + rng() * 7;
    ctx.fillStyle = `rgba(255, ${150 + rng() * 90}, ${40 + rng() * 70}, ${0.07 + rng() * 0.12})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEarthTexture(ctx, rng, width, height) {
  ctx.fillStyle = '#1e65a8';
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 28; i += 1) {
    ctx.fillStyle = rng() > 0.4 ? '#3d8b57' : '#b18c55';
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.ellipse(rng() * width, rng() * height, 18 + rng() * 54, 8 + rng() * 28, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 36; i += 1) {
    const y = rng() * height;
    ctx.beginPath();
    ctx.moveTo(rng() * width, y);
    ctx.bezierCurveTo(rng() * width, y - 18, rng() * width, y + 18, rng() * width, y + rng() * 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawBandTexture(ctx, body, rng, width, height) {
  const base = new THREE.Color(body.color);
  let y = 0;
  while (y < height) {
    const bandHeight = 8 + rng() * 22;
    const tint = rng() > 0.5 ? 0xffffff : 0x3c2617;
    const amount = body.slug === 'jupiter' ? 0.1 + rng() * 0.32 : 0.08 + rng() * 0.22;
    ctx.fillStyle = colorCss(base.clone().lerp(new THREE.Color(tint), amount));
    ctx.fillRect(0, y, width, bandHeight);
    y += bandHeight;
  }

  ctx.globalAlpha = body.slug === 'jupiter' ? 0.38 : 0.24;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 60; i += 1) {
    ctx.fillRect(rng() * width, rng() * height, 30 + rng() * 120, 1 + rng() * 3);
  }
  ctx.globalAlpha = 1;
}

function drawIceTexture(ctx, body, rng, width, height) {
  const base = new THREE.Color(body.color);
  for (let y = 0; y < height; y += 4) {
    const amount = 0.04 + Math.sin(y / height * Math.PI * 5) * 0.08 + rng() * 0.08;
    ctx.fillStyle = colorCss(base.clone().lerp(new THREE.Color(0xffffff), amount));
    ctx.fillRect(0, y, width, 4);
  }
}

function drawRockTexture(ctx, body, rng, width, height) {
  const base = new THREE.Color(body.color);
  for (let i = 0; i < 1200; i += 1) {
    const toward = rng() > 0.5 ? 0xffffff : 0x111111;
    ctx.fillStyle = colorCss(base.clone().lerp(new THREE.Color(toward), rng() * 0.38));
    ctx.globalAlpha = 0.12 + rng() * 0.28;
    ctx.fillRect(rng() * width, rng() * height, 1 + rng() * 4, 1 + rng() * 4);
  }
  ctx.globalAlpha = 1;
}

function colorCss(value) {
  const color = value instanceof THREE.Color ? value : new THREE.Color(value);
  return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed || 1;
  return function next() {
    state |= 0;
    state = state + 0x6d2b79f5 | 0;
    let result = Math.imul(state ^ state >>> 15, 1 | state);
    result ^= result + Math.imul(result ^ result >>> 7, 61 | result);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function buildStars() {
  const count = 2600;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const radius = 95 + Math.random() * 260;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const i = index * 3;

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.cos(phi);
    positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);

    color.setHSL(0.58 + Math.random() * 0.12, 0.45, 0.72 + Math.random() * 0.26);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.34,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.86,
    depthWrite: false
  });

  scene.add(new THREE.Points(geometry, material));
}

function buildPlanets() {
  planetData.forEach((body, index) => {
    if (body.slug === 'sun') {
      createSun(body);
      return;
    }

    const pivot = new THREE.Group();
    pivot.rotation.y = (index / planetData.length) * Math.PI * 2;
    solarRoot.add(pivot);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 72, 40),
      new THREE.MeshStandardMaterial({
        map: createBodyTexture(body),
        color: body.color,
        roughness: 0.82,
        metalness: 0.02
      })
    );
    mesh.userData.slug = body.slug;
    pivot.add(mesh);
    pickables.push(mesh);

    const orbitLine = new THREE.LineLoop(
      createOrbitGeometry(1),
      new THREE.LineBasicMaterial({
        color: body.color,
        transparent: true,
        opacity: 0.32
      })
    );
    orbitRoot.add(orbitLine);

    const label = createLabel(body);
    const bodyState = {
      data: body,
      mesh,
      pivot,
      orbitLine,
      label,
      radius: 1,
      orbitRadius: 1,
      angularSpeed: Math.pow(365.2 / body.orbitalDays, 0.64) * 0.28
    };

    if (body.slug === 'saturn') {
      bodyState.ring = createSaturnRing(mesh);
    }

    if (body.slug === 'earth') {
      bodyState.moon = createMoon(mesh);
    }

    bodies.set(body.slug, bodyState);
  });
}

function createSun(body) {
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 48),
    new THREE.MeshBasicMaterial({
      map: createBodyTexture(body),
      color: body.color
    })
  );
  sunMesh.userData.slug = body.slug;
  solarRoot.add(sunMesh);
  pickables.push(sunMesh);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.36, 96, 48),
    new THREE.MeshBasicMaterial({
      color: 0xff9e49,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  solarRoot.add(glow);

  bodies.set(body.slug, {
    data: body,
    mesh: sunMesh,
    glow,
    label: createLabel(body),
    radius: 4,
    orbitRadius: 0,
    angularSpeed: 0
  });
}

function createSaturnRing(parent) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.32, 2.16, 144),
    new THREE.MeshBasicMaterial({
      color: 0xd8c08d,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide
    })
  );
  ring.rotation.x = Math.PI * 0.5;
  ring.rotation.z = -0.32;
  parent.add(ring);
  return ring;
}

function createMoon(parent) {
  const moonPivot = new THREE.Group();
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 32, 16),
    new THREE.MeshStandardMaterial({
      color: 0xd8dce6,
      roughness: 0.88
    })
  );
  moon.position.x = 1.85;
  moonPivot.add(moon);
  parent.add(moonPivot);
  return { pivot: moonPivot, mesh: moon };
}

function createOrbitGeometry(radius) {
  const segments = 256;
  const points = [];
  for (let step = 0; step < segments; step += 1) {
    const angle = (step / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function createLabel(body) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'scene-label';
  button.textContent = body.name;
  button.dataset.slug = body.slug;
  button.addEventListener('click', () => selectBody(body.slug, { moveCamera: true }));
  labelsLayer.appendChild(button);
  return button;
}

function buildPlanetList() {
  planetData.forEach((body) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'planet-button';
    button.dataset.slug = body.slug;
    button.innerHTML = `
      <span class="planet-swatch" style="--swatch: #${body.color.toString(16).padStart(6, '0')}"></span>
      <span class="planet-copy">
        <strong>${body.name}</strong>
        <small>${body.kind}</small>
      </span>
      <span class="planet-distance">${body.distanceAu === 0 ? 'Core' : `${body.distanceAu.toFixed(2)} AU`}</span>
    `;
    button.addEventListener('click', () => selectBody(body.slug, { moveCamera: true }));
    planetList.appendChild(button);
  });
}

function applyScale(mode) {
  currentScale = mode;
  const profile = scaleProfiles[mode];
  scaleModeReadout.textContent = profile.label;

  planetData.forEach((body, index) => {
    const state = bodies.get(body.slug);
    if (!state) return;

    const radius = profile.bodyRadius(body, index);
    const orbitRadius = profile.orbitRadius(body, index);
    state.radius = radius;
    state.orbitRadius = orbitRadius;

    state.mesh.scale.setScalar(radius);
    if (state.glow) {
      state.glow.scale.setScalar(radius);
    }

    if (body.slug !== 'sun') {
      state.mesh.position.set(orbitRadius, 0, 0);
      state.orbitLine.geometry.dispose();
      state.orbitLine.geometry = createOrbitGeometry(orbitRadius);
    }

    if (state.moon) {
      state.moon.mesh.scale.setScalar(Math.max(0.16, radius * 0.18));
      state.moon.mesh.position.x = radius * 1.92;
    }
  });

  document.querySelectorAll('.mode-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.scale === mode);
  });
}

function selectBody(slug, options = {}) {
  selectedSlug = slug;
  const state = bodies.get(slug);
  if (!state) return;

  selectedKicker.textContent = state.data.kind;
  selectedName.textContent = state.data.name;
  selectedSummary.textContent = state.data.summary;
  selectedDistance.textContent = state.data.distanceAu === 0
    ? 'Center'
    : `${state.data.distanceAu.toFixed(2)} AU`;
  selectedRadius.textContent = `${formatNumber(state.data.radiusKm)} km`;
  selectedOrbit.textContent = state.data.orbitalDays === 0
    ? 'Anchor'
    : `${formatNumber(state.data.orbitalDays)} days`;
  selectedVelocity.textContent = state.data.velocity;

  document.querySelectorAll('[data-slug]').forEach((element) => {
    element.classList.toggle('active', element.dataset.slug === slug);
  });

  if (options.moveCamera) {
    moveCameraTo(slug);
  }
}

function moveCameraTo(slug) {
  const state = bodies.get(slug);
  if (!state) return;
  state.mesh.getWorldPosition(worldPosition);
  desiredTarget.copy(worldPosition);

  const orbit = Math.max(state.orbitRadius, 11);
  const height = slug === 'sun' ? 18 : 13 + Math.min(orbit * 0.18, 10);
  const offset = slug === 'sun'
    ? new THREE.Vector3(-24, height, 28)
    : new THREE.Vector3(-Math.max(12, state.radius * 5), height, Math.max(16, state.radius * 7));

  camera.position.copy(worldPosition).add(offset);
}

function setCameraPreset(preset) {
  const presets = {
    overview: {
      position: new THREE.Vector3(-38, 29, 50),
      target: new THREE.Vector3(0, 0, 0)
    },
    inner: {
      position: new THREE.Vector3(-20, 14, 24),
      target: new THREE.Vector3(6, 0, 0)
    },
    outer: {
      position: new THREE.Vector3(-58, 37, 74),
      target: new THREE.Vector3(18, 0, 0)
    }
  };

  const cameraPreset = presets[preset] || presets.overview;
  camera.position.copy(cameraPreset.position);
  desiredTarget.copy(cameraPreset.target);
}

function updateBodies(delta) {
  const speed = paused ? 0 : speedMultiplier;
  bodies.forEach((state) => {
    if (state.data.slug === 'sun') {
      state.mesh.rotation.y += delta * 0.045 * Math.max(speed, 0.2);
      if (state.glow) {
        state.glow.rotation.y -= delta * 0.02;
      }
      return;
    }

    state.pivot.rotation.y += delta * state.angularSpeed * speed;
    state.mesh.rotation.y += delta * (0.18 + state.angularSpeed) * Math.max(speed, 0.25);

    if (state.moon) {
      state.moon.pivot.rotation.y += delta * 1.45 * speed;
      state.moon.mesh.rotation.y += delta * 0.9 * Math.max(speed, 0.25);
    }
  });
}

function updateLabels() {
  bodies.forEach((state) => {
    state.mesh.getWorldPosition(worldPosition);
    const projected = worldPosition.clone().project(camera);
    const visible = projected.z > -1 && projected.z < 1;
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    state.label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    state.label.style.opacity = visible ? '1' : '0';
    state.label.style.pointerEvents = visible ? 'auto' : 'none';
  });
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  updateBodies(delta);
  controls.target.lerp(desiredTarget, 0.055);
  controls.update();
  updateLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1
  }).format(value);
}

function handlePointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster.intersectObjects(pickables, false)[0];
  if (hit && hit.object.userData.slug) {
    selectBody(hit.object.userData.slug, { moveCamera: true });
  }
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => applyScale(button.dataset.scale));
});

document.querySelectorAll('.camera-button').forEach((button) => {
  button.addEventListener('click', () => setCameraPreset(button.dataset.camera));
});

speedRange.addEventListener('input', () => {
  speedMultiplier = Number(speedRange.value);
  speedValue.value = `${speedMultiplier.toFixed(1)}x`;
  speedValue.textContent = `${speedMultiplier.toFixed(1)}x`;
});

motionButton.addEventListener('click', () => {
  paused = !paused;
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.querySelector('span:last-child').textContent = paused ? 'Play' : 'Pause';
  motionButton.querySelector('.pause-icon').classList.toggle('play', paused);
});

canvas.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('resize', handleResize);
