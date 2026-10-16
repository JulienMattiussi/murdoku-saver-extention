<div align="center">

<img src="icons/icon-128.png" alt="Murdoku Save Bank" width="96" height="96" />

# Murdoku Save Bank

**A browser extension that lets you bookmark your Murdoku grid under a name and jump back to it whenever a hypothesis goes wrong.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

</div>

---

## ✨ Why

[Murdoku](https://murdoku.com) mixes sudoku and cluedo. The game autosaves the last state of your grid, but only one: once you start testing a hypothesis, there is no way back to the position before it. Murdoku Save Bank keeps as many named snapshots as you want per puzzle and puts any of them back into the game's save in one click.

## 🚀 Features

- 💾 **Named snapshots**: save the current grid as "avant hypothèse Colonel", "début", whatever helps.
- ⏪ **One-click restore**: the snapshot is written into the game's native save and the page reloads on it.
- 📌 **Right on the page**: a small button in the top-right corner of every puzzle opens the panel, no toolbar trip needed.
- 🧩 **Per puzzle**: each puzzle has its own list, picked from the page URL, and the panel follows you when you switch puzzles.
- ⌨️ **No stray moves**: what you type in the panel never reaches the grid.
- 🛡️ **Safe from game resets**: the bank lives in the extension's own storage, not in the site's.
- 🔒 **Minimal permissions**: `storage` only, and the script runs on `murdoku.com` only. No tracking, no remote calls.

## 🧭 How it works

```
 murdoku.com tab
 ┌──────────────────────────────────────────────────────────┐
 │  game ── localStorage["mrd_state_<id>"]                  │
 │                ▲  │                                      │
 │  write + reload│  │read raw value          [M] ◀ button  │
 │                │  ▼                     ┌─────────────┐  │
 │        content script ───────────────── │ panel       │  │
 │                │                        │ (shadow DOM)│  │
 └────────────────┼────────────────────────┴─────────────┴──┘
                  ▼
        chrome.storage.local
        bank: { puzzleId: [states] }
```

When you are signed out, the game keeps each puzzle's grid in `localStorage` under `mrd_state_<puzzleId>` and reads it only when the puzzle loads. The extension's content script copies that value into its bank, and to restore it writes the value back and reloads the page. See [AGENTS.md](AGENTS.md) for the details.

> ⚠️ **Signed-in players are not supported yet**: the game then stores the grid on its servers, out of the extension's reach. Play signed out to use the bank.

## 📦 Install

### Pre-built release (recommended)

1. Head to the [Releases page](../../releases) and download the latest `murdoku-save-bank-vX.Y.Z.zip`.
2. Unzip it anywhere.
3. Open [chrome://extensions](chrome://extensions/) (or `brave://extensions`), enable **Developer mode** (top right), click **Load unpacked**, and select the unzipped folder.
4. Open any puzzle on [murdoku.com](https://murdoku.com): the button shows up in the top-right corner.

### From source

```bash
git clone <this-repo> murdoku-save-bank
cd murdoku-save-bank
nvm use             # Node 22, see .nvmrc
npm install
npm run build       # → dist/
npm run package     # → murdoku-save-bank.zip (optional, same shape as the Release)
```

Then load the generated [dist/](dist/) folder as an unpacked extension, as above.

## 🛠️ Scripts

| Command                  | What it does                                      |
| ------------------------ | ------------------------------------------------- |
| `npm run build`          | Build the extension to [dist/](dist/) via esbuild |
| `npm run watch`          | Dev mode, rebuild on change                       |
| `npm run package`        | Build and zip `dist/`                             |
| `npm test`               | Run every test (jsdom)                            |
| `npm run typecheck`      | `tsc --noEmit` against the whole codebase         |
| `npm run format`         | Prettier                                          |
| `npm run icons:generate` | Regenerate the icons (requires ImageMagick)       |

`make help` lists the same commands, and `make check` runs typecheck, format check and tests.

## 🧪 Testing

Unit tests run in jsdom with Vitest and cover the bank, the puzzle URL parsing, the access to the game's save, the keyboard shield and the panel. See [tests/README.md](tests/README.md).

## 🧱 Stack

- **TypeScript** (strict, no `any`)
- **esbuild** for bundling ([build.mjs](build.mjs))
- **Chrome Extension Manifest V3**
- **Vitest + jsdom** for unit tests
- Zero framework in the panel: vanilla TS in a shadow root

## 📁 Project layout

```
src/
├── content/      content script entry + keyboard shield
├── panel/        in-page panel: mount, flows, saved states list, confirm box
├── bank.ts       bank operations + chrome.storage.local
├── page.ts       access to the game's localStorage save
├── puzzle.ts     puzzle id from URL, native save key
└── types.ts      shared interfaces
icons/            extension icons (16 / 48 / 128) + generator script
tests/            unit tests (jsdom)
build.mjs         esbuild bundler
manifest.json     Manifest V3
```

## 🗺️ Roadmap

Planned improvements are tracked in [IMPROVEMENTS.md](IMPROVEMENTS.md).

## 📄 License

[MIT](LICENSE).

<div align="center">

_Built for the moment you realise the butler could not have been in the kitchen after all._

</div>
