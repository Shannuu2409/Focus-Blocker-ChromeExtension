# Focus Blocker (Chrome Extension)

A Chrome extension that blocks distracting websites for a chosen time. Built with React (Vite) and Manifest V3 using Declarative Net Request.

## Features
- Add domains to block (e.g., `youtube.com`, `instagram.com`).
- Choose a duration in minutes and start Focus Mode.
- Hard block navigation to those domains for the session.
- When the timer ends, rules are cleared and any open blocked tabs are redirected to the homepage.

## Tech Stack
- React 18 + Vite 7
- Manifest V3 Service Worker (`background.js`)
- `chrome.declarativeNetRequest` for blocking
- `chrome.storage.sync` for persistence

## Getting Started

### Install dependencies
```bash
npm install
```

### Build the popup (required for the extension)
```bash
npm run build
```
This outputs the production assets to `dist/`. The extension popup points to `dist/index.html` so you don’t have to hand‑edit hashed filenames.

### Load in Chrome
1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click “Load unpacked”.
4. Select the project root folder (the folder containing `manifest.json`).
5. Click the toolbar icon to open the popup.

### Usage
1. Enter a domain (e.g., `youtube.com`) and click Add. It will appear below the input.
2. Set the duration in minutes.
3. Click “Start Focus Mode”.
4. Try visiting the domains in new tabs—navigation will be blocked until time expires.
5. When the timer ends, open blocked tabs automatically redirect to the homepage and rules are cleared.

## Development
- Edit UI under `src/`.
- Background logic lives in `background.js`.
- Storage helpers are in `src/entities/`.
- Styles in `src/index.css`. Popup dimensions are enforced here (default 420×600).

Rebuild after changes:
```bash
npm run build
```
Then “Reload” the extension in `chrome://extensions`.

## Permissions (Manifest v3)
- `storage`: Save domains and sessions.
- `tabs`: Query and update tabs after a session ends.
- `declarativeNetRequest`: Block requests to distracting sites.
- `alarms`: End sessions automatically and clear rules.

## Troubleshooting
- Popup is blank: reload the extension; ensure `npm run build` was run. Check the popup console (right‑click popup → Inspect) for 404s.
- Sites not blocking: in the service worker console run:
  ```js
  chrome.declarativeNetRequest.getDynamicRules().then(r => console.log(r.map(x => x.condition.urlFilter)))
  ```
  You should see filters like `||youtube.com^`. If not, start Focus Mode again.

## Commit and Push to GitHub
1. Initialize the repo (run in project root):
```powershell
git init
git add .
git commit -m "feat: focus blocker extension MVP with blocking and timer"
```
2. Create a new GitHub repository (via the GitHub UI), copy the remote URL, then run:
```powershell
# HTTPS example
git remote add origin https://github.com/<your-username>/<your-repo>.git
# or SSH
# git remote add origin git@github.com:<your-username>/<your-repo>.git

git branch -M main
git push -u origin main
```

## License
MIT (or choose your preferred license)
