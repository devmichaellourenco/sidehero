const PORTAL_ID = 'skill-chip-tooltip-portal';

function getBranchClass(element: Element): string {
  for (const branch of ['offense', 'defense', 'utility']) {
    if (
      element.classList.contains(`hero-skill-chip--${branch}`) ||
      element.classList.contains(`skill-card--${branch}`)
    ) {
      return branch;
    }
  }
  return '';
}

function ensurePortal(): HTMLElement {
  let portal = document.getElementById(PORTAL_ID);
  if (portal) return portal;

  portal = document.createElement('div');
  portal.id = PORTAL_ID;
  portal.className = 'skill-chip-tooltip-portal hidden';
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
  portal.innerHTML = '';
}

function showPortal(anchor: HTMLElement, tooltip: HTMLElement): void {
  const portal = ensurePortal();
  const branch = getBranchClass(anchor);

  portal.className = 'skill-chip-tooltip-portal';
  if (branch) portal.classList.add(branch);
  portal.innerHTML = tooltip.innerHTML;

  positionPortal(portal, anchor.getBoundingClientRect());
}

function bindAnchor(anchor: HTMLElement): void {
  const tooltip = anchor.querySelector('.hero-skill-chip-tooltip');
  if (!tooltip) return;

  const onShow = () => showPortal(anchor, tooltip as HTMLElement);
  const onHide = () => hidePortal();

  anchor.addEventListener('mouseenter', onShow);
  anchor.addEventListener('mouseleave', onHide);
  anchor.addEventListener('focus', onShow);
  anchor.addEventListener('blur', onHide);
}

export function bindSkillChipTooltips(container: HTMLElement): void {
  container.querySelectorAll('[data-skill-tooltip]').forEach((element) => {
    bindAnchor(element as HTMLElement);
  });
}

export function hideSkillChipTooltip(): void {
  hidePortal();
}
