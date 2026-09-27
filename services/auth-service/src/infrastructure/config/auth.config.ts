/** 
 * toen expiry configuration
 * - access token
 * - refresh token
 */

export const AUTH_CONFIG = {
    ACCESS_TOKEN_EXPIRY:'15m',
    REFRESH_TOKEN_EXPIRY:'30d',
    REFRESH_TOKEN_TTL: 30 * 24 * 60 * 60 //30 days
} as const;