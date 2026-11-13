import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const FIELD_WIDTH = 72;
const FIELD_DEPTH = 100;
const ENEMY_BASE = new THREE.Vector3(0, 0, -42);
const PLAYER_BASE = new THREE.Vector3(0, 0, FIELD_DEPTH / 2 - 5);
const DEPLOYMENT_LINE_Z = 0;
const PLAYER_BASE_HEALTH = 900;
const MAX_PLAYER_UNITS = 18;
const UNIT_CATALOG = [
  { id: "tank", name: "Main battle tank", shortName: "Battle tank", speed: 5.2, hp: 180, damage: 30, range: 18, cooldown: 1.1, projectileSpeed: 26, detectionRange: 34, color: 0x829264 },
  { id: "scout", name: "Recon scout", shortName: "Recon scout", speed: 8.5, hp: 90, damage: 14, range: 13, cooldown: 0.65, projectileSpeed: 30, detectionRange: 30, color: 0x9aab70 },
  { id: "artillery", name: "Field artillery", shortName: "Artillery", speed: 3.4, hp: 160, damage: 48, range: 30, cooldown: 2.2, projectileSpeed: 24, detectionRange: 42, color: 0x777e68 },
  { id: "helicopter", name: "Attack helicopter", shortName: "Helicopter", speed: 9.2, hp: 130, damage: 22, range: 20, cooldown: 0.8, projectileSpeed: 30, detectionRange: 36, color: 0x73845d, air: true },
];
const LEVELS = [
  {
    name: "Green Valley",
    brief: "Clear the valley defenses and destroy the hostile base.",
    sky: 0x899487,
    groundTint: 0xffffff,
    enemyTint: 0xc6533f,
    baseHealth: 320,
    enemyStrength: 0.82,
    enemies: [
      { type: "scout", x: -8, z: -28 },
      { type: "tank", x: 7, z: -31 },
      { type: "scout", x: 1, z: -22 },
    ],
  },
  {
    name: "Dustline Pass",
    brief: "The pass is reinforced. Break through and capture the crossing.",
    sky: 0x9b8c76,
    groundTint: 0xd5c29a,
    enemyTint: 0xd87a4f,
    baseHealth: 520,
    enemyStrength: 1.12,
    enemies: [
      { type: "tank", x: -12, z: -31 },
      { type: "scout", x: 10, z: -29 },
      { type: "artillery", x: -3, z: -35 },
      { type: "helicopter", x: 7, z: -24 },
      { type: "tank", x: 0, z: -20 },
    ],
  },
  {
    name: "Blackstone Yard",
    brief: "Their strongest force guards the industrial yard. Take it to finish the campaign.",
    sky: 0x737b80,
    groundTint: 0xc1c5c0,
    enemyTint: 0xff7655,
    baseHealth: 760,
    enemyStrength: 1.42,
    enemies: [
      { type: "tank", x: -14, z: -32 },
      { type: "artillery", x: 12, z: -34 },
      { type: "scout", x: -6, z: -24 },
      { type: "helicopter", x: 6, z: -26 },
      { type: "tank", x: 1, z: -37 },
      { type: "artillery", x: -12, z: -20 },
      { type: "scout", x: 13, z: -21 },
    ],
  },
];
const TREAD_LINK_COUNT = 40;
const TREAD_LINK_GEOMETRY = new THREE.BoxGeometry(0.48, 0.14, 0.17);
const TREAD_MATERIAL = standardMaterial(0x303630, { roughness: 0.96, metalness: 0.08 });
const TREAD_LUG_GEOMETRY = new THREE.BoxGeometry(0.16, 0.09, 0.17);
const TREAD_LUG_MATERIAL = standardMaterial(0x41483e, { roughness: 0.96, metalness: 0.08 });

const $ = (id) => document.getElementById(id);

function standardMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.12, ...options });
}

function addBox(parent, material, size, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(parent, material, radiusTop, radiusBottom, height, position, segments = 12) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material,
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeBladeGeometry(length, width) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.12, 0.24);
  shape.lineTo(-width * 0.3, length * 0.34);
  shape.lineTo(-width * 0.54, length * 0.88);
  shape.quadraticCurveTo(-width * 0.57, length, -width * 0.27, length);
  shape.lineTo(width * 0.34, length);
  shape.quadraticCurveTo(width * 0.56, length * 0.97, width * 0.48, length * 0.88);
  shape.lineTo(width * 0.27, length * 0.34);
  shape.lineTo(width * 0.13, 0.24);
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 8);
}

