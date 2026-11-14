import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const FIELD_WIDTH = 72;
const FIELD_DEPTH = 100;
const ENEMY_BASE = new THREE.Vector3(0, 0, -42);
const PLAYER_BASE = new THREE.Vector3(0, 0, FIELD_DEPTH / 2 - 5);
const DEPLOYMENT_LINE_Z = 0;
const PLAYER_BASE_HEALTH = 900;
const PLAYER_BASE_HEALTH_INCREASE = 55;
const ENEMY_BASE_HEALTH_START = 1000;
const ENEMY_BASE_HEALTH_INCREASE = 110;
const MAX_PLAYER_UNITS = 18;
const MAX_WEAPON_UPGRADE_LEVEL = 5;
const WEAPON_UPGRADE_BASE_COST = 180;
const UNIT_CATALOG = [
  { id: "tank", name: "Main battle tank", shortName: "Battle tank", speed: 5.2, hp: 180, damage: 30, range: 18, cooldown: 1.1, projectileSpeed: 26, detectionRange: 34, color: 0x829264, domain: "land", weapon: "cannon" },
  { id: "scout", name: "Recon scout", shortName: "Recon scout", speed: 8.5, hp: 90, damage: 14, range: 13, cooldown: 0.65, projectileSpeed: 30, detectionRange: 30, color: 0x9aab70, domain: "land", weapon: "gun" },
  { id: "artillery", name: "Field artillery", shortName: "Artillery", speed: 3.4, hp: 160, damage: 48, range: 30, cooldown: 2.2, projectileSpeed: 24, detectionRange: 42, color: 0x777e68, domain: "land", weapon: "shell" },
  { id: "helicopter", name: "Attack helicopter", shortName: "Helicopter", speed: 9.2, hp: 130, damage: 22, range: 20, cooldown: 0.8, projectileSpeed: 30, detectionRange: 36, color: 0x73845d, air: true, domain: "air", weapon: "missile" },
  { id: "fighterJet", name: "Fighter jet", shortName: "Fighter jet", speed: 12, hp: 115, damage: 28, range: 24, cooldown: 0.72, projectileSpeed: 38, detectionRange: 42, color: 0x758697, air: true, domain: "air", weapon: "bomb" },
  { id: "sam", name: "Surface-to-air missile launcher", shortName: "SAM launcher", speed: 3.2, hp: 155, damage: 42, range: 40, cooldown: 0.8, projectileSpeed: 34, detectionRange: 48, color: 0x707a61, domain: "land", weapon: "missile" },
  { id: "carrier", name: "Aircraft carrier", shortName: "Carrier", speed: 2.5, hp: 620, damage: 44, range: 26, cooldown: 2.4, projectileSpeed: 25, detectionRange: 38, color: 0x65736d, domain: "water", weapon: "missile", secondaryWeapon: "gun", secondaryDamage: 9, secondaryCooldown: 0.35, secondaryRange: 15, secondaryProjectileSpeed: 36 },
  { id: "submarine", name: "Attack submarine", shortName: "Submarine", speed: 4.4, hp: 230, damage: 36, range: 19, cooldown: 1.45, projectileSpeed: 28, detectionRange: 32, color: 0x485954, domain: "water", weapon: "torpedo", secondaryWeapon: "gun", secondaryDamage: 6, secondaryCooldown: 0.4, secondaryRange: 12, secondaryProjectileSpeed: 34 },
];
const LEVELS = [
  {
    name: "Green Valley",
    brief: "Clear the valley defenses and destroy the hostile base.",
    sky: 0x899487,
    groundTint: 0xffffff,
    enemyTint: 0xc6533f,
    baseHealth: ENEMY_BASE_HEALTH_START,
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
    baseHealth: ENEMY_BASE_HEALTH_START + ENEMY_BASE_HEALTH_INCREASE,
    enemyStrength: 1.12,
    enemies: [
      { type: "tank", x: -12, z: -31 },
      { type: "scout", x: 10, z: -29 },
      { type: "artillery", x: -3, z: -35 },
      { type: "helicopter", x: 7, z: -24 },
      { type: "sam", x: -10, z: -23 },
      { type: "tank", x: 0, z: -20 },
    ],
  },
  {
    name: "Blackstone Yard",
    brief: "Break the industrial yard defenses and prepare for the wider campaign.",
    sky: 0x737b80,
    groundTint: 0xc1c5c0,
    enemyTint: 0xff7655,
    baseHealth: ENEMY_BASE_HEALTH_START + ENEMY_BASE_HEALTH_INCREASE * 2,
    enemyStrength: 1.42,
    enemies: [
      { type: "tank", x: -14, z: -32 },
      { type: "artillery", x: 12, z: -34 },
      { type: "scout", x: -6, z: -24 },
      { type: "helicopter", x: 6, z: -26 },
      { type: "tank", x: 1, z: -37 },
      { type: "artillery", x: -12, z: -20 },
      { type: "scout", x: 13, z: -21 },
      { type: "fighterJet", x: 12, z: -24 },
      { type: "sam", x: -1, z: -28 },
    ],
  },
  ...[
    ["Razorback Ridge", "Push through the highland defenses and secure the ridge.", 0x858d87, 0xb9c0b0, 0xc6533f],
    ["Copperhead Strait", "Take your carrier group through the strait and break the enemy fleet.", 0x778d95, 0xffffff, 0x408c9c, true],
    ["Frostbite Pass", "Advance through the frozen pass and destroy the command post.", 0x89949b, 0xb9c5c6, 0xb85c50],
    ["Sundown Range", "Clear the desert range of its remaining defenders.", 0x9a806d, 0xd2b78f, 0xd87a4f],
    ["Ironwood Basin", "Secure the basin and break the enemy's armored line.", 0x78867a, 0xaab39a, 0xc6533f],
    ["Broken Arrow", "The enemy has regrouped. Defeat their counterattack.", 0x85817c, 0xb9b09e, 0xd16c4e],
    ["Ashfall Crater", "Fight through the ash-covered perimeter to reach the base.", 0x747a7c, 0xaaa9a1, 0xc6533f],
    ["Red Mesa", "Take the mesa before the defenders can reinforce it.", 0x9c8170, 0xc8a58d, 0xd87a4f],
    ["Wolf's Run", "Push down the narrow valley and eliminate the hostile force.", 0x7d8779, 0xb0b69d, 0xc6533f],
    ["Stormwatch Fleet", "Fight through the storm and destroy the opposing carrier group.", 0x707c82, 0xffffff, 0x408c9c, true],
    ["Blackwater Coast", "Send submarines into the coastal waters and clear the hostile fleet.", 0x73847e, 0xffffff, 0x408c9c, true],
    ["Cobalt Quarry", "Capture the quarry and clear its heavy defenses.", 0x78818a, 0xb5b7b2, 0xd16c4e],
    ["Dead Man's Ridge", "Break the ridge defenses and keep your own base secure.", 0x827c72, 0xb5a98f, 0xc6533f],
    ["Cinderworks", "Overrun the industrial perimeter and target the enemy base.", 0x797b7c, 0xb3aaa0, 0xd87a4f],
    ["Thunderhead Channel", "Face the enemy fleet in open water and push onward.", 0x697880, 0xffffff, 0x408c9c, true],
    ["Last Stand Armada", "The enemy is making its final stand at sea. Break through the fleet.", 0x778d95, 0xffffff, 0x408c9c, true],
    ["Eagle's Nest", "Take the final stronghold and complete the campaign.", 0x737b80, 0xc1c5c0, 0xff7655],
  ].map(([name, brief, sky, groundTint, enemyTint, ocean = false], index) => ({
    name,
    brief,
    sky,
    groundTint,
    enemyTint,
    ocean,
    baseHealth: ENEMY_BASE_HEALTH_START + ENEMY_BASE_HEALTH_INCREASE * (index + 3),
    enemyStrength: 1.45 + index * 0.025,
    enemies: Array.from({ length: 7 + Math.floor(index / 3) }, (_, unitIndex) => {
      const enemyTypes = ocean
        ? ["carrier", "submarine", "fighterJet", "helicopter"]
        : ["tank", "artillery", "scout", "helicopter", "fighterJet", "sam"];
      return {
        type: enemyTypes[(unitIndex + index) % enemyTypes.length],
        x: ((unitIndex % 4) - 1.5) * 8,
        z: -18 - Math.floor(unitIndex / 4) * 9 - (unitIndex % 2) * 2,
      };
    }),
  })),
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
  constructor(scene, config, position, team, carrier = null, launchOffset = null) {
    this.scene = scene;
    this.config = config;
    this.team = team;
    this.isEnemy = team === "enemy";
    this.root = new THREE.Group();
    this.root.position.copy(position);
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.cooldownRemaining = 0;
    this.secondaryCooldownRemaining = 0;
    this.carrier = carrier;
    this.carrierLaunch = Boolean(carrier);
    this.carrierLaunchOffset = launchOffset ?? new THREE.Vector3();
    this.carrierLaunchElapsed = 0;
    this.destroyed = false;
    this.buildModel();
    this.scene.add(this.root);
    this.healthBar = createHealthBar(scene, this.isEnemy ? 0xff7655 : 0xd7f06a, 2.6);
  }

  buildModel() {}

  update(delta, battlefield) {
    if (this.hp <= 0) return;
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    this.secondaryCooldownRemaining = Math.max(0, this.secondaryCooldownRemaining - delta);

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

    if (!target) {
      target = this.team === "player" ? battlefield.enemyBase : battlefield.playerBase;
    }
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
    }
    if (this.config.secondaryWeapon && distance <= this.config.secondaryRange) {
      if (this.secondaryCooldownRemaining === 0 && target.hp > 0) {
        battlefield.spawnProjectile(
          this,
          target,
          this.config.secondaryWeapon,
          this.config.secondaryDamage,
          this.config.secondaryProjectileSpeed,
        );
        this.secondaryCooldownRemaining = this.config.secondaryCooldown;
      }
    }
    if (distance > Math.max(
      this.config.range,
      this.config.secondaryWeapon ? this.config.secondaryRange : 0,
    )) {
      const desiredDistance = this.config.range * 0.82;
      const travel = Math.min(this.config.speed * delta, Math.max(0, distance - desiredDistance));
      if (travel > 0) {
        this.root.position.x += (dx / distance) * travel;
        this.root.position.z += (dz / distance) * travel;
      }
    }

    this.updateCarrierTakeoff(delta);
    this.animate(delta);
    this.updateHealthBar(battlefield.camera);
  }

  updateCarrierTakeoff(delta) {
    if (!this.carrierLaunch) return;
    this.carrierLaunchElapsed += delta;
    if (this.carrier?.hp > 0) {
      this.root.position.x = this.carrier.root.position.x + this.carrierLaunchOffset.x;
      this.root.position.z = this.carrier.root.position.z + this.carrierLaunchOffset.z;
    }
    const cruiseHeight = this.config.id === "helicopter" ? 3.1 : 4;
    const progress = THREE.MathUtils.clamp(this.carrierLaunchElapsed / 1.2, 0, 1);
    this.root.position.y = THREE.MathUtils.lerp(1.2, cruiseHeight, progress);
    if (progress === 1) {
      this.carrierLaunch = false;
      this.carrier = null;
    }
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

class SamLauncher extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x303832, { metalness: 0.24 });
    const missileMaterial = standardMaterial(0x9b9e8a, { metalness: 0.28 });
    addBox(this.root, body, [2.8, 0.72, 3.8], [0, 0.66, 0]);

    for (const side of [-1, 1]) {
      addBox(this.root, dark, [0.52, 0.78, 4], [side * 1.48, 0.48, 0]);
      for (let wheel = 0; wheel < 4; wheel++) {
        const roller = addCylinder(
          this.root, dark, 0.25, 0.25, 0.14,
          [side * 1.78, 0.48, -1.25 + wheel * 0.82],
          10,
        );
        roller.rotation.z = Math.PI / 2;
      }
    }

    this.launcher = new THREE.Group();
    this.launcher.position.set(0, 1.18, -0.05);
    this.root.add(this.launcher);
    addBox(this.launcher, body, [2.45, 0.38, 2.8], [0, 0, 0]);
    for (const side of [-1, 1]) {
      for (const row of [-1, 1]) {
        const missile = new THREE.Group();
        missile.position.set(side * 0.63, 0.42, row * 0.74);
        missile.rotation.x = 0.48;
        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, 1.8, 10),
          missileMaterial,
        );
        missile.add(tube);
        const nose = new THREE.Mesh(
          new THREE.ConeGeometry(0.13, 0.36, 10),
          dark,
        );
        nose.position.y = 1.06;
        missile.add(nose);
        this.launcher.add(missile);
      }
    }

    addCylinder(this.root, dark, 0.12, 0.12, 0.85, [0, 1.7, -1.25]);
    this.radar = new THREE.Group();
    this.radar.position.set(0, 2.15, -1.25);
    this.root.add(this.radar);
    const dish = addBox(this.radar, missileMaterial, [1.15, 0.08, 0.48], [0, 0, 0]);
    dish.rotation.z = -0.2;
    addBox(this.radar, dark, [0.12, 0.42, 0.12], [0, -0.2, 0]);
  }

  animate(delta) {
    this.radar.rotation.y += delta * 1.3;
  }
}

