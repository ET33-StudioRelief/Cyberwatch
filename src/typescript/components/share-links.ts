/**
 * Wires the two "Partager cet article" actions on the Blog Post template page
 * that Finsweet's Social Share attributes don't cover (linkedin/x are handled
 * by Finsweet directly in the Designer): copying the article URL and copying
 * the article body text.
 */
function wireCopyButton(button: HTMLElement, copiedLabel: string, getText: () => string): void {
  button.setAttribute('data-copied-label', copiedLabel);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(getText()).then(() => {
      button.classList.add('is-copied');
      window.setTimeout(() => button.classList.remove('is-copied'), 1500);
    });
  });
}

export function initShareLinks(): void {
  const copyUrlButton = document.querySelector<HTMLElement>('[fs-socialshare-element="url"]');
  if (copyUrlButton) {
    wireCopyButton(copyUrlButton, 'Lien copié !', () => window.location.href);
  }

  const copyContentButton = document.querySelector<HTMLElement>('[data-share="copy-content"]');
  const articleBody = document.querySelector<HTMLElement>('.text-rich-text.is-article');
  if (copyContentButton && articleBody) {
    wireCopyButton(copyContentButton, 'Article copié !', () => articleBody.innerText.trim());
  }
}