const MAIN_ROTOR_BLADE_GEOMETRY = makeBladeGeometry(5.2, 0.72);
const TAIL_ROTOR_BLADE_GEOMETRY = makeBladeGeometry(1.05, 0.28);
const ROTOR_BLADE_MATERIAL = standardMaterial(0x303832, { side: THREE.DoubleSide, metalness: 0.22 });
const ROTOR_TRIM_MATERIAL = standardMaterial(0x9ba18c, { side: THREE.DoubleSide, metalness: 0.35 });
const ROTOR_TRIM_GEOMETRY = new THREE.BoxGeometry(0.035, 0.035, 3.2);
const SHARED_GEOMETRIES = new Set([
  TREAD_LINK_GEOMETRY,
  TREAD_LUG_GEOMETRY,
  MAIN_ROTOR_BLADE_GEOMETRY,
  TAIL_ROTOR_BLADE_GEOMETRY,
  ROTOR_TRIM_GEOMETRY,
]);
const SHARED_MATERIALS = new Set([
  TREAD_MATERIAL,
  TREAD_LUG_MATERIAL,
  ROTOR_BLADE_MATERIAL,
  ROTOR_TRIM_MATERIAL,
]);

function createHealthBar(scene, color, width) {
  const group = new THREE.Group();
  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x171c19, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
  );
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.08, 0.09),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
  );
  fill.position.z = 0.006;
  group.add(background, fill);
  scene.add(group);
  return { group, fill, width: width - 0.08 };
}

function updateHealthBar(bar, position, hp, maxHp, camera) {
  const ratio = THREE.MathUtils.clamp(hp / maxHp, 0, 1);
  bar.group.position.copy(position);
  bar.group.quaternion.copy(camera.quaternion);
  bar.fill.scale.x = ratio;
  bar.fill.position.x = -(1 - ratio) * bar.width / 2;
}

// The shared movement contract keeps each model free to define its own visuals.
class Unit {
  constructor(scene, config, position, team) {
    this.scene = scene;
    this.config = config;
    this.team = team;
    this.isEnemy = team === "enemy";
    this.root = new THREE.Group();
    this.root.position.copy(position);
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.cooldownRemaining = 0;
    this.destroyed = false;
    this.buildModel();
    this.scene.add(this.root);
    this.healthBar = createHealthBar(scene, this.isEnemy ? 0xff7655 : 0xd7f06a, 2.6);
  }

  buildModel() {}

  update(delta, battlefield) {
    if (this.hp <= 0) return;
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);

    let target = null;
    let closestDistance = this.config.detectionRange;
    for (const candidate of battlefield.units) {
      if (candidate.team === this.team || candidate.hp <= 0) continue;
      const distance = this.root.position.distanceTo(candidate.root.position);
      if (distance < closestDistance) {
        target = candidate;
        closestDistance = distance;
      }
    }

    if (!target) target = this.team === "player" ? battlefield.enemyBase : battlefield.playerBase;
    const targetPosition = target.root.position;
    const dx = targetPosition.x - this.root.position.x;
    const dz = targetPosition.z - this.root.position.z;
    const distance = Math.hypot(dx, dz);
    this.root.rotation.y = Math.atan2(dx, dz);

    if (distance <= this.config.range) {
      if (this.cooldownRemaining === 0 && target.hp > 0) {
        battlefield.spawnProjectile(this, target);
        this.cooldownRemaining = this.config.cooldown;
      }
    } else {
      const desiredDistance = this.config.range * 0.82;
      const travel = Math.min(this.config.speed * delta, Math.max(0, distance - desiredDistance));
      if (travel > 0) {
        this.root.position.x += (dx / distance) * travel;
        this.root.position.z += (dz / distance) * travel;
      }
    }

