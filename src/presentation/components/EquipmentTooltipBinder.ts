import { GEAR_RARITY_ORDER } from './GearRarityPresentation';

const PORTAL_ID = 'gear-tooltip-portal';

function getRarityClass(element: Element): string {
  for (let i = GEAR_RARITY_ORDER.length - 1; i >= 0; i -= 1) {
    const rarity = GEAR_RARITY_ORDER[i];
    if (element.classList.contains(rarity)) return rarity;
  }
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

  const modalHeader = document.querySelector(
    '.modal-root:not(.hidden) .modal-header',
  ) as HTMLElement | null;
  const headerBottom = modalHeader?.getBoundingClientRect().bottom ?? 0;
  const minTop = Math.max(margin, headerBottom + margin);

  if (top < minTop) {
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

function bindPortalTooltipSlots(
  container: HTMLElement,
  slotSelector: string,
  tooltipSelector: string,
): void {
  container.querySelectorAll(slotSelector).forEach((slotElement) => {
    const slot = slotElement as HTMLElement;
    const tooltip = slot.querySelector(tooltipSelector) as HTMLElement | null;
    if (!tooltip) return;

    const onShow = () => showPortal(slot, tooltip);
    const onHide = () => hidePortal();

    slot.addEventListener('mouseenter', onShow);
    slot.addEventListener('mouseleave', onHide);
    slot.addEventListener('focusin', onShow);
    slot.addEventListener('focusout', (event) => {
      const next = event.relatedTarget as Node | null;
      if (next && slot.contains(next)) return;
      onHide();
    });
  });
}

export function bindEquipmentTooltips(container: HTMLElement): void {
  bindPortalTooltipSlots(container, '.equipment-slot', '.equipment-slot-tooltip');
}

export function bindShopOfferTooltips(container: HTMLElement): void {
  bindPortalTooltipSlots(container, '.shop-offer-tile', '.shop-offer-tooltip');
}

export function hideEquipmentTooltip(): void {
  hidePortal();
}
