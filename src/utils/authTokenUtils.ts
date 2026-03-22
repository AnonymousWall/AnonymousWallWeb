const INVALID_TOKEN_VALUES = new Set(['undefined', 'null']);
const BASE64_PADDING_MULTIPLE = 4;

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

export const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalizedBase64 = base64.padEnd(
      Math.ceil(base64.length / BASE64_PADDING_MULTIPLE) * BASE64_PADDING_MULTIPLE,
      '='
    );

    return JSON.parse(atob(normalizedBase64)) as { exp?: number };
  } catch {
    return null;
  }
};
