export interface LoadScriptOptions {
  async?: boolean;
  defer?: boolean;
  type?: HTMLScriptElement['type'];
  /** Extra HTML attributes; `true` or `''` sets a boolean attribute (e.g. `{ 'fs-list': true }`). */
  attributes?: Record<string, string | boolean>;
  /** Skip loading when a `<script>` with the same `src` is already in the page (default `true`). */
  idempotent?: boolean;
}

const loadedScripts = new Map<string, Promise<void>>();

/**
 * Injects an external script into `<head>` and resolves once it has loaded.
 * Calls with the same `src` share one promise, so a script is never loaded twice.
 */
export function loadScript(src: string, options: LoadScriptOptions = {}): Promise<void> {
  const cached = loadedScripts.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    if (options.idempotent !== false && document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;

    if (options.async) script.async = true;
    if (options.defer) script.defer = true;
    if (options.type) script.type = options.type;

    for (const [key, value] of Object.entries(options.attributes ?? {})) {
      if (value === true || value === '') {
        script.setAttribute(key, '');
      } else {
        script.setAttribute(key, String(value));
      }
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}
