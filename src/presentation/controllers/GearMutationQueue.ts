import { SerialTaskRunner } from '../../infrastructure/background/SerialTaskRunner';

/** Serializa equipar/desequipar/otimizar na UI — evita cliques perdidos e corridas locais. */
export class GearMutationQueue {
  private readonly runner = new SerialTaskRunner();

  run<T>(task: () => Promise<T>): Promise<T> {
    return this.runner.run(task);
  }
}
