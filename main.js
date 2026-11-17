import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";
import Peer from "https://cdn.jsdelivr.net/npm/peerjs@1.5.4/+esm";

const MAP_SCALE = 2;
const MAX_CAMERA_DISTANCE = 480;
const FIELD_WIDTH = 120 * MAP_SCALE;
const FIELD_DEPTH = 180 * MAP_SCALE;
const ENEMY_BASE = new THREE.Vector3(0, 0, -FIELD_DEPTH / 2 + 5);
const PLAYER_BASE = new THREE.Vector3(0, 0, FIELD_DEPTH / 2 - 5);
const DEPLOYMENT_LINE_Z = 0;
const PLAYER_BASE_HEALTH = 900;
const PLAYER_BASE_HEALTH_INCREASE = 55;
const ENEMY_BASE_HEALTH_START = 1000;
const ENEMY_BASE_HEALTH_INCREASE = 110;
const MAX_UNITS_PER_TEAM = 20;
const MAX_WEAPON_UPGRADE_LEVEL = 10;
const WEAPON_UPGRADE_BASE_COST = 180;
const B52_ENGINE_X_POSITIONS = [-6.15, -5.45, -3.25, -2.55, 2.55, 3.25, 5.45, 6.15];
const UNIT_CATALOG = [
  { id: "tank", name: "Main battle tank", shortName: "Battle tank", speed: 5.2, hp: 180, damage: 30, range: 18, cooldown: 1.1, projectileSpeed: 26, detectionRange: 34, color: 0x829264, domain: "land", weapon: "cannon" },
  { id: "scout", name: "Recon scout", shortName: "Recon scout", speed: 8.5, hp: 90, damage: 14, range: 13, cooldown: 0.65, projectileSpeed: 30, detectionRange: 30, color: 0x9aab70, domain: "land", weapon: "gun" },
  { id: "artillery", name: "Field artillery", shortName: "Artillery", speed: 3.4, hp: 160, damage: 48, range: 30, cooldown: 2.2, projectileSpeed: 24, detectionRange: 42, color: 0x777e68, domain: "land", weapon: "shell" },
  { id: "tankDestroyer", name: "Tank destroyer", shortName: "Tank destroyer", speed: 3.8, hp: 205, damage: 64, range: 35, cooldown: 2.7, projectileSpeed: 38, detectionRange: 48, color: 0x717a60, domain: "land", weapon: "cannon" },
  { id: "armoredCar", name: "Armored scout car", shortName: "Scout car", speed: 9.5, hp: 105, damage: 10, range: 16, cooldown: 0.4, projectileSpeed: 35, detectionRange: 42, color: 0x8c8968, domain: "land", weapon: "gun" },
  { id: "heavyTank", name: "Heavy tank", shortName: "Heavy tank", speed: 3.4, hp: 330, damage: 50, range: 22, cooldown: 1.6, projectileSpeed: 26, detectionRange: 38, color: 0x687253, domain: "land", weapon: "cannon" },
  { id: "mortarCarrier", name: "Self-propelled mortar carrier", shortName: "Mortar carrier", speed: 4.2, hp: 145, damage: 38, range: 34, cooldown: 2.6, projectileSpeed: 26, detectionRange: 48, color: 0x757b68, domain: "land", weapon: "shell" },
  { id: "lightTank", name: "Light tank", shortName: "Light tank", speed: 7.1, hp: 145, damage: 23, range: 20, cooldown: 0.85, projectileSpeed: 29, detectionRange: 36, color: 0x8a956b, domain: "land", weapon: "cannon" },
  { id: "mobileAA", name: "Mobile anti-aircraft gun", shortName: "Mobile AA", speed: 5.8, hp: 155, damage: 7, range: 30, cooldown: 0.28, projectileSpeed: 42, detectionRange: 46, color: 0x78836a, domain: "land", weapon: "gun" },
  { id: "recoveryVehicle", name: "Armored recovery vehicle", shortName: "Recovery vehicle", speed: 4, hp: 240, damage: 5, range: 14, cooldown: 0.9, projectileSpeed: 26, detectionRange: 30, color: 0x8c8968, domain: "land", weapon: "gun", supportHeal: 20, supportRange: 12, supportCooldown: 2 },
  { id: "siegeTank", name: "Siege tank", shortName: "Siege tank", speed: 2.6, hp: 360, damage: 76, range: 31, cooldown: 3.2, projectileSpeed: 30, detectionRange: 44, color: 0x687253, domain: "land", weapon: "cannon" },
  { id: "tankHunter", name: "Tank hunter missile vehicle", shortName: "Tank hunter", speed: 5.2, hp: 155, damage: 28, range: 39, cooldown: 2.4, projectileSpeed: 36, detectionRange: 50, color: 0x737b68, domain: "land", weapon: "missile", volleyCount: 2, muzzleOffsets: [[-0.62, 1.65, 0.3], [0.62, 1.65, 0.3]] },
  { id: "mobileCommand", name: "Mobile command vehicle", shortName: "Mobile command", speed: 4.6, hp: 185, damage: 5, range: 16, cooldown: 0.7, projectileSpeed: 30, detectionRange: 60, color: 0x8c8968, domain: "land", weapon: "gun", supportHeal: 12, supportRange: 15, supportCooldown: 2.8 },
  { id: "amphibiousRecon", name: "Amphibious reconnaissance vehicle", shortName: "Amphibious recon", speed: 7.2, hp: 125, damage: 12, range: 17, cooldown: 0.5, projectileSpeed: 34, detectionRange: 52, color: 0x6f897d, domain: "amphibious", weapon: "gun" },
  { id: "attackDrone", name: "Armed reconnaissance drone", shortName: "Attack drone", speed: 10.5, hp: 100, damage: 25, range: 30, cooldown: 2.1, projectileSpeed: 38, detectionRange: 50, color: 0x7d928a, air: true, domain: "air", weapon: "missile", volleyCount: 2, muzzleOffsets: [[-0.7, -0.15, 0.2], [0.7, -0.15, 0.2]] },
  { id: "destroyer", name: "Guided missile destroyer", shortName: "Destroyer", speed: 3.8, hp: 470, damage: 36, range: 36, cooldown: 2, projectileSpeed: 31, detectionRange: 48, color: 0x65736d, domain: "water", weapon: "missile", volleyCount: 2, muzzleOffsets: [[-1.6, 1.5, -2.5], [1.6, 1.5, -2.5]], secondaryWeapon: "gun", secondaryDamage: 8, secondaryCooldown: 0.42, secondaryRange: 18, secondaryProjectileSpeed: 36 },
  { id: "howitzer", name: "Self-propelled howitzer", shortName: "Howitzer", speed: 2.9, hp: 150, damage: 58, range: 48, cooldown: 3.8, projectileSpeed: 27, detectionRange: 56, color: 0x777e68, domain: "land", weapon: "shell" },
  { id: "ifv", name: "Infantry fighting vehicle", shortName: "IFV", speed: 6.4, hp: 165, damage: 8, range: 19, cooldown: 0.34, projectileSpeed: 38, detectionRange: 36, color: 0x87916a, domain: "land", weapon: "gun", secondaryWeapon: "gun", secondaryDamage: 4, secondaryCooldown: 0.62, secondaryRange: 14, secondaryProjectileSpeed: 36 },
  { id: "apc", name: "Armored personnel carrier", shortName: "APC", speed: 6.8, hp: 205, damage: 4, range: 16, cooldown: 0.9, projectileSpeed: 34, detectionRange: 34, color: 0x78846a, domain: "land", weapon: "gun", volleyCount: 3, muzzleOffsets: [[-0.62, 1.4, 1.15], [0, 1.55, 1.3], [0.62, 1.4, 1.15]] },
  { id: "mlrs", name: "Rocket artillery", shortName: "MLRS", speed: 2.8, hp: 115, damage: 14, range: 42, cooldown: 3.2, projectileSpeed: 32, detectionRange: 50, color: 0x737b68, domain: "land", weapon: "missile", volleyCount: 4, muzzleOffsets: [[-0.72, 1.8, -0.5], [-0.24, 1.8, -0.5], [0.24, 1.8, -0.5], [0.72, 1.8, -0.5]] },
  { id: "heavyMlrs", name: "Heavy rocket artillery", shortName: "Heavy MLRS", speed: 2.3, hp: 170, damage: 22, range: 50, cooldown: 4.1, projectileSpeed: 34, detectionRange: 58, color: 0x6d7565, domain: "land", weapon: "missile", volleyCount: 6, muzzleOffsets: [[-0.9, 1.9, -0.6], [-0.54, 1.9, -0.6], [-0.18, 1.9, -0.6], [0.18, 1.9, -0.6], [0.54, 1.9, -0.6], [0.9, 1.9, -0.6]] },
  { id: "engineer", name: "Combat engineer vehicle", shortName: "Engineer", speed: 4.8, hp: 175, damage: 6, range: 15, cooldown: 0.55, projectileSpeed: 32, detectionRange: 32, color: 0x8c8968, domain: "land", weapon: "gun", supportHeal: 14, supportRange: 9, supportCooldown: 2.4 },
  { id: "helicopter", name: "Attack helicopter", shortName: "Helicopter", speed: 9.2, hp: 130, damage: 4, range: 24, cooldown: 0.4, projectileSpeed: 48, detectionRange: 36, color: 0x73845d, air: true, domain: "air", weapon: "gun", muzzleOffsets: [[0, -0.28, 1.85]], secondaryWeapon: "missile", secondaryDamage: 18, secondaryCooldown: 5.2, secondaryRange: 24, secondaryProjectileSpeed: 34, secondaryMuzzleOffsets: [[-1.1, -0.2, 0.4], [1.1, -0.2, 0.4]] },
  { id: "reconDrone", name: "Recon drone", shortName: "Recon drone", speed: 10, hp: 75, damage: 3, range: 17, cooldown: 0.32, projectileSpeed: 42, detectionRange: 58, color: 0x7d928a, air: true, domain: "air", weapon: "gun", muzzleOffsets: [[0, -0.23, 1.17]] },
  { id: "fighterJet", name: "Fighter jet", shortName: "Fighter jet", speed: 12, hp: 115, damage: 28, range: 24, cooldown: 0.72, projectileSpeed: 38, detectionRange: 42, color: 0x758697, air: true, domain: "air", weapon: "bomb" },
  { id: "b52", name: "B-52 Stratofortress", shortName: "B-52 bomber", speed: 7.4, hp: 2200, damage: 220, range: 30, cooldown: 8, projectileSpeed: 42, detectionRange: 56, color: 0x87908a, air: true, domain: "air", weapon: "b52Missile" },
  { id: "amphibious", name: "Amphibious assault vehicle", shortName: "Amphibious", speed: 5.4, hp: 190, damage: 25, range: 18, cooldown: 1.05, projectileSpeed: 27, detectionRange: 34, color: 0x6f897d, domain: "amphibious", weapon: "cannon" },
  { id: "sam", name: "Surface-to-air missile launcher", shortName: "SAM launcher", speed: 3.2, hp: 155, damage: 42, range: 40, cooldown: 0.8, projectileSpeed: 34, detectionRange: 48, color: 0x707a61, domain: "land", weapon: "missile" },
  { id: "carrier", name: "Aircraft carrier", shortName: "Carrier", speed: 2.5, hp: 620, damage: 44, range: 26, cooldown: 2.4, projectileSpeed: 25, detectionRange: 38, color: 0x65736d, domain: "water", weapon: "missile", secondaryWeapon: "gun", secondaryDamage: 9, secondaryCooldown: 0.35, secondaryRange: 15, secondaryProjectileSpeed: 36 },
  { id: "submarine", name: "Attack submarine", shortName: "Submarine", speed: 4.4, hp: 230, damage: 36, range: 19, cooldown: 1.45, projectileSpeed: 28, detectionRange: 32, color: 0x485954, domain: "water", weapon: "torpedo", secondaryWeapon: "gun", secondaryDamage: 6, secondaryCooldown: 0.4, secondaryRange: 12, secondaryProjectileSpeed: 34 },
];
const UNIT_SPACING_RADII = {
  tank: 2,
  scout: 1.5,
  artillery: 2.3,
  tankDestroyer: 2.8,
  armoredCar: 2.1,
  heavyTank: 3.5,
  mortarCarrier: 2.7,
  lightTank: 2.2,
  mobileAA: 2.6,
  recoveryVehicle: 2.8,
  siegeTank: 3.8,
  tankHunter: 3,
  mobileCommand: 2.8,
  amphibiousRecon: 2.8,
  attackDrone: 3.5,
  destroyer: 6,
  howitzer: 2.6,
  ifv: 2.2,
  apc: 2.5,
  mlrs: 2.6,
  heavyMlrs: 3,
  engineer: 2.4,
  helicopter: 3.2,
  reconDrone: 1.4,
  fighterJet: 3.8,
  b52: 7,
  amphibious: 2.7,
  sam: 2.7,
  carrier: 6.2,
  submarine: 4,
};
const LEVELS = [
  {
    name: "Green Valley",
    brief: "Clear the valley defenses and destroy the hostile base.",
    sky: 0x899487,
    groundTint: 0xffffff,
    enemyTint: 0xc6533f,
    weather: "clear",
    baseHealth: ENEMY_BASE_HEALTH_START,
    enemyStrength: 0.82,
    enemies: [
      { type: "scout", x: -18, z: -59 },
      { type: "tank", x: 16, z: -65 },
      { type: "scout", x: 2, z: -51 },
    ],
  },
  {
    name: "Dustline Pass",
    brief: "The pass is reinforced. Break through and capture the crossing.",
    sky: 0x9b8c76,
    groundTint: 0xd5c29a,
    enemyTint: 0xd87a4f,
    weather: "clear",
    baseHealth: ENEMY_BASE_HEALTH_START + ENEMY_BASE_HEALTH_INCREASE,
    enemyStrength: 1.12,
    enemies: [
      { type: "tank", x: -25, z: -65 },
      { type: "scout", x: 22, z: -60 },
      { type: "artillery", x: -7, z: -71 },
      { type: "helicopter", x: 16, z: -55 },
      { type: "sam", x: -22, z: -53 },
      { type: "tank", x: 0, z: -50 },
    ],
  },
  {
    name: "Blackstone Yard",
    brief: "Break the industrial yard defenses and prepare for the wider campaign.",
    sky: 0x737b80,
    groundTint: 0xc1c5c0,
    enemyTint: 0xff7655,
    weather: "clear",
    baseHealth: ENEMY_BASE_HEALTH_START + ENEMY_BASE_HEALTH_INCREASE * 2,
    enemyStrength: 1.42,
    enemies: [
      { type: "tank", x: -30, z: -67 },
      { type: "artillery", x: 26, z: -70 },
      { type: "scout", x: -13, z: -55 },
      { type: "helicopter", x: 13, z: -58 },
      { type: "tank", x: 2, z: -75 },
      { type: "artillery", x: -26, z: -50 },
      { type: "scout", x: 28, z: -52 },
      { type: "fighterJet", x: 25, z: -55 },
      { type: "sam", x: -2, z: -60 },
    ],
  },
  ...[
    ["Razorback Ridge", "Push through the highland defenses and secure the ridge.", 0x858d87, 0xb9c0b0, 0xc6533f, false, "wind"],
    ["Copperhead Strait", "Take your carrier group through the strait and break the enemy fleet.", 0x778d95, 0xffffff, 0x408c9c, true, "storm"],
    ["Frostbite Pass", "Advance through the frozen pass and destroy the command post.", 0x89949b, 0xb9c5c6, 0xb85c50, false, "snow"],
    ["Sundown Range", "Clear the desert range of its remaining defenders.", 0x9a806d, 0xd2b78f, 0xd87a4f, false, "sandstorm"],
    ["Ironwood Basin", "Secure the basin and break the enemy's armored line.", 0x78867a, 0xaab39a, 0xc6533f],
    ["Broken Arrow", "The enemy has regrouped. Defeat their counterattack.", 0x85817c, 0xb9b09e, 0xd16c4e, false, "rain"],
    ["Ashfall Crater", "Fight through the ash-covered perimeter to reach the base.", 0x747a7c, 0xaaa9a1, 0xc6533f, false, "ash"],
    ["Red Mesa", "Take the mesa before the defenders can reinforce it.", 0x9c8170, 0xc8a58d, 0xd87a4f, false, "sandstorm"],
    ["Wolf's Run", "Push down the narrow valley and eliminate the hostile force.", 0x7d8779, 0xb0b69d, 0xc6533f],
    ["Stormwatch Fleet", "Fight through the storm and destroy the opposing carrier group.", 0x707c82, 0xffffff, 0x408c9c, true, "storm"],
    ["Blackwater Coast", "Send submarines into the coastal waters and clear the hostile fleet.", 0x73847e, 0xffffff, 0x408c9c, true],
    ["Cobalt Quarry", "Capture the quarry and clear its heavy defenses.", 0x78818a, 0xb5b7b2, 0xd16c4e, false, "rain"],
    ["Dead Man's Ridge", "Break the ridge defenses and keep your own base secure.", 0x827c72, 0xb5a98f, 0xc6533f, false, "wind"],
    ["Cinderworks", "Overrun the industrial perimeter and target the enemy base.", 0x797b7c, 0xb3aaa0, 0xd87a4f, false, "ash"],
    ["Thunderhead Channel", "Face the enemy fleet in open water and push onward.", 0x697880, 0xffffff, 0x408c9c, true, "storm"],
    ["Last Stand Armada", "The enemy is making its final stand at sea. Break through the fleet.", 0x778d95, 0xffffff, 0x408c9c, true, "storm"],
    ["Eagle's Nest", "Take the final stronghold and complete the campaign.", 0x737b80, 0xc1c5c0, 0xff7655, false, "clear"],
    ["Whiteout Valley", "Cross the snow-blinded valley and break the fortified line.", 0x9ba9b2, 0xd7e0e0, 0xb85c50, false, "snow"],
    ["Tundra Crossing", "Hold the frozen crossing while the enemy advances through deep snow.", 0x8597a5, 0xcbd6d9, 0xc6533f, false, "snow"],
    ["Frozen Strait", "Take the fleet through icy waters under a freezing squall.", 0x738b99, 0xe7f0f0, 0x408c9c, true, "snow"],
    ["Monsoon Delta", "Push through flooded lowlands in relentless monsoon rain.", 0x647d75, 0x9baa91, 0x408c9c, false, "rain"],
    ["Typhoon Shelf", "Break the blockade as towering waves and gale-force rain hit the fleet.", 0x566d7a, 0xffffff, 0x408c9c, true, "storm"],
    ["Dust Devil Flats", "Advance through violent dust devils and seize the desert outpost.", 0xa88a6d, 0xc8aa82, 0xd87a4f, false, "sandstorm"],
    ["Sirocco Basin", "Survive the scorching sandstorm and destroy the enemy command post.", 0x9a755f, 0xc4a47f, 0xc6533f, false, "sandstorm"],
    ["Woodland Crossing", "Find the enemy through dense woodland and secure the crossing.", 0x687a72, 0x9da99a, 0xc6533f],
    ["Openwater Sound", "Hunt the enemy fleet through the open coastal sound.", 0x647b83, 0xffffff, 0x408c9c, true],
    ["Ashen Fields", "Fight across the ash-covered plain beneath a dark falling haze.", 0x686b6a, 0x98948b, 0xc6533f, false, "ash"],
    ["Sleetwater Strait", "Navigate the sleet-filled strait and break the naval defenses.", 0x74838b, 0xe2e8e8, 0x408c9c, true, "snow"],
    ["Gale Force Ridge", "Climb the exposed ridge while crosswinds disrupt the advance.", 0x77827d, 0xb4b6a9, 0xd16c4e, false, "wind"],
    ["Tempest Armada", "Defeat the final armada in a violent open-water storm.", 0x586d78, 0xffffff, 0x408c9c, true, "storm"],
  ].map(([name, brief, sky, groundTint, enemyTint, ocean = false, weather = "clear"], index) => ({
    name,
    brief,
    sky,
    groundTint,
    enemyTint,
    ocean,
    weather,
    baseHealth: ENEMY_BASE_HEALTH_START + ENEMY_BASE_HEALTH_INCREASE * (index + 3),
    enemyStrength: 1.5 + index * 0.06,
    enemies: Array.from({ length: Math.min(MAX_UNITS_PER_TEAM, 9 + Math.floor(index / 2)) }, (_, unitIndex) => {
      const enemyTypes = ocean
        ? ["carrier", "submarine", "destroyer", "fighterJet", "helicopter", "reconDrone", "attackDrone", "amphibious", "amphibiousRecon"]
        : ["tank", "artillery", "tankDestroyer", "armoredCar", "heavyTank", "mortarCarrier", "lightTank", "mobileAA", "recoveryVehicle", "siegeTank", "tankHunter", "mobileCommand", "howitzer", "scout", "ifv", "apc", "mlrs", "heavyMlrs", "engineer", "helicopter", "reconDrone", "attackDrone", "fighterJet", "amphibious", "amphibiousRecon", "sam"];
      return {
        type: enemyTypes[(unitIndex + index) % enemyTypes.length],
        x: ((unitIndex % 6) - 2.5) * 13,
        z: -38 - Math.floor(unitIndex / 6) * 12 - (unitIndex % 2) * 2,
      };
    }),
  })),
];
const WEATHER_PRESETS = {
  snow: { count: 420, color: 0xe9f3f5, size: 0.34, opacity: 0.82, fallSpeed: 4.5, windX: 3.2, windZ: 1.2 },
  rain: { count: 650, color: 0xa9c3d0, size: 0.14, opacity: 0.58, fallSpeed: 19, windX: 2.4, windZ: 1.2 },
  storm: { count: 820, color: 0xb9cbd2, size: 0.16, opacity: 0.7, fallSpeed: 25, windX: 8.5, windZ: -4.5 },
  sandstorm: { count: 520, color: 0xc3a173, size: 0.32, opacity: 0.55, fallSpeed: 3.5, windX: 12, windZ: -5 },
  wind: { count: 300, color: 0xc6c6aa, size: 0.25, opacity: 0.4, fallSpeed: 1.3, windX: 10, windZ: -3 },
  ash: { count: 440, color: 0x9c988e, size: 0.25, opacity: 0.55, fallSpeed: 2.4, windX: 4.5, windZ: -1.5 },
};
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

