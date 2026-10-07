# TempWise

**Perfect temperature. Automatically.**

TempWise is climate control for shops, gyms and physical work areas. This
repository is a ready-to-publish website: a landing page plus a working demo
app with zone thermostats, sensor status, settings and an account screen.

- **Landing page:** `index.html`
- **Demo app:** `app/index.html`
- Plain HTML, CSS and JavaScript. No build step, no dependencies.
- Fonts are bundled, so it also works offline.

> The demo uses **simulated sensor readings**. It is not connected to real
> thermostats. See [Connect real hardware](#connect-real-hardware-and-devices).

## Real sensor (ESP32 + DHT11)

Flash `esp32/tempwise_dht11.ino` to your board, then in the app open **Settings → Real sensor** and connect
by USB (Chrome/Edge) or Wi-Fi. The chosen zone then shows the real temperature and humidity. Full steps are in
`esp32/README.md`. Browsers block `http` sensors on `https` pages, so on the published GitHub Pages site use USB;
Wi-Fi works when you open the app from your own computer or network.

## What's new in 1.1

- Redesigned landing page with a live, interactive thermostat, light and dark themes, and a mobile menu.
- App: **Activity** log, one-tap **scenes** (Comfort, Busy, Eco, All off), trend charts, weekly **schedule**
  with eco setback and pre-cooling, add/rename/remove zones, alert limits, light/dark/auto theme.
- **Export / import** settings (JSON) and readings (CSV).
- **Installable and offline** (`sw.js`, `js/pwa.js`). When you republish, bump `VERSION` in `sw.js`
  so visitors get the new files.

See `CHANGELOG.md` for details. Sensors are simulated and sync works between windows of the same browser;
the section below explains how to connect real devices.

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example `tempwise`).
2. Upload everything from this folder to the repository root, so that
   `index.html` is at the top level. (On github.com: **Add file → Upload files**,
   drag in the contents of the folder, then **Commit changes**.)
3. Open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**,
   choose branch **main** and folder **/ (root)**, then **Save**.
5. After a minute your site is live at
   `https://YOUR-USERNAME.github.io/tempwise/`.

The "GitHub" buttons on the landing page find your repository automatically
when the site runs on `github.io`. If you use a custom domain, set the
address in `js/config.js`.

Using the command line instead:

```bash
cd tempwise
git init -b main
git add .
git commit -m "Add TempWise site"
git remote add origin https://github.com/YOUR-USERNAME/tempwise.git
git push -u origin main
```

## Run it locally

Serve the folder with any static server and open the address it prints:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` straight from disk also works, but live sync between tabs
is more reliable through a server.

## What the demo does

- **Home:** a dial per zone with target, current reading and mode (cool, heat,
  auto, off), energy use, humidity and alerts.
- **Sensors:** every sensor's temperature, humidity and status, including an
  offline sensor.
- **Settings:** °C/°F, accent color, eco schedule, occupancy cooling,
  pre-cooling, opening hours, alert limits and notification toggles.
- **Account:** your name, the windows sharing your settings, refresh, reset and
  log out.
- **Live sync:** change something in one tab and every other open tab updates
  within a second, with a message saying what changed.
- **Local mode:** try changes on one tab without changing the shared settings.
  Changed items are tagged *Local*. Use **Sync to all devices** to make them
  real or **Discard** to throw them away.

Settings are stored in your browser's `localStorage` and never leave your
device. **Account → Reset demo data** clears them.

## Project structure

```
tempwise/
├── index.html              Landing page
├── 404.html                Page-not-found screen for GitHub Pages
├── app/
│   └── index.html          The demo app
├── css/
│   ├── site.css            Landing page styles
│   └── app.css             App styles
├── js/
│   ├── config.js           Optional site settings (repo link)
│   ├── site.js             Landing page script
│   ├── sync.js             Settings sync adapter (localStorage)
│   ├── pwa.js              Registers the service worker
│   └── app.js              The app: screens, thermostat logic, simulated sensors
├── assets/
│   ├── favicon.svg
│   ├── icon-192.png, icon-512.png
│   ├── screens/            Screenshots used on the landing page
│   └── fonts/              Manrope and Unbounded (SIL Open Font License)
├── sw.js                   Service worker (offline). Bump VERSION when you republish
├── manifest.webmanifest    Lets the app be added to a phone home screen
├── .nojekyll               Tells GitHub Pages to serve files as they are
├── LICENSE
├── CHANGELOG.md
└── README.md
```

## Customize

**Zones and defaults.** Open `js/app.js` and edit `DEFAULTS` near the top: zone
names, sensor names, starting targets and modes, units, thresholds and the
accent color. Add or remove zones in the `ZONES` list and set which ones are
offline in `OFFLINE`.

**Colors and type.** Both stylesheets start with a `:root` block of color
tokens. Change them there.

**Landing page text.** Edit `index.html` directly.

**Screenshots.** The images in `assets/screens/` are phone-sized captures of the
app. Replace them if you change the design.

## Connect real hardware and devices

The app never talks to storage directly. It uses one small object from
`js/sync.js` with three methods:

```js
ref.get()                  // Promise of a snapshot
ref.set(body)              // Promise, saves the whole settings document
ref.onSnapshot(next, err)  // calls next(snapshot) now and on every change; returns an unsubscribe function
// snapshot = { exists, data(), metadata }
```

The default adapter uses `localStorage`, so it syncs windows of the same
browser only. To sync phones and computers, make `TempWiseSync.open()` return
an object with the same three methods that reads and writes a backend.

Example with Firebase Firestore (the snapshot shape is the same):

```js
// in js/sync.js, replace open() with:
open() {
  const doc = firebase.firestore().doc('tempwise/settings');
  return {
    get: () => doc.get(),
    set: body => doc.set(body),
    onSnapshot: (next, err) => doc.onSnapshot(next, err),
  };
}
```

Add your SDK script tag and config to `app/index.html` before `sync.js`, and
set access rules on your backend so only people you trust can write.

For real sensors, replace the `tick()` function in `js/app.js`. It currently
moves simulated readings toward each zone's target. Feed it real values for
`R[zone].t` (°C) and `R[zone].h` (% humidity) and update `seen[zone]` when a
sensor reports.

## Before you publish

- Replace `YOUR-USERNAME` in the links above.
- If you use a custom domain, set `repo` in `js/config.js`.
- To get a preview image when the link is shared, add a
  `<meta property="og:image" content="https://YOUR-USERNAME.github.io/tempwise/assets/screens/home.png">`
  tag to the `<head>` of `index.html`.
- Update the copyright line in `LICENSE`.

## Credits

Fonts: [Manrope](https://github.com/sharanda/manrope) and
[Unbounded](https://github.com/googlefonts/unbounded), both under the SIL Open
Font License 1.1 (texts in `assets/fonts/`).

## License

MIT. See `LICENSE`.
