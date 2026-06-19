const PORTAL_ID = 'inventory-gear-tooltip-portal';
const PORTAL_Z_INDEX = 1600;
const HIDE_DELAY_MS = 260;

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let activeSlot: HTMLElement | null = null;
let scrollContainer: HTMLElement | null = null;

function getRarityClass(element: Element): string {
  if (element.classList.contains('epic')) return 'epic';
  if (element.classList.contains('rare')) return 'rare';
  if (element.classList.contains('common')) return 'common';
  return '';
}

function cancelScheduledHide(): void {
  if (hideTimer !== null) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function isPointerOverTooltipArea(): boolean {
  const portal = document.getElementById(PORTAL_ID);
  if (portal?.matches(':hover')) return true;
  if (activeSlot?.matches(':hover')) return true;
  return false;
}

function scheduleHide(): void {
  cancelScheduledHide();
  hideTimer = window.setTimeout(() => {
    hideTimer = null;
    if (isPointerOverTooltipArea()) return;
    hideInventoryGearTooltip(true);
  }, HIDE_DELAY_MS);
}

function ensurePortal(): HTMLElement {
  let portal = document.getElementById(PORTAL_ID);
  if (portal) return portal;

  portal = document.createElement('div');
  portal.id = PORTAL_ID;
  portal.className = 'gear-tooltip-portal gear-tooltip-portal--interactive hidden';
  portal.style.zIndex = String(PORTAL_Z_INDEX);
  portal.setAttribute('role', 'tooltip');

  portal.addEventListener('mouseenter', () => {
    cancelScheduledHide();
    portal!.dataset.pinned = 'true';
  });
  portal.addEventListener('mouseleave', () => {
    delete portal!.dataset.pinned;
    scheduleHide();
  });

  document.body.appendChild(portal);
  return portal;
}

function positionPortal(portal: HTMLElement, anchor: DOMRect): void {
  const margin = 8;
  const overlap = 8;

  portal.classList.remove('hidden');
  portal.style.visibility = 'hidden';

  const portalRect = portal.getBoundingClientRect();
  let top = anchor.top - portalRect.height + overlap;
  let placement: 'above' | 'below' = 'above';

  if (top < margin) {
    top = anchor.bottom - overlap;
    placement = 'below';
  }

  let left = anchor.left + anchor.width / 2 - portalRect.width / 2;
  const maxLeft = window.innerWidth - portalRect.width - margin;
  left = Math.max(margin, Math.min(left, maxLeft));

  portal.style.top = `${top}px`;
  portal.style.left = `${left}px`;
  portal.dataset.placement = placement;
  portal.style.visibility = 'visible';
}

function detachScrollListener(): void {
  if (!scrollContainer) return;
  scrollContainer.removeEventListener('scroll', repositionActiveTooltip);
  scrollContainer = null;
}

function repositionActiveTooltip(): void {
  const portal = document.getElementById(PORTAL_ID);
  if (!portal || portal.classList.contains('hidden') || !activeSlot) return;
  positionPortal(portal, activeSlot.getBoundingClientRect());
}

function attachScrollListener(slot: HTMLElement): void {
  const nextContainer = slot.closest('.modal-body') as HTMLElement | null;
  if (scrollContainer === nextContainer) return;

  detachScrollListener();
  scrollContainer = nextContainer;
  scrollContainer?.addEventListener('scroll', repositionActiveTooltip, { passive: true });
}

function showPortal(slot: HTMLElement, tooltip: HTMLElement): void {
  cancelScheduledHide();

  const portal = ensurePortal();
  const rarity = getRarityClass(slot);
  const slotChanged = activeSlot !== slot;

  portal.className = 'gear-tooltip-portal gear-tooltip-portal--interactive';
  if (rarity) portal.classList.add(rarity);
  portal.style.zIndex = String(PORTAL_Z_INDEX);

  if (slotChanged) {
    portal.innerHTML = tooltip.innerHTML;
    activeSlot = slot;
  }

  positionPortal(portal, slot.getBoundingClientRect());
  attachScrollListener(slot);
}

export function hideInventoryGearTooltip(force = false): void {
  if (!force) {
    scheduleHide();
    return;
  }

  cancelScheduledHide();
  activeSlot = null;
  detachScrollListener();

  const portal = document.getElementById(PORTAL_ID);
  if (!portal) return;

  delete portal.dataset.pinned;
  delete portal.dataset.placement;
  portal.classList.add('hidden');
  portal.style.visibility = '';
  portal.innerHTML = '';
}

function handlePointerOver(event: Event): void {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const portal = document.getElementById(PORTAL_ID);
  if (portal && portal.contains(target)) {
    cancelScheduledHide();
    return;
  }

  const slot = target.closest('.inventory-grid-slot') as HTMLElement | null;
  if (!slot) return;

  const tooltip = slot.querySelector('.inventory-gear-tooltip-content');
  if (!tooltip) return;

  showPortal(slot, tooltip as HTMLElement);
}

function handlePointerOut(event: Event): void {
  const mouseEvent = event as MouseEvent;
  const related = mouseEvent.relatedTarget as Node | null;
  const portal = document.getElementById(PORTAL_ID);

  if (portal && related && portal.contains(related)) {
    cancelScheduledHide();
    return;
  }

  if (activeSlot && related && activeSlot.contains(related)) {
    return;
  }

  scheduleHide();
}

export function bindInventoryGearTooltips(container: HTMLElement): void {
  if (container.dataset.gridTooltipsBound === 'true') return;
  container.dataset.gridTooltipsBound = 'true';

  container.addEventListener('mouseover', handlePointerOver);
  container.addEventListener('mouseout', handlePointerOut);

  container.addEventListener('focusin', (event) => {
    const slot = (event.target as HTMLElement).closest('.inventory-grid-slot') as HTMLElement | null;
    if (!slot) return;
    const tooltip = slot.querySelector('.inventory-gear-tooltip-content');
    if (!tooltip) return;
    showPortal(slot, tooltip as HTMLElement);
  });

  container.addEventListener('focusout', () => {
    scheduleHide();
  });
}