function createB52MissileMesh(color = 0x6d7765) {
  const missile = new THREE.Group();
  const bodyMaterial = standardMaterial(color, { metalness: 0.42, roughness: 0.4 });
  const noseMaterial = standardMaterial(0xa7aa9d, { metalness: 0.56, roughness: 0.3 });
  const finMaterial = standardMaterial(0x343b35, { metalness: 0.34, roughness: 0.5 });
  const bandMaterial = standardMaterial(0x9a9b88, { metalness: 0.62, roughness: 0.34 });

  const body = addCylinder(missile, bodyMaterial, 0.12, 0.15, 1.12, [0, 0, -0.02], 16);
  body.rotation.x = Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.5, 16), noseMaterial);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 0.77;
  nose.castShadow = true;
  missile.add(nose);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), noseMaterial);
  tip.position.z = 1.02;
  missile.add(tip);

  for (const z of [-0.28, 0.22]) {
    const band = addCylinder(missile, bandMaterial, 0.153, 0.153, 0.045, [0, 0, z], 16);
    band.rotation.x = Math.PI / 2;
  }
  const nozzle = addCylinder(missile, finMaterial, 0.145, 0.15, 0.18, [0, 0, -0.61], 16);
  nozzle.rotation.x = Math.PI / 2;
  const nozzleInterior = addCylinder(missile, standardMaterial(0x171b18, { metalness: 0.15 }), 0.105, 0.105, 0.035, [0, 0, -0.71], 12);
  nozzleInterior.rotation.x = Math.PI / 2;

  for (let finIndex = 0; finIndex < 4; finIndex++) {
    const shape = new THREE.Shape();
    shape.moveTo(0.12, -0.34);
    shape.lineTo(0.39, -0.4);
    shape.lineTo(0.39, -0.63);
    shape.lineTo(0.14, -0.58);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 1,
    });
    geometry.translate(0, 0, -0.0175);
    const finGroup = new THREE.Group();
    finGroup.rotation.z = finIndex * Math.PI / 2;
    const fin = new THREE.Mesh(geometry, finMaterial);
    fin.rotation.x = Math.PI / 2;
    fin.castShadow = true;
    finGroup.add(fin);
    missile.add(finGroup);
  }
  return missile;
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
const EXHAUST_PIPE_GEOMETRY = new THREE.CylinderGeometry(0.11, 0.15, 0.46, 10);
const EXHAUST_CAP_GEOMETRY = new THREE.CylinderGeometry(0.16, 0.16, 0.07, 10);
const EXHAUST_SMOKE_GEOMETRY = new THREE.SphereGeometry(1, 10, 8);
const EXHAUST_PIPE_MATERIAL = standardMaterial(0x303632, { metalness: 0.55, roughness: 0.48 });
const EXHAUST_CAP_MATERIAL = standardMaterial(0x121614, { metalness: 0.12, roughness: 0.86 });
const SHARED_GEOMETRIES = new Set([
  TREAD_LINK_GEOMETRY,
  TREAD_LUG_GEOMETRY,
  MAIN_ROTOR_BLADE_GEOMETRY,
  TAIL_ROTOR_BLADE_GEOMETRY,
  ROTOR_TRIM_GEOMETRY,
  EXHAUST_PIPE_GEOMETRY,
  EXHAUST_CAP_GEOMETRY,
  EXHAUST_SMOKE_GEOMETRY,
]);
const SHARED_MATERIALS = new Set([
  TREAD_MATERIAL,
  TREAD_LUG_MATERIAL,
  ROTOR_BLADE_MATERIAL,
  ROTOR_TRIM_MATERIAL,
  EXHAUST_PIPE_MATERIAL,
  EXHAUST_CAP_MATERIAL,
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
  static nextSeparationId = 0;

  constructor(scene, config, position, team, carrier = null, launchOffset = null) {
    this.scene = scene;
    this.config = config;
    this.team = team;
    this.isEnemy = team === "enemy";
    this.separationId = Unit.nextSeparationId++;
    this.root = new THREE.Group();
    this.root.position.copy(position);
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.cooldownRemaining = 0;
    this.secondaryCooldownRemaining = 0;
    this.supportCooldownRemaining = 0;
    this.carrier = carrier;
    this.carrierLaunch = Boolean(carrier);
    this.carrierLaunchOffset = launchOffset ?? new THREE.Vector3();
    this.carrierLaunchElapsed = 0;
    this.destroyed = false;
    this.buildModel();
    this.exhaustPorts = this.createExhaustPipes();
    this.exhaustTimer = config.id === "b52" ? 0 : Math.random() * 0.2;
    this.movementSpeed = 0;
    this.driftIntensity = 0;
    this.movementVelocity = new THREE.Vector2();
    this.worldVelocity = new THREE.Vector3();
    this.scene.add(this.root);
    this.healthBar = createHealthBar(scene, this.isEnemy ? 0xff7655 : 0xd7f06a, config.id === "b52" ? 5.6 : 2.6);
  }

  buildModel() {}

  createExhaustPipes() {
    if (this.config.id === "b52") {
      return B52_ENGINE_X_POSITIONS.map((x) => {
        const pipe = new THREE.Mesh(EXHAUST_PIPE_GEOMETRY, EXHAUST_PIPE_MATERIAL);
        pipe.position.set(x, -0.43, -1.55);
        pipe.scale.setScalar(0.9);
        pipe.rotation.x = -Math.PI / 2;
        this.root.add(pipe);

        const cap = new THREE.Mesh(EXHAUST_CAP_GEOMETRY, EXHAUST_CAP_MATERIAL);
        cap.position.set(x, -0.43, -1.77);
        cap.scale.setScalar(0.9);
        cap.rotation.x = -Math.PI / 2;
        this.root.add(cap);
        return new THREE.Vector3(x, -0.43, -1.8);
      });
    }
    if (this.config.id === "fighterJet") {
      return [-0.62, 0.62].map((x) => {
        const pipe = new THREE.Mesh(EXHAUST_PIPE_GEOMETRY, EXHAUST_PIPE_MATERIAL);
        pipe.position.set(x, -0.34, -2.62);
        pipe.scale.setScalar(0.8);
        pipe.rotation.x = -Math.PI / 2;
        this.root.add(pipe);

        const cap = new THREE.Mesh(EXHAUST_CAP_GEOMETRY, EXHAUST_CAP_MATERIAL);
        cap.position.set(x, -0.34, -2.62 - 0.24 * 0.8);
        cap.scale.setScalar(0.8);
        cap.rotation.x = -Math.PI / 2;
        this.root.add(cap);
        return new THREE.Vector3(x, -0.34, -2.62 - 0.28 * 0.8);
      });
    }

    let outlet;
    let scale = 1;
    let horizontal = false;
    if (this.config.id === "helicopter") {
      outlet = [-0.38, 0.52, -0.9];
      scale = 0.95;
      horizontal = true;
    } else if (this.config.id === "reconDrone") {
      outlet = [0, 0.02, -0.7];
      scale = 0.6;
      horizontal = true;
    } else if (this.config.id === "carrier") {
      outlet = [2.7, 1.45, -9.1];
      scale = 1.2;
    } else if (this.config.id === "submarine") {
      outlet = [0, 1.9, -1.1];
      scale = 0.72;
    } else if (this.config.id === "scout") {
      outlet = [0.6, 0.98, -1.48];
      scale = 0.85;
    } else {
      outlet = [0.82, 1.08, -1.9];
    }

    const [x, y, z] = outlet;
    const pipe = new THREE.Mesh(EXHAUST_PIPE_GEOMETRY, EXHAUST_PIPE_MATERIAL);
    pipe.position.set(x, y, z);
    pipe.scale.setScalar(scale);
    if (horizontal) pipe.rotation.x = -Math.PI / 2;
    else pipe.rotation.x = -0.18;
    this.root.add(pipe);

    const cap = new THREE.Mesh(EXHAUST_CAP_GEOMETRY, EXHAUST_CAP_MATERIAL);
    cap.position.set(x, y + (horizontal ? 0 : 0.24 * scale), z - (horizontal ? 0.24 * scale : 0.04));
    if (horizontal) cap.rotation.x = -Math.PI / 2;
    cap.scale.setScalar(scale);
    this.root.add(cap);
    return [new THREE.Vector3(
      x,
      y + (horizontal ? 0 : 0.28 * scale),
      z - (horizontal ? 0.28 * scale : 0.08),
    )];
  }

  update(delta, battlefield) {
    if (this.hp <= 0) return;
    const previousPosition = this.root.position.clone();
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    this.secondaryCooldownRemaining = Math.max(0, this.secondaryCooldownRemaining - delta);
    this.supportCooldownRemaining = Math.max(0, this.supportCooldownRemaining - delta);

    let target = null;
    let closestDistance = this.config.detectionRange;
    for (const candidate of [...battlefield.units, ...battlefield.missileDefenseTowers]) {
      if (candidate.team === this.team || candidate.hp <= 0) continue;
      if (this.config.id === "b52"
        && (this.team === "player"
          ? candidate.root.position.z >= DEPLOYMENT_LINE_Z
          : candidate.root.position.z <= DEPLOYMENT_LINE_Z)) continue;
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

    if (this.config.supportHeal && this.supportCooldownRemaining === 0) {
      let repairTarget = null;
      let lowestHealthRatio = 1;
      for (const ally of battlefield.units) {
        if (ally === this || ally.team !== this.team || ally.hp <= 0 || ally.hp >= ally.maxHp) continue;
        if (this.root.position.distanceTo(ally.root.position) > this.config.supportRange) continue;
        const healthRatio = ally.hp / ally.maxHp;
        if (healthRatio < lowestHealthRatio) {
          repairTarget = ally;
          lowestHealthRatio = healthRatio;
        }
      }
      if (repairTarget) {
        repairTarget.hp = Math.min(repairTarget.maxHp, repairTarget.hp + this.config.supportHeal);
        repairTarget.updateHealthBar(battlefield.camera);
        this.supportCooldownRemaining = this.config.supportCooldown;
      }
    }

    if (distance <= this.config.range) {
      if (this.cooldownRemaining === 0 && target.hp > 0) {
        if (this.config.id === "b52") {
          const missileStore = this.b52MissileStores.find((store) => store.visible);
          if (missileStore) {
            this.openBombBay();
            battlefield.spawnProjectile(
              this,
              target,
              this.config.weapon,
              this.config.damage,
              this.config.projectileSpeed,
              missileStore.position.clone(),
            );
            missileStore.visible = false;
            this.cooldownRemaining = this.config.cooldown;
          }
        } else {
          const volleyCount = this.config.volleyCount ?? 1;
          for (let shot = 0; shot < volleyCount; shot++) {
            const offsetValues = this.config.muzzleOffsets?.[shot % this.config.muzzleOffsets.length];
            battlefield.spawnProjectile(
              this,
              target,
              this.config.weapon,
              this.config.damage,
              this.config.projectileSpeed,
              offsetValues ? new THREE.Vector3(...offsetValues) : null,
            );
          }
          this.cooldownRemaining = this.config.cooldown;
        }
      }
    }
    if (this.config.secondaryWeapon && distance <= this.config.secondaryRange) {
      if (this.secondaryCooldownRemaining === 0 && target.hp > 0) {
        const offsets = this.config.secondaryMuzzleOffsets ?? [null];
        for (const offsetValues of offsets) {
          battlefield.spawnProjectile(
            this,
            target,
            this.config.secondaryWeapon,
            this.config.secondaryDamage / offsets.length,
            this.config.secondaryProjectileSpeed,
            offsetValues ? new THREE.Vector3(...offsetValues) : null,
          );
        }
        this.secondaryCooldownRemaining = this.config.secondaryCooldown;
      }
    }
    const desiredRange = Math.max(
      this.config.range,
      this.config.secondaryWeapon ? this.config.secondaryRange : 0,
    );
    const outsideWeaponRange = distance > desiredRange;
    const separation = new THREE.Vector2();
    let hasCrowdedUnit = false;
    for (const other of battlefield.units) {
      if (other === this || other.hp <= 0) continue;
      const awayX = this.root.position.x - other.root.position.x;
      const awayZ = this.root.position.z - other.root.position.z;
      const otherDistance = Math.hypot(awayX, awayZ);
      const separationDistance = (UNIT_SPACING_RADII[this.config.id] ?? 2)
        + (UNIT_SPACING_RADII[other.config.id] ?? 2) + 1.4;
      if (otherDistance >= separationDistance) continue;
      hasCrowdedUnit = true;
      if (otherDistance > 0.001) {
        const weight = Math.min(1.5, (separationDistance - otherDistance) / separationDistance);
        separation.x += (awayX / otherDistance) * weight;
        separation.y += (awayZ / otherDistance) * weight;
      } else {
        const angle = (this.separationId * 2.399963229728653 + other.separationId) % (Math.PI * 2);
        const direction = this.separationId < other.separationId ? 1 : -1;
        separation.x += Math.cos(angle) * direction;
        separation.y += Math.sin(angle) * direction;
      }
    }
    if (hasCrowdedUnit && separation.lengthSq() < 0.000001) {
      const angle = this.separationId * 2.399963229728653;
      separation.set(Math.cos(angle), Math.sin(angle));
    }

    const snowTraction = battlefield.level.weather === "snow"
      && !this.config.air
      && this.config.domain !== "water";
    if (outsideWeaponRange || separation.lengthSq() > 0 || snowTraction) {
      const pursuitWeight = hasCrowdedUnit ? 0.35 : 1;
      const separationWeight = hasCrowdedUnit ? 2.6 : 1.4;
      const steerX = (outsideWeaponRange && distance > 0 ? (dx / distance) * pursuitWeight : 0)
        + separation.x * separationWeight;
      const steerZ = (outsideWeaponRange && distance > 0 ? (dz / distance) * pursuitWeight : 0)
        + separation.y * separationWeight;
      const steerLength = Math.hypot(steerX, steerZ);
      if (snowTraction) {
        const desiredVelocity = new THREE.Vector2();
        if (steerLength > 0.001) {
          desiredVelocity.set(steerX / steerLength, steerZ / steerLength)
            .multiplyScalar(this.config.speed * 0.78);
        }
        this.movementVelocity.lerp(desiredVelocity, Math.min(1, delta * 2.2));
        const velocityLength = this.movementVelocity.length();
        let travel = velocityLength * delta;
        if (outsideWeaponRange) {
          const desiredDistance = this.config.range * 0.82;
          travel = Math.min(travel, Math.max(0, distance - desiredDistance));
        }
        if (velocityLength > 0.001) {
          this.root.position.x += (this.movementVelocity.x / velocityLength) * travel;
          this.root.position.z += (this.movementVelocity.y / velocityLength) * travel;
        }
      } else if (steerLength > 0.001) {
        const desiredDistance = this.config.range * 0.82;
        const targetTravel = outsideWeaponRange ? Math.max(0, distance - desiredDistance) : Infinity;
        const separationTravel = this.config.speed * delta * Math.min(1, separation.length());
        const travel = outsideWeaponRange
          ? Math.min(this.config.speed * delta, targetTravel)
          : separationTravel;
        this.root.position.x += (steerX / steerLength) * travel;
        this.root.position.z += (steerZ / steerLength) * travel;
      }
    }
    const fieldMargin = UNIT_SPACING_RADII[this.config.id] ?? 2;
    this.root.position.x = THREE.MathUtils.clamp(
      this.root.position.x,
      -FIELD_WIDTH / 2 + fieldMargin,
      FIELD_WIDTH / 2 - fieldMargin,
    );
    this.root.position.z = THREE.MathUtils.clamp(
      this.root.position.z,
      -FIELD_DEPTH / 2 + fieldMargin,
      FIELD_DEPTH / 2 - fieldMargin,
    );

    this.updateCarrierTakeoff(delta);
    const movementX = this.root.position.x - previousPosition.x;
    const movementZ = this.root.position.z - previousPosition.z;
    const movementDistance = Math.hypot(movementX, movementZ);
    this.movementSpeed = delta > 0 ? movementDistance / delta : 0;
    this.worldVelocity.set(
      delta > 0 ? movementX / delta : 0,
      0,
      delta > 0 ? movementZ / delta : 0,
    );
    const lateralMovement = movementX * Math.cos(this.root.rotation.y)
      - movementZ * Math.sin(this.root.rotation.y);
    this.driftIntensity = THREE.MathUtils.clamp(
      Math.abs(lateralMovement) / Math.max(this.config.speed * delta, 0.001),
      0,
      1,
    );
    this.animate(delta);
    const weather = WEATHER_PRESETS[battlefield.level.weather];
    const windStrength = Math.hypot(weather?.windX ?? 0, weather?.windZ ?? 0);
    const aircraftInWind = ["helicopter", "reconDrone", "fighterJet", "b52"].includes(this.config.id)
      && windStrength >= 8;
    const swayScale = ["fighterJet", "b52"].includes(this.config.id) ? 0.45 : 1;
    this.root.rotation.z = aircraftInWind
      ? Math.sin(performance.now() * 0.008 + this.separationId)
        * Math.min(0.16, windStrength * 0.012)
        * swayScale
      : 0;
    battlefield.updateUnitExhaust(this, delta);
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
    const flightHeight = this.config.id === "reconDrone" ? 4.8 : cruiseHeight;
    const progress = THREE.MathUtils.clamp(this.carrierLaunchElapsed / 1.2, 0, 1);
    this.root.position.y = THREE.MathUtils.lerp(1.2, flightHeight, progress);
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

class MissileDefenseTower {
  constructor(scene, base, offsetX) {
    this.team = base.isEnemy ? "enemy" : "player";
    this.isEnemy = base.isEnemy;
    this.maxHp = 260;
    this.hp = this.maxHp;
    this.range = 42;
    this.cooldownRemaining = 0;
    this.nextLaunchSide = -1;
    this.damage = 30;
    this.projectileSpeed = 42;
    this.attackCooldown = 2;
    this.root = new THREE.Group();
    this.root.position.set(base.root.position.x + offsetX, 0, base.root.position.z);
    scene.add(this.root);

    const body = standardMaterial(this.team === "enemy" ? 0x794b40 : 0x596947, { metalness: 0.28 });
    const dark = standardMaterial(0x252b27, { metalness: 0.42 });
    const missile = standardMaterial(this.team === "enemy" ? 0xb25b48 : 0x9ba38b, { metalness: 0.4 });
    addBox(this.root, dark, [1.8, 0.42, 1.8], [0, 0.21, 0]);
    addBox(this.root, body, [1.05, 1.35, 1.05], [0, 1.05, 0]);

    this.launcher = new THREE.Group();
    this.launcher.position.set(0, 1.72, 0);
    this.root.add(this.launcher);
    addCylinder(this.launcher, dark, 0.55, 0.62, 0.32, [0, 0.15, 0]);
    addBox(this.launcher, body, [1.55, 0.42, 1.4], [0, 0.52, 0]);
    for (const side of [-1, 1]) {
      addCylinder(this.launcher, dark, 0.18, 0.18, 1.15, [side * 0.4, 1.3, 0], 10);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 10), missile);
      tip.position.set(side * 0.4, 2.03, 0);
      this.launcher.add(tip);
    }
    addBox(this.launcher, missile, [0.72, 0.16, 0.52], [0, 0.86, -0.5]);
    this.healthBar = createHealthBar(scene, this.team === "enemy" ? 0xff7655 : 0xd7f06a, 1.8);
  }

  getPosition() {
    return this.root.position.clone();
  }

  getAimPoint() {
    return new THREE.Vector3(this.root.position.x, 2.8, this.root.position.z);
  }

  getLaunchPosition(side = 0) {
    return this.launcher.localToWorld(new THREE.Vector3(side * 0.4, 1.8, 0));
  }

  updateHealthBar(camera) {
    updateHealthBar(
      this.healthBar,
      new THREE.Vector3(this.root.position.x, 4.2, this.root.position.z),
      this.hp,
      this.maxHp,
      camera,
    );
  }

  takeDamage(damage, battlefield) {
    if (this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - damage);
    if (this.hp === 0) {
      this.root.visible = false;
      this.healthBar.group.visible = false;
    } else {
      this.updateHealthBar(battlefield.camera);
    }
  }

  resetHealth(camera) {
    this.hp = this.maxHp;
    this.cooldownRemaining = 0;
    this.root.visible = true;
    this.healthBar.group.visible = true;
    this.updateHealthBar(camera);
  }

  aimAt(position) {
    const towerPosition = this.getPosition();
    this.launcher.rotation.y = Math.atan2(
      position.x - towerPosition.x,
      position.z - towerPosition.z,
    );
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

class InfantryFightingVehicle extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const glass = standardMaterial(0x9aada2, { metalness: 0.3, roughness: 0.36 });
    addBox(this.root, body, [2.5, 0.92, 3.8], [0, 0.8, 0]);
    addBox(this.root, body, [2.05, 0.64, 1.05], [0, 1.48, 1.0]);
    addBox(this.root, glass, [1.32, 0.34, 0.12], [0, 1.53, 1.55]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.25, 0, 1.25]) {
        const wheel = addCylinder(this.root, dark, 0.43, 0.43, 0.2, [side * 1.31, 0.47, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }

    const turret = new THREE.Group();
    turret.position.set(0, 1.45, -0.15);
    this.root.add(turret);
    addBox(turret, body, [1.35, 0.58, 1.35], [0, 0, 0]);
    const cannon = addCylinder(turret, dark, 0.08, 0.12, 1.65, [0, 0.1, 1.18]);
    cannon.rotation.x = Math.PI / 2;
    const coax = addCylinder(turret, dark, 0.035, 0.045, 0.85, [0.42, -0.1, 0.88], 8);
    coax.rotation.x = Math.PI / 2;
  }
}

class ArmoredPersonnelCarrier extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const glass = standardMaterial(0x9aada2, { metalness: 0.3, roughness: 0.36 });
    addBox(this.root, body, [2.55, 1.05, 4.35], [0, 0.82, 0]);
    addBox(this.root, body, [2.2, 0.7, 1.15], [0, 1.57, 1.15]);
    addBox(this.root, glass, [1.72, 0.32, 0.1], [0, 1.68, 1.73]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.35, -0.45, 0.55, 1.35]) {
        const wheel = addCylinder(this.root, dark, 0.42, 0.42, 0.2, [side * 1.33, 0.43, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }

    const gun = addCylinder(this.root, dark, 0.055, 0.075, 1.05, [0, 1.82, 1.0], 8);
    gun.rotation.x = Math.PI / 2;
    for (const x of [-0.62, 0, 0.62]) {
      addBox(this.root, dark, [0.2, 0.36, 0.2], [x, 1.5, -0.35]);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), glass);
      head.position.set(x, 1.77, -0.35);
      this.root.add(head);
    }
  }
}

