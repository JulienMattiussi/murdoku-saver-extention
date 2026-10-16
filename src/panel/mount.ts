export interface PanelElements {
  host: HTMLElement;
  toggle: HTMLButtonElement;
  panel: HTMLElement;
  puzzle: HTMLElement;
  message: HTMLElement;
  confirmBox: HTMLElement;
  confirmText: HTMLElement;
  confirmOk: HTMLButtonElement;
  confirmCancel: HTMLButtonElement;
  form: HTMLFormElement;
  name: HTMLInputElement;
  save: HTMLButtonElement;
  /** Wraps `states` and `empty`; the confirm box takes its place. */
  list: HTMLElement;
  states: HTMLElement;
  empty: HTMLElement;
}

// Static markup only: every dynamic value is set through textContent.
const MARKUP = `
  <button class="toggle" type="button" title="Murdoku Save Bank">
    <img alt="" />
  </button>
  <div class="panel" hidden>
    <header>
      <h1>Murdoku Save Bank</h1>
      <p class="puzzle muted"></p>
    </header>
    <p class="message" hidden></p>
    <form>
      <input type="text" placeholder="Nom de l'état" required autocomplete="off" />
      <button type="submit">Sauver</button>
    </form>
    <div class="confirm" hidden>
      <p class="confirm-text"></p>
      <div class="actions">
        <button class="confirm-cancel" type="button">Annuler</button>
        <button class="confirm-ok primary" type="button">Confirmer</button>
      </div>
    </div>
    <div class="list">
      <ul class="states"></ul>
      <p class="empty muted" hidden>Aucun état sauvegardé pour ce puzzle.</p>
    </div>
  </div>
`;

/**
 * Adds the floating button and its panel to the page, inside a shadow root
 * so the game's CSS and ours never leak into each other.
 */
export function mountPanel(
  css: string,
  iconUrl: string,
  parent: HTMLElement = document.body,
): PanelElements {
  const host = document.createElement("div");
  host.id = "murdoku-save-bank";
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = css;
  const container = document.createElement("div");
  container.innerHTML = MARKUP;
  root.append(style, ...container.childNodes);
  parent.append(host);

  const $ = <T extends Element>(selector: string) =>
    root.querySelector(selector) as T;
  $<HTMLImageElement>(".toggle img").src = iconUrl;

  return {
    host,
    toggle: $(".toggle"),
    panel: $(".panel"),
    puzzle: $(".puzzle"),
    message: $(".message"),
    confirmBox: $(".confirm"),
    confirmText: $(".confirm-text"),
    confirmOk: $(".confirm-ok"),
    confirmCancel: $(".confirm-cancel"),
    form: $("form"),
    name: $("input"),
    save: $('button[type="submit"]'),
    list: $(".list"),
    states: $(".states"),
    empty: $(".empty"),
  };
}