class Helicopter extends Unit {
  buildModel() {
    // The unit root is raised above the ground; the rotor animates independently.
    this.root.position.y = this.carrierLaunch ? 1.2 : 3.1;
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
    for (let blade = 0; blade < 4; blade++) {
      const angle = (blade / 4) * Math.PI * 2;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.y = angle;
      this.rotor.add(bladePivot);

      const bladeMesh = new THREE.Mesh(MAIN_ROTOR_BLADE_GEOMETRY, ROTOR_BLADE_MATERIAL);
      bladeMesh.rotation.x = Math.PI / 2;
      bladeMesh.castShadow = true;
      bladePivot.add(bladeMesh);

      const trim = new THREE.Mesh(ROTOR_TRIM_GEOMETRY, ROTOR_TRIM_MATERIAL);
      trim.position.set(0, 0.025, 3.05);
      trim.castShadow = true;
      bladePivot.add(trim);
    }
    addCylinder(this.rotor, dark, 0.3, 0.36, 0.24, [0, 0, 0]);
    addCylinder(this.rotor, ROTOR_TRIM_MATERIAL, 0.13, 0.18, 0.28, [0, 0.2, 0]);

    this.tailRotor = new THREE.Group();
    this.tailRotor.position.set(0.3, 0.3, -3.48);
    this.tailRotor.rotation.y = Math.PI / 2;
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
    if (!this.carrierLaunch) this.root.position.y = 3.1 + Math.sin(performance.now() * 0.003) * 0.12;
  }
}

