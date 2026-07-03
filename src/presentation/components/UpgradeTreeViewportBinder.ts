const MIN_SCALE = 0.45;
const MAX_SCALE = 2;
const ZOOM_STEP = 0.08;

export interface UpgradeTreeViewportState {
  scale: number;
  panX: number;
  panY: number;
}

export function bindUpgradeTreeViewport(
  viewport: HTMLElement,
  options: {
    onTransformChange?: (state: UpgradeTreeViewportState) => void;
  } = {},
): () => void {
  const stage = viewport.querySelector('.upgrade-tree-stage') as HTMLElement | null;
  if (!stage) return () => undefined;

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  const applyTransform = () => {
    stage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    options.onTransformChange?.({ scale, panX, panY });
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();

    const rect = viewport.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const previousScale = scale;

    const direction = event.deltaY > 0 ? -1 : 1;
    scale = clamp(scale + direction * ZOOM_STEP, MIN_SCALE, MAX_SCALE);

    const scaleRatio = scale / previousScale;
    panX = pointerX - (pointerX - panX) * scaleRatio;
    panY = pointerY - (pointerY - panY) * scaleRatio;

    applyTransform();
  };

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-upgrade-node], [data-upgrade-buy], button, a')) return;

    dragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('upgrade-tree-viewport--panning');
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;

    panX += event.clientX - lastPointerX;
    panY += event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    applyTransform();
  };

  const endDrag = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('upgrade-tree-viewport--panning');
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  viewport.addEventListener('wheel', onWheel, { passive: false });
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', endDrag);

  applyTransform();

  return () => {
    viewport.removeEventListener('wheel', onWheel);
    viewport.removeEventListener('pointerdown', onPointerDown);
    viewport.removeEventListener('pointermove', onPointerMove);
    viewport.removeEventListener('pointerup', endDrag);
    viewport.removeEventListener('pointercancel', endDrag);
    viewport.removeEventListener('pointerleave', endDrag);
    stage.style.transform = '';
    viewport.classList.remove('upgrade-tree-viewport--panning');
  };
}

export function focusUpgradeTreeNode(viewport: HTMLElement, nodeId: string): void {
  const stage = viewport.querySelector('.upgrade-tree-stage') as HTMLElement | null;
  const node = viewport.querySelector(`[data-upgrade-node="${nodeId}"]`) as HTMLElement | null;
  if (!stage || !node) return;

  const viewportRect = viewport.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();

  const scaleMatch = stage.style.transform.match(/scale\(([^)]+)\)/);
  const scale = scaleMatch ? Number(scaleMatch[1]) : 1;

  const nodeCenterX = nodeRect.left + nodeRect.width / 2 - stageRect.left;
  const nodeCenterY = nodeRect.top + nodeRect.height / 2 - stageRect.top;

  const panX = viewportRect.width / 2 - nodeCenterX * scale;
  const panY = viewportRect.height / 2 - nodeCenterY * scale;

  stage.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
