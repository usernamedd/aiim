// ============================================================
// Domain Value Objects
// ============================================================

// Token value object
export interface Token {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
}

export function createToken(params: {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}): Token {
  return {
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
    expiresAt: params.expiresAt,
  };
}

export function isTokenExpired(token: Token): boolean {
  return new Date() >= token.expiresAt;
}

// Credentials value object
export interface Credentials {
  readonly username: string;
  readonly password: string;
}

export interface RegisterParams {
  readonly username: string;
  readonly password: string;
  readonly nickname: string;
  readonly email?: string;
  readonly phone?: string;
}