class FighterJet extends Unit {
  buildModel() {
    this.root.position.y = this.carrierLaunch ? 1.2 : 4;
    const body = standardMaterial(this.config.color, { metalness: 0.32, roughness: 0.38 });
    const glass = standardMaterial(0xa6c2c8, { metalness: 0.3, roughness: 0.25 });
    const dark = standardMaterial(0x353c3d, { metalness: 0.22 });

    addBox(this.root, body, [0.85, 0.68, 5.2], [0, 0, 0]);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.3, 10), body);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.06, 3.4);
    nose.castShadow = true;
    this.root.add(nose);
    addBox(this.root, glass, [0.58, 0.42, 1.15], [0, 0.48, 1.1]);

    const wings = addBox(this.root, body, [7, 0.2, 1.8], [0, -0.08, -0.25]);
    wings.rotation.y = -0.14;
    addBox(this.root, body, [3.1, 0.16, 1.1], [0, 0, -1.95]);
    addBox(this.root, body, [0.18, 1.15, 1.25], [0, 0.48, -1.95]);

    for (const side of [-1, 1]) {
      const engine = addCylinder(this.root, dark, 0.28, 0.34, 1.55, [side * 0.62, -0.34, -1.65], 10);
      engine.rotation.x = Math.PI / 2;
      addBox(this.root, dark, [0.2, 0.16, 1.2], [side * 2.55, -0.22, 0.1]);
    }
  }

  animate() {
    if (!this.carrierLaunch) {
      this.root.position.y = 4 + Math.sin(performance.now() * 0.002 + this.root.position.x) * 0.16;
    }
  }
}

