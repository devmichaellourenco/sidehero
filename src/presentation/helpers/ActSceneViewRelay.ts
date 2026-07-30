/** Pedido da janela destacada para o side panel principal exibir a cena. */
export const ACT_SCENE_VIEW_REQUEST_KEY = 'sidehero_act_scene_view_request';

export interface ActSceneViewRequest {
  sceneId: string;
  at: number;
}

export function parseActSceneViewRequest(value: unknown): ActSceneViewRequest | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { sceneId?: unknown; at?: unknown };
  if (typeof record.sceneId !== 'string' || record.sceneId.length === 0) return null;
  if (typeof record.at !== 'number') return null;
  return { sceneId: record.sceneId, at: record.at };
}

/** Campanha unpin → side panel principal abre o overlay da cena. */
export async function requestActSceneViewOnMainPanel(sceneId: string): Promise<void> {
  try {
    await chrome.storage.local.set({
      [ACT_SCENE_VIEW_REQUEST_KEY]: {
        sceneId,
        at: Date.now(),
      } satisfies ActSceneViewRequest,
    });
  } catch {
    // storage indisponível
  }
}
