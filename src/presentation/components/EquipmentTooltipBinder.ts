const PORTAL_ID = 'gear-tooltip-portal';

function getRarityClass(element: Element): string {
  if (element.classList.contains('epic')) return 'epic';
  if (element.classList.contains('rare')) return 'rare';
  if (element.classList.contains('common')) return 'common';
  return '';
}

function ensurePortal(): HTMLElement {
  let portal = document.getElementById(PORTAL_ID);
  if (portal) return portal;

  portal = document.createElement('div');
  portal.id = PORTAL_ID;
  portal.className = 'gear-tooltip-portal hidden';
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

function showPortal(slot: HTMLElement, tooltip: HTMLElement): void {
  const portal = ensurePortal();
  const rarity = getRarityClass(slot);

  portal.className = 'gear-tooltip-portal';
  if (rarity) portal.classList.add(rarity);
  portal.innerHTML = tooltip.innerHTML;

  positionPortal(portal, slot.getBoundingClientRect());
}

export function bindEquipmentTooltips(container: HTMLElement): void {
  container.querySelectorAll('.equipment-slot').forEach((slotElement) => {
    const slot = slotElement as HTMLElement;
    const tooltip = slot.querySelector('.equipment-slot-tooltip');
    if (!tooltip) return;

    const onShow = () => showPortal(slot, tooltip as HTMLElement);
    const onHide = () => hidePortal();

    slot.addEventListener('mouseenter', onShow);
    slot.addEventListener('mouseleave', onHide);
    slot.addEventListener('focus', onShow);
    slot.addEventListener('blur', onHide);
  });
}

export function hideEquipmentTooltip(): void {
  hidePortal();
}