class AircraftCarrier extends Unit {
  buildModel() {
    const hull = standardMaterial(this.config.color);
    const deck = standardMaterial(0x697571);
    const markings = standardMaterial(0xc2c5b3);
    const gunmetal = standardMaterial(0x343b37, { metalness: 0.4 });
    addBox(this.root, hull, [9, 1.2, 22], [0, 0.1, 0]);
    addBox(this.root, deck, [8.2, 0.28, 20], [0, 0.84, 0]);
    addBox(this.root, hull, [2.4, 2.2, 3.2], [-2.4, 1.9, -5.7]);
    addBox(this.root, markings, [0.12, 0.03, 10], [2.7, 1.01, 1]);
    for (const z of [-5, -1, 3, 7]) {
      addBox(this.root, standardMaterial(0x829084), [1.1, 0.32, 2], [0, 1.12, z]);
    }
    for (const [x, z] of [[-3.1, -8], [3.1, -8], [-3.1, 8], [3.1, 8]]) {
      addCylinder(this.root, gunmetal, 0.32, 0.36, 0.28, [x, 1.08, z]);
      const barrel = addCylinder(this.root, gunmetal, 0.075, 0.1, 0.95, [x, 1.27, z + 0.55], 10);
      barrel.rotation.x = Math.PI / 2;
    }
  }
}

class Submarine extends Unit {
  buildModel() {
    this.root.position.y = -0.35;
    const hull = standardMaterial(this.config.color, { metalness: 0.34, roughness: 0.42 });
    const dark = standardMaterial(0x263531, { metalness: 0.25 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), hull);
    body.position.set(0, 0.28, 0);
    body.scale.set(1.05, 0.82, 5.1);
    body.castShadow = true;
    body.receiveShadow = true;
    this.root.add(body);

    const conningTower = addBox(this.root, hull, [0.95, 0.78, 1.8], [0, 1.05, -0.45]);
    conningTower.rotation.x = -0.06;
    addBox(this.root, dark, [0.12, 1, 0.14], [0, 1.82, -0.38]);
    addBox(this.root, dark, [0.1, 0.62, 0.12], [0.2, 1.62, -0.48]);

    const gunBase = addCylinder(this.root, dark, 0.2, 0.24, 0.2, [0, 1.52, 0.35]);
    const deckGun = addCylinder(this.root, dark, 0.055, 0.075, 0.95, [0, 1.65, 0.83], 10);
    deckGun.rotation.x = Math.PI / 2;
    gunBase.rotation.y = Math.PI / 4;

    for (const x of [-0.42, 0.42]) {
      const tube = addCylinder(this.root, dark, 0.13, 0.13, 0.42, [x, 0.18, 4.6], 12);
      tube.rotation.x = Math.PI / 2;
    }

    for (const side of [-1, 1]) {
      addBox(this.root, dark, [0.18, 1.2, 1.4], [side * 0.85, 0.25, -4.25]);
      addBox(this.root, dark, [1.5, 0.16, 0.22], [side * 0.7, 0.28, -4.45]);
      const propellerBlade = addBox(this.root, dark, [0.16, 1.35, 0.12], [side * 0.2, 0.28, -5.08]);
      propellerBlade.rotation.z = side * 0.35;
    }
    const propellerHub = addCylinder(this.root, dark, 0.2, 0.2, 0.45, [0, 0.28, -5.18], 12);
    propellerHub.rotation.x = Math.PI / 2;
  }
}

