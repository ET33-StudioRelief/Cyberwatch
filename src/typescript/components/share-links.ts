/** Confirmation tooltips, keyed by the first two letters of `<html lang>`. */
const COPIED_LABELS: Record<string, { url: string; content: string }> = {
  fr: { url: 'Lien copié !', content: 'Article copié !' },
  en: { url: 'Link copied!', content: 'Article copied!' },
  es: { url: '¡Enlace copiado!', content: '¡Artículo copiado!' },
};

/**
 * Copies `getText()` to the clipboard on click, then adds `.is-copied` for 1.5s.
 * The label is exposed as `data-copied-label` and displayed by share-links.css.
 */
function wireCopyButton(button: HTMLElement, copiedLabel: string, getText: () => string): void {
  button.setAttribute('data-copied-label', copiedLabel);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    navigator.clipboard
      .writeText(getText())
      .then(() => {
        button.classList.add('is-copied');
        window.setTimeout(() => button.classList.remove('is-copied'), 1500);
      })
      // Clipboard access can be denied (permissions, insecure context): fail silently
      .catch(() => {});
  });
}

/**
 * Wires the two "share this article" actions on the Blog Post template page
 * that Finsweet's Social Share attributes don't cover (LinkedIn and X are
 * handled by Finsweet directly in the Designer): copying the article URL and
 * copying the article body text.
 */
export function initShareLinks(): void {
  const locale = document.documentElement.lang.slice(0, 2).toLowerCase();
  const labels = COPIED_LABELS[locale] ?? COPIED_LABELS.fr;

  const copyUrlButton = document.querySelector<HTMLElement>('[fs-socialshare-element="url"]');
  if (copyUrlButton) {
    wireCopyButton(copyUrlButton, labels.url, () => window.location.href);
  }

  const copyContentButton = document.querySelector<HTMLElement>('[data-share="copy-content"]');
  const articleBody = document.querySelector<HTMLElement>('.text-rich-text.is-article');
  if (copyContentButton && articleBody) {
    wireCopyButton(copyContentButton, labels.content, () => articleBody.innerText.trim());
  }
}
