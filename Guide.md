# D&D 5e Toolkit

A portable, offline-capable PWA for running D&D 5e sessions. Three tools in one app:

- **⚔ Combat Tracker** — Initiative, HP, conditions, concentration, death saves, stat block preview
- **🐉 Monster Creator** — Build stat blocks with live preview, export as JSON/Markdown/HTML
- **🛡 Character Creator** — Full character editor with all 5e 2024 fields, export as JSON

## Setup (GitHub Pages)

1. Push this entire folder to a GitHub repository
2. Go to **Settings → Pages → Source: Deploy from a branch → main / root**
3. Your toolkit is live at `https://yourusername.github.io/your-repo-name`
4. On your iPad/phone, open the URL in **Safari**, tap **Share → Add to Home Screen**
5. It now works as a standalone app with offline support

## Adding Monsters & Players

1. Add your `.json` files to `data/monsters/` or `data/players/`
2. Update `data/index.json` to list the new filenames:

```json
{
  "monsters": [
    "Summer_Eladrin.json",
    "Winter_Eladrin.json",
    "My_New_Monster.json"
  ],
  "players": [
    "Ja_Liss.json",
    "New_Character.json"
  ]
}
```

3. Commit and push — the app picks up changes on next load

## Folder Structure

```
dnd-toolkit/
├── index.html              Hub / landing page
├── manifest.json           PWA manifest
├── sw.js                   Service worker (offline caching)
├── icon-192.png            App icon
├── icon-512.png            App icon (large)
├── README.md               This file
├── tools/
│   ├── combat-tracker.html
│   ├── monster-creator.html
│   └── character-creator.html
└── data/
    ├── index.json           File manifest (update when adding JSONs)
    ├── monsters/
    │   ├── Summer_Eladrin.json
    │   ├── Winter_Eladrin.json
    │   ├── Elven_Lost_Soul_CR2.json
    │   └── Elven_Lost_Soul_CR4.json
    └── players/
        └── Ja_Liss.json
```

## Updating the App Cache

When you update the tools or add data, bump the version number in `sw.js`:

```js
const CACHE_NAME = 'dnd-toolkit-v2';  // was v1
```

This forces the service worker to re-cache everything on next load.

## Local Use (No Hosting)

You can also just open any HTML file directly in a browser. The Library button won't work (no server to fetch from), but the file picker buttons still work for loading JSONs from your device.

## JSON Formats

- **Monster JSON**: Created by the Monster Creator tool. See any file in `data/monsters/` for the schema.
- **Player JSON**: Created by the Character Creator tool. See `data/players/Ja_Liss.json` for the schema.
- Both formats are loaded by the Combat Tracker for stat block / character sheet preview.