const UNIT_TYPES = {
  tank: Tank,
  scout: ReconScout,
  artillery: Artillery,
  sam: SamLauncher,
  helicopter: Helicopter,
  fighterJet: FighterJet,
  carrier: AircraftCarrier,
  submarine: Submarine,
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
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
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
    this.smokeParticles = [];
    this.reinforcementTimer = 0;
    this.reinforcementWave = 0;
    this.selectedUnit = UNIT_CATALOG[0];
    this.credits = 0;
    this.weaponUpgradeLevels = Object.fromEntries(UNIT_CATALOG.map((unit) => [unit.id, 0]));
    this.progressWarning = false;
    this.loadProgress();
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
    if (this.progressWarning) this.showToast("CREDITS COULD NOT BE LOADED — STARTING FRESH");
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
    this.landTexture = terrainTexture;
    this.waterTexture = this.createWaterTexture();
    terrainTexture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 16);
    const terrainBump = terrainTexture.clone();
    terrainBump.colorSpace = THREE.NoColorSpace;
    terrainBump.needsUpdate = true;
    this.landBumpTexture = terrainBump;
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

  createWaterTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create the ocean texture.");
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#467c86");
    gradient.addColorStop(0.52, "#5e929a");
    gradient.addColorStop(1, "#315f6c");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(195,225,222,.12)";
    context.lineWidth = 2;
    for (let y = 10; y < canvas.height; y += 34) {
      context.beginPath();
      for (let x = 0; x <= canvas.width; x += 16) {
        const wave = Math.sin(x * 0.025 + y * 0.01) * 3;
        if (x === 0) context.moveTo(x, y + wave);
        else context.lineTo(x, y + wave);
      }
      context.stroke();
    }
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
    this.rocks = rocks;
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
    this.scrub = scrub;
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
    this.refreshUnitMenu();
    this.updateSelectionHint();
  }

  selectUnit(config) {
    if (!this.isUnitAvailable(config)) {
      this.showToast(this.level.ocean ? "LAND VEHICLES CANNOT DEPLOY AT SEA" : "NAVAL UNITS REQUIRE AN OCEAN SECTOR");
      return;
    }
    this.selectedUnit = config;
    this.refreshUnitMenu();
    this.updateSelectionHint();
  }

  updateSelectionHint() {
    $("selectionHint").textContent = `${this.selectedUnit.shortName.toUpperCase()} SELECTED`;
    this.refreshWeaponWorkshop();
  }

  isUnitAvailable(config) {
    if (!this.level) return true;
    return this.level.ocean ? config.domain !== "land" : config.domain !== "water";
  }

  refreshUnitMenu() {
    for (const button of $("unitList").querySelectorAll(".unit-card")) {
      const config = UNIT_CATALOG.find((unit) => unit.id === button.dataset.unit);
      button.disabled = !this.isUnitAvailable(config);
      button.setAttribute("aria-pressed", String(config.id === this.selectedUnit.id));
    }
  }

  getUpgradedConfig(config) {
    const level = this.weaponUpgradeLevels[config.id];
    return { ...config, cooldown: config.cooldown * Math.pow(0.86, level) };
  }

  refreshWeaponWorkshop() {
    if (!$("weaponInfo")) return;
    const level = this.weaponUpgradeLevels[this.selectedUnit.id];
    const config = this.getUpgradedConfig(this.selectedUnit);
    const cost = WEAPON_UPGRADE_BASE_COST + level * 120;
    const rate = Math.round(60 / config.cooldown);
    const rateNames = {
      bomb: "BOMB DROP RATE",
      torpedo: "TORPEDO FIRING RATE",
      missile: "MISSILE FIRING RATE",
      shell: "SHELL FIRING RATE",
      cannon: "CANNON FIRING RATE",
      gun: "GUN FIRING RATE",
    };
    const rateName = rateNames[config.weapon];
    $("credits").textContent = String(this.credits);
    $("workshopUnit").textContent = this.selectedUnit.name.toUpperCase();
    $("weaponInfo").textContent = `${rate} SHOTS / MIN · UPGRADE ${level}/${MAX_WEAPON_UPGRADE_LEVEL}`;
    $("rateUpgrade").textContent = level >= MAX_WEAPON_UPGRADE_LEVEL ? "WEAPON RATE MAXED"
      : `UPGRADE ${rateName} · ${cost} CREDITS`;
    $("rateUpgrade").disabled = level >= MAX_WEAPON_UPGRADE_LEVEL || this.credits < cost;
  }

  loadProgress() {
    try {
      const saved = window.localStorage.getItem("ironclad-campaign-upgrades");
      if (!saved) return;
      const progress = JSON.parse(saved);
      if (!Number.isSafeInteger(progress?.credits) || progress.credits < 0 || !progress.weaponUpgradeLevels) {
        throw new Error("Saved progress has an invalid format.");
      }
      for (const unit of UNIT_CATALOG) {
        const level = progress.weaponUpgradeLevels[unit.id] ?? 0;
        if (!Number.isInteger(level) || level < 0 || level > MAX_WEAPON_UPGRADE_LEVEL) {
          throw new Error(`Invalid weapon upgrade level for ${unit.id}.`);
        }
        this.weaponUpgradeLevels[unit.id] = level;
      }
      this.credits = progress.credits;
    } catch (error) {
      console.error("Could not load campaign upgrades.", error);
      this.progressWarning = true;
    }
  }

  saveProgress() {
    try {
      window.localStorage.setItem("ironclad-campaign-upgrades", JSON.stringify({
        credits: this.credits,
        weaponUpgradeLevels: this.weaponUpgradeLevels,
      }));
    } catch (error) {
      console.error("Could not save campaign upgrades.", error);
      this.showToast("PROGRESS COULD NOT BE SAVED IN THIS BROWSER");
    }
  }

  purchaseWeaponUpgrade() {
    const level = this.weaponUpgradeLevels[this.selectedUnit.id];
    if (level >= MAX_WEAPON_UPGRADE_LEVEL) return;
    const cost = WEAPON_UPGRADE_BASE_COST + level * 120;
    if (this.credits < cost) {
      this.showToast("NOT ENOUGH CREDITS — WIN MORE BATTLES");
      return;
    }

    this.credits -= cost;
    this.weaponUpgradeLevels[this.selectedUnit.id]++;
    const config = this.getUpgradedConfig(this.selectedUnit);
    for (const unit of this.units) {
      if (unit.team === "player" && unit.config.id === this.selectedUnit.id) unit.config = config;
    }
    this.saveProgress();
    this.refreshWeaponWorkshop();
    this.showToast(`${this.selectedUnit.name.toUpperCase()} WEAPON RATE UPGRADED`);
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
    $("rateUpgrade").addEventListener("click", () => this.purchaseWeaponUpgrade());
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

    let carrier = null;
    let position = new THREE.Vector3(point.x, 0, point.z);
    let launchOffset = null;
    if (this.level.ocean && this.selectedUnit.domain === "air") {
      const carriers = this.units.filter((unit) => unit.team === "player"
        && unit.config.id === "carrier" && unit.hp > 0);
      if (carriers.length === 0) {
        this.showToast("DEPLOY AN AIRCRAFT CARRIER BEFORE LAUNCHING AIRCRAFT");
        return;
      }
      carriers.sort((a, b) => a.root.position.distanceToSquared(position) - b.root.position.distanceToSquared(position));
      carrier = carriers[0];
      const launchedCount = this.units.filter((unit) => unit.team === "player"
        && unit.carrier === carrier && unit.carrierLaunch).length;
      launchOffset = new THREE.Vector3(
        launchedCount % 2 === 0 ? -1.6 : 1.6,
        0,
        (Math.floor(launchedCount / 2) % 5 - 2) * 2.4,
      );
      position = carrier.root.position.clone().add(launchOffset);
      position.y = 1.2;
    }
    this.spawnUnit(this.selectedUnit.id, "player", position, carrier, launchOffset);
    this.refreshHud();
    this.refreshWeaponWorkshop();
    this.showToast(`${this.selectedUnit.name.toUpperCase()} DEPLOYED`);
  }

  spawnUnit(typeId, team, position, carrier = null, launchOffset = null) {
    const baseConfig = UNIT_CATALOG.find((unit) => unit.id === typeId);
    const UnitType = UNIT_TYPES[typeId];
    if (!baseConfig || !UnitType) throw new Error(`Unknown unit type: ${typeId}`);

    let config = team === "player" ? this.getUpgradedConfig(baseConfig) : baseConfig;
    if (team === "enemy") {
      const enemyColors = {
        tank: 0x954d3d,
        scout: 0xb2664d,
        artillery: 0x805047,
        sam: 0x80634c,
        helicopter: 0xa1513f,
        fighterJet: 0xc36a55,
        carrier: 0x986557,
        submarine: 0x85584f,
      };
      const strength = this.level.enemyStrength;
      config = {
        ...baseConfig,
        hp: Math.round(baseConfig.hp * strength),
        damage: Math.round(baseConfig.damage * strength),
        cooldown: baseConfig.cooldown * Math.pow(0.96, this.levelIndex),
        speed: baseConfig.speed * (1 + this.levelIndex * 0.06),
        color: enemyColors[typeId],
      };
    }

    const unit = new UnitType(this.scene, config, position, team, carrier, launchOffset);
    this.units.push(unit);
    return unit;
  }

  loadLevel(index, resetCampaign = false) {
    if (!LEVELS[index]) throw new RangeError(`Unknown campaign sector: ${index + 1}`);
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.reinforcementTimer = 0;
    this.reinforcementWave = 0;
    if (!this.isUnitAvailable(this.selectedUnit)) {
      this.selectedUnit = UNIT_CATALOG.find((unit) => unit.domain === (this.level.ocean ? "water" : "land"));
    }
    this.mode = "battle";
    $("missionMessage").hidden = true;
    this.clearProjectiles();

    if (resetCampaign) {
      this.clearUnits();
    } else {
      this.clearUnits("enemy");
      this.units = this.units.filter((unit) => {
        const config = UNIT_CATALOG.find((entry) => entry.id === unit.config.id);
        if (unit.team !== "player" || unit.hp <= 0 || !this.isUnitAvailable(config)) {
          unit.destroy();
          return false;
        }
        return true;
      });
      this.units.forEach((unit, i) => {
        const height = unit.config.air ? 3.1 : unit.config.id === "submarine" ? -0.35 : 0;
        unit.root.position.set(((i % 5) - 2) * 3.2, height, 20 + Math.floor(i / 5) * 4);
        unit.root.rotation.y = Math.PI;
      });
    }

    this.enemyBase.resetHealth(this.level.baseHealth);
    this.playerBase.resetHealth(PLAYER_BASE_HEALTH + index * PLAYER_BASE_HEALTH_INCREASE);
    this.scene.background.setHex(this.level.sky);
    this.scene.fog.color.setHex(this.level.sky);
    this.ground.material.map = this.level.ocean ? this.waterTexture : this.landTexture;
    this.ground.material.bumpMap = this.level.ocean ? null : this.landBumpTexture;
    this.ground.material.color.setHex(this.level.groundTint);
    this.ground.material.needsUpdate = true;
    this.rocks.visible = !this.level.ocean;
    this.scrub.visible = !this.level.ocean;
    this.enemyZone.material.color.setHex(this.level.enemyTint);
    this.deploymentZone.material.color.setHex(this.level.ocean ? 0x65b7be : 0x9cb15c);
    $("levelLabel").textContent = `SECTOR ${String(index + 1).padStart(2, "0")} / ${String(LEVELS.length).padStart(2, "0")}`;
    $("levelCounter").textContent = `${String(index + 1).padStart(2, "0")} / ${String(LEVELS.length).padStart(2, "0")}`;
    $("sectorName").textContent = this.level.name;
    $("missionBrief").textContent = this.level.brief;
    $("objectiveName").textContent = `${this.level.name.toUpperCase()} BASE`;
    $("battleStatus").textContent = "ENGAGEMENT ACTIVE";
    this.refreshUnitMenu();
    this.updateSelectionHint();

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

  updateEnemyReinforcements(delta) {
    this.reinforcementTimer += delta;
    const interval = Math.max(4, 8 - this.levelIndex * 0.2);
    if (this.reinforcementTimer < interval) return;

    this.reinforcementTimer -= interval;
    this.reinforcementWave++;
    const landTypes = ["tank", "artillery", "scout", "helicopter", "fighterJet", "sam"];
    const oceanTypes = ["carrier", "submarine", "fighterJet", "helicopter"];
    const types = this.level.ocean ? oceanTypes : landTypes;
    const type = types[(this.reinforcementWave - 1) % types.length];
    const x = ((this.reinforcementWave * 2) % 5 - 2) * 10;
    const z = -31 - (this.reinforcementWave % 3) * 4;
    this.spawnUnit(type, "enemy", new THREE.Vector3(x, 0, z));
    this.refreshHud();
    this.showToast("ENEMY REINFORCEMENTS DEPLOYED");
  }

  spawnProjectile(
    owner,
    target,
    weapon = owner.config.weapon,
    damage = owner.config.damage,
    projectileSpeed = owner.config.projectileSpeed,
  ) {
    const start = owner.root.position.clone();
    if (weapon === "torpedo" && owner.config.id === "submarine") {
      start.y += 0.18;
      start.z += 4.6;
    } else {
      start.y += owner.config.air ? 0.15 : 1.4;
    }
    const color = owner.team === "player" ? 0xd7f06a : 0xff7655;
    let mesh;
    if (weapon === "missile") {
      mesh = this.createMissileMesh(owner.team);
    } else {
      const geometry = weapon === "bomb"
        ? new THREE.CylinderGeometry(0.13, 0.18, 0.65, 8)
        : weapon === "torpedo"
          ? new THREE.CylinderGeometry(0.09, 0.11, 0.82, 8)
          : new THREE.SphereGeometry(0.19, 10, 8);
      mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color }),
      );
    }
    mesh.position.copy(start);
    const direction = target.getAimPoint().sub(start).normalize();
    if (weapon === "missile") {
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    } else if (weapon === "bomb" || weapon === "torpedo") {
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    }
    this.scene.add(mesh);
    this.projectiles.push({ mesh, owner, target, weapon, damage, projectileSpeed, life: 5, trailTimer: 0 });
  }

  createMissileMesh(team) {
    const missile = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: team === "player" ? 0x7d8470 : 0x985e51,
      metalness: 0.48,
      roughness: 0.36,
    });
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0xc3bca0,
      metalness: 0.55,
      roughness: 0.3,
    });
    const finMaterial = new THREE.MeshStandardMaterial({
      color: 0x363b37,
      metalness: 0.42,
      roughness: 0.48,
    });
    const exhaustMaterial = new THREE.MeshBasicMaterial({ color: 0xff8a35 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.12, 0.72, 10), bodyMaterial);
    body.rotation.x = Math.PI / 2;
    missile.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), noseMaterial);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 0.49;
    missile.add(nose);
    const exhaust = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 8), exhaustMaterial);
    exhaust.rotation.x = -Math.PI / 2;
    exhaust.position.z = -0.5;
    missile.add(exhaust);
    for (let fin = 0; fin < 4; fin++) {
      const angle = (fin / 4) * Math.PI * 2;
      const surface = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.2), finMaterial);
      surface.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, -0.27);
      surface.rotation.z = angle;
      missile.add(surface);
    }
    return missile;
  }

  spawnMissileSmoke(position) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x77756f,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 6), material);
    mesh.position.copy(position);
    const size = 0.13 + Math.random() * 0.07;
    mesh.scale.setScalar(size);
    this.scene.add(mesh);
    this.smokeParticles.push({
      mesh,
      material,
      life: 0.62,
      maxLife: 0.62,
      size,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.7,
        0.2 + Math.random() * 0.35,
        (Math.random() - 0.5) * 0.7,
      ),
    });
  }

  updateSmokeParticles(delta) {
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const particle = this.smokeParticles[i];
      particle.life -= delta;
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.material.dispose();
        this.smokeParticles.splice(i, 1);
        continue;
      }

      const progress = 1 - particle.life / particle.maxLife;
      particle.material.opacity = 0.44 * (1 - progress);
      const size = particle.size + progress * 0.38;
      particle.mesh.scale.setScalar(size);
      particle.mesh.position.addScaledVector(particle.velocity, delta);
    }
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
      const step = projectile.projectileSpeed * delta;
      const hitRadius = projectile.target instanceof BattleBase ? projectile.target.attackRadius : 1.6;
      if (distance <= step + hitRadius) {
        this.removeProjectile(i);
        projectile.target.takeDamage(projectile.damage, this);
        continue;
      }
      const direction = offset.normalize();
      projectile.mesh.position.addScaledVector(direction, step);
      if (projectile.weapon === "missile") {
        projectile.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        projectile.trailTimer -= delta;
        if (projectile.trailTimer <= 0) {
          this.spawnMissileSmoke(projectile.mesh.localToWorld(new THREE.Vector3(0, 0, -0.58)));
          projectile.trailTimer = 0.045;
        }
      } else if (projectile.weapon === "bomb" || projectile.weapon === "torpedo") {
        projectile.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      }
    }
  }

  removeProjectile(index) {
    const [projectile] = this.projectiles.splice(index, 1);
    if (!projectile) return;
    this.scene.remove(projectile.mesh);
    projectile.mesh.traverse((object) => {
      if (!object.isMesh) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material.dispose();
    });
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
      const reward = 300 + this.levelIndex * 50;
      this.credits += reward;
      this.saveProgress();
      this.refreshWeaponWorkshop();
      $("battleStatus").textContent = "SECTOR SECURED";
      $("messageEyebrow").textContent = `SECTOR ${this.levelIndex + 1} / ${LEVELS.length} CAPTURED`;
      $("messageTitle").textContent = this.levelIndex === LEVELS.length - 1 ? "Campaign complete" : "Land captured";
      $("messageCopy").textContent = this.levelIndex === LEVELS.length - 1
        ? `The hostile command has fallen. You conquered all ${LEVELS.length} sectors and earned ${reward} credits.`
        : `${this.level.name} is under your control. You earned ${reward} credits for this victory.`;
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
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.updateSmokeParticles(delta);
    if (this.mode === "battle") {
      this.updateEnemyReinforcements(delta);
      for (const unit of this.units) unit.update(delta, this);
      this.updateProjectiles(delta);
      this.enemyBase.updateHealthBar(this.camera);
      this.playerBase.updateHealthBar(this.camera);
    }
    this.renderer.render(this.scene, this.camera);
  }
}

new Battlefield();
