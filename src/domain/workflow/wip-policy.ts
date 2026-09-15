import { DomainError } from "../shared/domain-error";
import { WipLimit } from "../shared/wip-limit";

export class WipPolicy {
  private constructor() {}

  static canEnter(limit: WipLimit, currentCount: number): boolean {
    if (!Number.isInteger(currentCount) || currentCount < 0) {
      throw new DomainError(`Contagem atual inválida: ${currentCount}. Deve ser inteiro >= 0.`);
    }
    return limit.allows(currentCount + 1);
  }
}