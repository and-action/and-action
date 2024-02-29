export class ValueError extends Error {
  constructor(
    message: string,
    public obj: unknown,
  ) {
    super(message);
  }
}

export function assertIsNotUndefinedAndNotNull<T>(
  value: T,
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new ValueError('Object is not defined.', value);
  }
}