class RocketArtillery extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f, { metalness: 0.2 });
    const missileBody = standardMaterial(0x9ca28d, { metalness: 0.42, roughness: 0.38 });
    const missileNose = standardMaterial(0x4c554a, { metalness: 0.25, roughness: 0.44 });
    const missileBand = standardMaterial(0xb9523e, { metalness: 0.18, roughness: 0.5 });
    addBox(this.root, body, [2.8, 0.78, 4.3], [0, 0.68, 0]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.3, 0, 1.3]) {
        const wheel = addCylinder(this.root, dark, 0.43, 0.43, 0.2, [side * 1.48, 0.43, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }

    const launcher = new THREE.Group();
    launcher.position.set(0, 1.08, -0.55);
    launcher.rotation.x = -0.28;
    this.root.add(launcher);
    addBox(launcher, body, [2.35, 0.42, 2.2], [0, 0, 0]);
    for (const x of [-0.72, -0.24, 0.24, 0.72]) {
      const missile = new THREE.Group();
      missile.position.set(x, 0.42, 0.1);
      missile.rotation.x = Math.PI / 2 - 0.48;
      launcher.add(missile);
      addCylinder(missile, missileBody, 0.105, 0.12, 1.72, [0, 0, 0], 12);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 12), missileNose);
      nose.position.y = 1.04;
      missile.add(nose);
      addCylinder(missile, missileBand, 0.123, 0.123, 0.12, [0, -0.42, 0], 12);
      addCylinder(missile, dark, 0.12, 0.14, 0.14, [0, -0.9, 0], 12);
      addBox(missile, missileNose, [0.34, 0.08, 0.08], [0.16, -0.67, 0]);
      addBox(missile, missileNose, [0.34, 0.08, 0.08], [-0.16, -0.67, 0]);
      addBox(missile, missileNose, [0.08, 0.08, 0.34], [0, -0.67, 0.16]);
      addBox(missile, missileNose, [0.08, 0.08, 0.34], [0, -0.67, -0.16]);
    }
  }
}

