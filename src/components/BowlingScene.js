import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * ═══════════════════════════════════════════════════════════════
 * BowlingScene — Hyper-Realistic Lighting Simulator
 * ═══════════════════════════════════════════════════════════════
 *
 * Vanilla Three.js class (no R3F) with:
 * - PCFSoftShadowMap + ACESFilmicToneMapping
 * - 5-light studio rig (DirectionalLight, 2× RectAreaLight,
 *   HemisphereLight, PointLight)
 * - PMREM procedural environment map for glossy reflections
 * - GLTFLoader with material overrides for maximum gloss
 * - GSAP ScrollTrigger timeline: ball roll, pin scatter, camera track
 * - Accurate rolling physics: rotation = -(distance / radius)
 *
 * Lifecycle: init() → animate loop → dispose()
 */

/* ─── Pin scatter directions (randomized per pin) ─── */
const SCATTER_DIRS = [
  { dx:  0.5, dy: 3,   dz: -2,  rx: 4,  ry: 3,  rz: 1 },
  { dx: -2,   dy: 2.5, dz: -1,  rx:-3,  ry: 1,  rz: 2 },
  { dx:  2,   dy: 3,   dz: -1,  rx: 4,  ry:-2,  rz:-1 },
  { dx: -3,   dy: 2,   dz: -2,  rx:-2,  ry: 4,  rz: 3 },
  { dx:  0,   dy: 4,   dz: -3,  rx: 5,  ry: 1,  rz:-2 },
  { dx:  3,   dy: 2.5, dz: -2,  rx: 1,  ry: 5,  rz: 4 },
  { dx: -3.5, dy: 1.5, dz: -1,  rx:-4,  ry:-1,  rz: 2 },
  { dx: -1,   dy: 3,   dz: -2,  rx: 2,  ry:-3,  rz: 1 },
  { dx:  1,   dy: 2.5, dz: -3,  rx: 3,  ry: 2,  rz:-3 },
  { dx:  3.5, dy: 2,   dz: -1,  rx:-1,  ry: 4,  rz: 2 },
];

export default class BowlingScene {
  constructor(container, { overlays = {}, scrollContainer = null } = {}) {
    this.container = container;         // the div wrapping the <canvas>
    this.scrollContainer = scrollContainer; // the 400vh outer container for ScrollTrigger
    this.overlays = overlays;           // { veil, flash }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.animId = null;
    this.timeline = null;
    this.scrollTrigger = null;
    this.ball = null;
    this.pins = [];        // Array of { group, startPos, startRot }
    this.ballRadius = 1.0;
    this.disposed = false;

    // Animation state (mutated by GSAP)
    this.state = {
      ballY: 4,
      ballZ: 3.535,
      ballRotX: -0.839,
      camY: 1.8,
      camZOffset: 4,
      camLookY: 0.4,
      pinProgress: 0,      // 0 = standing, 1 = fully scattered
      veilOpacity: 1,
      flashOpacity: 0,
    };
  }

  /* ═══════════════════════════════════════════
     INIT — Setup everything
     ═══════════════════════════════════════════ */
  async init() {
    this._createRenderer();
    this._createScene();
    this._createCamera();
    this._createLighting();
    this._createEnvironmentMap();
    await this._loadModel();
    this._buildTimeline();
    this._bindResize();
    this.animate();
  }

