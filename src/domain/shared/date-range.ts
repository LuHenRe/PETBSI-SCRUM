import { DomainError } from "./domain-error";

export class DateRange {
  readonly startsOn: string;
  readonly endsOn: string;

  constructor(startsOn: string, endsOn: string) {
    if (!startsOn || !startsOn.trim()) {
      throw new DomainError("Data de início não pode ser vazia");
    }
    if (!endsOn || !endsOn.trim()) {
      throw new DomainError("Data de fim não pode ser vazia");
    }
    if (startsOn > endsOn) {
      throw new DomainError(`Período invertido: ${startsOn} > ${endsOn}`);
    }
    this.startsOn = startsOn;
    this.endsOn = endsOn;
    Object.freeze(this);
  }

  contains(date: string): boolean {
    return date >= this.startsOn && date <= this.endsOn;
  }

  equals(other: DateRange): boolean {
    return this.startsOn === other.startsOn && this.endsOn === other.endsOn;
  }
}