class TankDestroyer extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    addBox(this.root, body, [2.7, 0.8, 4.2], [0, 0.7, 0]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.25, 0, 1.25]) {
        const wheel = addCylinder(this.root, dark, 0.4, 0.4, 0.2, [side * 1.4, 0.42, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    addBox(this.root, body, [2.1, 0.8, 1.5], [0, 1.45, -0.5]);
    const barrel = addCylinder(this.root, dark, 0.15, 0.2, 3.4, [0, 1.5, 0.85]);
    barrel.rotation.x = Math.PI / 2;
  }
}

class ArmoredScoutCar extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const glass = standardMaterial(0x9aada2, { metalness: 0.3, roughness: 0.36 });
    addBox(this.root, body, [2.4, 0.78, 4], [0, 0.78, 0]);
    addBox(this.root, body, [2.05, 0.62, 1.45], [0, 1.38, 1.02]);
    addBox(this.root, body, [1.65, 0.8, 1.65], [0, 1.55, -0.55]);
    addBox(this.root, glass, [1.52, 0.34, 0.1], [0, 1.57, 0.92]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.25, 1.25]) {
        const wheel = addCylinder(this.root, dark, 0.48, 0.48, 0.25, [side * 1.25, 0.48, axle], 12);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    const gun = addCylinder(this.root, dark, 0.06, 0.09, 1.15, [0, 2.02, -0.25], 8);
    gun.rotation.x = Math.PI / 2;
  }
}

class HeavyTank extends Tank {
  buildModel() {
    const body = standardMaterial(this.config.color);
    addBox(this.root, body, [3, 0.9, 4.3], [0, 0.88, 0]);
    for (const side of [-1, 1]) {
      this.addTread(side);
      for (const wheel of [-1, 1]) {
        const roller = addCylinder(this.root, TREAD_MATERIAL, 0.28, 0.28, 0.18, [side * 1.68, 0.58, wheel * 0.9]);
        roller.rotation.z = Math.PI / 2;
      }
    }
    const turret = new THREE.Group();
    turret.position.set(0, 1.5, 0);
    this.root.add(turret);
    addBox(turret, body, [2.2, 0.9, 2.1], [0, 0, 0]);
    const barrel = addCylinder(turret, TREAD_MATERIAL, 0.16, 0.22, 2.6, [0, 0.1, 1.65]);
    barrel.rotation.x = Math.PI / 2;
    addBox(this.root, body, [0.65, 0.5, 1.6], [0, 1.25, -2.55]);
  }
}

class SelfPropelledMortarCarrier extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    addBox(this.root, body, [2.7, 0.82, 4.2], [0, 0.72, 0]);
    for (const side of [-1, 1]) {
      addBox(this.root, dark, [0.42, 0.78, 4], [side * 1.42, 0.48, 0]);
    }
    addBox(this.root, body, [2.2, 0.9, 2.1], [0, 1.45, -0.4]);
    for (const x of [-0.48, 0.48]) {
      const tube = addCylinder(this.root, dark, 0.13, 0.19, 2.4, [x, 1.95, 0.55]);
      tube.rotation.x = Math.PI / 2 - 0.28;
    }
  }
}

class LightTank extends Tank {
  buildModel() {
    const body = standardMaterial(this.config.color);
    addBox(this.root, body, [2.15, 0.68, 3.2], [0, 0.76, 0]);
    for (const side of [-1, 1]) {
      this.addTread(side);
      const roller = addCylinder(this.root, TREAD_MATERIAL, 0.2, 0.2, 0.15, [side * 1.48, 0.48, 0]);
      roller.rotation.z = Math.PI / 2;
    }
    const turret = new THREE.Group();
    turret.position.set(0, 1.18, 0);
    this.root.add(turret);
    addBox(turret, body, [1.45, 0.55, 1.55], [0, 0, 0]);
    const barrel = addCylinder(turret, TREAD_MATERIAL, 0.1, 0.13, 1.7, [0, 0.05, 1.08]);
    barrel.rotation.x = Math.PI / 2;
  }
}

class MobileAntiAircraftGun extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    addBox(this.root, body, [2.5, 0.82, 4], [0, 0.72, 0]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.25, 1.25]) {
        const wheel = addCylinder(this.root, dark, 0.44, 0.44, 0.22, [side * 1.3, 0.46, axle], 12);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    const turret = new THREE.Group();
    turret.position.set(0, 1.25, -0.3);
    this.root.add(turret);
    addCylinder(turret, dark, 0.68, 0.68, 0.24, [0, 0, 0], 12);
    for (const x of [-0.24, 0.24]) {
      const barrel = addCylinder(turret, dark, 0.055, 0.075, 2, [x, 0.26, 1.05], 8);
      barrel.rotation.x = Math.PI / 2;
    }
  }
}

class ArmoredRecoveryVehicle extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const metal = standardMaterial(0xa6a187, { metalness: 0.36 });
    addBox(this.root, body, [2.8, 0.9, 4.3], [0, 0.76, 0]);
    for (const side of [-1, 1]) {
      addBox(this.root, dark, [0.42, 0.78, 4.1], [side * 1.48, 0.48, 0]);
    }
    addBox(this.root, body, [2.1, 0.86, 1.55], [0, 1.58, 0.9]);
    const crane = new THREE.Group();
    crane.position.set(0.65, 1.35, -0.5);
    crane.rotation.x = -0.42;
    this.root.add(crane);
    addBox(crane, metal, [0.36, 0.42, 3.2], [0, 0, 0]);
    addBox(crane, metal, [0.22, 0.72, 0.22], [0, -0.48, 1.5]);
    addCylinder(crane, dark, 0.08, 0.08, 0.5, [0, -0.92, 1.62], 8);
  }
}

class SiegeTank extends Tank {
  buildModel() {
    const body = standardMaterial(this.config.color);
    addBox(this.root, body, [3.3, 0.96, 4.7], [0, 0.88, 0]);
    for (const side of [-1, 1]) this.addTread(side);
    const turret = new THREE.Group();
    turret.position.set(0, 1.55, 0);
    this.root.add(turret);
    addBox(turret, body, [2.45, 0.95, 2.4], [0, 0, 0]);
    const barrel = addCylinder(turret, TREAD_MATERIAL, 0.2, 0.28, 4.1, [0, 0.1, 2.15]);
    barrel.rotation.x = Math.PI / 2;
  }
}

class TankHunter extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    addBox(this.root, body, [2.65, 0.84, 4.3], [0, 0.72, 0]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.25, 0, 1.25]) {
        const wheel = addCylinder(this.root, dark, 0.4, 0.4, 0.22, [side * 1.38, 0.46, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    addBox(this.root, body, [2.05, 0.62, 1.45], [0, 1.35, 0.9]);
    for (const side of [-1, 1]) {
      const launcher = new THREE.Group();
      launcher.position.set(side * 0.62, 1.55, -0.5);
      launcher.rotation.x = -0.25;
      this.root.add(launcher);
      addBox(launcher, dark, [0.65, 0.42, 2.25], [0, 0, 0]);
      const missile = addCylinder(launcher, standardMaterial(0xa6aa98), 0.11, 0.13, 2.1, [0, 0.38, 0.1], 10);
      missile.rotation.x = Math.PI / 2 - 0.25;
    }
  }
}

class MobileCommandVehicle extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const glass = standardMaterial(0x9aada2, { metalness: 0.3, roughness: 0.36 });
    addBox(this.root, body, [2.7, 0.92, 4.4], [0, 0.78, 0]);
    addBox(this.root, body, [2.35, 0.84, 1.8], [0, 1.62, 0.7]);
    addBox(this.root, glass, [1.7, 0.38, 0.12], [0, 1.73, 1.62]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.35, 0, 1.35]) {
        const wheel = addCylinder(this.root, dark, 0.44, 0.44, 0.22, [side * 1.38, 0.46, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    addCylinder(this.root, dark, 0.12, 0.12, 1.05, [0, 2.05, -0.85]);
    this.radar = new THREE.Group();
    this.radar.position.set(0, 2.6, -0.85);
    this.root.add(this.radar);
    const dish = addBox(this.radar, standardMaterial(0xb1b39c), [1.65, 0.08, 0.62], [0, 0, 0]);
    dish.rotation.z = -0.22;
    addBox(this.radar, dark, [0.14, 0.36, 0.14], [0, -0.16, 0]);
  }

  animate(delta) {
    this.radar.rotation.y += delta * 1.1;
  }
}

class AmphibiousRecon extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const glass = standardMaterial(0x9aada2, { metalness: 0.3, roughness: 0.36 });
    addBox(this.root, body, [2.65, 0.78, 4.2], [0, 0.72, 0]);
    for (const side of [-1, 1]) {
      addBox(this.root, standardMaterial(0x58766d), [0.42, 0.68, 4.1], [side * 1.48, 0.48, 0]);
      for (const axle of [-1.2, 0, 1.2]) {
        const wheel = addCylinder(this.root, dark, 0.34, 0.34, 0.18, [side * 1.66, 0.4, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    addBox(this.root, body, [1.85, 0.68, 1.6], [0, 1.38, 0.72]);
    addBox(this.root, glass, [1.48, 0.32, 0.1], [0, 1.47, 1.52]);
    addCylinder(this.root, dark, 0.1, 0.12, 0.8, [0, 1.9, -1.05]);
    const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), glass);
    sensor.position.set(0, 2.38, -1.05);
    this.root.add(sensor);
  }
}

class ArmedReconDrone extends Unit {
  buildModel() {
    this.root.position.y = this.carrierLaunch ? 1.2 : 5.2;
    this.flightTime = 0;
    const body = standardMaterial(this.config.color, { metalness: 0.25 });
    const dark = standardMaterial(0x303832, { metalness: 0.3 });
    addBox(this.root, body, [1.25, 0.4, 2.1], [0, 0, 0]);
    const wing = addBox(this.root, body, [5.2, 0.16, 0.9], [0, 0.04, 0.05]);
    wing.rotation.z = -0.04;
    addBox(this.root, body, [0.2, 0.12, 1.55], [0, 0.05, -1.35]);
    this.rotors = [];
    for (const x of [-1, 1]) {
      const rotor = new THREE.Group();
      rotor.position.set(x * 2.2, 0.15, 0.1);
      this.root.add(rotor);
      addBox(rotor, dark, [1.25, 0.06, 0.1], [0, 0, 0]);
      this.rotors.push(rotor);
    }
    for (const x of [-0.7, 0.7]) {
      const missile = addCylinder(this.root, dark, 0.07, 0.09, 1.05, [x, -0.17, 0.45], 8);
      missile.rotation.x = Math.PI / 2;
    }
  }

  animate(delta) {
    this.flightTime += delta;
    for (const rotor of this.rotors) rotor.rotation.y += delta * 22;
    if (!this.carrierLaunch) this.root.position.y = 5.2 + Math.sin(this.flightTime * 2.4) * 0.12;
  }
}

class GuidedMissileDestroyer extends Unit {
  buildModel() {
    const hull = standardMaterial(this.config.color, { metalness: 0.28, roughness: 0.48 });
    const deck = standardMaterial(0x697571);
    const dark = standardMaterial(0x343b37, { metalness: 0.4 });
    const markings = standardMaterial(0xc2c5b3);
    addBox(this.root, hull, [6.2, 1.1, 16], [0, 0.12, 0]);
    addBox(this.root, deck, [5.5, 0.28, 14.5], [0, 0.82, 0]);
    addBox(this.root, hull, [2.1, 2, 2.7], [-1.25, 1.85, -2.6]);
    addBox(this.root, markings, [0.12, 0.03, 7], [1.4, 1.0, 0.5]);
    for (const z of [-5, -2, 3]) {
      addBox(this.root, standardMaterial(0x829084), [2.2, 0.55, 1.2], [0.3, 1.2, z]);
    }
    for (const [x, z] of [[-2.2, 5.2], [2.2, 5.2], [-2.2, -6.1], [2.2, -6.1]]) {
      addCylinder(this.root, dark, 0.28, 0.32, 0.24, [x, 1.15, z]);
      const barrel = addCylinder(this.root, dark, 0.07, 0.09, 1.1, [x, 1.36, z + 0.62], 8);
      barrel.rotation.x = Math.PI / 2;
    }
    addCylinder(this.root, dark, 0.12, 0.12, 1.6, [0.8, 1.55, -0.5]);
    const radar = addBox(this.root, markings, [1.15, 0.08, 0.42], [0.8, 2.38, -0.5]);
    radar.rotation.z = -0.18;
  }
}

class SelfPropelledHowitzer extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    addBox(this.root, body, [2.8, 0.8, 4.4], [0, 0.7, 0]);
    for (const side of [-1, 1]) {
      addBox(this.root, dark, [0.42, 0.72, 4.2], [side * 1.48, 0.48, 0]);
    }
    addBox(this.root, body, [2.1, 1.25, 2.2], [0, 1.55, -0.45]);
    const barrel = addCylinder(this.root, dark, 0.19, 0.26, 4.8, [0, 2.1, 0.85]);
    barrel.rotation.x = Math.PI / 2 - 0.22;
  }
}

class HeavyRocketArtillery extends RocketArtillery {
  buildModel() {
    super.buildModel();
    const dark = standardMaterial(0x30372f, { metalness: 0.2 });
    const pod = addBox(this.root, dark, [2.65, 0.2, 2.4], [0, 2.25, -0.55]);
    pod.rotation.x = -0.28;
    for (const x of [-0.9, -0.54, -0.18, 0.18, 0.54, 0.9]) {
      const missile = addCylinder(this.root, standardMaterial(0xa6aa98), 0.1, 0.1, 1.85, [x, 2.46, -0.55], 8);
      missile.rotation.x = Math.PI / 2 - 0.28;
    }
  }
}

class EngineerVehicle extends Unit {
  buildModel() {
    const body = standardMaterial(this.config.color);
    const dark = standardMaterial(0x30372f);
    const metal = standardMaterial(0xa6a187, { metalness: 0.36 });
    addBox(this.root, body, [2.5, 0.88, 4.1], [0, 0.75, 0]);
    addBox(this.root, body, [2.15, 0.62, 1.15], [0, 1.43, 1.05]);
    for (const side of [-1, 1]) {
      for (const axle of [-1.25, 0, 1.25]) {
        const wheel = addCylinder(this.root, dark, 0.43, 0.43, 0.2, [side * 1.31, 0.43, axle], 10);
        wheel.rotation.z = Math.PI / 2;
      }
    }

    const crane = new THREE.Group();
    crane.position.set(0.7, 1.28, -0.5);
    crane.rotation.x = -0.55;
    this.root.add(crane);
    addBox(crane, metal, [0.3, 0.34, 2.6], [0, 0, 0]);
    addBox(crane, metal, [0.18, 0.7, 0.18], [0, -0.36, 1.24]);
    addCylinder(crane, dark, 0.09, 0.09, 0.52, [0, -0.76, 1.35], 8);
  }
}

class ReconDrone extends Unit {
  buildModel() {
    this.root.position.y = this.carrierLaunch ? 1.2 : 4.8;
    const body = standardMaterial(this.config.color, { metalness: 0.25 });
    const dark = standardMaterial(0x303832, { metalness: 0.3 });
    const sensor = standardMaterial(0x9bb7ad, { metalness: 0.2, roughness: 0.28 });
    addBox(this.root, body, [0.8, 0.38, 1.15], [0, 0, 0]);
    const camera = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), sensor);
    camera.position.set(0, -0.12, 0.67);
    this.root.add(camera);
    const gun = addCylinder(this.root, dark, 0.045, 0.065, 0.82, [0, -0.23, 0.76], 8);
    gun.rotation.x = Math.PI / 2;
    this.rotors = [];
    this.flightTime = 0;
    this.flightPhase = Math.random() * Math.PI * 2;
    for (const x of [-1, 1]) {
      for (const z of [-0.9, 0.9]) {
        addBox(this.root, dark, [0.12, 0.1, 1.05], [x * 0.55, 0, z * 0.48]);
        const rotor = new THREE.Group();
        rotor.position.set(x * 1.08, 0.1, z * 0.95);
        this.root.add(rotor);
        addBox(rotor, dark, [1.0, 0.06, 0.12], [0, 0, 0]);
        addCylinder(rotor, sensor, 0.1, 0.1, 0.12, [0, 0.08, 0], 8);
        this.rotors.push(rotor);
      }
    }
  }

  animate(delta) {
    this.flightTime += delta;
    for (const rotor of this.rotors) rotor.rotation.y += delta * (18 + this.config.speed * 1.1);
    if (!this.carrierLaunch) {
      this.root.position.y = 4.8 + Math.sin(this.flightTime * 2.2 + this.flightPhase) * 0.16;
    }
  }
}

