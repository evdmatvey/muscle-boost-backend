export type ErrorDetail = {
  field: string;
  message: string;
};

export abstract class DomainException extends Error {
  public constructor(
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}
