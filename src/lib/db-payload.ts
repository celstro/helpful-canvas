/** Strips undefined values so payloads satisfy exactOptionalPropertyTypes. */
export function compact<T extends object>(input: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as { [K in keyof T]: Exclude<T[K], undefined> };
}
