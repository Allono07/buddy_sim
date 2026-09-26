# Trash Buddy

React + Vite rebuild of trashbuddy.in, with React Router, Tailwind CSS, component CSS, Framer Motion, and Leaflet.

## Run

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Vite was chosen because the existing application is a static marketing site plus a browser simulation; no server rendering or server data layer is required. Builds generate HTML entry points with the original title and description for each route. Marketing content is rendered client-side; if crawler-independent content indexing becomes a requirement, add prerendering or migrate the marketing pages to SSR.

## Structure

- `src/pages`: Home, Dashboard, Your Story, Contact.
- `src/components`: reusable animated bin, resident phone, map, dashboard panels.
- `src/simulation/engine.js`: pure reducer, route interpolation, haversine distance and ETA.
- `src/simulation/useSimulation.js`: cleaned-up route timer, notification audio, simulated speech.
- `src/Theme.jsx`: persistent shared theme.
- `public/assets`: unchanged original images, slide deck and alert sound.
- `legacy`: original static pages, styles and scripts retained for reference, not shipped in production.

## Behavior and assumptions

The simulation retains Bengaluru coordinates, 11 interpolated route points, the 1200 ms / speed cadence, a nearby alert three points from the end, configurable auto voice, event export/clear, location updates, resident login and scenarios. Pause/resume now works without restarting the route. Disabling push notifications now suppresses push alerts; the old toggle did not actually suppress them. Call mode remains a demo preference as in the original; no SMS or telephone service is invoked. Simulated voice uses browser speech synthesis and automatically closes after 4.5 seconds.

The cleanup hero now uses the supplied `public/assets/3d/bin.glb` through a dynamically loaded Three.js renderer, plus the four transparent PNGs in `public/assets/images/waste`. The `ITEMS` list in `src/components/CleanupHero.jsx` defines the current assets, positions and sizes; add entries there when more photographs are available. Asset loading completes before the sequence begins. Four photos swirl into the projected 3D opening, the lid closes from 2.0–2.5 seconds, then the lowercase `trashbuddy` wordmark resolves letter by letter with a short stagger. Once that first sequence settles, a resident-app phone and illustrated BBMP collection auto glide into a responsive three-part layout; the phone's truck-nearby alert follows its arrival. Reduced motion shows the complete final composition immediately.

The supplied GLB has a Z-up coordinate system and separate body/lid meshes. At load time the renderer restores the missing lid translation, shares the body's steel material with the lid, removes the body's top cap to expose its opening, and uses the GLB's 65-degree lid rotation. The source GLB is not modified. Soft environment lighting and a contact shadow frame the model. Rendering stops when the lid finishes and resumes only for resizing or preference changes. Resources are disposed when leaving the route. If WebGL or the model fails, the existing SVG bin remains available as a fallback.

The Contact form uses the original Formspree endpoint. Your Story uses the original EmailJS service, template and public browser key. Optional overrides are `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`. These are browser-visible identifiers, not server secrets. No private environment variables are exposed. Real delivery depends on those services remaining configured; verification intercepts submissions rather than sending messages.

Original Google Analytics setup is preserved. Maps use OpenStreetMap tiles and require internet access. Audio depends on browser playback permissions. The resident session flag and theme are stored locally, matching the original.

## Hosting

Publish `dist/` after `npm run build`. The build emits `/contact/index.html`, `/yourstory/index.html`, `/simulationdashboard/index.html`, and the legacy `/simulation` alias. A `_redirects` fallback is included for compatible static hosts; configure other hosts to serve `index.html` for client routes. Do not publish the repository root or `.env` files.

## Verification

`npm test` covers route timing, offline guards, pause/resume, arrival, alert counts, reset, notification suppression and destination changes. `node scripts/browser-check.mjs` runs browser smoke checks against a running development server, using installed Chrome on macOS. It intercepts outgoing forms and writes screenshots to the OS temporary directory. Set `CHROME_PATH` for another Chrome installation.
