# Ironclad: Field Command

A build-free, browser-based 3D strategy prototype. Select a tank, scout,
artillery unit, or helicopter, then click your side of the battlefield to
deploy it. Units automatically engage nearby enemies and attack the opposing
base. Defend your own base across three increasingly difficult sectors.

## Play

- Select a unit card, then click on the green side of the field to deploy.
- Units automatically choose nearby hostiles, move into range, and fire.
- Destroy the enemy base to capture the sector; protect your base from enemy
  attackers. Surviving units carry into the next sector. You can field up to 18
  active units at once.
- The campaign has three sectors, with larger enemy forces and stronger units
  and tougher bases in each one. The final sector completes the campaign; losing
  your base lets you retry the sector or restart the campaign.

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
