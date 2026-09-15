import { DomainError } from "../shared/domain-error";
import { EmailAddress } from "../shared/email-address";

export class Person {
  readonly id: string;
  readonly name: string;
  readonly email: EmailAddress;

  constructor(draft: { id: string; name: string; email: string | EmailAddress }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador da pessoa não pode ser vazio");
    }
    if (!draft.name || !draft.name.trim()) {
      throw new DomainError("Nome da pessoa não pode ser vazio");
    }
    this.id = draft.id;
    this.name = draft.name;
    this.email = typeof draft.email === "string" ? new EmailAddress(draft.email) : draft.email;
    // Entity - Object.freeze removed intentionally
  }

  get emailAddress(): string {
    return this.email.value;
  }
}