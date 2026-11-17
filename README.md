# Ironclad: Field Command

A build-free, browser-based 3D strategy prototype. Select a tank, scout,
artillery unit, tank destroyer, armored scout car, heavy tank, mortar carrier,
light tank, mobile anti-aircraft gun, armored recovery vehicle, siege tank,
tank hunter, mobile command vehicle, amphibious reconnaissance vehicle,
armed reconnaissance drone, guided missile destroyer, self-propelled howitzer,
heavy rocket artillery, SAM launcher, helicopter, fighter jet, or B-52
Stratofortress, then click your side of the 240-by-360
battlefield to deploy it. Units automatically engage nearby enemies and attack
the opposing base. Defend your own base across a 33-sector campaign.

## Play

- Select a unit card, then click on the green side of the field to deploy.
- Units automatically choose nearby hostiles, move into range, and fire.
- Destroy the enemy base to capture the sector; protect your base from enemy
  attackers. Surviving units carry into the next sector. You can field up to 20
  active units at once.
- The campaign has 33 sectors, with larger enemy forces and stronger units
  and tougher bases as you advance. Your base starts with 900 health and gains
  55 per sector; the enemy starts with 1,000 and gains 110 per sector, making
  each battle progressively tougher. Both bases are replenished at the start
  of each battle.
  Enemy units fire faster in later sectors and deploy an uncapped stream of
  reinforcements every 12 to 6.4 seconds, up to the active-unit limit, until
  either base is destroyed. The final
  sector completes the campaign; losing your base lets you retry the sector or
  restart the campaign.
- Victories award credits, which you can spend in the field workshop to increase
  the selected vehicle's weapon rate, up to 10 upgrade levels. Upgrades are
  specific to each vehicle type and are saved in this browser. Enemy weapons
  also improve as the campaign advances; the B-52 remains player-only.
- Rotate the camera with right-drag or the on-screen rotate/tilt controls. Zoom
  with the mouse wheel or zoom buttons. Pan with middle-drag or Shift + left-drag.
- Fighter jets drop bombs, aircraft carriers and destroyers fire missiles, and
  submarines launch torpedoes from their bow tubes. Naval units also use mounted
  guns in combat. Ocean battles take place in sectors 5, 13, 14, 18, and 19.
  Land units deploy on land, naval units deploy at sea, and aircraft can deploy
  on land or launch from your deployed aircraft carrier in ocean battles.
  Deploy a carrier before selecting aircraft at sea.
  Submarines deploy and fight alongside the carrier fleet.
- The player-only B-52 Stratofortress is available in all 33 sectors. Its eight
  engines emit exhaust, and its underside bay carries up to four guided
  missiles as its only weapon. Missiles launch directly toward enemy targets
  with a smoke trail.
- SAM launchers use smoke-trailing missiles against all enemy vehicle types.
  Both sides use them in land battles from sector 2 onward.

## Online PvP

- Select **ONLINE PvP**, host a match, and share the displayed room code with
  the other player. The other player enters that code and selects **JOIN MATCH**.
- Each player has their own vehicle selection and can deploy any vehicle in the
  full roster on their side of the battlefield. The first player to destroy
  the opposing base wins.
- Online rooms use PeerJS's public signaling service to connect browsers, so
  both players need an internet connection. No game backend or account is
  required. Share room codes only with the intended opponent.
- Online PvP is separate from the campaign: campaign balance, credits,
  upgrades, and vehicle settings are unchanged. Weapon upgrades are disabled
  during PvP matches. Entering or leaving PvP restarts the current campaign
  battle, including units deployed in that battle.

## Project structure

```text
.
├── index.html   # Interface, styles, and entry point
├── main.js      # Three.js scene, unit classes, deployment, and movement
└── README.md
```

## Run

Serve the project root with a local static server, for example:

```sh
python3 -m http.server
```

Open the address printed by the server. The Three.js ES module is loaded from
jsDelivr, so an internet connection is required.

## GitHub Pages

No build step is needed. Push `index.html`, `main.js`, and `README.md` to the
repository's `main` branch, then in GitHub open **Settings → Pages**, choose
**Deploy from a branch**, select `main` and the `/(root)` folder, and save. Pages
will publish the site at the repository's GitHub Pages URL.

## Extending units

Unit models inherit combat and movement behavior from `Unit` in `main.js`.
Implement `buildModel()` in a `Unit` subclass, then add the class and its
configuration to `UNIT_TYPES` and `UNIT_CATALOG`. Campaign waves are configured
in `LEVELS`. Ground placement is handled by the `Raycaster` in
`Battlefield.deployAtPointer()`.
