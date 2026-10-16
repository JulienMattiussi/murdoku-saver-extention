import type { SavedState } from "../types";

export interface StateListHandlers {
  onRestore: (entry: SavedState) => void;
  onDelete: (entry: SavedState) => void;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

function button(
  label: string,
  onClick: () => void,
  className: string,
  title?: string,
) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  el.className = className;
  if (title) {
    el.title = title;
    el.setAttribute("aria-label", title);
  }
  el.addEventListener("click", onClick);
  return el;
}

/** Renders one `<li>` per state into `list`, replacing its content. */
export function renderStateList(
  list: HTMLElement,
  states: SavedState[],
  handlers: StateListHandlers,
) {
  list.replaceChildren(
    ...states.map((entry) => {
      const li = document.createElement("li");

      const label = document.createElement("div");
      label.className = "label";
      const name = document.createElement("strong");
      name.textContent = entry.name;
      name.title = entry.name;
      const date = document.createElement("small");
      date.textContent = new Date(entry.savedAt).toLocaleString(
        "fr-FR",
        DATE_FORMAT,
      );
      label.append(name, date);

      li.append(
        label,
        button("Charger", () => handlers.onRestore(entry), "primary"),
        button("✕", () => handlers.onDelete(entry), "danger icon", "Supprimer"),
      );
      return li;
    }),
  );
}
