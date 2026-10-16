# Murdoku Save Bank

Browser extension (Manifest V3) for local use on [murdoku.com](https://murdoku.com), a puzzle game mixing sudoku and cluedo. Saves named snapshots of a puzzle grid and restores them into the game's native save.

## Product

There is no toolbar popup: a content script adds a floating button in the top-right corner of every puzzle page (`https://murdoku.com/play/<puzzleId>`). The button is hidden on other pages of the site. Clicking it opens a panel that:

1. Shows the puzzle id read from the current URL
2. Lists the states saved for that puzzle, most recent first
3. **Sauver**: copies the game's native save of the puzzle into the bank under the typed name (confirmation if the name already exists)
4. **Charger**: writes the saved value back into the native save, then reloads the page so the game picks it up
5. **Suppr.**: removes a state from the bank

If the native save key is missing (puzzle never played, or user signed in), the panel shows a warning. The panel closes on a second click on the button, a click outside it, or Escape.

## How the game saves

Reverse-engineered from the game's bundle (`/play/assets/app-core-*.js`, progress provider around `const t2="mrd_state_"`). Re-check it if the extension stops working after a game update.

- **Signed out**: the current grid of each puzzle lives in `localStorage["mrd_state_<puzzleId>"]`, a JSON value like `{"v":2,"s":"<code>","w":<width>,"h":<height>,"sym":"<suspect letters>"}`. It is written on every move. `puzzleId` is the URL path after `/play/`.
- The game reads that key **only when the puzzle loads** and keeps the state in memory afterwards: restoring means writing the key, then reloading the page. Without the reload, the next move overwrites the injected value.
- `mrd_catalog_v2` holds the per-puzzle status (in progress, completed). The extension leaves it alone.
- **Signed in**: the state is stored in Firestore (`users/<uid>.puzzleProgress.<puzzleId>.gameState`) and the local `mrd_state_` keys are removed after the first sync. The extension does not support this mode.
- `mrd_progress_*` keys (decoded `{"placed":[...]}` values) are a legacy format: the current game no longer reads them, it only deletes them on reset.

## Architecture

```
src/
├── content/                  # content script (isolated world, document_start)
│   ├── index.ts              # entry: keyboard shield, mount on DOM ready, URL polling
│   └── keyboard-shield.ts    # keeps panel key events away from the game
├── panel/                    # in-page UI, inside a shadow root
│   ├── mount.ts              # host + shadow root + static markup, returns elements
│   ├── controller.ts         # save / restore / delete flows
│   ├── state-list.ts         # renders the list of saved states
│   ├── confirm.ts            # inline confirmation box
│   └── panel.css             # bundled as text, injected in the shadow root
├── bank.ts                   # pure bank operations + chrome.storage.local persistence
├── page.ts                   # reads / writes the game's localStorage save
├── puzzle.ts                 # puzzle id from URL, native save key
├── types.ts                  # SavedState, Bank
└── css.d.ts                  # `*.css` imports are strings
icons/
├── icon-{16,48,128}.png      # extension icons (icon-48 is also the floating button)
└── generate-icons.sh         # regenerates them (ImageMagick)
docs/
├── button-location.png       # README preview: where the button is
├── panel-preview.png         # README preview: open panel with two states
└── generate-previews.sh      # draws both with ImageMagick, mirrors panel.css
manifest.json     # Manifest V3, permission: storage; content script on murdoku.com
build.mjs         # esbuild bundler, 1 entry: content
dist/             # built extension, load this folder in the browser
tests/            # see tests/README.md
```

### Content script (`src/content/`)

- Declared in `manifest.json` on `https://murdoku.com/*` (the whole site, not only `/play/*`: the game is a single-page app, so the script must already be there when the player navigates from the catalog to a puzzle)
- Runs at `document_start` so the keyboard shield is installed before the game's scripts; the panel itself is mounted on `DOMContentLoaded`
- Polls `location.href` every second (`URL_POLL_MS`): shows the button only on puzzle pages and refreshes the open panel when the puzzle changes. The isolated world cannot hook the page's `history.pushState`, hence the polling

**Keyboard shield (`keyboard-shield.ts`):** the game handles letters (placing suspects) and Escape on the whole document. Events leaving a shadow root are retargeted to the host, so the game cannot see they come from an input. A capture listener on `window`, registered before any page script, stops every key event whose `composedPath()` contains the host. Stopping propagation does not cancel default actions, so typing and Enter-to-submit still work. Escape is handled there to close the panel.

### Panel (`src/panel/`)

- `mountPanel` builds everything inside an open shadow root on a `#murdoku-save-bank` host: the game's CSS cannot reach it and ours cannot leak. `:host` is `position: fixed` in the top-right corner with the maximum `z-index`
- The markup is static; dynamic values (puzzle id, state names) only go through `textContent`
- The button icon is loaded with `chrome.runtime.getURL`, hence the `web_accessible_resources` entry for `icons/icon-48.png`
- `createPanelController` takes the elements and a `getPuzzleId` callback read on every action; it returns `refresh()`, called on each opening

### Bank (`bank.ts`)

- Stored in `chrome.storage.local` under the key `bank`, not in the page's localStorage, so the game's own resets ("Clear & Reload", account reset) never wipe it
- Shape: `{ [puzzleId]: SavedState[] }`, with `SavedState = { name, state, savedAt }`
- `state` is the raw native value, kept opaque: the extension never parses the game format, so it survives format changes as long as the key stays the same
- Names are unique per puzzle; `upsertState` replaces, `removeState` drops the puzzle entry once empty
- All operations are pure and return a new bank; only `loadBank` / `saveBank` touch the storage

### Page access (`page.ts`)

- Plain `localStorage` calls: the content script's isolated world shares `localStorage` with the page, so no MAIN-world injection is needed
- `writeNativeStateAndReload` writes, then reloads; the reload is a parameter so tests can stub it

## Stack

- **TypeScript** strict (no `any`)
- **esbuild** for bundling
- **Chrome Extension Manifest V3**
- **Vitest** for unit testing (jsdom environment)
- **Prettier** for formatting (default config)
- Vanilla TS, no framework

## Build & Test

Node version is pinned in `package.json` `engines.node` (24), which CI reads: run `nvm use 24` first (a local `.nvmrc` is fine but is not committed). Under Node 25, Node's own `localStorage` global shadows jsdom's and the tests fail with `localStorage.clear is not a function`.

```bash
npm install
npm run build          # outputs to dist/
npm run watch          # dev mode with rebuild on change
npm test               # run all tests (jsdom)
npm run typecheck      # tsc --noEmit
npm run format         # prettier --write
npm run package        # build + zip dist/ to murdoku-save-bank.zip
npm run icons:generate # regenerate icons (requires ImageMagick)
npm run docs:previews  # redraw README previews (requires ImageMagick)
make check             # typecheck + format check + tests
```

Load `dist/` as unpacked extension in `chrome://extensions/` or `brave://extensions/` (dev mode enabled). After a rebuild, reload the extension, then reload the murdoku tab.

## Testing

See `tests/README.md`. Unit tests only (jsdom): bank, URL parsing, page save access, keyboard shield, panel mounting and rendering. The real flow (button placement over the game, restore + reload, game picking the state up) is validated by hand on the site.

## Rules

- Code and comments in English, UI strings in French
- Minimal permissions (`storage` only; the content script is limited to murdoku.com)
- Never parse or rewrite the game's save format: store and restore the raw value
- Keep logic out of `content/index.ts` and `panel/controller.ts` when it can be a pure function or a module taking its elements as parameters, and test it there
- Never use `alert()` / `confirm()` / `prompt()`: they froze the whole browser from the former popup; use `panel/confirm.ts`
- Every panel element lives in the shadow root; never add nodes or styles to the game's DOM besides the host
- Any new focusable control in the panel is covered by the keyboard shield as long as it stays inside the host
- No unused imports
- Proper error handling at system boundaries
- Export functions needed for testing
- Mock `chrome` APIs with `vi.stubGlobal` in tests
- **When the game changes its save format or keys**, update the "How the game saves" section in the same change
- **When the panel's look changes**, update `docs/generate-previews.sh` to match and rerun `npm run docs:previews`
- **When writing or modifying tests, refer to `tests/README.md`** and update it if you add new test patterns