class AmphibiousAssaultVehicle extends Tank {
  buildModel() {
    super.buildModel();
    const pontoon = standardMaterial(0x58766d, { metalness: 0.18 });
    for (const side of [-1, 1]) {
      addBox(this.root, pontoon, [0.55, 0.62, 3.6], [side * 1.72, 0.46, 0]);
      addBox(this.root, pontoon, [0.16, 0.16, 3.3], [side * 2.04, 0.68, 0]);
    }
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
    const gun = addCylinder(this.root, dark, 0.08, 0.11, 1.05, [0, -0.28, 1.32]);
    gun.rotation.x = Math.PI / 2;
    const launcherMaterial = standardMaterial(0x454c40, { metalness: 0.3 });
    const missileMaterial = standardMaterial(0xb1b39c, { metalness: 0.35 });
    for (const side of [-1, 1]) {
      addBox(this.root, launcherMaterial, [0.3, 0.24, 1.35], [side * 1.1, -0.38, 0.08]);
      const missile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.075, 0.82, 8),
        missileMaterial,
      );
      missile.rotation.x = Math.PI / 2;
      missile.position.set(side * 1.1, -0.19, 0.2);
      this.root.add(missile);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 8), missileMaterial);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(side * 1.1, -0.19, 0.71);
      this.root.add(nose);
    }
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

class B52Stratofortress extends Unit {
  buildModel() {
    this.root.position.y = this.carrierLaunch ? 1.2 : 5.2;
    const body = standardMaterial(this.config.color, { metalness: 0.24, roughness: 0.7 });
    const dark = standardMaterial(0x39413b, { metalness: 0.35, roughness: 0.62 });
    const canopy = standardMaterial(0x91a9a9, { metalness: 0.3, roughness: 0.3 });

    const wingShape = new THREE.Shape();
    wingShape.moveTo(-1.25, 1.05);
    wingShape.lineTo(1.25, 1.05);
    wingShape.lineTo(8.5, -1.25);
    wingShape.lineTo(8.5, -3.25);
    wingShape.lineTo(1.2, -1.8);
    wingShape.lineTo(-1.2, -1.8);
    wingShape.lineTo(-8.5, -3.25);
    wingShape.lineTo(-8.5, -1.25);
    wingShape.closePath();
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, { depth: 0.2, bevelEnabled: false });
    wingGeometry.translate(0, 0, -0.1);
    const wings = new THREE.Mesh(wingGeometry, body);
    wings.rotation.x = Math.PI / 2;
    wings.castShadow = true;
    wings.receiveShadow = true;
    this.root.add(wings);

