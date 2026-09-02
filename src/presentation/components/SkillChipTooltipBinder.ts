const PORTAL_ID = 'skill-chip-tooltip-portal';
const PINNED_BRIDGE_MS = 80;

type SkillTooltipInteraction = {
  pinned: boolean;
  pinnedAnchor: HTMLElement | null;
  anchorHovered: boolean;
  portalHovered: boolean;
};

const interaction: SkillTooltipInteraction = {
  pinned: false,
  pinnedAnchor: null,
  anchorHovered: false,
  portalHovered: false,
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;

function getBranchClass(element: Element): string {
  for (const branch of ['offense', 'defense', 'utility']) {
    if (
      element.classList.contains(`hero-skill-chip--${branch}`) ||
      element.classList.contains(`skill-card--${branch}`) ||
      element.classList.contains(`skill-row--${branch}`)
    ) {
      return branch;
    }
  }
  return '';
}

function cancelHide(): void {
  if (hideTimer === null) return;
  window.clearTimeout(hideTimer);
  hideTimer = null;
}

function resetInteraction(): void {
  interaction.pinned = false;
  interaction.pinnedAnchor = null;
  interaction.anchorHovered = false;
  interaction.portalHovered = false;
  cancelHide();
}

function applyPortalPointerMode(portal: HTMLElement): void {
  if (interaction.pinned) {
    portal.dataset.pinned = 'true';
  } else {
    delete portal.dataset.pinned;
  }
}

function ensurePortal(): HTMLElement {
  let portal = document.getElementById(PORTAL_ID);
  if (portal) return portal;

  portal = document.createElement('div');
  portal.id = PORTAL_ID;
  portal.className = 'skill-chip-tooltip-portal hidden';
  portal.setAttribute('role', 'tooltip');

  portal.addEventListener('mouseenter', () => {
    if (!interaction.pinned) return;
    interaction.portalHovered = true;
    cancelHide();
  });
  portal.addEventListener('mouseleave', () => {
    interaction.portalHovered = false;
    if (!interaction.pinned) {
      hidePortal();
      return;
    }
    scheduleVisibilityCheck();
  });

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

function updateVisibility(): void {
  if (interaction.pinned) {
    if (interaction.anchorHovered || interaction.portalHovered) return;
    hidePortal();
    return;
  }

  if (!interaction.anchorHovered) {
    hidePortal();
  }
}

function scheduleVisibilityCheck(): void {
  cancelHide();
  const delay = interaction.pinned ? PINNED_BRIDGE_MS : 0;
  hideTimer = window.setTimeout(() => {
    hideTimer = null;
    updateVisibility();
  }, delay);
}

function hidePortal(): void {
  cancelHide();
  resetInteraction();

  const portal = document.getElementById(PORTAL_ID);
  if (!portal) return;
  delete portal.dataset.pinned;
  portal.classList.add('hidden');
  portal.style.visibility = '';
  portal.innerHTML = '';
}

function showPortal(anchor: HTMLElement, tooltip: HTMLElement): void {
  cancelHide();
  interaction.anchorHovered = true;

  const portal = ensurePortal();
  const branch = getBranchClass(anchor);

  portal.className = 'skill-chip-tooltip-portal';
  if (branch) portal.classList.add(branch);
  applyPortalPointerMode(portal);
  portal.innerHTML = tooltip.innerHTML;

  positionPortal(portal, anchor.getBoundingClientRect());
}

function pinAndShow(anchor: HTMLElement, tooltip: HTMLElement): void {
  interaction.pinned = true;
  interaction.pinnedAnchor = anchor;
  interaction.anchorHovered = true;
  interaction.portalHovered = false;
  showPortal(anchor, tooltip);
  applyPortalPointerMode(ensurePortal());
}

function bindAnchor(anchor: HTMLElement, tooltipSelector: string): void {
  const tooltip = anchor.querySelector(tooltipSelector);
  if (!tooltip) return;

  const onShow = () => showPortal(anchor, tooltip as HTMLElement);
  const onHide = () => {
    interaction.anchorHovered = false;
    if (!interaction.pinned) {
      hidePortal();
      return;
    }
    scheduleVisibilityCheck();
  };

  anchor.addEventListener('mouseenter', onShow);
  anchor.addEventListener('mouseleave', onHide);
  anchor.addEventListener('focus', onShow);
  anchor.addEventListener('blur', onHide);
  anchor.addEventListener('dragstart', () => hidePortal());

  if (tooltipSelector === '.hero-skill-chip-tooltip') {
    anchor.addEventListener('click', () => {
      pinAndShow(anchor, tooltip as HTMLElement);
    });
  }
}

function bindSkillTooltipAnchor(anchor: HTMLElement): void {
  bindAnchor(anchor, '.hero-skill-chip-tooltip');
}

function bindRankDotTooltipAnchor(anchor: HTMLElement): void {
  bindAnchor(anchor, '.skill-rank-dot-preview');
}

export function bindSkillChipTooltips(container: HTMLElement): void {
  container.querySelectorAll('[data-skill-tooltip]').forEach((element) => {
    bindSkillTooltipAnchor(element as HTMLElement);
  });
  container.querySelectorAll('[data-skill-rank-tooltip]').forEach((element) => {
    bindRankDotTooltipAnchor(element as HTMLElement);
  });
}

export function hideSkillChipTooltip(): void {
  hidePortal();
}

export function isSkillChipTooltipPinned(): boolean {
  return interaction.pinned;
}