    this.animate(delta);
    this.updateHealthBar(battlefield.camera);
  }

  getAimPoint() {
    return new THREE.Vector3(
      this.root.position.x,
      this.root.position.y + (this.config.air ? 0 : 1.15),
      this.root.position.z,
    );
  }

  updateHealthBar(camera) {
    updateHealthBar(
      this.healthBar,
      new THREE.Vector3(this.root.position.x, this.root.position.y + (this.config.air ? 6.4 : 3.1), this.root.position.z),
      this.hp,
      this.maxHp,
      camera,
    );
  }

  takeDamage(damage, battlefield) {
    if (this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - damage);
    if (this.hp === 0) battlefield.onUnitDestroyed(this);
    else this.updateHealthBar(battlefield.camera);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.scene.remove(this.root);
    this.scene.remove(this.healthBar.group);
    const geometries = new Set();
    const materials = new Set();
    this.root.traverse((object) => {
      if (!object.isMesh) return;
      if (object.geometry && !SHARED_GEOMETRIES.has(object.geometry)) geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of list) {
        if (material && !SHARED_MATERIALS.has(material)) materials.add(material);
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    this.healthBar.group.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
  }

  animate() {}
}

class BattleBase {
  constructor(scene, position, isEnemy, maxHp) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.position.copy(position);
    this.isEnemy = isEnemy;
    this.hp = maxHp;
    this.maxHp = maxHp;
    this.attackRadius = 4.5;

    const color = isEnemy ? 0xff7655 : 0xd7f06a;
    const structure = standardMaterial(isEnemy ? 0x55433b : 0x414d38);
    const markerMaterial = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.28 });
    addBox(this.root, structure, [8, 1.6, 6], [0, 0.8, 0]);
    addBox(this.root, structure, [3, 3.2, 3], [0, 2.4, 0]);
    addCylinder(this.root, markerMaterial, 0.22, 0.22, 4, [0, 5, 0]);
    const marker = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.85, 0.12), markerMaterial);
    marker.position.set(0.9, 6.35, 0);
    this.root.add(marker);
    this.scene.add(this.root);
    this.healthBar = createHealthBar(scene, color, 8.5);
  }

  getAimPoint() {
    return new THREE.Vector3(this.root.position.x, 3.4, this.root.position.z);
  }

  resetHealth(maxHp) {
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  updateHealthBar(camera) {
    updateHealthBar(
      this.healthBar,
      new THREE.Vector3(this.root.position.x, 9.2, this.root.position.z),
      this.hp,
      this.maxHp,
      camera,
    );
  }

  takeDamage(damage, battlefield) {
    if (this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - damage);
    if (this.hp === 0) {
      battlefield.refreshHud();
      battlefield.finishGame(this.isEnemy ? "victory" : "defeat");
    } else {
      battlefield.refreshHud();
    }
  }
}

class Tank extends Unit {
  buildModel() {
    const hullMaterial = standardMaterial(this.config.color);
    const detailMaterial = standardMaterial(0xc0c79c, { metalness: 0.25 });

    addBox(this.root, hullMaterial, [2.4, 0.72, 3.4], [0, 0.84, 0]);
    for (const side of [-1, 1]) {
      this.addTread(side);
      for (let wheel = 0; wheel < 4; wheel++) {
        const roller = addCylinder(
          this.root, detailMaterial, 0.24, 0.24, 0.14,
          [side * 1.6, 0.53, -1.15 + wheel * 0.76],
        );
        roller.rotation.z = Math.PI / 2;
      }
    }

    const turret = new THREE.Group();
    turret.position.set(0, 1.28, 0);
    this.root.add(turret);
    addBox(turret, hullMaterial, [1.65, 0.66, 1.8], [0, 0, 0]);
    const barrel = addCylinder(turret, TREAD_MATERIAL, 0.12, 0.17, 2, [0, 0, 1.35]);
    barrel.rotation.x = Math.PI / 2;
    this.root.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });
  }

  addTread(side) {
    // Instancing keeps the many individual shoes inexpensive as armies grow.
    const tread = new THREE.InstancedMesh(TREAD_LINK_GEOMETRY, TREAD_MATERIAL, TREAD_LINK_COUNT);
    const lugs = new THREE.InstancedMesh(TREAD_LUG_GEOMETRY, TREAD_LUG_MATERIAL, TREAD_LINK_COUNT);
    const transform = new THREE.Object3D();
    for (let i = 0; i < TREAD_LINK_COUNT; i++) {
      const angle = (i / TREAD_LINK_COUNT) * Math.PI * 2;
      const vertical = 0.58 + 0.42 * Math.sin(angle);
      const forward = 1.35 * Math.cos(angle);
      const verticalTangent = 0.42 * Math.cos(angle);
      const forwardTangent = -1.35 * Math.sin(angle);
      transform.position.set(side * 1.35, vertical, forward);
      transform.rotation.set(Math.atan2(-verticalTangent, forwardTangent), 0, 0);
      transform.updateMatrix();
      tread.setMatrixAt(i, transform.matrix);

      transform.position.x -= side * 0.08;
      transform.position.y += 0.1;
      transform.updateMatrix();
      lugs.setMatrixAt(i, transform.matrix);
    }
    tread.instanceMatrix.needsUpdate = true;
    lugs.instanceMatrix.needsUpdate = true;
    tread.castShadow = true;
    tread.receiveShadow = true;
    lugs.castShadow = true;
    this.root.add(tread);
    this.root.add(lugs);
  }
}