    const fuselage = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), body);
    fuselage.scale.set(0.7, 0.49, 5.1);
    fuselage.position.set(0, 0.03, 0.15);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    this.root.add(fuselage);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.9, 12), body);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.04, 5.25);
    nose.castShadow = true;
    this.root.add(nose);
    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8), canopy);
    cockpit.scale.set(1, 0.68, 1.45);
    cockpit.position.set(0, 0.39, 3.85);
    this.root.add(cockpit);

    addBox(this.root, body, [3.8, 0.16, 1.05], [0, 0.06, -4.55]);
    addBox(this.root, body, [0.2, 1.65, 1.4], [0, 0.76, -4.52]);
    addBox(this.root, dark, [0.62, 0.12, 2.1], [0, -0.47, -0.45]);

    this.b52MissileStores = [];
    for (const [x, z] of [[-0.2, -0.68], [0.2, -0.68], [-0.2, 0.68], [0.2, 0.68]]) {
      addBox(this.root, dark, [0.2, 0.32, 0.3], [x, -0.22, z]);
      const missile = createB52MissileMesh();
      missile.position.set(x, -0.58, z);
      this.root.add(missile);
      this.b52MissileStores.push(missile);
    }

    this.bombBayDoors = [];
    this.bombBayDoorTimer = 0;
    this.bombBayDoorProgress = 0;
    for (const side of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(side * 0.16, -0.49, 0);
      this.root.add(hinge);
      addBox(hinge, dark, [0.34, 0.08, 2.35], [side * 0.17, 0, 0]);
      this.bombBayDoors.push({ hinge, side });
    }

    for (const x of B52_ENGINE_X_POSITIONS) {
      addBox(this.root, dark, [0.2, 0.36, 0.34], [x, -0.22, -0.35]);
      const nacelle = addCylinder(this.root, body, 0.34, 0.4, 1.5, [x, -0.48, -0.65], 12);
      nacelle.rotation.x = Math.PI / 2;
      const exhaust = addCylinder(this.root, dark, 0.29, 0.29, 0.16, [x, -0.48, -1.43], 12);
      exhaust.rotation.x = Math.PI / 2;
    }

  }

  openBombBay() {
    this.bombBayDoorTimer = 1.3;
  }

  animate(delta) {
    if (!this.carrierLaunch) {
      this.root.position.y = 5.2 + Math.sin(performance.now() * 0.0015 + this.root.position.x) * 0.08;
    }
    this.bombBayDoorTimer = Math.max(0, this.bombBayDoorTimer - delta);
    const doorTarget = this.bombBayDoorTimer > 0 ? 1 : 0;
    this.bombBayDoorProgress += (doorTarget - this.bombBayDoorProgress) * Math.min(1, delta * 24);
    for (const { hinge, side } of this.bombBayDoors) {
      hinge.rotation.z = -side * this.bombBayDoorProgress * 1.1;
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
    this.nextTorpedoTube = -0.42;
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
  tankDestroyer: TankDestroyer,
  armoredCar: ArmoredScoutCar,
  heavyTank: HeavyTank,
  mortarCarrier: SelfPropelledMortarCarrier,
  lightTank: LightTank,
  mobileAA: MobileAntiAircraftGun,
  recoveryVehicle: ArmoredRecoveryVehicle,
  siegeTank: SiegeTank,
  tankHunter: TankHunter,
  mobileCommand: MobileCommandVehicle,
  amphibiousRecon: AmphibiousRecon,
  attackDrone: ArmedReconDrone,
  destroyer: GuidedMissileDestroyer,
  howitzer: SelfPropelledHowitzer,
  ifv: InfantryFightingVehicle,
  apc: ArmoredPersonnelCarrier,
  mlrs: RocketArtillery,
  heavyMlrs: HeavyRocketArtillery,
  engineer: EngineerVehicle,
  sam: SamLauncher,
  helicopter: Helicopter,
  reconDrone: ReconDrone,
  fighterJet: FighterJet,
  b52: B52Stratofortress,
  amphibious: AmphibiousAssaultVehicle,
  carrier: AircraftCarrier,
  submarine: Submarine,
};

class Battlefield {
  constructor() {
    this.mount = $("game");
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x899487);
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.cameraSpherical = new THREE.Spherical(160, 0.78, 0);
    this.camera.position.setFromSpherical(this.cameraSpherical).add(this.cameraTarget);
    this.camera.lookAt(this.cameraTarget);
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
    this.weatherEffect = null;
    this.missileDefenseTowers = [];
    this.cameraDrag = null;
    this.reinforcementTimer = 0;
    this.reinforcementWave = 0;
    this.selectedUnit = UNIT_CATALOG[0];
    this.credits = 0;
    this.weaponUpgradeLevels = Object.fromEntries(UNIT_CATALOG.map((unit) => [unit.id, 0]));
    this.progressWarning = false;
    this.peer = null;
    this.peerConnection = null;
    this.pvpActive = false;
    this.pvpRole = null;
    this.campaignLevelIndex = null;
    this.nextNetworkUnitId = 1;
    this.networkSnapshotTimer = 0;
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
    this.loadLevel(0);
    if (this.progressWarning) this.showToast("CREDITS COULD NOT BE LOADED — STARTING FRESH");
    this.animate();
  }

  createLighting() {
    this.scene.add(new THREE.HemisphereLight(0xe4ebd8, 0x353b2d, 2.1));
    const sun = new THREE.DirectionalLight(0xffe6bd, 3);
    sun.position.set(-34, 60, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 220;
    sun.shadow.camera.bottom = -220;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
  }

  createGround() {
    const terrainTexture = this.createTerrainTexture();
    this.landTexture = terrainTexture;
    this.snowTexture = this.createSnowTexture(terrainTexture);
    this.waterTexture = this.createWaterTexture();
    for (const texture of [terrainTexture, this.snowTexture, this.waterTexture]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(FIELD_WIDTH / 72, FIELD_DEPTH / 100);
      texture.needsUpdate = true;
    }
    terrainTexture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 16);
    this.snowTexture.anisotropy = terrainTexture.anisotropy;
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

    const grid = new THREE.GridHelper(FIELD_WIDTH, 60, 0xa2ac8a, 0x8c9877);
    grid.scale.z = FIELD_DEPTH / FIELD_WIDTH;
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

  createSnowTexture(terrainTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create the battlefield snow texture.");
    context.drawImage(terrainTexture.image, 0, 0, canvas.width, canvas.height);

    const blanket = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    blanket.addColorStop(0, "rgba(226, 236, 240, 0.92)");
    blanket.addColorStop(0.5, "rgba(245, 248, 247, 0.94)");
    blanket.addColorStop(1, "rgba(220, 232, 238, 0.92)");
    context.fillStyle = blanket;
    context.fillRect(0, 0, canvas.width, canvas.height);

    let seed = 0x5a0f2024;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    for (let drift = 0; drift < 90; drift++) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const radius = 24 + random() * 110;
      context.save();
      context.translate(x, y);
      context.rotate(random() * Math.PI);
      context.scale(1, 0.25 + random() * 0.35);
      const patch = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      patch.addColorStop(0, "rgba(255, 255, 255, 0.2)");
      patch.addColorStop(0.7, "rgba(255, 255, 255, 0.08)");
      patch.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = patch;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

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
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 1), rockMaterial, 72 * MAP_SCALE ** 2);
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
    const scrub = new THREE.InstancedMesh(scrubGeometry, scrubMaterial, 120 * MAP_SCALE ** 2);
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
    const ridges = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7, 2), ridgeMaterial, 18 * MAP_SCALE);
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
    this.missileDefenseTowers = [
      new MissileDefenseTower(this.scene, this.playerBase, -5.5),
      new MissileDefenseTower(this.scene, this.playerBase, 5.5),
      new MissileDefenseTower(this.scene, this.enemyBase, -5.5),
      new MissileDefenseTower(this.scene, this.enemyBase, 5.5),
    ];
  }

  updateCameraPosition() {
    this.camera.position.setFromSpherical(this.cameraSpherical).add(this.cameraTarget);
    this.camera.lookAt(this.cameraTarget);
  }

  adjustCamera(control) {
    if (control === "rotate-left") this.cameraSpherical.theta -= 0.14;
    else if (control === "rotate-right") this.cameraSpherical.theta += 0.14;
    else if (control === "tilt-up") this.cameraSpherical.phi = Math.max(0.24, this.cameraSpherical.phi - 0.08);
    else if (control === "tilt-down") this.cameraSpherical.phi = Math.min(1.38, this.cameraSpherical.phi + 0.08);
    else if (control === "zoom-in") this.cameraSpherical.radius = Math.max(34, this.cameraSpherical.radius * 0.85);
    else if (control === "zoom-out") this.cameraSpherical.radius = Math.min(MAX_CAMERA_DISTANCE, this.cameraSpherical.radius / 0.85);
    else if (control === "reset") {
      this.cameraTarget.set(0, 0, 0);
      this.cameraSpherical.set(160, 0.78, 0);
    }
    this.updateCameraPosition();
  }

  beginCameraDrag(event, type) {
    event.preventDefault();
    this.cameraDrag = { pointerId: event.pointerId, type, x: event.clientX, y: event.clientY };
    this.renderer.domElement.setPointerCapture(event.pointerId);
  }

  moveCameraDrag(event) {
    if (!this.cameraDrag || event.pointerId !== this.cameraDrag.pointerId) return;
    const deltaX = event.clientX - this.cameraDrag.x;
    const deltaY = event.clientY - this.cameraDrag.y;
    this.cameraDrag.x = event.clientX;
    this.cameraDrag.y = event.clientY;
    if (this.cameraDrag.type === "orbit") {
      this.cameraSpherical.theta -= deltaX * 0.006;
      this.cameraSpherical.phi = THREE.MathUtils.clamp(this.cameraSpherical.phi + deltaY * 0.005, 0.24, 1.38);
    } else {
      this.camera.updateMatrixWorld();
      const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0).setY(0).normalize();
      const forward = this.cameraTarget.clone().sub(this.camera.position).setY(0).normalize();
      const scale = this.cameraSpherical.radius * 0.0015;
      this.cameraTarget.addScaledVector(right, -deltaX * scale);
      this.cameraTarget.addScaledVector(forward, deltaY * scale);
      this.cameraTarget.x = THREE.MathUtils.clamp(this.cameraTarget.x, -FIELD_WIDTH / 2, FIELD_WIDTH / 2);
      this.cameraTarget.z = THREE.MathUtils.clamp(this.cameraTarget.z, -FIELD_DEPTH / 2, FIELD_DEPTH / 2);
    }
    this.updateCameraPosition();
  }

  createUnitMenu() {
    const list = $("unitList");
    for (const config of UNIT_CATALOG) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "unit-card";
      button.dataset.unit = config.id;
      button.setAttribute("aria-pressed", String(config.id === this.selectedUnit.id));
      const volleyCount = config.volleyCount ?? 1;
      const damageDetail = volleyCount > 1 ? `${config.damage} × ${volleyCount}` : config.damage;
      button.innerHTML = `<span class="unit-card-name">${config.name}</span><span class="unit-card-detail">HP ${config.hp} · DMG ${damageDetail}</span>`;
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
    if (this.pvpActive) return true;
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
    return {
      ...config,
      cooldown: config.cooldown * Math.pow(0.86, level),
      ...(config.secondaryCooldown
        ? { secondaryCooldown: config.secondaryCooldown * Math.pow(0.86, level) }
        : {}),
    };
  }

  refreshWeaponWorkshop() {
    if (!$("weaponInfo")) return;
    if (this.pvpActive) {
      $("credits").textContent = String(this.credits);
      $("workshopUnit").textContent = this.selectedUnit.name.toUpperCase();
      $("weaponInfo").textContent = "WEAPON UPGRADES ARE NOT USED IN ONLINE PvP.";
      $("rateUpgrade").textContent = "UNAVAILABLE IN ONLINE PvP";
      $("rateUpgrade").disabled = true;
      return;
    }
    const level = this.weaponUpgradeLevels[this.selectedUnit.id];
    const config = this.getUpgradedConfig(this.selectedUnit);
    const cost = WEAPON_UPGRADE_BASE_COST + level * 120;
    const rate = Math.round(60 / config.cooldown);
    const rateNames = {
      bomb: "BOMB DROP RATE",
      torpedo: "TORPEDO FIRING RATE",
      missile: "MISSILE FIRING RATE",
      b52Missile: "MISSILE FIRING RATE",
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

  openMultiplayerDialog() {
    if (this.pvpActive) {
      if (window.confirm("Leave the online match and return to the campaign?")) {
        this.endMultiplayerMatch();
      }
      return;
    }
    if (this.peer) {
      $("multiplayerDialog").hidden = false;
      return;
    }
    $("multiplayerDialog").hidden = false;
    $("multiplayerRoom").hidden = true;
    $("multiplayerLobbyActions").hidden = false;
    $("multiplayerStatus").textContent = "Host a match and share its room code, or enter the other player's code to join. Both players can deploy every vehicle. The current campaign battle restarts when you enter or leave PvP.";
  }

  hostMultiplayerMatch() {
    if (this.peer) return;
    $("multiplayerStatus").textContent = "Connecting to the online room service…";
    $("multiplayerLobbyActions").hidden = true;
    this.mode = "lobby";
    this.peer = new Peer();
    this.peer.on("open", (roomId) => {
      $("roomCode").textContent = roomId;
      $("multiplayerRoom").hidden = false;
      $("multiplayerStatus").textContent = "Waiting for the other player to join. Share the room code above.";
    });
    this.peer.on("connection", (connection) => {
      if (this.peerConnection) {
        connection.close();
        return;
      }
      this.attachPeerConnection(connection, "host");
    });
    this.peer.on("error", (error) => this.handlePeerError(error));
  }

  joinMultiplayerMatch() {
    if (this.peer) return;
    const roomId = $("roomCodeInput").value.trim();
    if (!roomId) {
      this.showToast("ENTER THE HOST'S ROOM CODE");
      return;
    }
    $("multiplayerStatus").textContent = "Connecting to the host…";
    $("multiplayerLobbyActions").hidden = true;
    this.mode = "lobby";
    this.peer = new Peer();
    this.peer.on("open", () => {
      const connection = this.peer.connect(roomId, { reliable: true });
      this.attachPeerConnection(connection, "guest");
    });
    this.peer.on("error", (error) => this.handlePeerError(error));
  }

  attachPeerConnection(connection, role) {
    this.peerConnection = connection;
    connection.on("open", () => {
      if (role === "guest") {
        $("multiplayerStatus").textContent = "Connected. Waiting for the host to start the match…";
        this.sendNetworkMessage({ type: "ready" });
      }
    });
    connection.on("data", (message) => this.handleNetworkMessage(message));
    connection.on("close", () => {
      if (this.pvpActive) {
        this.showToast("OTHER PLAYER DISCONNECTED");
        this.endMultiplayerMatch(false);
      } else {
        this.peerConnection = null;
        this.mode = "battle";
        $("multiplayerStatus").textContent = "Connection closed. Try another room code.";
        $("multiplayerLobbyActions").hidden = false;
        $("multiplayerRoom").hidden = true;
      }
    });
    connection.on("error", (error) => this.handlePeerError(error));
    if (role === "host") {
      connection.on("open", () => {
        $("multiplayerStatus").textContent = "Player connected. Starting the match…";
      });
    }
  }

  handlePeerError(error) {
    console.error("Online multiplayer connection failed.", error);
    this.showToast("ONLINE CONNECTION FAILED — CHECK THE ROOM CODE AND TRY AGAIN");
    $("multiplayerStatus").textContent = "Connection failed. Check the room code and try again.";
    $("multiplayerLobbyActions").hidden = false;
    $("multiplayerRoom").hidden = true;
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.peerConnection = null;
  }

  copyRoomCode() {
    const roomId = $("roomCode").textContent;
    if (!roomId) return;
    if (!navigator.clipboard?.writeText) {
      this.showToast("SELECT THE ROOM CODE TO COPY IT");
      return;
    }
    navigator.clipboard.writeText(roomId).then(
      () => this.showToast("ROOM CODE COPIED"),
      (error) => {
        console.error("Could not copy the online room code.", error);
        this.showToast("COPY FAILED — SELECT THE ROOM CODE TO COPY IT");
      },
    );
  }

  sendNetworkMessage(message) {
    if (!this.peerConnection?.open) return false;
    this.peerConnection.send(message);
    return true;
  }

  handleNetworkMessage(message) {
    if (!message || typeof message !== "object") return;
    if (message.type === "ready" && this.pvpRole !== "guest" && !this.pvpActive) {
      this.startMultiplayerMatch("host");
      this.sendNetworkMessage({ type: "start" });
    } else if (message.type === "start" && this.pvpRole !== "host" && !this.pvpActive) {
      this.startMultiplayerMatch("guest");
    } else if (message.type === "deploy" && this.pvpRole === "host" && this.pvpActive) {
      this.handleRemoteDeployment(message);
    } else if (message.type === "state" && this.pvpRole === "guest" && this.pvpActive) {
      this.applyNetworkSnapshot(message);
    } else if (message.type === "result" && this.pvpRole === "guest" && this.pvpActive) {
      this.finishGame(message.result === "victory" ? "defeat" : "victory", true);
    } else if (message.type === "deployRejected" && this.pvpRole === "guest") {
      this.showToast("DEPLOYMENT REJECTED — FORCE LIMIT REACHED");
    } else if (message.type === "end" && this.pvpActive) {
      this.endMultiplayerMatch(false);
    }
  }

  startMultiplayerMatch(role) {
    this.campaignLevelIndex = this.levelIndex;
    this.pvpActive = true;
    this.pvpRole = role;
    this.nextNetworkUnitId = 1;
    this.networkSnapshotTimer = 0;
    $("multiplayerDialog").hidden = true;
    this.loadLevel(0);
    this.playerBase.resetHealth(PLAYER_BASE_HEALTH);
    this.enemyBase.resetHealth(PLAYER_BASE_HEALTH);
    for (const tower of this.missileDefenseTowers) tower.resetHealth(this.camera);
    $("levelLabel").textContent = "ONLINE PvP";
    $("levelCounter").textContent = "PvP";
    $("sectorName").textContent = "Online Arena";
    $("missionBrief").textContent = "Deploy any vehicle and destroy the opposing player's base.";
    $("objectiveName").textContent = "OPPONENT BASE";
    $("battleStatus").textContent = "ONLINE MATCH";
    const guest = role === "guest";
    $("enemyBaseLabel").textContent = guest ? "YOUR BASE" : "HOSTILE BASE";
    $("playerBaseLabel").textContent = guest ? "HOSTILE BASE" : "YOUR BASE";
    $("yourForceLabel").textContent = "YOUR FORCE";
    $("hostileForceLabel").textContent = "OPPONENT";
    if (guest) this.cameraSpherical.theta = Math.PI;
    this.updateCameraPosition();
    this.refreshUnitMenu();
    this.updateSelectionHint();
    this.refreshHud();
    this.refreshWeaponWorkshop();
    this.sendMultiplayerSnapshot(0.1);
  }

  handleRemoteDeployment(message) {
    const config = UNIT_CATALOG.find((unit) => unit.id === message.unitId);
    if (!config || !Number.isFinite(message.x) || !Number.isFinite(message.z)
      || message.z >= DEPLOYMENT_LINE_Z || Math.abs(message.x) > FIELD_WIDTH / 2 - 2
      || !this.isUnitAvailable(config)) return;
    if (this.getActiveUnitCount("enemy") >= MAX_UNITS_PER_TEAM) {
      this.sendNetworkMessage({ type: "deployRejected" });
      return;
    }
    const position = new THREE.Vector3(message.x, 0, message.z);
    let carrier = null;
    let launchOffset = null;
    if (this.level.ocean && config.domain === "air" && config.id !== "b52") {
      carrier = this.units.find((unit) => unit.netId === message.carrierId
        && unit.team === "enemy" && unit.config.id === "carrier" && unit.hp > 0);
      if (!carrier || !Array.isArray(message.launchOffset) || message.launchOffset.length !== 3
        || !message.launchOffset.every(Number.isFinite)) return;
      launchOffset = new THREE.Vector3(...message.launchOffset);
    }
    this.spawnUnit(config.id, "enemy", position, carrier, launchOffset);
    this.refreshHud();
  }

  sendMultiplayerSnapshot(delta) {
    if (!this.pvpActive || this.pvpRole !== "host" || !this.peerConnection?.open) return;
    this.networkSnapshotTimer += delta;
    if (this.networkSnapshotTimer < 0.1) return;
    this.networkSnapshotTimer = 0;
    this.sendNetworkMessage({
      type: "state",
      units: this.units.map((unit) => ({
        id: unit.netId,
        type: unit.config.id,
        team: unit.team,
        x: unit.root.position.x,
        y: unit.root.position.y,
        z: unit.root.position.z,
        rotation: unit.root.rotation.y,
        hp: unit.hp,
        cooldown: unit.cooldownRemaining,
        secondaryCooldown: unit.secondaryCooldownRemaining,
        supportCooldown: unit.supportCooldownRemaining,
      })),
      playerBaseHp: this.playerBase.hp,
      enemyBaseHp: this.enemyBase.hp,
      towerHp: this.missileDefenseTowers.map((tower) => tower.hp),
    });
  }

  applyNetworkSnapshot(snapshot) {
    if (!Array.isArray(snapshot.units) || !Array.isArray(snapshot.towerHp)) return;
    const receivedIds = new Set();
    for (const state of snapshot.units) {
      if (!Number.isSafeInteger(state.id) || !UNIT_CATALOG.some((unit) => unit.id === state.type)
        || !["player", "enemy"].includes(state.team)
        || ![state.x, state.y, state.z, state.rotation, state.hp, state.cooldown,
          state.secondaryCooldown, state.supportCooldown].every(Number.isFinite)) continue;
      receivedIds.add(state.id);
      let unit = this.units.find((candidate) => candidate.netId === state.id);
      if (!unit) {
        unit = this.spawnUnit(state.type, state.team, new THREE.Vector3(state.x, state.y, state.z));
        if (!unit) continue;
        unit.netId = state.id;
      }
      unit.root.position.set(state.x, state.y, state.z);
      unit.root.rotation.y = state.rotation;
      unit.hp = state.hp;
      unit.cooldownRemaining = state.cooldown;
      unit.secondaryCooldownRemaining = state.secondaryCooldown;
      unit.supportCooldownRemaining = state.supportCooldown;
      unit.updateHealthBar(this.camera);
    }
    for (const unit of [...this.units]) {
      if (!receivedIds.has(unit.netId)) this.onUnitDestroyed(unit);
    }
    if (Number.isFinite(snapshot.playerBaseHp)) this.playerBase.hp = snapshot.playerBaseHp;
    if (Number.isFinite(snapshot.enemyBaseHp)) this.enemyBase.hp = snapshot.enemyBaseHp;
    snapshot.towerHp.forEach((hp, index) => {
      const tower = this.missileDefenseTowers[index];
      if (!tower || !Number.isFinite(hp)) return;
      tower.hp = hp;
      tower.root.visible = hp > 0;
      tower.healthBar.group.visible = hp > 0;
      tower.updateHealthBar(this.camera);
    });
    this.refreshHud();
  }

  endMultiplayerMatch(notifyOpponent = true) {
    const campaignLevel = this.campaignLevelIndex ?? 0;
    if (notifyOpponent) this.sendNetworkMessage({ type: "end" });
    this.pvpActive = false;
    this.pvpRole = null;
    if (this.peerConnection) this.peerConnection.close();
    if (this.peer) this.peer.destroy();
    this.peerConnection = null;
    this.peer = null;
    this.clearMultiplayerLabels();
    this.campaignLevelIndex = null;
    $("missionMessage").hidden = true;
    $("multiplayerDialog").hidden = true;
    this.cameraSpherical.theta = 0;
    this.updateCameraPosition();
    this.loadLevel(campaignLevel);
  }

  clearMultiplayerLabels() {
    $("enemyBaseLabel").textContent = "HOSTILE BASE";
    $("playerBaseLabel").textContent = "YOUR BASE";
    $("yourForceLabel").textContent = "YOUR FORCE";
    $("hostileForceLabel").textContent = "HOSTILES";
  }

  closeMultiplayerDialog() {
    if (this.pvpActive) this.endMultiplayerMatch();
    else {
      if (this.peer) this.peer.destroy();
      this.peer = null;
      this.peerConnection = null;
      $("multiplayerDialog").hidden = true;
      this.mode = "battle";
    }
  }

  bindEvents() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button === 2) this.beginCameraDrag(event, "orbit");
      else if (event.button === 1 || (event.button === 0 && event.shiftKey)) this.beginCameraDrag(event, "pan");
      else if (event.button === 0) this.deployAtPointer(event);
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.cameraSpherical.radius = THREE.MathUtils.clamp(
        this.cameraSpherical.radius * Math.exp(event.deltaY * 0.001),
        34,
        MAX_CAMERA_DISTANCE,
      );
      this.updateCameraPosition();
    }, { passive: false });
    window.addEventListener("pointermove", (event) => this.moveCameraDrag(event));
    window.addEventListener("pointerup", (event) => {
      if (event.pointerId === this.cameraDrag?.pointerId) this.cameraDrag = null;
    });
    window.addEventListener("pointercancel", () => { this.cameraDrag = null; });
    for (const button of document.querySelectorAll("[data-camera]")) {
      button.addEventListener("click", () => this.adjustCamera(button.dataset.camera));
    }
    $("messagePrimary").addEventListener("click", () => {
      if (this.pvpActive) {
        this.endMultiplayerMatch();
        return;
      }
      if (this.mode === "defeat") {
        this.loadLevel(this.levelIndex);
      } else if (this.mode === "victory" && this.levelIndex < LEVELS.length - 1) {
        this.loadLevel(this.levelIndex + 1);
      } else {
        this.loadLevel(0);
      }
    });
    $("messageSecondary").addEventListener("click", () => this.loadLevel(0));
    $("rateUpgrade").addEventListener("click", () => this.purchaseWeaponUpgrade());
    $("multiplayerButton").addEventListener("click", () => this.openMultiplayerDialog());
    $("hostMatchButton").addEventListener("click", () => this.hostMultiplayerMatch());
    $("joinMatchButton").addEventListener("click", () => this.joinMultiplayerMatch());
    $("copyRoomCodeButton").addEventListener("click", () => this.copyRoomCode());
    $("closeMultiplayerButton").addEventListener("click", () => this.closeMultiplayerDialog());
    window.addEventListener("resize", () => this.resize());
  }

  deployAtPointer(event) {
    if (this.mode !== "battle") return;
    const team = this.getLocalTeam();
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const [intersection] = this.raycaster.intersectObject(this.ground, false);
    if (!intersection) return;

    const point = intersection.point;
    const onOpponentSide = team === "player"
      ? point.z < DEPLOYMENT_LINE_Z
      : point.z > DEPLOYMENT_LINE_Z;
    if (onOpponentSide || Math.abs(point.x) > FIELD_WIDTH / 2 - 2) {
      this.showToast("DEPLOY UNITS ON YOUR SIDE OF THE FIELD");
      return;
    }

    if (this.getActiveUnitCount(team) >= MAX_UNITS_PER_TEAM) {
      this.showToast(`FORCE LIMIT: ${MAX_UNITS_PER_TEAM} ACTIVE UNITS`);
      return;
    }

    let carrier = null;
    let position = new THREE.Vector3(point.x, 0, point.z);
    let launchOffset = null;
    if (this.level.ocean && this.selectedUnit.domain === "air" && this.selectedUnit.id !== "b52") {
      const carriers = this.units.filter((unit) => unit.team === team
        && unit.config.id === "carrier" && unit.hp > 0);
      if (carriers.length === 0) {
        this.showToast("DEPLOY AN AIRCRAFT CARRIER BEFORE LAUNCHING AIRCRAFT");
        return;
      }
      carriers.sort((a, b) => a.root.position.distanceToSquared(position) - b.root.position.distanceToSquared(position));
      carrier = carriers[0];
      const launchedCount = this.units.filter((unit) => unit.team === team
        && unit.carrier === carrier && unit.carrierLaunch).length;
      launchOffset = new THREE.Vector3(
        launchedCount % 2 === 0 ? -1.6 : 1.6,
        0,
        (Math.floor(launchedCount / 2) % 5 - 2) * 2.4,
      );
      position = carrier.root.position.clone().add(launchOffset);
      position.y = 1.2;
    }
    if (this.pvpActive && this.pvpRole === "guest") {
      const sent = this.sendNetworkMessage({
        type: "deploy",
        unitId: this.selectedUnit.id,
        x: position.x,
        z: position.z,
        carrierId: carrier?.netId ?? null,
        launchOffset: launchOffset ? launchOffset.toArray() : null,
      });
      this.showToast(sent
        ? `${this.selectedUnit.name.toUpperCase()} DEPLOYMENT SENT`
        : "ONLINE CONNECTION LOST — REJOIN TO DEPLOY");
      return;
    }

    const unit = this.spawnUnit(this.selectedUnit.id, team, position, carrier, launchOffset);
    if (!unit) {
      this.showToast(`FORCE LIMIT: ${MAX_UNITS_PER_TEAM} ACTIVE UNITS`);
      return;
    }
    this.refreshHud();
    this.refreshWeaponWorkshop();
    this.showToast(`${this.selectedUnit.name.toUpperCase()} DEPLOYED`);
  }

  findOpenSpawnPosition(position, typeId, team, ignoredUnits = null) {
    const unitRadius = UNIT_SPACING_RADII[typeId] ?? 2;
    const xMin = -FIELD_WIDTH / 2 + unitRadius;
    const xMax = FIELD_WIDTH / 2 - unitRadius;
    const zMin = team === "player" ? DEPLOYMENT_LINE_Z + unitRadius : -FIELD_DEPTH / 2 + unitRadius;
    const zMax = team === "player" ? FIELD_DEPTH / 2 - unitRadius : DEPLOYMENT_LINE_Z - unitRadius;
    const candidates = [];
    candidates.push(position.clone());
    const step = Math.max(1.2, unitRadius * 0.6);
    for (let ring = 1; ring <= 16; ring++) {
      const radius = ring * step;
      for (let spoke = 0; spoke < 16; spoke++) {
        const angle = (spoke / 16) * Math.PI * 2;
        candidates.push(new THREE.Vector3(
          position.x + Math.cos(angle) * radius,
          position.y,
          position.z + Math.sin(angle) * radius,
        ));
      }
    }

    let bestPosition = candidates[0];
    let bestClearance = -Infinity;
    for (const candidate of candidates) {
      candidate.x = THREE.MathUtils.clamp(candidate.x, xMin, xMax);
      candidate.z = THREE.MathUtils.clamp(candidate.z, zMin, zMax);
      let clearance = Infinity;
      for (const other of this.units) {
        if (other.hp <= 0 || ignoredUnits?.has(other)) continue;
        const requiredDistance = unitRadius + (UNIT_SPACING_RADII[other.config.id] ?? 2) + 1.4;
        const distance = Math.hypot(candidate.x - other.root.position.x, candidate.z - other.root.position.z);
        clearance = Math.min(clearance, distance - requiredDistance);
        if (clearance < 0 && clearance <= bestClearance) break;
      }
      if (clearance > bestClearance) {
        bestPosition = candidate;
        bestClearance = clearance;
      }
      if (clearance >= 0) return candidate;
    }
    return bestPosition;
  }

  getActiveUnitCount(team) {
    return this.units.filter((unit) => unit.team === team && unit.hp > 0).length;
  }

  getLocalTeam() {
    return this.pvpActive && this.pvpRole === "guest" ? "enemy" : "player";
  }

  getOpponentTeam() {
    return this.getLocalTeam() === "player" ? "enemy" : "player";
  }

  spawnUnit(typeId, team, position, carrier = null, launchOffset = null) {
    if (team === "enemy" && typeId === "b52" && !this.pvpActive) {
      throw new Error("The B-52 Stratofortress is player-only.");
    }
    const baseConfig = UNIT_CATALOG.find((unit) => unit.id === typeId);
    const UnitType = UNIT_TYPES[typeId];
    if (!baseConfig || !UnitType) throw new Error(`Unknown unit type: ${typeId}`);
    if (this.getActiveUnitCount(team) >= MAX_UNITS_PER_TEAM) return null;

    let config = team === "player" && !this.pvpActive ? this.getUpgradedConfig(baseConfig) : baseConfig;
    if (team === "enemy" && !this.pvpActive) {
      const enemyColors = {
        tank: 0x954d3d,
        scout: 0xb2664d,
        artillery: 0x805047,
        tankDestroyer: 0x815345,
        armoredCar: 0x80634c,
        heavyTank: 0x76504a,
        mortarCarrier: 0x805047,
        lightTank: 0x954d3d,
        mobileAA: 0x80634c,
        recoveryVehicle: 0x826047,
        siegeTank: 0x76504a,
        tankHunter: 0x805047,
        mobileCommand: 0x826047,
        amphibiousRecon: 0x5c8180,
        attackDrone: 0xa55d4c,
        destroyer: 0x986557,
        howitzer: 0x805047,
        ifv: 0x8c5142,
        apc: 0x865044,
        mlrs: 0x76504a,
        heavyMlrs: 0x76504a,
        engineer: 0x826047,
        sam: 0x80634c,
        helicopter: 0xa1513f,
        reconDrone: 0xa55d4c,
        fighterJet: 0xc36a55,
        amphibious: 0x5c8180,
        carrier: 0x986557,
        submarine: 0x85584f,
      };
      const strength = this.level.enemyStrength;
      const enemyUpgradeLevel = Math.min(MAX_WEAPON_UPGRADE_LEVEL, Math.floor(this.levelIndex / 3));
      config = {
        ...baseConfig,
        hp: Math.round(baseConfig.hp * strength),
        damage: Math.round(baseConfig.damage * strength),
        cooldown: baseConfig.cooldown * Math.pow(0.96, this.levelIndex) * Math.pow(0.86, enemyUpgradeLevel),
        ...(baseConfig.secondaryCooldown
          ? {
            secondaryCooldown: baseConfig.secondaryCooldown
              * Math.pow(0.96, this.levelIndex)
              * Math.pow(0.86, enemyUpgradeLevel),
          }
          : {}),
        ...(baseConfig.secondaryDamage
          ? { secondaryDamage: Math.round(baseConfig.secondaryDamage * strength) }
          : {}),
        speed: baseConfig.speed * (1 + this.levelIndex * 0.06),
        color: enemyColors[typeId],
      };
    }

    const spawnPosition = carrier ? position : this.findOpenSpawnPosition(position, typeId, team);
    const unit = new UnitType(this.scene, config, spawnPosition, team, carrier, launchOffset);
    unit.netId = this.nextNetworkUnitId++;
    this.units.push(unit);
    return unit;
  }

  loadLevel(index) {
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
    this.clearUnits();

    this.enemyBase.resetHealth(this.level.baseHealth);
    this.playerBase.resetHealth(PLAYER_BASE_HEALTH + index * PLAYER_BASE_HEALTH_INCREASE);
    for (const tower of this.missileDefenseTowers) tower.resetHealth(this.camera);
    this.scene.background.setHex(this.level.sky);
    this.setWeather(this.level.weather ?? "clear");
    const snowCovered = !this.level.ocean && this.level.weather === "snow";
    this.ground.material.map = this.level.ocean
      ? this.waterTexture
      : snowCovered ? this.snowTexture : this.landTexture;
    this.ground.material.bumpMap = this.level.ocean ? null : this.landBumpTexture;
    this.ground.material.color.setHex(snowCovered ? 0xffffff : this.level.groundTint);
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

    for (const spawn of this.pvpActive ? [] : this.level.enemies) {
      this.spawnUnit(
        spawn.type,
        "enemy",
        new THREE.Vector3(spawn.x * MAP_SCALE, 0, spawn.z * MAP_SCALE),
      );
    }
    this.refreshHud();
  }

  setWeather(weather) {
    if (this.weatherEffect) {
      this.scene.remove(this.weatherEffect.points);
      this.weatherEffect.points.geometry.dispose();
      this.weatherEffect.points.material.dispose();
      this.weatherEffect = null;
    }

    const preset = WEATHER_PRESETS[weather];
    if (weather !== "clear" && !preset) throw new RangeError(`Unknown weather: ${weather}`);
    this.scene.fog = null;
    if (!preset) return;

    const positions = new Float32Array(preset.count * 3);
    for (let i = 0; i < preset.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD_WIDTH;
      positions[i * 3 + 1] = Math.random() * 36 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD_DEPTH;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: preset.color,
      size: preset.size,
      transparent: true,
      opacity: preset.opacity,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    this.scene.add(points);
    this.weatherEffect = { points, preset };
  }

  updateWeather(delta) {
    if (!this.weatherEffect) return;
    const { points, preset } = this.weatherEffect;
    const positions = points.geometry.attributes.position.array;
    const halfWidth = FIELD_WIDTH / 2;
    const halfDepth = FIELD_DEPTH / 2;
    for (let i = 0; i < preset.count; i++) {
      const offset = i * 3;
      positions[offset] += preset.windX * delta;
      positions[offset + 1] -= preset.fallSpeed * delta;
      positions[offset + 2] += preset.windZ * delta;
      if (positions[offset + 1] < 0
        || Math.abs(positions[offset]) > halfWidth
        || Math.abs(positions[offset + 2]) > halfDepth) {
        positions[offset] = (Math.random() - 0.5) * FIELD_WIDTH;
        positions[offset + 1] = 24 + Math.random() * 20;
        positions[offset + 2] = (Math.random() - 0.5) * FIELD_DEPTH;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
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
    const ownTeam = this.getLocalTeam();
    const playerCount = this.units.filter((unit) => unit.team === ownTeam && unit.hp > 0).length;
    const enemyCount = this.units.filter((unit) => unit.team !== ownTeam && unit.hp > 0).length;
    $("deployedCount").textContent = String(playerCount).padStart(2, "0");
    $("deployedSummary").textContent = String(playerCount);
    $("hostileCount").textContent = String(enemyCount);
    const ownBase = ownTeam === "player" ? this.playerBase : this.enemyBase;
    const hostileBase = ownTeam === "player" ? this.enemyBase : this.playerBase;
    $("enemyBaseText").textContent = `${Math.ceil(hostileBase.hp)} / ${hostileBase.maxHp}`;
    $("playerBaseText").textContent = `${Math.ceil(ownBase.hp)} / ${ownBase.maxHp}`;
    $("enemyBaseBar").style.width = `${(hostileBase.hp / hostileBase.maxHp) * 100}%`;
    $("playerBaseBar").style.width = `${(ownBase.hp / ownBase.maxHp) * 100}%`;
    this.enemyBase.updateHealthBar(this.camera);
    this.playerBase.updateHealthBar(this.camera);
  }

  onUnitDestroyed(unit) {
    unit.destroy();
    const unitIndex = this.units.indexOf(unit);
    if (unitIndex !== -1) this.units.splice(unitIndex, 1);
    this.refreshHud();
  }

  updateEnemyReinforcements(delta) {
    if (this.pvpActive) return;
    if (this.getActiveUnitCount("enemy") >= MAX_UNITS_PER_TEAM) {
      this.reinforcementTimer = 0;
      return;
    }
    this.reinforcementTimer += delta;
    const interval = Math.max(6.4, 12 - this.levelIndex * 0.34);
    if (this.reinforcementTimer < interval) return;

    this.reinforcementTimer -= interval;
    this.reinforcementWave++;
    const landTypes = ["tank", "artillery", "tankDestroyer", "armoredCar", "heavyTank", "mortarCarrier", "lightTank", "mobileAA", "recoveryVehicle", "siegeTank", "tankHunter", "mobileCommand", "howitzer", "scout", "ifv", "apc", "mlrs", "heavyMlrs", "engineer", "helicopter", "reconDrone", "attackDrone", "fighterJet", "amphibious", "amphibiousRecon", "sam"];
    const oceanTypes = ["carrier", "submarine", "destroyer", "fighterJet", "helicopter", "reconDrone", "attackDrone", "amphibious", "amphibiousRecon"];
    const types = this.level.ocean ? oceanTypes : landTypes;
    const availableSlots = MAX_UNITS_PER_TEAM - this.getActiveUnitCount("enemy");
    const groupSize = Math.min(3, 1 + Math.floor((this.reinforcementWave - 1) / 5), availableSlots);
    for (let i = 0; i < groupSize; i++) {
      const type = types[(this.reinforcementWave + i - 1) % types.length];
      const formationSlot = this.reinforcementWave * 2 + i * 3;
      const x = (formationSlot % 7 - 3) * 15 * MAP_SCALE;
      const z = (-45 - ((this.reinforcementWave + i) % 3) * 7) * MAP_SCALE;
      this.spawnUnit(type, "enemy", new THREE.Vector3(x, 0, z));
    }
    this.refreshHud();
    this.showToast("ENEMY REINFORCEMENTS DEPLOYED");
  }

  updateMissileDefense(delta) {
    for (const tower of this.missileDefenseTowers) {
      if (tower.hp <= 0) continue;
      tower.cooldownRemaining = Math.max(0, tower.cooldownRemaining - delta);
      if (tower.cooldownRemaining > 0) continue;

      const towerPosition = tower.getPosition();
      let incomingMissile = null;
      let closestDistance = tower.range;
      for (const projectile of this.projectiles) {
        if (!["missile", "b52Missile"].includes(projectile.weapon)
          || projectile.owner.team === tower.team
          || projectile.intercepted) continue;
        const targetTeam = projectile.target.team ?? (projectile.target.isEnemy ? "enemy" : "player");
        if (targetTeam !== tower.team) continue;
        const distance = towerPosition.distanceTo(projectile.mesh.position);
        if (distance < closestDistance) {
          incomingMissile = projectile;
          closestDistance = distance;
        }
      }

      if (incomingMissile) {
        incomingMissile.intercepted = true;
        tower.aimAt(incomingMissile.mesh.position);
        const mesh = this.createMissileMesh(tower.team);
        mesh.position.copy(tower.getLaunchPosition(tower.nextLaunchSide));
        tower.nextLaunchSide *= -1;
        this.scene.add(mesh);
        this.projectiles.push({
          mesh,
          owner: tower,
          weapon: "interceptor",
          targetProjectile: incomingMissile,
          projectileSpeed: 52,
          life: 4,
          trailTimer: 0,
        });
        tower.cooldownRemaining = 1.25;
        continue;
      }

      let target = null;
      closestDistance = tower.range;
      for (const unit of this.units) {
        if (unit.team === tower.team || unit.hp <= 0) continue;
        const distance = towerPosition.distanceTo(unit.root.position);
        if (distance < closestDistance) {
          target = unit;
          closestDistance = distance;
        }
      }
      const enemyBase = tower.team === "player" ? this.enemyBase : this.playerBase;
      const baseDistance = towerPosition.distanceTo(enemyBase.root.position);
      if (!target && baseDistance < closestDistance) target = enemyBase;
      if (!target) continue;

      tower.aimAt(target.getAimPoint());
      const mesh = this.createMissileMesh(tower.team);
      mesh.position.copy(tower.getLaunchPosition(tower.nextLaunchSide));
      tower.nextLaunchSide *= -1;
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        target.getAimPoint().sub(mesh.position).normalize(),
      );
      this.scene.add(mesh);
      this.projectiles.push({
        mesh,
        owner: tower,
        target,
        weapon: "missile",
        damage: tower.damage,
        projectileSpeed: tower.projectileSpeed,
        life: 5,
        trailTimer: 0,
      });
      tower.cooldownRemaining = tower.attackCooldown;
    }
  }

  spawnInterceptionFlash(position) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffc45c,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(EXHAUST_SMOKE_GEOMETRY, material);
    mesh.position.copy(position);
    const size = 0.4;
    mesh.scale.setScalar(size);
    this.scene.add(mesh);
    this.smokeParticles.push({
      mesh,
      material,
      life: 0.24,
      maxLife: 0.24,
      size,
      growth: 0.5,
      opacity: 0.95,
      velocity: new THREE.Vector3(0, 0.25, 0),
    });
  }

  spawnProjectile(
    owner,
    target,
    weapon = owner.config.weapon,
    damage = owner.config.damage,
    projectileSpeed = owner.config.projectileSpeed,
    localMuzzleOffset = null,
  ) {
    const start = localMuzzleOffset
      ? owner.root.localToWorld(localMuzzleOffset.clone())
      : owner.root.position.clone();
    if (!localMuzzleOffset && weapon === "torpedo" && owner.config.id === "submarine") {
      start.copy(owner.root.localToWorld(new THREE.Vector3(owner.nextTorpedoTube, 0.18, 4.6)));
      owner.nextTorpedoTube *= -1;
    } else if (!localMuzzleOffset) {
      start.y += owner.config.air ? 0.15 : 1.4;
    }
    const color = owner.team === "player" ? 0xd7f06a : 0xff7655;
    let mesh;
    if (weapon === "b52Missile") {
      mesh = createB52MissileMesh(owner.team === "player" ? 0x6d7765 : 0x985e51);
    } else if (weapon === "missile") {
      mesh = this.createMissileMesh(owner.team);
    } else if (weapon === "torpedo") {
      mesh = this.createTorpedoMesh(owner.team);
    } else {
      const geometry = weapon === "bomb"
        ? new THREE.CylinderGeometry(0.13, 0.18, 0.65, 8)
        : new THREE.SphereGeometry(0.19, 10, 8);
      mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color }));
    }
    mesh.position.copy(start);
    const aimPoint = target.getAimPoint();
    if (weapon === "torpedo") aimPoint.y = start.y;
    const direction = aimPoint.sub(start).normalize();
    if (weapon === "b52Missile" || weapon === "missile") {
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    } else if (weapon === "bomb" || weapon === "torpedo") {
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    }
    this.scene.add(mesh);
    const projectile = { mesh, owner, target, weapon, damage, projectileSpeed, life: 5, trailTimer: 0 };
    if (weapon === "b52Missile") {
      Object.assign(projectile, {
        currentSpeed: projectileSpeed,
        acceleration: 40,
        lastKnownTargetPosition: target.getAimPoint(),
      });
    }
    this.projectiles.push(projectile);
  }

  createTorpedoMesh(team) {
    const color = team === "player" ? 0x31eaff : 0xff6248;
    const bodyMaterial = new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false });
    const detailMaterial = new THREE.MeshBasicMaterial({
      color: 0xe9ffff,
      depthTest: false,
      depthWrite: false,
    });
    const torpedo = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 1.15, 12), bodyMaterial);
    torpedo.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 12), detailMaterial);
    nose.position.y = 0.78;
    torpedo.add(nose);
    const tailFin = new THREE.BoxGeometry(0.48, 0.12, 0.08);
    for (const rotation of [0, Math.PI / 2]) {
      const fin = new THREE.Mesh(tailFin, detailMaterial);
      fin.position.y = -0.54;
      fin.rotation.y = rotation;
      torpedo.add(fin);
    }
    torpedo.traverse((part) => {
      if (part.isMesh) part.renderOrder = 2;
    });
    return torpedo;
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

  updateUnitExhaust(unit, delta) {
    const isB52 = unit.config.id === "b52";
    unit.exhaustTimer -= delta;
    if (unit.exhaustTimer > 0) return;

    const weatherActive = (this.level.weather ?? "clear") !== "clear";
    const snowDrifting = this.level.weather === "snow"
      && unit.config.domain !== "water"
      && unit.movementSpeed > 1
      && unit.driftIntensity > 0.18;
    const moving = unit.movementSpeed > 0.5;
    const heavyPlume = weatherActive || snowDrifting;
    const isFighterJet = unit.config.id === "fighterJet";
    unit.exhaustTimer = isB52
      ? 0.015
      : snowDrifting ? 0.16 : weatherActive ? (moving ? 0.17 : 0.4) : moving ? 0.22 : 0.72;

    for (const outlet of unit.exhaustPorts) {
      const position = unit.root.localToWorld(outlet.clone());
      const velocity = new THREE.Vector3(0, 0, -1).applyQuaternion(unit.root.quaternion);
      velocity.multiplyScalar(isB52 ? 6 : isFighterJet ? 12 : snowDrifting ? 2.3 : weatherActive ? 1.7 : moving ? 1.1 : 0.35);
      velocity.y += snowDrifting ? 0.65 : weatherActive ? 0.55 : 0.38;
      if (isB52) {
        velocity.addScaledVector(unit.worldVelocity, 0.6);
        this.spawnB52Exhaust(position, velocity, moving, heavyPlume);
      } else if (isFighterJet) {
        velocity.addScaledVector(unit.worldVelocity, 0.7);
        this.spawnFighterJetExhaust(position, velocity, moving, heavyPlume);
      } else {
        this.spawnExhaustSmoke(position, heavyPlume, moving, velocity);
      }
    }
  }

  spawnB52Exhaust(position, velocity, moving, heavyPlume) {
    const layers = [
      {
        color: heavyPlume ? 0x9ca39e : 0x858d89,
        size: heavyPlume ? 0.36 : 0.24,
        growth: heavyPlume ? 0.65 : 0.4,
        stretch: heavyPlume ? 3.8 : 3.3,
        opacity: heavyPlume ? 0.48 : 0.26,
        life: heavyPlume ? 1.4 : moving ? 1.25 : 0.9,
        speed: 0.38,
      },
    ];

    for (const layer of layers) {
      const material = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(EXHAUST_SMOKE_GEOMETRY, material);
      mesh.position.copy(position);
      const particleVelocity = velocity.clone().multiplyScalar(layer.speed).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.22,
        Math.random() * 0.12,
        (Math.random() - 0.5) * 0.22,
      ));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), particleVelocity.clone().normalize());
      mesh.scale.set(layer.size * 0.78, layer.size * 0.78, layer.size * layer.stretch);
      this.scene.add(mesh);
      this.smokeParticles.push({
        mesh,
        material,
        life: layer.life,
        maxLife: layer.life,
        size: layer.size,
        growth: layer.growth,
        stretch: layer.stretch,
        opacity: layer.opacity,
        velocity: particleVelocity,
      });
    }
  }

  spawnFighterJetExhaust(position, velocity, moving, heavyPlume) {
    const layers = [
      {
        color: 0xc3cbc9,
        size: heavyPlume ? 0.16 : 0.12,
        growth: heavyPlume ? 0.18 : 0.12,
        stretch: 2.8,
        opacity: heavyPlume ? 0.36 : 0.3,
        life: 0.38,
        speed: 0.72,
      },
      {
        color: heavyPlume ? 0xa2aaa6 : 0x87908d,
        size: heavyPlume ? 0.3 : 0.2,
        growth: heavyPlume ? 0.54 : 0.36,
        stretch: heavyPlume ? 3.6 : 3.2,
        opacity: heavyPlume ? 0.38 : 0.24,
        life: heavyPlume ? 1.25 : moving ? 1.05 : 0.8,
        speed: 0.38,
      },
    ];

    for (const layer of layers) {
      const material = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(EXHAUST_SMOKE_GEOMETRY, material);
      mesh.position.copy(position);
      const particleVelocity = velocity.clone().multiplyScalar(layer.speed).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.16,
        Math.random() * 0.1,
        (Math.random() - 0.5) * 0.16,
      ));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), particleVelocity.clone().normalize());
      mesh.scale.set(layer.size * 0.78, layer.size * 0.78, layer.size * layer.stretch);
      this.scene.add(mesh);
      this.smokeParticles.push({
        mesh,
        material,
        life: layer.life,
        maxLife: layer.life,
        size: layer.size,
        growth: layer.growth,
        stretch: layer.stretch,
        opacity: layer.opacity,
        velocity: particleVelocity,
      });
    }
  }

  spawnTorpedoBubble(position) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x8cf7ff,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 6), material);
    mesh.position.copy(position);
    const size = 0.12 + Math.random() * 0.08;
    mesh.scale.setScalar(size);
    mesh.renderOrder = 2;
    this.scene.add(mesh);
    this.smokeParticles.push({
      mesh,
      material,
      life: 0.85,
      maxLife: 0.85,
      size,
      growth: 0.16,
      opacity: 0.82,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        0.05 + Math.random() * 0.05,
        (Math.random() - 0.5) * 0.08,
      ),
    });
  }

  spawnExhaustSmoke(position, heavyPlume, moving, velocity) {
    const size = heavyPlume ? 0.42 : moving ? 0.3 : 0.22;
    const growth = heavyPlume ? 0.65 : 0.42;
    const opacity = heavyPlume ? 0.68 : 0.5;
    const life = heavyPlume ? 1.4 : moving ? 1.1 : 0.9;
    const material = new THREE.MeshBasicMaterial({
      color: heavyPlume ? 0x9ca39e : 0x737a76,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(EXHAUST_SMOKE_GEOMETRY, material);
    mesh.position.copy(position);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), velocity.clone().normalize());
    mesh.scale.set(size * 0.78, size * 0.78, size * 1.7);
    this.scene.add(mesh);
    this.smokeParticles.push({
      mesh,
      material,
      life,
      maxLife: life,
      size,
      growth,
      stretch: 1.7,
      opacity,
      velocity: velocity.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.16,
        Math.random() * 0.12,
        (Math.random() - 0.5) * 0.16,
      )),
    });
  }

  updateSmokeParticles(delta) {
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const particle = this.smokeParticles[i];
      particle.life -= delta;
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        if (!SHARED_GEOMETRIES.has(particle.mesh.geometry)) particle.mesh.geometry.dispose();
        particle.material.dispose();
        this.smokeParticles.splice(i, 1);
        continue;
      }

      const progress = 1 - particle.life / particle.maxLife;
      particle.material.opacity = (particle.opacity ?? 0.44) * (1 - progress);
      const size = particle.size + progress * (particle.growth ?? 0.38);
      if (particle.stretch) particle.mesh.scale.set(size * 0.78, size * 0.78, size * particle.stretch);
      else particle.mesh.scale.setScalar(size);
      particle.mesh.position.addScaledVector(particle.velocity, delta);
    }
  }

  updateProjectiles(delta) {
    for (let i = this.projectiles.length - 1; i >= 0 && this.mode === "battle"; i--) {
      const projectile = this.projectiles[i];
      if (projectile.weapon === "interceptor") {
        const targetProjectile = projectile.targetProjectile;
        const targetIndex = this.projectiles.indexOf(targetProjectile);
        if (targetIndex === -1) {
          this.removeProjectile(i);
          continue;
        }
        projectile.life -= delta;
        if (projectile.life <= 0) {
          targetProjectile.intercepted = false;
          this.removeProjectile(i);
          continue;
        }

        const offset = targetProjectile.mesh.position.clone().sub(projectile.mesh.position);
        const distance = offset.length();
        const step = projectile.projectileSpeed * delta;
        if (distance <= step + 0.9) {
          const interceptPosition = targetProjectile.mesh.position.clone();
          this.removeProjectile(targetIndex);
          this.spawnInterceptionFlash(interceptPosition);
          const interceptorIndex = this.projectiles.indexOf(projectile);
          if (interceptorIndex !== -1) this.removeProjectile(interceptorIndex);
          continue;
        }
        const direction = offset.normalize();
        projectile.mesh.position.addScaledVector(direction, step);
        projectile.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        projectile.trailTimer -= delta;
        if (projectile.trailTimer <= 0) {
          this.spawnMissileSmoke(projectile.mesh.localToWorld(new THREE.Vector3(0, 0, -0.58)));
          projectile.trailTimer = 0.045;
        }
        continue;
      }

      if (projectile.weapon === "b52Missile") {
        this.updateB52Missile(projectile, i, delta);
        continue;
      }

      projectile.life -= delta;
      if (projectile.life <= 0 || projectile.target.hp <= 0) {
        this.removeProjectile(i);
        continue;
      }

      const destination = projectile.target.getAimPoint();
      if (projectile.weapon === "torpedo") destination.y = projectile.mesh.position.y;
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
      } else if (projectile.weapon === "torpedo") {
        projectile.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        projectile.trailTimer -= delta;
        if (projectile.trailTimer <= 0) {
          this.spawnTorpedoBubble(projectile.mesh.position);
          projectile.trailTimer = 0.1;
        }
      } else if (projectile.weapon === "bomb") {
        projectile.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      }
    }
  }

  retargetB52Missile(projectile) {
    const enemyTeam = projectile.owner.team === "player" ? "enemy" : "player";
    const isEnemySide = (z) => projectile.owner.team === "player"
      ? z < DEPLOYMENT_LINE_Z
      : z > DEPLOYMENT_LINE_Z;
    let closestTarget = null;
    let closestDistance = Infinity;
    for (const candidate of [...this.units, ...this.missileDefenseTowers]) {
      if (candidate.team !== enemyTeam || candidate.hp <= 0 || !isEnemySide(candidate.root.position.z)) continue;
      const distance = projectile.mesh.position.distanceTo(candidate.root.position);
      if (distance < closestDistance) {
        closestTarget = candidate;
        closestDistance = distance;
      }
    }
    projectile.target = closestTarget
      ?? (projectile.owner.team === "player" ? this.enemyBase : this.playerBase);
    projectile.lastKnownTargetPosition.copy(projectile.target.getAimPoint());
  }

  updateB52Missile(projectile, index, delta) {
    projectile.life -= delta;
    if (projectile.life <= 0) {
      this.removeProjectile(index);
      return;
    }
    if (projectile.target.hp <= 0) this.retargetB52Missile(projectile);
    if (projectile.target.hp > 0) {
      projectile.lastKnownTargetPosition.copy(projectile.target.getAimPoint());
    }

    const destination = projectile.target.hp > 0
      ? projectile.target.getAimPoint()
      : projectile.lastKnownTargetPosition.clone();
    projectile.currentSpeed = Math.min(72, projectile.currentSpeed + projectile.acceleration * delta);
    if (projectile.target.hp > 0 && projectile.target.worldVelocity) {
      const leadTime = Math.min(
        1.25,
        projectile.mesh.position.distanceTo(destination) / projectile.currentSpeed,
      );
      destination.addScaledVector(projectile.target.worldVelocity, leadTime);
    }
    const offset = destination.sub(projectile.mesh.position);
    const distance = offset.length();
    const step = projectile.currentSpeed * delta;
    const hitRadius = projectile.target instanceof BattleBase ? projectile.target.attackRadius : 2;
    if (distance <= step + hitRadius) {
      this.removeProjectile(index);
      projectile.target.takeDamage(projectile.damage, this);
      return;
    }

    const direction = offset.normalize();
    projectile.mesh.position.addScaledVector(direction, step);
    projectile.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    projectile.trailTimer -= delta;
    if (projectile.trailTimer <= 0) {
      this.spawnMissileSmoke(projectile.mesh.localToWorld(new THREE.Vector3(0, 0, -0.58)));
      projectile.trailTimer = 0.045;
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

  finishGame(result, fromNetwork = false) {
    if (this.mode !== "battle") return;
    if (this.pvpActive && this.pvpRole !== "host" && !fromNetwork) return;
    this.mode = result;
    this.clearProjectiles();
    $("missionMessage").hidden = false;
    $("messageSecondary").hidden = this.pvpActive || result !== "defeat";

    if (this.pvpActive) {
      if (this.pvpRole === "host") this.sendNetworkMessage({ type: "result", result });
      $("battleStatus").textContent = result === "victory" ? "ONLINE VICTORY" : "ONLINE DEFEAT";
      $("messageEyebrow").textContent = "ONLINE PvP";
      $("messageTitle").textContent = result === "victory" ? "Victory" : "Defeat";
      $("messageCopy").textContent = result === "victory"
        ? "The opposing base has been destroyed."
        : "Your base has been destroyed.";
      $("messagePrimary").textContent = "RETURN TO CAMPAIGN";
      return;
    }

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
    this.updateWeather(delta);
    if (this.mode === "battle") {
      this.updateEnemyReinforcements(delta);
      for (const unit of this.units) unit.update(delta, this);
      this.updateMissileDefense(delta);
      this.updateProjectiles(delta);
      this.sendMultiplayerSnapshot(delta);
      for (const tower of this.missileDefenseTowers) tower.updateHealthBar(this.camera);
      this.enemyBase.updateHealthBar(this.camera);
      this.playerBase.updateHealthBar(this.camera);
    }
    this.renderer.render(this.scene, this.camera);
  }
}

new Battlefield();
