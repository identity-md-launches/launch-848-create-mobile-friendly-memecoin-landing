const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const menu = document.querySelector<HTMLElement>('#site-menu')!;
const navigation = document.querySelector<HTMLElement>('.navigation')!;
const copyButton = document.querySelector<HTMLButtonElement>('.copy-button')!;
const address = document.querySelector<HTMLElement>('#contract-address')!;
const copyStatus = document.querySelector<HTMLElement>('#copy-status')!;
let statusTimer: ReturnType<typeof setTimeout> | undefined;
let copying = false;

menuToggle.hidden = false;
copyButton.hidden = false;

function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const opening = menu.hidden;
  menu.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
});

document.addEventListener('click', (event) => {
  if (event.target instanceof Node && !navigation.contains(event.target)) closeMenu();
});

navigation.addEventListener('focusout', (event) => {
  if (event.relatedTarget instanceof Node && !navigation.contains(event.relatedTarget)) closeMenu();
});

menu.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest('a') : null;
  if (!link) return;
  closeMenu();
  const href = link.getAttribute('href');
  if (href?.startsWith('#')) document.querySelector<HTMLElement>(href)?.focus();
  else menuToggle.focus();
});

// Older browsers and HTTP hosts may not expose the Clipboard API.
function legacyCopy(value: string): boolean {
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-label', 'Contract address to copy');
  field.className = 'clipboard-fallback';
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    field.remove();
    copyButton.focus({ preventScroll: true });
  }
  return copied;
}

copyButton.addEventListener('click', async () => {
  if (copying) return;
  copying = true;
  clearTimeout(statusTimer);
  copyStatus.textContent = '';
  copyButton.classList.remove('is-copied');
  copyButton.setAttribute('aria-busy', 'true');
  const value = address.textContent!.trim();
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      copied = true;
    }
  } catch {
    // A denied clipboard permission can still allow a user-triggered legacy copy.
  }
  if (!copied) copied = legacyCopy(value);
  copying = false;
  copyButton.removeAttribute('aria-busy');
  if (copied) {
    copyButton.classList.add('is-copied');
    copyStatus.textContent = 'Copied!';
    statusTimer = setTimeout(() => {
      copyButton.classList.remove('is-copied');
      copyStatus.textContent = '';
    }, 3000);
  } else {
    copyStatus.textContent = 'Copy unavailable. Select and copy the address above.';
  }
});
