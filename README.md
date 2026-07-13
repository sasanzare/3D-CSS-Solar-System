# 3D Solar System Lab

An interactive Solar System scene rebuilt as a real WebGL experience with
Three.js. The original CSS-only model has been replaced with a full-screen 3D
canvas, responsive HUD controls, planet picking, camera presets, animated
orbits, and procedural planet surfaces.

## Features

- Full-screen Three.js scene with the Sun, all eight planets, Earth's Moon, and
  Saturn's ring.
- Procedural non-alpha planet surfaces designed for UV spheres.
- Orbit focus list, projected scene labels, click-to-select planets, and live
  planet metrics.
- Scale modes for balanced viewing, distance emphasis, and size emphasis.
- Speed slider, pause/play control, and camera presets for overview, inner
  system, and outer system views.
- Responsive HUD layout for desktop and mobile screens.

## Run Locally

Install dependencies once:

```bash
npm install
```

Start a local static server:

```bash
npm run dev
```

Then open the printed local URL.

## Project Structure

```text
.
|-- index.html
|-- css/
|   |-- styles.css
|   `-- fonts/
|-- img/
|-- js/
|   `-- scripts.js
|-- package.json
`-- package-lock.json
```

The page uses an import map that points to the local `three` package under
`node_modules`, so it should be served over HTTP after `npm install`.

## Credits

The original project was created by Julian Garnier and released under the MIT
license. This version keeps the original local assets for reference while
moving the rendering layer to Three.js.
