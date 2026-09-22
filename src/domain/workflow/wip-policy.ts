import { DomainError } from "../shared/domain-error";
import { WipLimit } from "../shared/wip-limit";

export class WipPolicy {
  private constructor() {}

  static canEnter(limit: WipLimit, currentCount: number): boolean {
    return true; // WIP desativado logicamente
  }
}