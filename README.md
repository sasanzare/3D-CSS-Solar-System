# 3D CSS Solar System 🪐

An interactive 3D model of the Solar System rendered entirely with **CSS 3D transforms and animations** — no Canvas, no WebGL, no 3D libraries. The Sun and all eight planets orbit, spin and cast moving shadows in real time, driven purely by CSS `@keyframes`.

> Originally created by **Julian Garnier** (© 2012, MIT License). This fork modernizes the project for fully offline use and removes its legacy library dependencies while keeping the original look and behavior intact.

---

## ✨ Features

- 🌞 **The Sun + 8 planets** — Mercury through Neptune, plus Earth's Moon and Saturn's ring.
- 🔄 **Real-time orbital motion** — every body revolves and rotates using pure CSS keyframe animations.
- 💡 **Dynamic lighting** — each planet shows a moving day/night shadow as it orbits the Sun.
- 🌗 **2D / 3D views** — switch between a top-down 2D map and a perspective 3D scene.
- 🔭 **Scale modes** — toggle between *Speed*, *Size* and *Distance* to explore different aspects of the system.
- 📱 **Responsive** — adapts to mobile and desktop screens.
- 🔌 **100% offline** — fonts and assets are bundled; works with no internet connection.

---

## 🚀 Quick Start

This is a static site — no build step, no server, no dependencies to install.

1. **Download/clone** this repository.
2. Open `index.html` in any modern browser.

That's it. You can also serve it locally if you prefer:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`.

---

## 🎮 Controls

| Control | Action |
|---------|--------|
| **Data** (top-left) | Toggles the planet selector panel. Click a planet name to focus the system on it. |
| **Controls** (top-right) | Toggles the controls panel. |
| **View toggle** | Switches between **3D** (perspective) and **2D** (top-down) views. |
| **Zoom toggle** | Switches between **zoomed-in** and **zoomed-out**. |
| **Speed / Size / Distance** | Radio buttons that change how the Solar System is scaled. |

On load, the scene opens in a zoomed-in 2D view and automatically animates into the full 3D view.

---

## 📁 Project Structure

```
3D-CSS-Solar-System-master/
├── index.html              # Main HTML markup
├── css/
│   ├── styles.css          # Compiled stylesheet (used by the page)
│   ├── styles.scss         # SCSS entry point — imports the modules below
│   ├── basics.scss         # Reset, typography, font-face
│   ├── views.scss          # Orbit keyframes, 2D/3D & scale views
│   ├── data.scss           # Planet selector (#data panel)
│   ├── lighting.scss       # Per-planet day/night shadow keyframes
│   ├── legends.scss        # Planet info labels
│   ├── ui.scss             # Navbar, toggle buttons, control inputs
│   ├── transitions.scss    # View & zoom transitions
│   ├── images.scss         # Planet & Sun background images
│   ├── responsive.scss     # Mobile breakpoints
│   └── fonts/
│       ├── opensans-latin.woff2   # Open Sans (bundled, offline)
│       └── OpenSans-Variable.ttf  # Open Sans fallback (TTF)
├── img/
│   ├── sun.png             # Sun texture
│   ├── p-*.png             # Planet textures (mercury, venus, earth, ...)
│   ├── bg-stars.png        # Starfield background
│   ├── bg-glow.png         # Ambient glow
│   └── fw-mockup.png       # Reference mockup
└── js/
    └── scripts.js          # UI interactions (vanilla JS)
```

> The `.scss` files are the original **source** of the stylesheet. The page loads the pre-compiled `styles.css`. To rebuild the CSS, run Sass on `styles.scss` (see [Building the CSS](#-building-the-css)).

---

## 🧠 How It Works

The entire simulation is built on three CSS features:

### 1. CSS 3D Transforms
The Solar System is a nested 3D scene. The container uses `transform-style: preserve-3d` and `perspective`, so each `.orbit` becomes a flat ring tilted in 3D space, and the planets sit on those rings.

### 2. CSS `@keyframes` Animations
Three keyframes drive the motion:

```css
@keyframes orbit    { to { transform: rotateZ(360deg); } }   /* planet revolves  */
@keyframes suborbit { to { transform: rotateZ(360deg); } }   /* moon revolves    */
@keyframes invert   { to { transform: rotateZ(-360deg); } }  /* keeps planets upright */
```

Each orbit has its own `animation-duration` set in the planet data (see `data.scss`), so Mercury is fast and Neptune is slow — roughly proportional to their real orbital periods.

### 3. Animated Shadows (`lighting.scss`)
Every planet has a `@keyframes shadow-<planet>` that moves a radial `box-shadow` across its surface, simulating the Sun illuminating one side as the planet orbits.

### JavaScript (`scripts.js`)
The JS only handles the **UI** — toggling the Data/Controls panels, switching between 2D/3D, zoom, and scale modes. All actual motion is CSS. The script is written in dependency-free vanilla JavaScript.

---

## 🔧 Building the CSS

The committed `styles.css` is already built, so you only need this if you edit the `.scss` files.

```bash
# Install Sass (one-time)
npm install -g sass
#   or:  gem install sass   (Ruby)

# Compile styles.scss → styles.css
sass css/styles.scss css/styles.css

# Watch for changes during development
sass --watch css/styles.scss:css/styles.css
```

---

## 🌐 Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge — desktop and mobile). Requires support for:

- CSS 3D transforms (`transform-style: preserve-3d`, `perspective`)
- CSS animations & `@keyframes`
- WOFF2 web fonts

> Internet Explorer and other legacy browsers are **not** supported. (The original project shipped `-prefix-free` and jQuery to support them; both were removed during modernization since they added ~100 KB for browsers that can't render 3D transforms anyway.)

---

## 🔌 Offline Support

All external dependencies have been bundled:

| Asset | Source | Bundled as |
|-------|--------|------------|
| **Open Sans** font | Google Fonts (online) | `css/fonts/opensans-latin.woff2` + `.ttf` fallback |
| **jQuery** | CDN (online, ~95 KB) | Replaced by ~2 KB of vanilla JS in `scripts.js` |
| **-prefix-free** | CDN (online, ~6 KB) | Removed — modern browsers need no vendor prefixes |

The project now runs with **zero network requests**.

---

## 📜 License

MIT License — see the original header in `css/styles.css`:

```
Copyright (c) 2012 Julian Garnier
Licensed under the MIT license.
```

The Open Sans font is licensed under the [SIL Open Font License 1.1](https://scripts.sil.org/OFL).

---

## 🙏 Credits

- **Original project:** [Julian Garnier](https://github.com/juliangarnier) (2012)
- **Open Sans font:** Steve Matteson / Google Fonts