class ReconScout extends Tank {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x282e29);
    const glass = standardMaterial(0x99a998, { metalness: 0.35, roughness: 0.35 });
    addBox(this.root, body, [1.65, 0.7, 2.6], [0, 0.78, 0]);
    addBox(this.root, glass, [1.25, 0.52, 1.05], [0, 1.34, -0.15]);
    for (const side of [-1, 1]) {
      for (const axle of [-0.82, 0.82]) {
        const wheel = addCylinder(this.root, dark, 0.43, 0.43, 0.22, [side * 0.91, 0.43, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }
  }
}

class Artillery extends Tank {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x282e29);
    addBox(this.root, body, [2.5, 0.78, 3.5], [0, 0.78, 0]);
    for (const side of [-1, 1]) {
      addBox(this.root, dark, [0.45, 0.8, 3.7], [side * 1.35, 0.53, 0]);
    }
    const barrel = addCylinder(this.root, dark, 0.18, 0.26, 3.5, [0, 1.35, 0.85]);
    barrel.rotation.x = Math.PI / 2;
  }
}

class Helicopter extends Unit {
  buildModel() {
    // The unit root is raised above the ground; the rotor animates independently.
    this.root.position.y = 3.1;
    const body = standardMaterial(this.config.color);
    const glass = standardMaterial(0x9aada2, { metalness: 0.3, roughness: 0.3 });
    const dark = standardMaterial(0x252b27);

    const fuselage = addBox(this.root, body, [1.25, 0.95, 2.8], [0, 0, 0]);
    fuselage.rotation.x = -0.08;
    addBox(this.root, glass, [1.05, 0.62, 0.75], [0, 0.08, 0.86]);
    const tail = addBox(this.root, body, [0.34, 0.35, 2.3], [0, 0.18, -2.35]);
    tail.rotation.x = -0.12;
    addBox(this.root, body, [1.5, 0.14, 0.42], [0, -0.16, -1.3]);
    addCylinder(this.root, dark, 0.11, 0.11, 0.32, [0, 0.55, 0]);

    this.rotor = new THREE.Group();
    this.rotor.position.y = 0.73;
    this.root.add(this.rotor);
    for (let blade = 0; blade < 2; blade++) {
      const angle = (blade / 2) * Math.PI * 2;
      const bladeMesh = new THREE.Mesh(MAIN_ROTOR_BLADE_GEOMETRY, ROTOR_BLADE_MATERIAL);
      bladeMesh.rotation.set(Math.PI / 2, angle, 0);
      bladeMesh.castShadow = true;
      this.rotor.add(bladeMesh);

      const trim = new THREE.Mesh(ROTOR_TRIM_GEOMETRY, ROTOR_TRIM_MATERIAL);
      trim.position.set(0, 0.025, 3.05);
      trim.rotation.y = angle;
      trim.castShadow = true;
      this.rotor.add(trim);
    }
    addCylinder(this.rotor, dark, 0.3, 0.36, 0.24, [0, 0, 0]);
    addCylinder(this.rotor, ROTOR_TRIM_MATERIAL, 0.13, 0.18, 0.28, [0, 0.2, 0]);

    this.tailRotor = new THREE.Group();
    this.tailRotor.position.set(0, 0.3, -3.48);
    this.root.add(this.tailRotor);
    for (let blade = 0; blade < 4; blade++) {
      const bladeMesh = new THREE.Mesh(TAIL_ROTOR_BLADE_GEOMETRY, ROTOR_BLADE_MATERIAL);
      bladeMesh.rotation.z = (blade / 4) * Math.PI * 2;
      this.tailRotor.add(bladeMesh);
    }
    const tailHub = addCylinder(this.tailRotor, dark, 0.13, 0.16, 0.24, [0, 0, 0]);
    tailHub.rotation.x = Math.PI / 2;

    const legMaterial = standardMaterial(0x343b34);
    for (const side of [-1, 1]) {
      const skid = addBox(this.root, legMaterial, [0.12, 0.12, 2.35], [side * 0.85, -0.74, 0.05]);
      skid.rotation.y = 0.04;
      addBox(this.root, legMaterial, [0.1, 0.68, 0.1], [side * 0.58, -0.43, 0.15]);
    }
  }

  get arrivalRadius() {
    return 4.5;
  }

  animate(delta) {
    this.rotor.rotation.y += delta * 18;
    this.tailRotor.rotation.z += delta * 22;
    this.root.position.y = 3.1 + Math.sin(performance.now() * 0.003) * 0.12;
  }
}

const UNIT_TYPES = {
  tank: Tank,
  scout: ReconScout,
  artillery: Artillery,
  helicopter: Helicopter,
};

