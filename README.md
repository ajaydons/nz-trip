# NZ Trip guide – website + offline app

This folder publishes the trip guide on **GitHub Pages**, **password-protected** and **installable as an offline app** on phones.

- GitHub only ever stores the **encrypted** guide. Anyone opening the link sees a password screen.
- After the first visit, the guide works **with no signal**. That includes Milford Road, Lindis Pass and the cricket gate.
- When you publish an update, phones pick it up the next time they're online.

---

## One-time setup (about 15 minutes)

**You need:** Node.js 18 or newer (`node -v`) and a GitHub account.

1. **Add the guide.** Copy `NZ_South_Island_Trip_Guide.html` into the `source/` folder.
   *Tip: whatever is inside that file is what everyone sees. That includes photos, uploads, expenses and insurance numbers. Use "Save copy with uploads" first if you want your additions included.*

2. **Choose a trip password.** Use 4 or more random words, for example `kea-pukaki-lupin-ferry`. Don't reuse a password you use anywhere else. You'll share it with the families on WhatsApp, never in the repo.

3. **Build (encrypt):**
   ```bash
   node build.mjs
   ```
   It asks for the password. It then writes the encrypted `docs/index.html` and an offline helper `docs/sw.js`, and creates `.staticrypt.json`.
   Keep `.staticrypt.json`. It lets "Remember me" survive future updates.

4. **Create a GitHub repository** (public is fine, because the content is encrypted). Name it something like `nz-trip`. Then:
   ```bash
   git init
   git add .
   git commit -m "NZ trip guide"
   git branch -M main
   git remote add origin https://github.com/<your-username>/nz-trip.git
   git push -u origin main
   ```
   `.gitignore` keeps `source/` (the unencrypted guide) off GitHub.

5. **Turn on Pages:** repo → **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/docs` → Save**.
   After a minute or two the site is live at `https://<your-username>.github.io/nz-trip/`.

> ⚠️ **If you upload through the GitHub website instead of git,** upload only `docs/`, `build.mjs`, `template/`, `tools/`, `README.md`, `.gitignore` and `.staticrypt.json`. **Never upload the `source/` folder.** The website uploader ignores `.gitignore`.

---

## Installing on phones (each person, on Wi-Fi)

1. Open the link and enter the password. Tick **"Remember me on this device"**.
2. Wait for **"Saved for offline use ✓"**, a toast message at the bottom of the screen.
3. Install it:
   - **iPhone/iPad:** in Safari, tap **Share → Add to Home Screen**. It must be Safari.
   - **Android:** in Chrome, tap **⋮ → Install app** (or "Add to Home screen").
4. Test it: turn on **Airplane mode** and open **NZ Trip** from the home screen. The guide should open.

Use the **home-screen app** during the trip, not a browser tab. iPhones can clear website data that hasn't been opened for a while, but installed apps keep theirs.

---

## Updating the guide

1. Replace the file in `source/` with the new version.
2. Run `node build.mjs` with the **same password**.
3. Run `git add docs && git commit -m "Update guide" && git push`.

Phones get the new version the next time they open the app with signal. Offline, they keep showing the last saved version.

---

## Moving your own data across

Each phone keeps its own uploads, expenses, meal plans and ticks.
To move them from the file version (or another phone):

1. In the old copy, tap **Save copy with uploads**.
2. In the website app, go to **Toolkit → Import a saved copy** and pick that file.

---

## Good to know

- **What the password protects:** the whole guide is encrypted with AES-256 (via StatiCrypt), and the password is never stored on GitHub. How safe it is depends on the password, so use 4+ random words.
- **Changing the password:** rebuild with a new one. Everyone has to enter the new password once.
- **Size:** the encrypted page is about 3.6 MB. GitHub compresses it in transit, and each phone downloads it once.
- **Live features need signal:** weather forecasts, scenic photo downloads, photo links and Google Maps links work when online. Everything else works offline.
- **Prefer a private repo?** Pages from a private repo needs a paid GitHub plan, and the site itself is still public. The password is what protects it either way.
