import { GameViewController } from '../components/GameViewController';

document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');
  if (!appRoot) return;

  const controller = new GameViewController(appRoot);
  controller.init();
});