class Battlefield {
  constructor() {
    this.mount = $("game");
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x899487);
    this.scene.fog = new THREE.Fog(0x899487, 95, 190);
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 260);
    this.camera.position.set(0, 80, 84);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.mount.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.units = [];
    this.projectiles = [];
    this.selectedUnit = UNIT_CATALOG[0];
    this.levelIndex = 0;
    this.mode = "battle";
    this.toastTimer = 0;
    this.clock = new THREE.Clock();

    this.createLighting();
    this.createGround();
    this.createTerrainFeatures();
    this.createBases();
    this.createUnitMenu();
    this.bindEvents();
    this.loadLevel(0, true);
    this.animate();
  }

  createLighting() {
    this.scene.add(new THREE.HemisphereLight(0xe4ebd8, 0x353b2d, 2.1));
    const sun = new THREE.DirectionalLight(0xffe6bd, 3);
    sun.position.set(-34, 60, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -55;
    sun.shadow.camera.right = 55;
    sun.shadow.camera.top = 65;
    sun.shadow.camera.bottom = -65;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
  }

  createGround() {
    const terrainTexture = this.createTerrainTexture();
    terrainTexture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 16);
    const terrainBump = terrainTexture.clone();
    terrainBump.colorSpace = THREE.NoColorSpace;
    terrainBump.needsUpdate = true;
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(FIELD_WIDTH, FIELD_DEPTH),
      standardMaterial(0xffffff, {
        map: terrainTexture,
        bumpMap: terrainBump,
        bumpScale: 0.12,
        roughness: 1,
        metalness: 0,
      }),
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.deploymentZone = new THREE.Mesh(
      new THREE.PlaneGeometry(FIELD_WIDTH, FIELD_DEPTH / 2),
      new THREE.MeshBasicMaterial({ color: 0x9cb15c, transparent: true, opacity: 0.09 }),
    );
    this.deploymentZone.rotation.x = -Math.PI / 2;
    this.deploymentZone.position.set(0, 0.035, FIELD_DEPTH / 4);
    this.scene.add(this.deploymentZone);

    this.enemyZone = new THREE.Mesh(
      new THREE.PlaneGeometry(FIELD_WIDTH, FIELD_DEPTH / 2),
      new THREE.MeshBasicMaterial({ color: 0xc6533f, transparent: true, opacity: 0.07 }),
    );
    this.enemyZone.rotation.x = -Math.PI / 2;
    this.enemyZone.position.set(0, 0.03, -FIELD_DEPTH / 4);
    this.scene.add(this.enemyZone);

    const grid = new THREE.GridHelper(FIELD_DEPTH, 40, 0xa2ac8a, 0x8c9877);
    grid.position.y = 0.045;
    grid.material.transparent = true;
    grid.material.opacity = 0.16;
    this.scene.add(grid);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-FIELD_WIDTH / 2, 0.06, DEPLOYMENT_LINE_Z),
      new THREE.Vector3(FIELD_WIDTH / 2, 0.06, DEPLOYMENT_LINE_Z),
    ]);
    this.scene.add(new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xd7f06a, transparent: true, opacity: 0.7 })));
  }

  createTerrainTexture() {
    const size = 2048;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create the battlefield terrain texture.");

    const image = context.createImageData(size, size);
    const columnVariation = new Float32Array(size);
    const rowVariation = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      columnVariation[i] = Math.sin(i * 0.018) * 3.5 + Math.sin(i * 0.004) * 4;
      rowVariation[i] = Math.cos(i * 0.016) * 3 + Math.sin(i * 0.006) * 4;
    }

    let seed = 0x31a7f00d;
    const pixels = image.data;
    for (let pixel = 0; pixel < size * size; pixel++) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      const x = pixel % size;
      const y = Math.floor(pixel / size);
      const noise = ((seed >>> 0) / 0xffffffff - 0.5) * 24 + columnVariation[x] + rowVariation[y];
      const offset = pixel * 4;
      pixels[offset] = Math.max(0, Math.min(255, 87 + noise));
      pixels[offset + 1] = Math.max(0, Math.min(255, 99 + noise));
      pixels[offset + 2] = Math.max(0, Math.min(255, 72 + noise * 0.8));
      pixels[offset + 3] = 255;
    }
    context.putImageData(image, 0, 0);

    // Fine-grain flecks, shallow craters, and worn paths make the texture read at an angle.
    let detailSeed = 58123;
    const random = () => {
      detailSeed = (detailSeed * 1664525 + 1013904223) >>> 0;
      return detailSeed / 0x100000000;
    };
    for (let i = 0; i < 5200; i++) {
      const x = random() * size;
      const y = random() * size;
      const radius = 0.5 + random() * 2.4;
      context.fillStyle = random() > 0.5 ? "rgba(25,32,24,.12)" : "rgba(205,190,143,.12)";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    for (let i = 0; i < 22; i++) {
      const x = random() * size;
      const y = random() * size;
      const radius = 12 + random() * 34;
      context.strokeStyle = "rgba(34,40,29,.13)";
      context.lineWidth = 2 + random() * 3;
      context.beginPath();
      context.ellipse(x, y, radius * 1.35, radius, random() * Math.PI, 0, Math.PI * 2);
      context.stroke();
    }
    context.strokeStyle = "rgba(171,165,125,.16)";
    context.lineWidth = 20;
    context.beginPath();
    context.moveTo(size * 0.17, size * 0.91);
    context.bezierCurveTo(size * 0.28, size * 0.73, size * 0.66, size * 0.62, size * 0.84, size * 0.12);
    context.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  createTerrainFeatures() {
    let seed = 90317;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    const transform = new THREE.Object3D();

    const rockMaterial = standardMaterial(0x797766, { roughness: 1 });
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 1), rockMaterial, 72);
    rocks.receiveShadow = true;
    for (let i = 0; i < rocks.count; i++) {
      const x = (random() - 0.5) * (FIELD_WIDTH - 5);
      const z = (random() - 0.5) * (FIELD_DEPTH - 8);
      const scale = 0.25 + random() * 0.85;
      transform.position.set(x, scale * 0.34, z);
      transform.rotation.set(random() * 1.1, random() * Math.PI, random() * 0.7);
      transform.scale.set(scale * (0.8 + random() * 0.8), scale * 0.65, scale * (0.7 + random() * 0.8));
      transform.updateMatrix();
      rocks.setMatrixAt(i, transform.matrix);
      rocks.setColorAt(i, new THREE.Color().setHSL(0.17 + random() * 0.04, 0.08 + random() * 0.12, 0.32 + random() * 0.18));
    }
    rocks.instanceMatrix.needsUpdate = true;
    if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;
    this.scene.add(rocks);

    const scrubMaterial = standardMaterial(0x75805c, { roughness: 1 });
    const scrubGeometry = new THREE.ConeGeometry(0.55, 1.25, 5);
    const scrub = new THREE.InstancedMesh(scrubGeometry, scrubMaterial, 120);
    for (let i = 0; i < scrub.count; i++) {
      const x = (random() - 0.5) * (FIELD_WIDTH - 3);
      const z = (random() - 0.5) * (FIELD_DEPTH - 5);
      const scale = 0.35 + random() * 0.85;
      transform.position.set(x, scale * 0.5, z);
      transform.rotation.set(0, random() * Math.PI, (random() - 0.5) * 0.18);
      transform.scale.set(scale, scale, scale);
      transform.updateMatrix();
      scrub.setMatrixAt(i, transform.matrix);
      scrub.setColorAt(i, new THREE.Color().setHSL(0.18 + random() * 0.08, 0.18 + random() * 0.2, 0.27 + random() * 0.18));
    }
    scrub.instanceMatrix.needsUpdate = true;
    if (scrub.instanceColor) scrub.instanceColor.needsUpdate = true;
    this.scene.add(scrub);

    const ridgeMaterial = standardMaterial(0x687362, { roughness: 1 });
    const ridges = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7, 2), ridgeMaterial, 18);
    for (let i = 0; i < ridges.count; i++) {
      const angle = (i / ridges.count) * Math.PI * 2;
      const height = 13 + random() * 24;
      const radius = 7 + random() * 10;
      transform.position.set(
        Math.cos(angle) * (FIELD_WIDTH / 2 + radius * 0.7),
        height / 2 - 1,
        Math.sin(angle) * (FIELD_DEPTH / 2 + radius * 0.7),
      );
      transform.rotation.set(0, random() * Math.PI, 0);
      transform.scale.set(radius, height, radius);
      transform.updateMatrix();
      ridges.setMatrixAt(i, transform.matrix);
      ridges.setColorAt(i, new THREE.Color().setHSL(0.23 + random() * 0.05, 0.1, 0.32 + random() * 0.14));
    }
    ridges.instanceMatrix.needsUpdate = true;
    if (ridges.instanceColor) ridges.instanceColor.needsUpdate = true;
    this.scene.add(ridges);
  }

  createBases() {
    this.enemyBase = new BattleBase(this.scene, ENEMY_BASE, true, LEVELS[0].baseHealth);
    this.playerBase = new BattleBase(this.scene, PLAYER_BASE, false, PLAYER_BASE_HEALTH);
  }

  createUnitMenu() {
    const list = $("unitList");
    for (const config of UNIT_CATALOG) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "unit-card";
      button.dataset.unit = config.id;
      button.setAttribute("aria-pressed", String(config.id === this.selectedUnit.id));
      button.innerHTML = `<span class="unit-card-name">${config.name}</span><span class="unit-card-detail">HP ${config.hp} · DMG ${config.damage}</span>`;
      button.addEventListener("click", () => this.selectUnit(config));
      list.appendChild(button);
    }
    this.updateSelectionHint();
  }

  selectUnit(config) {
    this.selectedUnit = config;
    for (const button of $("unitList").querySelectorAll(".unit-card")) {
      button.setAttribute("aria-pressed", String(button.dataset.unit === config.id));
    }
    this.updateSelectionHint();
  }

  updateSelectionHint() {
    $("selectionHint").textContent = `${this.selectedUnit.shortName.toUpperCase()} SELECTED`;
  }

  bindEvents() {
    this.renderer.domElement.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      this.deployAtPointer(event);
    });
    $("messagePrimary").addEventListener("click", () => {
      if (this.mode === "defeat") {
        this.loadLevel(this.levelIndex, true);
      } else if (this.mode === "victory" && this.levelIndex < LEVELS.length - 1) {
        this.loadLevel(this.levelIndex + 1);
      } else {
        this.loadLevel(0, true);
      }
    });
    $("messageSecondary").addEventListener("click", () => this.loadLevel(0, true));
    window.addEventListener("resize", () => this.resize());
  }

  deployAtPointer(event) {
    if (this.mode !== "battle") return;
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const [intersection] = this.raycaster.intersectObject(this.ground, false);
    if (!intersection) return;

    const point = intersection.point;
    if (point.z < DEPLOYMENT_LINE_Z || Math.abs(point.x) > FIELD_WIDTH / 2 - 2) {
      this.showToast("DEPLOY UNITS ON YOUR SIDE OF THE FIELD");
      return;
    }

    const activeCount = this.units.filter((unit) => unit.team === "player" && unit.hp > 0).length;
    if (activeCount >= MAX_PLAYER_UNITS) {
      this.showToast(`FORCE LIMIT: ${MAX_PLAYER_UNITS} ACTIVE UNITS`);
      return;
    }

    this.spawnUnit(this.selectedUnit.id, "player", new THREE.Vector3(point.x, 0, point.z));
    this.refreshHud();
    this.showToast(`${this.selectedUnit.name.toUpperCase()} DEPLOYED`);
  }

  spawnUnit(typeId, team, position) {
    const baseConfig = UNIT_CATALOG.find((unit) => unit.id === typeId);
    const UnitType = UNIT_TYPES[typeId];
    if (!baseConfig || !UnitType) throw new Error(`Unknown unit type: ${typeId}`);

    let config = baseConfig;
    if (team === "enemy") {
      const enemyColors = {
        tank: 0x954d3d,
        scout: 0xb2664d,
        artillery: 0x805047,
        helicopter: 0xa1513f,
      };
      const strength = this.level.enemyStrength;
      config = {
        ...baseConfig,
        hp: Math.round(baseConfig.hp * strength),
        damage: Math.round(baseConfig.damage * strength),
        speed: baseConfig.speed * (1 + this.levelIndex * 0.06),
        color: enemyColors[typeId],
      };
    }

    const unit = new UnitType(this.scene, config, position, team);
    this.units.push(unit);
    return unit;
  }

  loadLevel(index, resetCampaign = false) {
    if (!LEVELS[index]) throw new RangeError(`Unknown campaign sector: ${index + 1}`);
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.mode = "battle";
    $("missionMessage").hidden = true;
    this.clearProjectiles();

    if (resetCampaign) {
      this.clearUnits();
      this.playerBase.resetHealth(PLAYER_BASE_HEALTH);
    } else {
      this.clearUnits("enemy");
      this.units = this.units.filter((unit) => {
        if (unit.team !== "player" || unit.hp <= 0) {
          unit.destroy();
          return false;
        }
        return true;
      });
      this.units.forEach((unit, i) => {
        unit.root.position.set(((i % 5) - 2) * 3.2, unit.config.air ? 3.1 : 0, 20 + Math.floor(i / 5) * 4);
        unit.root.rotation.y = Math.PI;
      });
    }

    this.enemyBase.resetHealth(this.level.baseHealth);
    this.scene.background.setHex(this.level.sky);
    this.scene.fog.color.setHex(this.level.sky);
    this.ground.material.color.setHex(this.level.groundTint);
    this.enemyZone.material.color.setHex(this.level.enemyTint);
    $("levelLabel").textContent = `SECTOR ${String(index + 1).padStart(2, "0")} / ${String(LEVELS.length).padStart(2, "0")}`;
    $("levelCounter").textContent = `${String(index + 1).padStart(2, "0")} / ${String(LEVELS.length).padStart(2, "0")}`;
    $("sectorName").textContent = this.level.name;
    $("missionBrief").textContent = this.level.brief;
    $("objectiveName").textContent = `${this.level.name.toUpperCase()} BASE`;
    $("battleStatus").textContent = "ENGAGEMENT ACTIVE";

    for (const spawn of this.level.enemies) {
      this.spawnUnit(spawn.type, "enemy", new THREE.Vector3(spawn.x, 0, spawn.z));
    }
    this.refreshHud();
  }

  clearUnits(team) {
    const survivors = [];
    for (const unit of this.units) {
      if (!team || unit.team === team) unit.destroy();
      else survivors.push(unit);
    }
    this.units = survivors;
  }

  refreshHud() {
    const playerCount = this.units.filter((unit) => unit.team === "player" && unit.hp > 0).length;
    const enemyCount = this.units.filter((unit) => unit.team === "enemy" && unit.hp > 0).length;
    $("deployedCount").textContent = String(playerCount).padStart(2, "0");
    $("deployedSummary").textContent = String(playerCount);
    $("hostileCount").textContent = String(enemyCount);
    $("enemyBaseText").textContent = `${Math.ceil(this.enemyBase.hp)} / ${this.enemyBase.maxHp}`;
    $("playerBaseText").textContent = `${Math.ceil(this.playerBase.hp)} / ${this.playerBase.maxHp}`;
    $("enemyBaseBar").style.width = `${(this.enemyBase.hp / this.enemyBase.maxHp) * 100}%`;
    $("playerBaseBar").style.width = `${(this.playerBase.hp / this.playerBase.maxHp) * 100}%`;
    this.enemyBase.updateHealthBar(this.camera);
    this.playerBase.updateHealthBar(this.camera);
  }

  onUnitDestroyed(unit) {
    unit.destroy();
    this.refreshHud();
  }

  spawnProjectile(owner, target) {
    const start = owner.root.position.clone();
    start.y += owner.config.air ? 0.15 : 1.4;
    const color = owner.team === "player" ? 0xd7f06a : 0xff7655;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 10, 8),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.position.copy(start);
    this.scene.add(mesh);
    this.projectiles.push({ mesh, owner, target, life: 5 });
  }

  updateProjectiles(delta) {
    for (let i = this.projectiles.length - 1; i >= 0 && this.mode === "battle"; i--) {
      const projectile = this.projectiles[i];
      projectile.life -= delta;
      if (projectile.life <= 0 || projectile.target.hp <= 0) {
        this.removeProjectile(i);
        continue;
      }

      const destination = projectile.target.getAimPoint();
      const offset = destination.sub(projectile.mesh.position);
      const distance = offset.length();
      const step = projectile.owner.config.projectileSpeed * delta;
      const hitRadius = projectile.target instanceof BattleBase ? projectile.target.attackRadius : 1.6;
      if (distance <= step + hitRadius) {
        const damage = projectile.owner.config.damage;
        this.removeProjectile(i);
        projectile.target.takeDamage(damage, this);
        continue;
      }
      projectile.mesh.position.addScaledVector(offset.normalize(), step);
    }
  }

  removeProjectile(index) {
    const [projectile] = this.projectiles.splice(index, 1);
    if (!projectile) return;
    this.scene.remove(projectile.mesh);
    projectile.mesh.geometry.dispose();
    projectile.mesh.material.dispose();
  }

  clearProjectiles() {
    while (this.projectiles.length) this.removeProjectile(this.projectiles.length - 1);
  }

  finishGame(result) {
    if (this.mode !== "battle") return;
    this.mode = result;
    this.clearProjectiles();
    $("missionMessage").hidden = false;
    $("messageSecondary").hidden = result !== "defeat";

    if (result === "victory") {
      $("battleStatus").textContent = "SECTOR SECURED";
      $("messageEyebrow").textContent = `SECTOR ${this.levelIndex + 1} / ${LEVELS.length} CAPTURED`;
      $("messageTitle").textContent = this.levelIndex === LEVELS.length - 1 ? "Campaign complete" : "Land captured";
      $("messageCopy").textContent = this.levelIndex === LEVELS.length - 1
        ? "The hostile command has fallen. You conquered all three sectors."
        : `${this.level.name} is under your control. The next sector has a stronger enemy force.`;
      $("messagePrimary").textContent = this.levelIndex === LEVELS.length - 1 ? "REPLAY CAMPAIGN" : "NEXT SECTOR";
    } else {
      $("battleStatus").textContent = "BASE OVERRUN";
      $("messageEyebrow").textContent = "COMMAND BASE LOST";
      $("messageTitle").textContent = "Sector lost";
      $("messageCopy").textContent = "The enemy broke through your defenses. Redeploy and try the sector again.";
      $("messagePrimary").textContent = "RETRY SECTOR";
      $("messageSecondary").textContent = "RESTART CAMPAIGN";
    }
  }

  showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 1700);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.05);
    if (this.mode === "battle") {
      for (const unit of this.units) unit.update(delta, this);
      this.updateProjectiles(delta);
      this.enemyBase.updateHealthBar(this.camera);
      this.playerBase.updateHealthBar(this.camera);
    }
    this.renderer.render(this.scene, this.camera);
  }
}

new Battlefield();
