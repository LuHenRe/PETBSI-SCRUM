import { DomainError } from "./domain-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress {
  readonly value: string;

  constructor(value: string) {
    if (!EmailAddress.isValid(value)) {
      throw new DomainError(`Endereço de e-mail inválido: ${value}`);
    }
    this.value = value;
    Object.freeze(this);
  }

  static isValid(value: string): boolean {
    return typeof value === "string" && EMAIL_REGEX.test(value);
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}