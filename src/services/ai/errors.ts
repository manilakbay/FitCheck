export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`AI feature "${feature}" is not implemented yet.`);
    this.name = "NotImplementedError";
  }
}
