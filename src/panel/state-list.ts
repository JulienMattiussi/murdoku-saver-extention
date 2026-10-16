import type { SavedState } from "../types";

export interface StateListHandlers {
  onRestore: (entry: SavedState) => void;
  onDelete: (entry: SavedState) => void;
}

function button(label: string, onClick: () => void, className?: string) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  if (className) el.className = className;
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
      date.textContent = new Date(entry.savedAt).toLocaleString("fr-FR");
      label.append(name, date);

      li.append(
        label,
        button("Charger", () => handlers.onRestore(entry)),
        button("Suppr.", () => handlers.onDelete(entry), "danger"),
      );
      return li;
    }),
  );
}