  /* ─── Renderer ─── */
  _createRenderer() {
    const canvas = this.container.querySelector('canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x050505, 1);
  }

  /* ─── Scene ─── */
  _createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050505, 0.02);
  }

  /* ─── Camera ─── */
  _createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(0, 1.8, 7.5);
  }

  /* ─── Studio-Grade Lighting Rig ─── */
  _createLighting() {
    // Initialize RectAreaLight uniforms
    RectAreaLightUniformsLib.init();

    // 1. KEY LIGHT — DirectionalLight with soft shadows
    const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.5);
    keyLight.position.set(3, 8, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // 2. FLUORESCENT LEFT — RectAreaLight (long panel over left gutter)
    const fluorL = new THREE.RectAreaLight(0xffe8d0, 4, 8, 0.3);
    fluorL.position.set(-1.5, 4, -3);
    fluorL.lookAt(-1.5, 0, -3);
    this.scene.add(fluorL);

    // 3. FLUORESCENT RIGHT — Mirror
    const fluorR = new THREE.RectAreaLight(0xffe8d0, 4, 8, 0.3);
    fluorR.position.set(1.5, 4, -3);
    fluorR.lookAt(1.5, 0, -3);
    this.scene.add(fluorR);

    // 4. HEMISPHERE FILL — subtle ambient
    const hemi = new THREE.HemisphereLight(0xb0c4ff, 0x1a0800, 0.15);
    this.scene.add(hemi);

    // 5. RIM / BACK LIGHT — warm accent behind pins
    const rimLight = new THREE.PointLight(0xffa040, 2, 15, 2);
    rimLight.position.set(0, 2, -7);
    this.scene.add(rimLight);
  }

  /* ─── PMREM Environment Map (procedural) ─── */
  _createEnvironmentMap() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // Build a simple "room" scene for reflections
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x111111);

    // Overhead emissive panels (simulate fluorescent ceiling lights)
    const panelGeo = new THREE.PlaneGeometry(6, 1);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const panel1 = new THREE.Mesh(panelGeo, panelMat);
    panel1.position.set(0, 5, -2);
    panel1.rotation.x = Math.PI / 2;
    envScene.add(panel1);

    const panel2 = panel1.clone();
    panel2.position.set(0, 5, -5);
    envScene.add(panel2);

    // Warm floor bounce
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x3a2a10,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    envScene.add(floor);

    // Generate PMREM
    const renderTarget = pmremGenerator.fromScene(envScene, 0.04);
    this.scene.environment = renderTarget.texture;

    // Cleanup
    pmremGenerator.dispose();
    panelGeo.dispose();
    panelMat.dispose();
    floorGeo.dispose();
    floorMat.dispose();
  }

  /* ─── Load GLB Model ─── */
  async _loadModel() {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        '/Bowling.glb',
        (gltf) => {
          const model = gltf.scene;

          // Find ball — try both naming conventions
          let ballMesh = null;
          let pinMeshes = [];
          let floorMesh = null;

          model.traverse((child) => {
            const name = child.name.toLowerCase();

            // Ball detection
            if (name === 'bowling_ball' || name === 'bola') {
              ballMesh = child;
            }
            // Floor detection
            if (name === 'floor' || name === 'piso') {
              floorMesh = child;
            }
          });

          // Pin detection: robust multi-strategy approach
          const pinosGroup = model.getObjectByName('pinos');
          if (pinosGroup) {
            // Strategy 1: Named group 'pinos' (future re-export)
            pinosGroup.children.forEach((child) => {
              if (child.isGroup || child.isMesh) pinMeshes.push(child);
            });
          } else {
            // Strategy 2: Find parent groups containing meshes with 'Pin' material
            // In the current GLB, each pin is a pair of meshes (Pin body + Stripe)
            // sharing the same parent group.
            const pinParents = new Set();
            model.traverse((child) => {
              if (child.isMesh) {
                const matName = child.material?.name || '';
                if (matName === 'Pin' || matName === 'Stripe') {
                  const parent = child.parent;
                  if (parent && parent !== model && !pinParents.has(parent)) {
                    // Ensure this parent is not the ball, floor, or light
                    const parentName = parent.name.toLowerCase();
                    if (!parentName.includes('ball') && !parentName.includes('bola') &&
                        !parentName.includes('floor') && !parentName.includes('light')) {
                      pinParents.add(parent);
                      pinMeshes.push(parent);
                    }
                  }
                }
              }
            });
          }

          // ═══ MATERIAL OVERRIDES ═══

          // Ball: ultra-glossy MeshPhysicalMaterial
          if (ballMesh) {
            const ballMat = new THREE.MeshPhysicalMaterial({
              color: 0x1a0040,
              roughness: 0.03,
              metalness: 0.1,
              clearcoat: 1.0,
              clearcoatRoughness: 0.03,
              reflectivity: 1.0,
              envMapIntensity: 1.5,
            });
            if (ballMesh.isMesh) {
              ballMesh.material = ballMat;
            } else {
              ballMesh.traverse((c) => {
                if (c.isMesh) c.material = ballMat;
              });
            }
            ballMesh.castShadow = true;
            ballMesh.receiveShadow = true;
            this.ball = ballMesh;

            // Calculate ball radius from bounding sphere
            const box = new THREE.Box3().setFromObject(ballMesh);
            const size = new THREE.Vector3();
            box.getSize(size);
            this.ballRadius = Math.max(size.x, size.y, size.z) / 2;
          }

          // Pins: polished white with red stripes
          const pinBodyMat = new THREE.MeshStandardMaterial({
            color: 0xf5f0e8,
            roughness: 0.2,
            metalness: 0.05,
            envMapIntensity: 0.8,
          });
          const pinStripeMat = new THREE.MeshStandardMaterial({
            color: 0xcc0020,
            roughness: 0.25,
            metalness: 0.05,
            emissive: 0x330000,
            emissiveIntensity: 0.1,
            envMapIntensity: 0.6,
          });

          pinMeshes.forEach((pinGroup) => {
            pinGroup.traverse((c) => {
              if (c.isMesh) {
                const matName = c.material?.name?.toLowerCase() || '';
                if (matName.includes('stripe') || matName.includes('franja')) {
                  c.material = pinStripeMat;
                } else {
                  c.material = pinBodyMat;
                }
                c.castShadow = true;
                c.receiveShadow = true;
              }
            });

            // Store original transform for scatter animation
            this.pins.push({
              group: pinGroup,
              startPos: pinGroup.position.clone(),
              startRot: pinGroup.rotation.clone(),
            });
          });

          // Floor: polished wood with procedural texture
          if (floorMesh) {
            const woodTex = this._createWoodTexture();
            const floorMat = new THREE.MeshStandardMaterial({
              map: woodTex,
              color: 0xaa8866,
              roughness: 0.12,
              metalness: 0.25,
              envMapIntensity: 1.0,
            });
            if (floorMesh.isMesh) {
              floorMesh.material = floorMat;
            } else {
              floorMesh.traverse((c) => {
                if (c.isMesh) c.material = floorMat;
              });
            }
            floorMesh.receiveShadow = true;
          }

          // Hide blender lights and enable shadows on remaining meshes
          model.traverse((child) => {
            if (child.name.toLowerCase().includes('light')) {
              child.visible = false;
            } else if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.scene.add(model);
          resolve();
        },
        undefined,
        reject
      );
    });
  }

  /* ─── Procedural Wood Texture ─── */
  _createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base wood color (warm amber)
    ctx.fillStyle = '#3a2a10';
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle grain variation
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 1024;
      const w = Math.random() * 3 + 1;
      const h = Math.random() * 20 + 5;
      ctx.fillStyle = `rgba(${50 + Math.random() * 30}, ${30 + Math.random() * 20}, ${5 + Math.random() * 10}, ${0.05 + Math.random() * 0.08})`;
      ctx.fillRect(x, y, w, h);
    }

    // Lane planks (39 boards)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    const planks = 39;
    for (let i = 1; i < planks; i++) {
      const x = (512 / planks) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();

      // Staggered plank joints
      for (let j = 0; j < 6; j++) {
        const y = Math.random() * 1024;
        ctx.beginPath();
        ctx.moveTo(x - (512 / planks), y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 12);
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ═══════════════════════════════════════════
     GSAP SCROLLTRIGGER TIMELINE
     ═══════════════════════════════════════════ */
  _buildTimeline() {
    const s = this.state;
    const self = this;

    // Ball travel distance for rolling calc
    const ballStartZ = 3.535;
    const ballEndZ = -5.5;
    const ballTravelDistance = Math.abs(ballEndZ - ballStartZ);  // ~9.035
    const totalRollRotation = -(ballTravelDistance / this.ballRadius);

    // scrollContainer is the 400vh .strike-finale-container
    const triggerEl = this.scrollContainer || this.container;

    this.timeline = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        // No pin — the sticky viewport in CSS handles that
      },
    });

    const tl = this.timeline;

    // ─── PHASE 1: Entry veil fade + ball drop (0% → 8%) ───
    tl.to(s, {
      veilOpacity: 0,
      duration: 0.08,
      ease: 'power2.out',
    }, 0);

    tl.to(s, {
      ballY: 1.017,
      duration: 0.08,
      ease: 'power2.out',
    }, 0);

    // ─── PHASE 2: Ball rolls forward (8% → 55%) ───
    tl.to(s, {
      ballZ: ballEndZ,
      ballRotX: -0.839 + totalRollRotation,  // accurate rolling: Δrot = -distance/radius
      duration: 0.47,  // 0.55 - 0.08
      ease: 'none',    // linear for physically accurate roll
    }, 0.08);

    // Camera rises and tightens during roll
    tl.to(s, {
      camY: 1.2,
      camZOffset: 3,
      camLookY: 0.3,
      duration: 0.47,
      ease: 'power1.inOut',
    }, 0.08);

    // ─── PHASE 3: Impact flash (55% → 65%) ───
    tl.to(s, {
      flashOpacity: 1,
      duration: 0.03,
      ease: 'power3.out',
    }, 0.55);
    tl.to(s, {
      flashOpacity: 0,
      duration: 0.07,
      ease: 'power2.in',
    }, 0.58);

    // ─── PHASE 4: Pin scatter (55% → 80%) ───
    tl.to(s, {
      pinProgress: 1,
      duration: 0.25,
      ease: 'power2.out',
    }, 0.55);

    // Ball continues through pins
    tl.to(s, {
      ballZ: -8,
      duration: 0.25,
      ease: 'power2.out',
    }, 0.55);

    // ─── PHASE 5: Camera pull-back + exit veil (80% → 100%) ───
    tl.to(s, {
      camY: 2.5,
      camZOffset: 6,
      duration: 0.20,
      ease: 'power1.inOut',
    }, 0.80);

    tl.to(s, {
      veilOpacity: 0.3,
      duration: 0.20,
      ease: 'power1.in',
    }, 0.80);

    this.scrollTrigger = this.timeline.scrollTrigger;
  }

  /* ═══════════════════════════════════════════
     ANIMATE LOOP
     ═══════════════════════════════════════════ */
  animate() {
    if (this.disposed) return;

    this.animId = requestAnimationFrame(() => this.animate());
    this._updateScene();
    this.renderer.render(this.scene, this.camera);
  }

  _updateScene() {
    const s = this.state;

    // ─── Update ball position & rotation ───
    if (this.ball) {
      this.ball.position.y = s.ballY;
      this.ball.position.z = s.ballZ;
      this.ball.rotation.x = s.ballRotX;
    }

    // ─── Update camera tracking ───
    const bz = s.ballZ;
    this.camera.position.set(0, s.camY, bz + s.camZOffset);
    this.camera.lookAt(0, s.camLookY, bz - 2);

    // ─── Update pin scatter ───
    const t = s.pinProgress;
    this.pins.forEach((pin, i) => {
      const scatter = SCATTER_DIRS[i % SCATTER_DIRS.length];
      const g = pin.group;

      g.position.x = pin.startPos.x + scatter.dx * t;
      g.position.y = pin.startPos.y + scatter.dy * t;
      g.position.z = pin.startPos.z + scatter.dz * t;

      g.rotation.x = pin.startRot.x + scatter.rx * t;
      g.rotation.y = pin.startRot.y + scatter.ry * t;
      g.rotation.z = pin.startRot.z + scatter.rz * t;
    });

    // ─── Update overlays ───
    if (this.overlays.veil) {
      this.overlays.veil.style.opacity = s.veilOpacity;
    }
    if (this.overlays.flash) {
      this.overlays.flash.style.opacity = s.flashOpacity;
    }
  }

  /* ═══════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════ */
  _bindResize() {
    this._onResize = () => {
      if (this.disposed) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this._onResize);
  }

  /* ═══════════════════════════════════════════
     DISPOSE — cleanup for React unmount
     ═══════════════════════════════════════════ */
  dispose() {
    this.disposed = true;

    if (this.animId) cancelAnimationFrame(this.animId);

    if (this.timeline) {
      this.timeline.kill();
    }
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    window.removeEventListener('resize', this._onResize);

    // Dispose Three.js resources
    this.scene?.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });

    this.renderer?.dispose();

    // Kill all ScrollTrigger instances related to this scene
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }
}
