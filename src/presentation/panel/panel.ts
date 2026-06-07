import { GameViewController } from '../components/GameViewController';

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('app')) return;

  const controller = new GameViewController(document.body);
  controller.init();
});
