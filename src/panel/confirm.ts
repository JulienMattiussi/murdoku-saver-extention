// Native confirm() is avoided: from an extension popup it rendered behind the
// page and froze the whole browser, and inline boxes match the panel anyway.

export interface ConfirmElements {
  box: HTMLElement;
  text: HTMLElement;
  ok: HTMLButtonElement;
  cancel: HTMLButtonElement;
}

/**
 * Returns `ask(question)`, which shows the inline box and resolves to the
 * user's answer, and `cancel()`, which answers a pending question `false`.
 * Asking again while a question is pending cancels it first.
 * `onOpenChange` lets the caller hide or disable what the box stands in for.
 */
export function createConfirm(
  { box, text, ok, cancel }: ConfirmElements,
  onOpenChange: (open: boolean) => void = () => {},
) {
  let settle: ((answer: boolean) => void) | null = null;

  function answer(value: boolean) {
    const pending = settle;
    settle = null;
    if (pending) {
      box.hidden = true;
      onOpenChange(false);
    }
    pending?.(value);
  }

  ok.addEventListener("click", () => answer(true));
  cancel.addEventListener("click", () => answer(false));

  function ask(question: string): Promise<boolean> {
    answer(false);
    text.textContent = question;
    box.hidden = false;
    onOpenChange(true);
    ok.focus();
    return new Promise((resolve) => {
      settle = resolve;
    });
  }

  return { ask, cancel: () => answer(false) };
}
