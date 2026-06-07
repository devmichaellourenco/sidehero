const PORTAL_ID = 'bar-tooltip-portal';

function ensurePortal(): HTMLElement {
  let portal = document.getElementById(PORTAL_ID);
  if (portal) return portal;

  portal = document.createElement('div');
  portal.id = PORTAL_ID;
  portal.className = 'bar-tooltip-portal hidden';
  portal.setAttribute('role', 'tooltip');
  document.body.appendChild(portal);
  return portal;
}

function positionPortal(portal: HTMLElement, anchor: DOMRect): void {
  const margin = 8;
  portal.style.visibility = 'hidden';
  portal.classList.remove('hidden');

  const portalRect = portal.getBoundingClientRect();
  let top = anchor.top - portalRect.height - margin;
  let left = anchor.left + anchor.width / 2 - portalRect.width / 2;

  const maxLeft = window.innerWidth - portalRect.width - margin;
  left = Math.max(margin, Math.min(left, maxLeft));

  if (top < margin) {
    top = anchor.bottom + margin;
  }

  portal.style.top = `${top}px`;
  portal.style.left = `${left}px`;
  portal.style.visibility = 'visible';
}

function hidePortal(): void {
  const portal = document.getElementById(PORTAL_ID);
  if (!portal) return;
  portal.classList.add('hidden');
  portal.style.visibility = '';
  portal.textContent = '';
}

function showPortal(bar: HTMLElement): void {
  const label = bar.getAttribute('data-bar-label');
  if (!label) return;

  const portal = ensurePortal();
  portal.className = 'bar-tooltip-portal';
  portal.textContent = label;
  positionPortal(portal, bar.getBoundingClientRect());
}

export function bindBarTooltips(container: HTMLElement): void {
  container.querySelectorAll('[data-bar-label]').forEach((barElement) => {
    const bar = barElement as HTMLElement;

    const onShow = () => showPortal(bar);
    const onHide = () => hidePortal();

    bar.addEventListener('mouseenter', onShow);
    bar.addEventListener('mouseleave', onHide);
    bar.addEventListener('focus', onShow);
    bar.addEventListener('blur', onHide);
    bar.addEventListener('click', (event) => event.stopPropagation());
  });
}

export function hideBarTooltip(): void {
  hidePortal();
}
