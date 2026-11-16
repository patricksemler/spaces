import { COLORS } from './store.js';

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const $ = (root, sel) => (typeof root === 'string' ? document.querySelector(root) : root.querySelector(sel));
export const $$ = (root, sel) => [...root.querySelectorAll(sel)];

export function setText(node, text) {
  if (node && node.textContent !== String(text)) node.textContent = text;
}

export function cls(node, name, on) {
  if (node) node.classList.toggle(name, !!on);
}

export function avatar(name, size = 28, extra = '') {
  return `<span class="av ${extra}" data-p="${name}" style="--c:${COLORS[name]};--s:${size}px">${name[0]}</span>`;
}

// Is the stage currently replaying instantly (no animation)?
export const noAnim = () => document.documentElement.classList.contains('no-anim');
