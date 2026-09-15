import { DomainError } from "./domain-error";

export class WipLimit {
  private readonly _value: number | null;

  private constructor(value: number | null) {
    this._value = value;
    Object.freeze(this);
  }

  static of(value: number | null): WipLimit {
    if (value !== null) {
      if (!Number.isInteger(value) || value < 0) {
        throw new DomainError(`Limite de WIP inválido: ${value}. Deve ser inteiro >= 0 ou null.`);
      }
    }
    return new WipLimit(value);
  }

  static unlimited(): WipLimit {
    return new WipLimit(null);
  }

  get value(): number | null {
    return this._value;
  }

  isUnlimited(): boolean {
    return this._value === null;
  }

  allows(count: number): boolean {
    if (!Number.isInteger(count) || count < 0) {
      throw new DomainError(`Contagem inválida: ${count}. Deve ser inteiro >= 0.`);
    }
    if (this._value === null) return true;
    return count <= this._value;
  }

  equals(other: WipLimit): boolean {
    return this._value === other._value;
  }
}