const INVALID_TOKEN_VALUES = new Set(['undefined', 'null']);

export const normalizeTokenValue = (token?: string | null): string | undefined => {
  if (typeof token !== 'string') {
    return undefined;
  }

  const normalizedToken = token.trim();
  if (!normalizedToken || INVALID_TOKEN_VALUES.has(normalizedToken)) {
    return undefined;
  }

  return normalizedToken;
};

export const isUsableTokenValue = (value: string | null | undefined): value is string => {
  return normalizeTokenValue(value) !== undefined;
};
