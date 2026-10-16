// Native confirm() is avoided: from an extension popup it rendered behind the
// page and froze the whole browser, and inline boxes match the panel anyway.

export interface ConfirmElements {
  box: HTMLElement;
  text: HTMLElement;
  ok: HTMLButtonElement;
  cancel: HTMLButtonElement;
}

/**
 * Returns an `ask(question)` that shows the inline box and resolves to the
 * user's answer. Asking again while a question is pending answers it `false`.
 */
export function createConfirm({ box, text, ok, cancel }: ConfirmElements) {
  let settle: ((answer: boolean) => void) | null = null;

  function answer(value: boolean) {
    box.hidden = true;
    const pending = settle;
    settle = null;
    pending?.(value);
  }

  ok.addEventListener("click", () => answer(true));
  cancel.addEventListener("click", () => answer(false));

  return function ask(question: string): Promise<boolean> {
    answer(false);
    text.textContent = question;
    box.hidden = false;
    ok.focus();
    return new Promise((resolve) => {
      settle = resolve;
    });
  };
}
