/**
 * ClukyBook For Kids — Motor de traducción en vivo (ES / EN / PT-BR)
 * Agregado el 2026-10-20 a petición de Memento.
 *
 * Cómo funciona: la app está escrita en español. Este motor recorre el DOM,
 * y cada texto visible lo busca en el diccionario (dictionary.json):
 *  1. Coincidencia exacta del texto completo.
 *  2. Patrones con {} (textos con nombres o números: "Tutor de {}").
 *  3. Fragmentos conocidos dentro del texto (frases con variables).
 * Traduce nodos de texto y atributos (placeholder, title, aria-label, alt).
 * El texto original en español se guarda siempre: al volver a Español se
 * restaura todo sin recargar. Un MutationObserver traduce lo que la app
 * dibuje después (cambios de pestaña, modales, mensajes nuevos).
 *
 * NO se traduce lo que el usuario está escribiendo (inputs/textarea),
 * ni el contenido marcado con data-no-translate.
 */

import dictionary from './dictionary.json';

export type Language = 'es' | 'en' | 'pt';

interface DictEntry { en: string; pt: string; }
const EXACT = (dictionary as { exact: Record<string, DictEntry> }).exact;
const FRAGMENTS = (dictionary as { fragments: Record<string, DictEntry> }).fragments;

const fragmentKeys = Object.keys(FRAGMENTS).sort((a, b) => b.length - a.length);

// Patrones con {} convertidos a regex
interface PatternEntry { regex: RegExp; en: string; pt: string; }
const PATTERNS: PatternEntry[] = Object.entries(EXACT)
  .filter(([key]) => key.includes('{}'))
  .map(([key, val]) => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{\\\}/g, '(.+?)');
    return { regex: new RegExp(`^${escaped}$`), en: val.en, pt: val.pt };
  });

function translateString(original: string, lang: Language): string {
  if (lang === 'es' || !original) return original;
  const trimmed = original.trim();
  if (!trimmed) return original;

  // 1. Exacta
  const exact = EXACT[trimmed];
  if (exact) {
    const lead = original.slice(0, original.indexOf(trimmed));
    const trail = original.slice(original.indexOf(trimmed) + trimmed.length);
    return lead + exact[lang] + trail;
  }

  // 2. Patrones con {}
  for (const p of PATTERNS) {
    const m = trimmed.match(p.regex);
    if (m) {
      let out = p[lang];
      m.slice(1).forEach((g) => { out = out.replace('{}', g); });
      const lead = original.slice(0, original.indexOf(trimmed));
      const trail = original.slice(original.indexOf(trimmed) + trimmed.length);
      return lead + out + trail;
    }
  }

  // 3. Fragmentos (solo frases de 8+ caracteres para no romper palabras)
  let result = original;
  let changed = false;
  for (const key of fragmentKeys) {
    if (key.length < 8) continue;
    if (result.includes(key)) {
      result = result.split(key).join(FRAGMENTS[key][lang]);
      changed = true;
    }
  }
  return changed ? result : original;
}

const originalText = new WeakMap<Text, string>();
const originalAttrs = new WeakMap<Element, Map<string, string>>();
const ownWrites = new Map<Text, string>();
let currentLang: Language = 'es';
let observer: MutationObserver | null = null;

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);

function translateTextNode(node: Text) {
  if (!originalText.has(node)) originalText.set(node, node.nodeValue || '');
  const original = originalText.get(node)!;
  const target = translateString(original, currentLang);
  if (node.nodeValue !== target) {
    ownWrites.set(node, target);
    node.nodeValue = target;
  }
}

function translateElementAttrs(el: Element) {
  let stored = originalAttrs.get(el);
  if (!stored) { stored = new Map(); originalAttrs.set(el, stored); }
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    if (!stored.has(attr)) stored.set(attr, el.getAttribute(attr) || '');
    const original = stored.get(attr)!;
    const target = translateString(original, currentLang);
    if (el.getAttribute(attr) !== target) el.setAttribute(attr, target);
  }
}

function shouldSkip(el: Element | null): boolean {
  let cur: Element | null = el;
  while (cur) {
    if (SKIP_TAGS.has(cur.tagName)) return true;
    if (cur.hasAttribute && cur.hasAttribute('data-no-translate')) return true;
    if ((cur as HTMLElement).isContentEditable) return true;
    cur = cur.parentElement;
  }
  return false;
}

function translateSubtree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const t = root as Text;
    if (t.parentElement && !shouldSkip(t.parentElement)) translateTextNode(t);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (shouldSkip(el)) return;
  translateElementAttrs(el);
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = n as Text;
      if (t.parentElement && !shouldSkip(t.parentElement)) translateTextNode(t);
    } else {
      translateElementAttrs(n as Element);
    }
  }
}

function handleMutations(mutations: MutationRecord[]) {
  for (const mut of mutations) {
    if (mut.type === 'characterData') {
      const t = mut.target as Text;
      if (ownWrites.get(t) === t.nodeValue) { ownWrites.delete(t); continue; }
      // React cambió el texto: el nuevo valor es el original en español
      originalText.set(t, t.nodeValue || '');
      if (t.parentElement && !shouldSkip(t.parentElement)) translateTextNode(t);
    } else if (mut.type === 'childList') {
      mut.addedNodes.forEach((n) => translateSubtree(n));
    } else if (mut.type === 'attributes') {
      const el = mut.target as Element;
      const attr = mut.attributeName || '';
      if (ATTRS.includes(attr)) {
        const stored = originalAttrs.get(el);
        const current = el.getAttribute(attr) || '';
        // Si el valor actual no es nuestra traducción, es el nuevo original
        if (stored) {
          const prevOriginal = stored.get(attr);
          if (prevOriginal !== undefined && translateString(prevOriginal, currentLang) !== current) {
            stored.set(attr, current);
          }
        }
        translateElementAttrs(el);
      }
    }
  }
}

/** Aplica un idioma a toda la página y deja el observador activo. */
export function applyLanguage(lang: Language) {
  currentLang = lang;
  if (observer) observer.disconnect();
  translateSubtree(document.body);
  observer = new MutationObserver(handleMutations);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  });
}
